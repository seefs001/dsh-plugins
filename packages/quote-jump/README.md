# dsh-quote-jump

Replaces the quote pill in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) user messages with a quote block. Click the block (or focus it and press Enter) to scroll to the quoted text earlier in the conversation and highlight it for about two seconds.

## How it works

Browser only (`lib/client.js`). The Host half is a no-op that the Loader needs for the bundle row.

- Registers the `quote` key of `conversation.user.text.node` at priority 50, which shadows the built-in renderer from `dsh-message-quotes` (priority 100). Disabling the plugin restores the built-in pill.
- Matching ignores whitespace, so Markdown layout differences do not matter. When several places match, the closest one above the quote wins. Long quotes fall back to their first 48 characters.
- The highlight uses the CSS Custom Highlight API and falls back to an outline.
- Folded rows (`hidden="until-found"`, `<details>`) are opened before scrolling.

## Limits

- Only text that is loaded in the page can be found. If the original message is in history that has not loaded yet, the block shows a short "not found" hint; scroll up to load it and click again.
- Quotes from code blocks or tables match by text, which can fail when the rendered text differs from the copied selection.
