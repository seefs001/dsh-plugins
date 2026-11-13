# dsh-recent-sessions

Sorts the session rows in the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `@` reference menu by last activity, newest first.

## How it works

The plugin runs in the browser (`lib/client.js`). Its Host half is empty; the Loader needs it for the bundle row.

It wraps `candidates()` on the built-in `@` source (`reference`, from `dsh-client-ui-reference`). Each contiguous run of session rows in a section is sorted by the session's `updatedAt`; ties keep their original order. File rows and other sections are left alone. Disabling the plugin restores the original function.

The source registers asynchronously, so the plugin looks for it every 500 ms and gives up after about 30 seconds.

## Compatibility

The plugin relies on internals of `dsh-client-ui-reference`: the source name `reference`, the `icon: 'session'` row shape, and the `dsh-session:` mention encoding. If a DSH release changes them, the plugin stops sorting and reports no error.
