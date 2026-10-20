# AGENTS.md

Guidelines and reference for AI agents working in the **mtgcarddb** repository.

---

## 1. Project Overview

**mtgcarddb** is a Node.js REST API service for cataloging and managing Magic: The Gathering (MTG) card collections. It integrates with Scryfall for card artwork and card data, persists records in a local SQLite database, and serves both REST endpoints and server-rendered Bootstrap/DataTables web views.

---

## 2. Tech Stack & Architecture

- **Runtime**: Node.js (ES Modules, `"type": "module"` in `package.json`).
- **Web Framework**: Express 5.x with CORS middleware.
- **API Documentation**: OpenAPI / Swagger generation via `express-oas-generator`.
- **Database**: SQLite3 (`./db/mtgCardDB.db`) using the `sqlite3` driver.
- **Utilities**: `lodash` for collection operations.
- **Frontend / Views**: Server-rendered HTML with Bootstrap 5, jQuery, and jQuery DataTables.
- **Server**: HTTPS server listening on port `8080` (requires SSL certificates `privkey.pem` and `fullchain.pem`).

---

## 3. Directory & File Structure

```
mtgcarddb/
├── card/
│   ├── MtgCard.js        # MtgCard class model and comparison/sorting utilities
│   └── mtgCardDB.js      # SQLite database access layer (CRUD operations)
├── db/                   # SQLite database directory (auto-created: mtgCardDB.db)
├── cardsManager.js       # Main server entry point, Express routes, HTML view generation
├── package.json          # Project manifest and dependencies
├── package-lock.json     # Dependency lockfile
├── README.md             # High-level project description
├── niceToHave.md         # Feature roadmap and backlog
└── AGENTS.md             # AI Agent guidelines and project documentation
```

---

## 4. Key Components & Conventions

### `cardsManager.js`
- Serves as the primary entry point (`main` in `package.json`).
- In-memory array `cards` is loaded at startup from SQLite via `mtgCardDB.loadAllCards()`.
- Provides REST endpoints:
  - `GET /` - HTML view of all cards using DataTables and Bootstrap.
  - `GET /card` - Card lookup.
  - `GET /set` - List known sets or cards belonging to a set.
  - `POST /card` - Add a card (fetches Scryfall metadata if needed, stores in DB and memory).
  - `PUT /card/:id` - Update number of cards owned.
  - `PUT /cardPrice/:id` - Update card price.
  - `DELETE /card` - Delete a card by ID.
- Uses HTTPS with local `privkey.pem` and `fullchain.pem`. When testing locally without SSL certificates, mock or guard the `https.createServer` call.

### `card/MtgCard.js`
- Class `MtgCard` schema:
  - `id`: Unique identifier (e.g., `123-setcode`)
  - `name`: Card name
  - `numberOwned`: Count of cards owned
  - `imgUrl`: Scryfall image URL
  - `manaCost`: Mana cost string (e.g., `{2}{U}`)
  - `cmc`: Converted mana cost (numeric)
  - `colorIdentity`: Color identity string
  - `layout`: Card layout (e.g., `normal`)
  - `price`: Market/purchase price
- Exports sorting helpers: `compareCardById(card, cardToCompare)` and `compareCardByName(card, cardToCompare)`.

### `card/mtgCardDB.js`
- SQLite helper that automatically creates table `mtgCards` in `./db/mtgCardDB.db`.
- **Always use SQL parameter binding (`?`)** to prevent SQL injection vulnerabilities.
- Exported functions:
  - `loadAllCards()`
  - `addCard(card)`
  - `deleteCard(id)`
  - `updateNumberOwnedCard(id, numberOwned)`
  - `updateCardPrice(id, price)`

---

## 5. Development Guidelines & Best Practices

1. **JavaScript & Module System**:
   - Always use standard ES Module syntax (`import` / `export`). Do not use CommonJS `require()`.
   - Validate JS syntax using `node --check <file>` before committing changes.

2. **Dependency Management**:
   - Core server dependencies (`cors`, `express`, `express-oas-generator`) follow exact version pinning (e.g., `"5.3.0"` without `^`).
   - When installing or upgrading dependencies, maintain the pinning convention:
     ```bash
     npm install --save-exact <package>@<version>
     ```
   - Regularly verify vulnerability status using `npm audit`.

3. **Database & Queries**:
   - Keep SQL queries parameterized with placeholders (`?`).
   - Synchronize in-memory cache (`cards` array in `cardsManager.js`) whenever database mutations occur.

4. **API Responses**:
   - Return appropriate HTTP status codes: `200` for success, `400` for invalid parameters, `404` for not found, `500` for internal server errors.
   - Maintain consistency between JSON and text/HTML output formats.
