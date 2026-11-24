# dsh-model-favorites

Star models in the DSH model picker to pin a **Favorites** group at the top of the model list, switch favorites directly from the root model menu, and keep favorites synced across browsers on the same Host.

## Features

- **Star directly in the Model list**: Click the star next to any model row in the composer's Model list to favorite or unfavorite it without switching models or closing the menu.
- **Pinned Favorites group**: Starred models appear in a dedicated **Favorites** section at the top of the Model list (filtered in sync with search) and at the top of the `/model` popup.
- **One-click root menu switching**: Up to 5 favorite models appear directly in the composer's root model menu for faster switching.
- **Manage & reorder**: Open **Favorites** from the model menu to star/unstar the current model, reorder favorites with up/down controls, or clean up unavailable entries.
- **Host persistence**: Stored in the `model_favorites` DSH storage domain and synchronized across tabs via `BroadcastChannel`.

## Install

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/model-favorites"
```

## Storage & HTTP API

- Storage domain: `model_favorites` (`@deepseek-ai/dsh-storage-domain`)
- `GET /model-favorites/state`: Read the ordered list of `{ provider, model }` favorites (owner auth required)
- `POST /model-favorites/op`: Mutate favorites (`list`, `add`, `remove`, `toggle`, `move`, `reorder`, `clear`)
- Agent tool: `model_favorites` (registered when `tools` is available)
