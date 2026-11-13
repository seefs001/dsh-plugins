# dsh-ai-mascot

A small GPT / Claude companion in the lower-right corner of the DSH Web UI. It follows the conversation you are looking at and ignores activity in other sessions.

右下角的 GPT / Claude Q 版小伙伴。当前会话在思考、读文件、搜索、写代码、跑命令、协作、等待确认时，切换提示、动作和小道具。正常完成回复后短暂庆祝，随后回到待机。停止和报错不会触发庆祝。

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
| Prompt / agent error | Two brief, small shakes and a “check the chat” message |

- GPT, ChatGPT, Codex and OpenAI o1/o3/o4 model IDs select the GPT character. Claude model IDs select Claude. Matching uses the model ID, so an OpenAI-compatible provider serving a different model does not turn it into GPT. Other models do not display a mascot.
- Actions use the actual Chat projection's live tool calls and partial reply, plus Session running/error/pending-interaction facts. A preparing tool call remains “thinking” until dispatched. For concurrent tools, the latest active call wins, including nested calls.
- The character has no visible model-name label. Idle shows no status text or badge; active-state messages and controls remain available. GPT uses brisk copy such as “理理思路…” and Claude uses gentler copy such as “想一想…”. Each message follows the actual activity, without fake progress or rotating chatter.
- This version animates a static front-view reference image with CSS and props. There are no frame-by-frame sprites, Live2D model, or new character poses.
- Drag the character to move it. Its position stays inside the viewport and is remembered in this browser. The collapsed 40px status button can also be dragged; a click without dragging expands it. Focus the character or compact button and use arrow keys to adjust its position (`Shift` for larger steps). Status text remains click-through.
- The oval backing has been removed. The front-view crop is made transparent in browser memory by clearing edge-connected near-white background pixels, preserving enclosed white details. No processed artwork is bundled or uploaded.
- Settings offer two sizes and an animation toggle. Preferences, including position, stay in this browser's local storage under `dsh-ai-mascot:preferences`. System `prefers-reduced-motion` is respected. No sound.
- English and Chinese UI copy. Source attribution is available from the gear button. `Escape` closes settings.
- No host process, polling, transcript upload, extra Session retention, model change, or tool execution. The header observer returns no UI; the actual companion mounts in the additive `shell.overlay` seat. It disappears on other global panels or when the displayed conversation unmounts.
- The two reference images are loaded from `selinlee.github.io`, so first use requires access to that site and sends the normal image request to that host. No conversation data or referrer is sent with the request. An image-load failure leaves the model name and activity visible.

## Install

Requires Node.js `^22.19.0 || >=24.0.0` and DSH `>=0.2.2-rc.1 <0.3.0`.

For local development, add the package through DSH's plugin manager using a `link:` spec pointing to this directory, for example `link:/absolute/path/to/dsh-plugins/packages/ai-mascot`. Then enable the `dsh-ai-mascot` bundle. No build or additional dependency install is required for this plain-JavaScript package. Plugin/profile changes affect other sessions in the same profile; perform them only when intended.

Installing this package does **not** grant rights to the referenced artwork. Review the following terms before enabling it, especially for public or commercial use.

## Artwork and rights

The plugin's **code and original catalog icon** use the repository's MIT license. The character designs and reference images do **not**.

- Original GPT / Claude character designs: **[ZipZipPipe](https://www.pixiv.net/users/18604994)**. [Original collection](https://www.pixiv.net/artworks/148186519).
- Q-version reference sheets and hosting: **[AI Moe Atlas](https://selinlee.github.io/ai-moe-atlas/zh/chibi/)**, `super-chibi-v1` collection.
- Referenced images: [GPT](https://selinlee.github.io/ai-moe-atlas/generated/super-chibi-v1/openai/preview.webp), [Claude](https://selinlee.github.io/ai-moe-atlas/generated/super-chibi-v1/claude/preview.webp).
- [Atlas rights statement](https://github.com/SelinLee/ai-moe-atlas/blob/main/RIGHTS.md): the site's MIT license covers code, not the artwork. ZipZipPipe designs require attribution and prohibit commercial use under the stated `LicenseRef-ZipZipPipe-NC` terms. The generated Q-version sheets are references, not source originals or animation rigs; display does not grant additional adaptation or redistribution rights.

This package references those existing hosted images, crops the front view for display, and does not copy them into the published package. Attribution and remote referencing are **not a substitute for permission**. Broader rights for distributing animated/adapted versions have not been established. Obtain permission or replace the `ART` URLs with artwork you have licensed before commercial use, redistribution of the images, or wider release. Neither the characters nor this plugin are official OpenAI or Anthropic products.

## State model

Subject: one currently displayed conversation's mascot. Public seam: read-only Session/Chat selector props enter the headless observer; a shared in-memory bridge publishes `{ sessionId, character, activity }` to the overlay.

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

Duplicate facts are a no-op. A completion timeout may change only the exact publication that scheduled it. Old observer cleanup is ignored after ownership changes. The bridge never mutates a Session or opens an unobserved one.

## Validation boundary

Use the repository's existing package validator, targeted lint, and existing test suite. No new unit/integration test files are required. An isolated browser preview can exercise the same client module with synthetic read-only Session/Chat snapshots without installing it. That preview is not a replacement for an authenticated, installed-plugin check in the real DSH GUI.
