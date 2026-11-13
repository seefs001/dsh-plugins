// Keep native source and tool declarations intact. Recovery belongs to the
// next model-authored call, never a guessed rewrite or an automatic replay.
export const CODEMODE_STRING_GUIDANCE = [
  'Codemode string literals must be valid JavaScript after transport decoding. Ordinary single- or double-quoted strings cannot contain literal line breaks.',
  'For multiline shell commands or heredocs without backticks or ${...}, use a String.raw template literal so embedded backslashes (such as \\n in a Node script) remain intact.',
  'String.raw still interpolates ${...}. If the command contains backticks or ${...}, use correctly escaped ordinary strings or string concatenation instead; do not blindly add backslashes, which can change shell behavior.',
  'Example JavaScript:',
  "const command = String.raw`node --input-type=module <<'JS'",
  "console.log('a\\nb');",
  'JS`;',
  'text(await tools.bash({ command }));',
  'On JSON tool routes, JSON-encode the complete JavaScript source exactly once. On raw-JavaScript routes, submit the source directly. Neither route changes JavaScript string-literal rules.',
].join('\n')

export function withCodemodeSyntaxGuidance(result, attemptedCalls, signal) {
  if (!result.isError || signal.aborted || attemptedCalls !== 0 || result.details?.calls?.length !== 0) return result
  const stringError = result.content.some(block => block.type === 'text'
    && /^Script error:\nSyntaxError: unexpected end of string(?:\n|$)/m.test(block.text))
  if (!stringError) return result
  return {
    ...result,
    content: [...result.content, {
      type: 'text',
      text: 'Multiline command quoting\n'
        + 'No nested tool calls were made. Check for literal line breaks inside ordinary quoted strings. Correct the JavaScript and resubmit codemode using its existing input; do not change tools or permissions.\n\n'
        + CODEMODE_STRING_GUIDANCE,
    }],
  }
}
