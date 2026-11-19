#!/usr/bin/env python3
"""Drive the shipped headless CLI. Only the Messages API peer is scripted."""
import argparse
import json
import os
import shutil
import subprocess
import tempfile
import threading
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

NAME = 'sample-context'
DESC = 'Synthetic catalog entry for the context verifier.'
BODY = 'The fixture mascot is a blue heron.'
PROMPTS = {'catalog': 'Inspect the available skill catalog.',
           'load': 'Load the sample-context skill using the skill tool.',
           'slash': '/sample-context', 'repeat': 'Load the fixture twice.', 'prune': 'Exercise pruning of the fixture.',
           'compact': 'Exercise compaction of the fixture.'}
EXPECTED = {'catalog': [False], 'load': [False, True], 'slash': [True],
            'repeat': [False, True, True], 'prune': [False, True, False], 'compact': [False, True, False]}
ROOT = Path(__file__).resolve().parents[3]

def required(ok, message):
    if not ok:
        raise RuntimeError(message)

@contextmanager
def peer(mode, evidence, rows):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_): pass

        def do_POST(self):
            if self.path.split('?')[0] != '/v1/messages' or len(rows) >= 3:
                self.send_error(400); return
            request = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
            messages = json.dumps(request['messages'], ensure_ascii=False)
            tools = [item.get('name') for item in request.get('tools', [])]
            row = {'request': len(rows) + 1, 'path': self.path, 'model': request.get('model'),
                   'has_catalog_description': DESC in messages, 'has_body': BODY in messages,
                   'tool_declared': 'skill' in tools,
                   'roster_count': messages.count('Full skill instructions already in this request (reuse without reloading): ' + NAME),
                   'cleared': 'No full skill instructions are currently retained.' in messages,
                   'has_named_block': json.dumps(f'<skill_content name="{NAME}">')[1:-1] in messages,
                   'has_full_fixture': f'<skill_instructions>\\n{BODY}\\n</skill_instructions>\\n</skill_content>' in messages,
                   'roles_with_body': [m['role'] for m in request['messages'] if BODY in json.dumps(m)]}
            summary = mode == 'compact' and 'Output only the checkpoint text' in messages
            call = not summary and len(rows) < len(EXPECTED[mode]) - 1
            block = ({'type': 'tool_use', 'id': 'toolu_probe_' + str(len(rows)), 'name': 'skill', 'input': {}}
                     if call else {'type': 'text', 'text': ''})
            delta = ({'type': 'input_json_delta', 'partial_json': json.dumps({'name': NAME})}
                     if call else {'type': 'text_delta', 'text': 'fixture complete'})
            row['peer_reply'] = 'tool_use: skill(sample-context)' if call else 'fixture complete'
            if summary:
                (evidence / 'summary-request.json').write_text(json.dumps(row, indent=2) + '\n')
            else:
                rows.append(row)
            (evidence / 'requests.json').write_text(json.dumps(rows, indent=2) + '\n')
            events = [('message_start', {'message': {'id': 'msg_probe', 'type': 'message', 'role': 'assistant',
                       'model': request['model'], 'content': [], 'stop_reason': None, 'stop_sequence': None,
                       'usage': {'input_tokens': 1, 'output_tokens': 0}}}),
                      ('content_block_start', {'index': 0, 'content_block': block}),
                      ('content_block_delta', {'index': 0, 'delta': delta}), ('content_block_stop', {'index': 0}),
                      ('message_delta', {'delta': {'stop_reason': 'tool_use' if call else 'end_turn', 'stop_sequence': None},
                                         'usage': {'output_tokens': 1}}), ('message_stop', {})]
            body = ''.join(f'event: {name}\ndata: {json.dumps(dict(type=name, **data))}\n\n' for name, data in events).encode()
            self.send_response(200); self.send_header('Content-Type', 'text/event-stream')
            self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)

    with ThreadingHTTPServer(('127.0.0.1', 0), Handler) as server:
        thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
        try: yield f'http://127.0.0.1:{server.server_port}'
        finally: server.shutdown(); thread.join()

def run(mode, dest):
    cli = shutil.which('dsh'); required(cli, 'dsh not on PATH')
    with tempfile.TemporaryDirectory(prefix='verify-dsh-skill-') as scratch:
        root = Path(scratch); cwd = root / 'workspace'; home = root / 'home'; home.mkdir(); cwd.mkdir()
        env = dict(PATH=os.environ['PATH'], HOME=str(home), DSH_HOME=str(home / '.dsh'),
                   DSH_TELEMETRY_MODE='OFF', NO_PROXY='127.0.0.1,localhost', DEEPSEEK_API_KEY=NAME)
        def command(*args, timeout=15):
            return subprocess.run([cli, *args], cwd=cwd, env=env, capture_output=True, text=True, timeout=timeout)
        # The local profile must actually contain the user-facing entry points we're about to drive.
        ver = command('--version'); cfg = command('headless', '--dump-default-config'); help_ = command('headless', '--help')
        required(all(x.returncode == 0 for x in (ver, cfg, help_)), 'headless not available')
        package = '@deepseek-ai/dsh-tool-skill'
        required(package in cfg.stdout and '--permission-mode' in help_.stdout, 'wrong headless composition')
        required(package in (ROOT / 'packages/pi-tools/cordis.patch.yml').read_text(), 'Pi no longer uses the checked skill loader')
        print(f'Doctor: DSH {ver.stdout.strip()}, headless + skill loader, isolated HOME and project', flush=True)
        if mode == 'doctor': return
        fixture = cwd / '.agents' / 'skills' / NAME / 'SKILL.md'; fixture.parent.mkdir(parents=True)
        fixture.write_text(f'---\nname: {NAME}\ndescription: {DESC}\n---\n\n{BODY}\n')
        dest.mkdir(parents=True, exist_ok=True)
        evidence = Path(tempfile.mkdtemp(prefix=mode + '-', dir=dest)); print(f'Evidence: {evidence}', flush=True)
        rows = []
        with peer(mode, evidence, rows) as endpoint:
            env['DEEPSEEK_BASE_URL'] = endpoint
            patch = root / 'verify.yml'
            extra = ''
            if mode == 'prune':
                # Drive the real DSH pruner at a deterministic admission boundary, not a fake transcript.
                hook = root / 'drive-pruner.mjs'
                hook.write_text("export const inject=['toolResultPruner']; export function apply(ctx) { "
                                "ctx.on('agent/pre-step', ({agent,step}, next) => { if(step===3) "
                                "ctx.toolResultPruner.pruneSession(agent.session); return next() }) }")
                extra = ('- id: tool-result-pruner\n  config:\n    thresholdChars: 135\n    headChars: 40\n    tailChars: 40\n'
                         '- insert:\n    - id: drive-pruner\n      name: ' + json.dumps(str(hook)) + '\n')
            if mode == 'compact':
                hook = root / 'drive-compact.mjs'
                hook.write_text("export const inject=['compaction']; export function apply(ctx){"
                                "ctx.on('agent/pre-step',async({agent,step,signal},next)=>{if(step===3){"
                                "const n=agent.session.surface.nodes; await ctx.compaction.compactRegion(n[1],n.at(-1),agent,signal)"
                                "}return next()})}")
                extra = '- insert:\n    - id: drive-compact\n      name: ' + json.dumps(str(hook)) + '\n'
            # Observe the same pre-step decision consumed by prompt recall; don't connect a real memory service.
            observer = root / 'observe-recall.mjs'
            observer.write_text("import {appendFileSync} from 'node:fs'; export function apply(ctx) { "
                "ctx.on('agent/pre-step',async ({step},next)=>{const d=await next(); if(d.kind==='enter'){"
                "const text=d.messages.flatMap(m=>m.content.map(b=>b.text??'')).join(' ');"
                "const row={step,userControl:text.includes('RECALL_CONTROL'),"
                "hasRoster:/Full skill instructions already|No full skill instructions/.test(text)};"
                "appendFileSync(" + json.dumps(str(evidence / 'recall-input.ndjson')) + ",JSON.stringify(row)+'\\n');}"
                "return d},{prepend:true})}")
            extra += '- insert:\n    - id: observe-recall\n      name: ' + json.dumps(str(observer)) + '\n'
            patch.write_text(extra + '- id: llm-deepseek\n  config:\n    baseURL: ' + endpoint +
                             '\n- id: session-title-llm\n  disabled: true\n- id: llm-retry\n  disabled: true\n'
                             '- id: session-telemetry-otel\n  disabled: true\n'
                             '- insert:\n    - id: verify-skill-context\n      name: ' +
                             json.dumps(str(ROOT / 'packages/pi-tools/lib/skill-context.js')) + '\n')
            args = ['headless', '--patch', str(patch), '--json', '--permission-mode', 'read-only', '--approval-policy', 'never', PROMPTS[mode]]
            if mode != 'slash': args[-1] += ' RECALL_CONTROL'
            (evidence / 'action.json').write_text(json.dumps({'version': ver.stdout.strip(), 'argv': [cli, *args],
                'endpoint': endpoint, 'fixture': fixture.read_text()}, indent=2) + '\n')
            proc = command(*args, timeout=25)
            (evidence / 'events.ndjson').write_text(proc.stdout); (evidence / 'stderr.txt').write_text(proc.stderr)
            required(proc.returncode == 0, f'DSH exited {proc.returncode}; see {evidence}/stderr.txt')
        required(len(rows) == len(EXPECTED[mode]), 'unexpected number of model requests')
        proposals = [json.loads(line) for line in (evidence / 'recall-input.ndjson').read_text().splitlines()]
        required(len(proposals) == len(rows) and not any(r['hasRoster'] for r in proposals), 'status leaked into recall input')
        required(proposals[0]['userControl'] == (mode != 'slash'), 'missing human prompt control')
        if mode == 'compact': required((evidence / 'summary-request.json').is_file(), 'no auxiliary summarization request')
        required(rows[0]['tool_declared'] and rows[0]['has_catalog_description'], 'missing catalog or skill tool')
        expected = EXPECTED[mode]
        required([r['has_body'] for r in rows] == expected, 'wrong body visibility: see requests.json')
        # History retains superseded snapshots: pruning must deliver a clear, not delete history.
        required([r['roster_count'] for r in rows] == ([0, 1, 1] if mode == 'prune' else list(map(int, expected))),
                 'wrong or duplicate Skill status: see requests.json')
        required([r['cleared'] for r in rows] == [mode in ('prune', 'compact') and i == 2 for i in range(len(rows))], 'wrong clear')
        required([r['has_named_block'] and r['has_full_fixture'] for r in rows] == expected, 'wrong named instruction block')
        events = [json.loads(line) for line in proc.stdout.splitlines()]
        required(events[-1]['type'] == 'final' and events[-1]['text'] == 'fixture complete', 'missing CLI completion')
        skill_calls = [e for e in events if e['type'] == 'tool_call' and e['tool'] == 'skill']
        required(len(skill_calls) == len(expected) - 1, 'unexpected explicit skill tool calls')
        if skill_calls:
            required(any(e['type'] == 'tool_result' and e['callId'] == skill_calls[0]['callId'] and
                         e['status'] == 'completed' and BODY in e['result'] for e in events), 'missing matching tool result')
        required(list((home / '.dsh' / 'sessions').glob('*/*/session.*')), 'isolated session journal missing')
    required(not root.exists() and (evidence / 'requests.json').is_file(), 'cleanup or retained evidence failed')
    (evidence / 'result.json').write_text(json.dumps({'feature': mode, 'exit': proc.returncode,
        'requests': len(rows), 'body_visible': expected, 'cleanup': 'scratch removed, listener closed'}, indent=2) + '\n')
    print(f'PASS {mode}: body visible {expected}; proof retained')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('mode', choices=['doctor', *PROMPTS])
    parser.add_argument('--evidence-dir', type=Path, default=ROOT / 'reports/verify-dsh-skill-context')
    args = parser.parse_args(); run(args.mode, args.evidence_dir.resolve())
