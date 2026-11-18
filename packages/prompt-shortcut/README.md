# dsh-prompt-shortcut

**Prompt shortcuts** (常用片段) adds a bookmark button to the left side of the DSH composer toolbar, immediately after **Skill cheat sheet** when both plugins are enabled. A pick inserts plain text at the captured cursor, or replaces the selected text. It does not send a message, run a skill, or change the slash menu. One editor undo reverses the insertion.

## Use

- Open the bookmark button in a session. On desktop the picker floats above the composer, aligned to its left and right edges without taking up chat space. If there is too little room above and more space below, it opens downward. Click a snippet to insert it. Search by name or text; Enter inserts the highlighted match (initially the first). Use the arrow keys to focus another row and Enter to insert it. Escape closes the picker. On narrow screens it opens as a bottom sheet.
- With an empty library, try the labeled example, write your first snippet, or start from your current draft. **Remove example** hides it in this browser even after reopening the picker. Use **Undo** in the open picker to bring it back. In a populated library, use **New** for a blank snippet or **Save from draft** to copy the current text. Review the body and its suggested name before saving. Editing this copy does not edit the draft; attachments are never copied. Inline references are represented by their clipboard text, not as live chips.
- Use **More** (⋯) on a row to pin, edit or delete. Pins keep their order; successful insertions move unpinned snippets into **Recently used**. Undo the most recent deletion in the open picker before closing it or deleting another snippet.
- If the draft changes or the composer is submitting, insertion is refused. Close the picker, place the cursor again and retry. Nothing overwrites the new draft.

## Storage

The library is saved only to this browser’s local storage for this DSH origin. Sessions and tabs at the same origin share it. Other devices and browser profiles do not. Clearing site data removes the library. There is no Host database, agent tool, telemetry or model call.

## Install

Requires DSH 0.2.2-rc.3 or later in the 0.2.x line. In **Plugins → Add plugin**, select the local `packages/prompt-shortcut` directory. Follow Plugin Manager’s activation result and refresh the Web page to load the client.
