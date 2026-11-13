# dsh-quote-jump

Shows quotes in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) user messages as blocks. Click a block, or focus it and press Enter, to scroll to the quoted text earlier in the conversation and highlight it for about 2.4 seconds.

## How it works

The plugin runs in the browser (`lib/client.js`). Its Host half is empty; the Loader needs it for the bundle row.

- It registers the `quote` key of `conversation.user.text.node` at priority 50, which shadows the built-in renderer from `dsh-message-quotes` (priority 100). Disabling the plugin brings back the built-in pill.
- Matching ignores whitespace, so Markdown layout differences do not matter. When several places match, the closest one above the quote wins. Long quotes are matched by their first 48 characters.
- The highlight uses the CSS Custom Highlight API and falls back to an outline.
- Folded rows (`hidden="until-found"` and `<details>`) are opened before scrolling.

## Limits

- Only text already loaded in the page can be found. If the original message is in history that has not loaded yet, the block shows a short "not found" hint. Scroll up to load it and click again.
- Quotes taken from code blocks or tables are matched as text, which fails when the rendered text differs from the copied selection.
