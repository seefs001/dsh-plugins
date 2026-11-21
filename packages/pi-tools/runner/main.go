package main

import (
	"context"
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"os"

	js "github.com/MoeForge/moejs"
)

//go:embed prelude.js
var preludeSource string

type startData struct {
	Code                  string
	Tools, Globals, Store json.RawMessage
	MemoryLimitBytes      int64
}
type frame struct {
	Run                 int
	Type                string
	Data                startData
	ID                  int
	OK                  bool
	Payload, Properties *string
}
type task struct {
	run      int
	results  chan frame
	finished chan struct{}
	cancel   context.CancelFunc
}

func optional(s *string) js.Value {
	if s == nil {
		return js.Undefined()
	}
	return js.String(*s)
}

func execute(ctx context.Context, prelude *js.Script, data startData, results <-chan frame, emit func([]any)) ([]any, error) {
	// external: Pi's prelude freezes builtins with override-friendly descriptors, requiring MutableIntrinsics
	rt := js.NewRuntime(js.Options{MutableIntrinsics: true, MemoryLimit: data.MemoryLimitBytes})
	stop := context.AfterFunc(ctx, func() { rt.Interrupt(context.Canceled) })
	defer stop()
	var terminal []any
	bridge, err := rt.FromGo(js.NativeFunc(func(_ *js.Realm, _ js.Value, args []js.Value) (js.Value, error) {
		msg := make([]any, len(args))
		for i, v := range args {
			var e error
			msg[i], e = rt.ToGo(v)
			if e != nil {
				return js.Undefined(), e
			}
		}
		if msg[0] == "done" {
			terminal = msg
			rt.Interrupt(errors.New("script settled"))
		} else {
			emit(msg)
		}
		return js.Undefined(), nil
	}))
	if err != nil {
		return nil, err
	}
	factory, err := rt.RunScript(prelude)
	if err != nil {
		return nil, err
	}
	api, err := rt.CallFunction(factory, js.Undefined(), bridge, js.String(string(data.Tools)), js.String(string(data.Globals)), js.String(string(data.Store)))
	if err != nil {
		return nil, err
	}
	run, err := rt.Get(api, "run")
	if err != nil {
		return nil, err
	}
	settle, err := rt.Get(api, "settle")
	if err != nil {
		return nil, err
	}
	stalled, err := rt.Get(api, "stalled")
	if err != nil {
		return nil, err
	}
	script, err := js.CompileScriptWith("codemode.js", "(async (tools, console) => {"+data.Code+"\n})", js.CompileOptions{Context: ctx})
	if err != nil {
		var syntax *js.SyntaxError
		if errors.As(err, &syntax) {
			message := syntax.Message
			// external: Pi's syntax recovery matches QuickJS's "unexpected end of string" error message
			if message == "Unterminated string constant" {
				message = "unexpected end of string"
			}
			b, _ := json.Marshal(map[string]string{"name": "SyntaxError", "message": message, "stack": fmt.Sprintf("SyntaxError: %s\n    at %s:%d:%d", message, syntax.File, syntax.Line, syntax.Column)})
			return []any{"done", false, string(b)}, nil
		}
		return nil, err
	}
	fn, err := rt.RunScript(script)
	if err != nil {
		return nil, err
	}
	_, err = rt.CallFunction(run, api, fn)
	for terminal == nil && err == nil {
		_, err = rt.CallFunction(stalled, api)
		if err != nil || terminal != nil {
			break
		}
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case reply := <-results:
			_, err = rt.CallFunction(settle, api, js.Int(int64(reply.ID)), js.Bool(reply.OK), optional(reply.Payload), optional(reply.Properties))
		}
	}
	if terminal != nil {
		return terminal, nil
	}
	return nil, err
}

func main() {
	prelude, err := js.CompileScript("codemode-prelude.js", preludeSource)
	if err != nil {
		panic(err)
	}
	input := json.NewDecoder(os.Stdin)
	output := json.NewEncoder(os.Stdout)
	output.SetEscapeHTML(false)
	var active *task
	for {
		var f frame
		if err := input.Decode(&f); err != nil {
			return
		}
		switch f.Type {
		case "start":
			if active != nil {
				<-active.finished
			}
			ctx, cancel := context.WithCancel(context.Background())
			t := &task{f.Run, make(chan frame), make(chan struct{}), cancel}
			active = t
			go func(data startData) {
				defer close(t.finished)
				defer cancel()
				send := func(event []any) {
					if err := output.Encode([]any{t.run, event}); err != nil {
						os.Exit(1)
					}
				}
				end, err := execute(ctx, prelude, data, t.results, send)
				if err != nil {
					end = []any{"crash", err.Error()}
				}
				send(end)
			}(f.Data)
		case "result":
			if active != nil && active.run == f.Run {
				select {
				case active.results <- f:
				case <-active.finished:
				}
			}
		case "cancel":
			if active != nil && active.run == f.Run {
				active.cancel()
			}
		default:
			fmt.Fprintln(os.Stderr, "unknown runner command")
			return
		}
	}
}
