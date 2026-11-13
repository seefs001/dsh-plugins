# dsh-recent-sessions

Sorts the session rows in the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `@` reference menu by last activity, newest first.

## How it works

Browser only (`lib/client.js`). The Host half is a no-op that the Loader needs for the bundle row.

The plugin wraps `candidates()` on the built-in `@` source (`reference`, from `dsh-client-ui-reference`). Each contiguous block of session rows in the same section is sorted by the session's `updatedAt`. Ties keep their original order. File rows and other sections are not touched. Disabling the plugin restores the original function.

The source registers asynchronously, so the plugin looks for it every 500 ms and gives up after 30 s.

## Compatibility

This relies on internals of `dsh-client-ui-reference`: the source name `reference`, the `icon: 'session'` row shape, and the `dsh-session:` mention encoding. If a DSH release changes them, the plugin stops sorting and reports no error.
