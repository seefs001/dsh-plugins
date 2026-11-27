# dsh-mobile-boost

Pure Web CSS mitigation plugin for mobile and coarse-pointer browsers in DeepSeek Harness (DSH).

## What it mitigates

Active only under `@media (max-width: 768px), (pointer: coarse)` (desktop layouts are untouched):

- **Offscreen chat history skipping**: Applies `content-visibility: auto; contain-intrinsic-size: auto 96px` to older chat nodes while keeping the latest 4 nodes, hidden/folded nodes, and compaction markers untouched.
- **Collapsed drawer isolation**: Applies `content-visibility: auto` to the collapsed mobile sidebar list area so offscreen workspace rows skip layout and paint while still opening smoothly.
- **Drawer grid-transition guard**: Disables the unused `grid-template-columns` transition on `[data-sidebar-drawer][data-animating]`.
- **Host backdrop blur fallback**: Sets `--dsw-menu-backdrop-filter: none`, `--dsw-mask-blur: none`, and an opaque `--dsw-specific-menu` fallback across host popovers and docks on mobile.
- **Composer touch & paint reduction**: Sets `touch-action: manipulation` on composer and sidebar rows, replaces heavy composer card elevation shadows with a hairline border shadow, and disables flow `margin-top` transitions on mobile.

## Install

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/mobile-boost"
```
