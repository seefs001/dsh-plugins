# dsh-ai-mascot

A small GPT / Claude companion in the lower-right corner of the DSH Web UI. It follows the conversation you are looking at and ignores activity in other sessions.

右下角的 GPT / Claude Q 版角色。当前会话在思考、读文件、搜索、写代码、跑命令、协作或等待确认时，它会切换提示、动作和小道具。回复正常完成后短暂庆祝一下，然后回到待机。停止和报错不会触发庆祝。

## Behavior

| Current activity | Presentation |
| --- | --- |
| Idle | Quiet breathing, without a status bubble or badge |
| Thinking | A slight head tilt with gently fading thinking dots |
| Reading files, images, skills, web pages | Slow nodding with an open book |
| Searching / grep / glob | Looking side to side with a scanning search badge |
| Writing / editing | Small typing movements with a code prop |
| Replying | A paper note with a moving pencil, distinct from coding |
| Shell / terminal / job tools | Leaning toward a green terminal with a blinking prompt |
| Subagents / teammates | A small sway with a pulsing connection badge |
| Approval / user question | Slow breathing, a steady badge, and an input prompt; no flashing reminder |
| Successful reply | One small hop and sparkle, then quiet idle |
| Prompt / agent error | Two brief, small shakes and a "check the chat" message |

- GPT, ChatGPT, Codex, and OpenAI o1/o3/o4 model IDs select the GPT character, and Claude model IDs select Claude. Matching uses the model ID, so a different model served by an OpenAI-compatible provider does not become GPT. Other models show no mascot.
- Actions come from the Chat projection's live tool calls and partial reply, plus the session's running, error, and pending-interaction state. A tool call that is still being prepared counts as thinking until it is dispatched. When tools run concurrently, the latest active call wins, including nested calls.
- The character has no visible model-name label. Idle shows no status text or badge; the other states keep their messages and controls. GPT uses brisk copy such as "理理思路…", and Claude gentler copy such as "想一想…". Each message reflects the actual activity, with no fake progress or rotating chatter.
- This version animates a static front-view reference image with CSS and props. There are no frame-by-frame sprites, Live2D model, or new character poses.
- Drag the character to move it. Its position stays inside the viewport and is remembered in this browser. The collapsed 40px status button can be dragged too, and a click without dragging expands it. With the character or the compact button focused, arrow keys move it, and `Shift` makes larger steps. Clicks pass through the status text.
- The character has no oval backing. In browser memory, the front-view crop is made transparent by clearing near-white background pixels connected to the edge, which keeps enclosed white details. No processed artwork is bundled or uploaded. If an image fails to load, the character's name is shown in its place.
- Settings offer two sizes and an animation toggle. Preferences, including position, stay in this browser's local storage under `dsh-ai-mascot:preferences`. The system `prefers-reduced-motion` setting is respected. There is no sound.
- The UI copy is in English and Chinese. The gear button shows the artwork sources, and `Escape` closes settings.
- There is no Host process, polling, transcript upload, extra session retention, model change, or tool execution. The header observer renders nothing; the companion itself mounts in the additive `shell.overlay` seat. It disappears on other global panels or when the displayed conversation unmounts.
- The two reference images load from `selinlee.github.io`, so first use needs access to that site, and the browser sends it an ordinary image request. The request carries no conversation data and no referrer. If an image fails to load, the character's name and the activity stay visible.

## Install

For local development, add the package through DSH's Plugin Manager with a `link:` spec that points to this directory, for example `link:/absolute/path/to/dsh-plugins/packages/ai-mascot`, then enable the `dsh-ai-mascot` bundle. The package is plain JavaScript and needs no build or extra dependencies. Plugin and profile changes affect every session in the profile.

Installing this package does not grant rights to the referenced artwork. Read the terms below before enabling it, especially for public or commercial use.

## Artwork and rights

The plugin's code and its original catalog icon use the repository's MIT license. The character designs and reference images do not.

- Original GPT / Claude character designs: [ZipZipPipe](https://www.pixiv.net/users/18604994). [Original collection](https://www.pixiv.net/artworks/148186519).
- Q-version reference sheets and hosting: [AI Moe Atlas](https://selinlee.github.io/ai-moe-atlas/zh/chibi/), `super-chibi-v1` collection.
- Referenced images: [GPT](https://selinlee.github.io/ai-moe-atlas/generated/super-chibi-v1/openai/preview.webp), [Claude](https://selinlee.github.io/ai-moe-atlas/generated/super-chibi-v1/claude/preview.webp).
- [Atlas rights statement](https://github.com/SelinLee/ai-moe-atlas/blob/main/RIGHTS.md): the site's MIT license covers code, not the artwork. ZipZipPipe designs require attribution and prohibit commercial use under the stated `LicenseRef-ZipZipPipe-NC` terms. The generated Q-version sheets are references. They are neither the original artwork nor animation rigs, and displaying them grants no further adaptation or redistribution rights.

This package references those existing hosted images, crops the front view for display, and does not copy them into the published package. Attribution and remote referencing do not replace permission. No broader rights to distribute animated or adapted versions have been obtained. Obtain permission or replace the `ART` URLs with artwork you have licensed before commercial use, redistribution of the images, or wider release. Neither the characters nor this plugin are official OpenAI or Anthropic products.

## State model

The model covers the mascot of the one conversation currently displayed. Read-only Session and Chat selector props feed a headless observer, and a shared in-memory bridge publishes `{ sessionId, character, activity }` to the overlay.

| Event | Transition |
| --- | --- |
| Observer mounts / facts change | Derive waiting first, then running tool/reply/thinking, then error, otherwise idle |
| Same observer: running → stopped, final node is a non-interrupted text reply, no error or pending interaction | `done` for 2400ms, then idle |
| Stop / interrupted reply / failed turn | Idle or error, never completion celebration |
| Switch displayed session | New observer owns publication; old cleanup cannot clear its state |
| Unmount / plugin disposal | Clear publication, subscriptions, CSS, and pending completion timer |
| Collapse / expand | Change browser-only presentation, without affecting Session activity |
| Primary pointer down → move → up / cancel / lost capture | Capture the pointer, clamp movement to the viewport, then remember the last dragged position; ignore unrelated pointers and movement under 4px |
| Viewport resize / size change | Keep the remembered position inside the current viewport without changing Session activity |
| Global panel selected / unknown model | Hide overlay and finish any active drag at its last valid position, without changing the Session |

Repeated facts change nothing. A completion timeout can change only the publication that scheduled it. Cleanup from an old observer is ignored once another observer owns the publication. The bridge never changes a session or opens one it does not observe.

## Validation boundary

Use the repository's package validator, lint for this package, and the existing tests. An isolated browser preview can run the same client module against synthetic read-only Session and Chat snapshots without installing it. Such a preview does not replace checking the installed plugin in an authenticated DSH GUI.
