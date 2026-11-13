// Keep native source and tool declarations intact. Recovery belongs to the
// next model-authored call, never a guessed rewrite or an automatic replay.
export const CODEMODE_STRING_GUIDANCE = [
  'These JavaScript rules apply inside codemode to every string argument: shell commands, file contents, edit text, paths, regex/glob patterns, and MCP fields. Ordinary quoted strings cannot contain literal line breaks or unescaped matching quotes.',
  'Use String.raw template literals for literal backslashes or nested quotes when the text contains neither backticks nor ${...}. Ordinary JS strings interpret escapes: \\n becomes a newline, \\t a tab, and \\d loses its backslash. Use ordinary escapes only when that conversion is intended.',
  'String.raw still evaluates ${...}; escaping interpolation or backticks inside it retains extra backslashes. For literal ${...} or backticks, use correctly escaped ordinary strings or concatenate raw chunks with ordinary strings such as \'${HOME}\' or \'`\'. Do not guess variable values or blindly add backslashes.',
  'Literal line endings inside templates, including String.raw, normalize to LF. For exact CRLF/CR bytes, use explicit \\r\\n or \\r escapes in ordinary strings, or preserve an existing string value.',
  'Pass objects/arrays directly when the tool schema expects them. To produce JSON text, use JSON.stringify on structured values instead of assembling nested JSON by hand.',
  'Nested Python example JavaScript:',
  'text(await tools.bash({ command: String.raw`python3 -c \'print("\\n".join(["a", "b"]))\'` }));',
  'Literal shell expansion example JavaScript (the shell, not JavaScript, expands HOME):',
  'text(await tools.bash({ command: String.raw`printf \'%s\\n\' "` + \'${HOME}\' + \'"\' }));',
  'Multiline heredoc example JavaScript:',
  "const command = String.raw`node --input-type=module <<'JS'",
  "console.log('a\\nb');",
  'JS`;',
  'text(await tools.bash({ command }));',
  'For codemode JSON transport, code contains JavaScript source, not a JSON string literal of that source; JSON-encode the outer input once. For raw-JavaScript transport, send source directly. Double-encoding source can create an inert string literal that calls no tools.',
  'For a single operation with an already available direct tool, avoid an unnecessary codemode wrapper. Direct tool arguments are plain JSON values, not JavaScript literal syntax; do not add codemode escaping. Neither route permits enabling tools or changing permissions to work around a denial.',
].join('\n')

export function withCodemodeSyntaxGuidance(result, attemptedCalls, signal) {
  if (!result.isError || signal.aborted || attemptedCalls !== 0 || result.details?.calls?.length !== 0) return result
  const error = result.content.find(block => block.type === 'text'
    && /^Script error:\n(?:SyntaxError|ReferenceError):/m.test(block.text))
  if (!error) return result
  const reference = /^Script error:\nReferenceError:/m.test(error.text)
  return {
    ...result,
    content: [...result.content, {
      type: 'text',
      text: (reference ? 'Codemode JavaScript reference recovery\n' : 'Codemode JavaScript syntax recovery\n')
        + 'No nested tool calls were made. '
        + (reference
          ? 'Check undeclared JavaScript names. If ${...} was intended as literal tool input, prevent JavaScript interpolation; String.raw still evaluates it. '
          : 'Use the reported location to correct the JavaScript source, or the input to JSON.parse/eval if the error arose there. ')
        + 'Correct the cause before resubmitting codemode with its existing input; do not repeat unchanged code, enable tools, or change permissions.\n\n'
        + CODEMODE_STRING_GUIDANCE,
    }],
  }
}
