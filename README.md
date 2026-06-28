# Shelfed

> Build a visual shelf of every movie you've watched in your life.

Shelfed is a cross-platform (iOS + Android) movie app with a **swipe-to-sort**
discovery feed and a sepia, 90s-videothek / DVD-rental aesthetic. You flip
through full-screen movie cards and sort them onto shelves:

| Gesture / Tap        | Meaning                          | Signal for recommendations |
| -------------------- | -------------------------------- | -------------------------- |
| **Swipe right →**    | I've **watched** this            | positive (weak)            |
| **Swipe left ←**     | **Skip** — not interested        | negative                   |
| **Star** (tap)       | Add to **Watchlist** (watch later) | intent                   |
| **Heart** (tap)      | **Favorite** — an all-time love  | positive (strong)          |

Everything is stored locally and kept in **separate buckets** (watched,
watchlist, favorites, skipped) so a future recommendation engine can learn your
taste: watched + favorites are positive signals, skips are negative.

---

## Tech stack & why

| Choice | Why |
| ------ | --- |
| **Expo (SDK 56) + expo-router** | One codebase for iOS & Android, file-based routing, easy to run on a real phone with Expo Go. |
| **TypeScript (strict)** | Catches mistakes before runtime; self-documents the data model. |
| **TMDB API** | Free, huge catalog, great poster/artwork CDN, simple REST. (See "Why TMDB" below.) |
| **expo-sqlite** | On-device relational store — perfect for separate, queryable interaction buckets and an offline-first shelf. |
| **@tanstack/react-query** | Handles the infinite feed, caching, and cache-invalidation when you sort a movie. |
| **react-native-reanimated 4 + gesture-handler** | 60fps swipe animations that run on the UI thread (buttery, no jank). |
| **expo-image** | Cached, fast poster loading with blurhash placeholders. |

### Why TMDB (vs OMDb / Trakt)

We compared three options:

- **OMDb API** — simple, but you fetch one movie at a time by IMDb id; there is
  no rich "discover / browse by popularity & decade" endpoint and image support
  is limited. Bad fit for an endless swipe feed.
- **Trakt** — great for social / watch-tracking, but its catalog/discovery is
  geared toward TV/scrobbling and requires OAuth even for browsing. Heavier than
  we need for a first version.
- **TMDB ✅ (chosen)** — free API key, a powerful `/discover/movie` endpoint
  (filter by decade, popularity, vote count), and a fast image CDN with multiple
  poster sizes. It gives us exactly the "browse great-looking movies forever"
  experience the swipe feed needs.

---

## Project structure

```
shelfed/
├─ app/                        # expo-router screens (the "pages")
│  ├─ _layout.tsx              # root: fonts, SQLite init, React Query, gesture root
│  └─ (tabs)/
│     ├─ _layout.tsx           # bottom tab bar (Discover / Shelf / Watchlist / Favorites)
│     ├─ index.tsx             # Discover — the swipe feed
│     ├─ shelf.tsx             # Watched shelf
│     ├─ watchlist.tsx         # Watchlist
│     └─ favorites.tsx         # Favorites
└─ src/
   ├─ api/                     # TMDB client + normalized Movie types
   ├─ constants/              # config (URLs, feed tuning) + genre fallbacks
   ├─ theme/                  # sepia color palette, retro fonts, spacing
   ├─ db/                     # SQLite schema + connection/migration
   ├─ repositories/          # data-access layer (abstracts storage)
   ├─ hooks/                 # useMovieFeed, useInteractions, useShelf
   ├─ components/            # MovieCard, SwipeDeck, ShelfGrid, etc.
   └─ recommendations/       # future recommender data contract (signals export)
```

**Why this layout:** UI (`components`) is separated from data access
(`repositories`) by an interface. SQLite lives behind `MovieRepository` /
`InteractionRepository`, so a cloud backend can replace it later without
touching the screens.

---

## Getting started

### 1. Install dependencies (already done if you scaffolded here)

```powershell
npm install
```

### 2. Add a free TMDB token

1. Create a free account at https://www.themoviedb.org/ and request an API key
   (Settings → API). Copy your **v4 "API Read Access Token"** (a long JWT).
2. Copy the example env file and paste your token:

   ```powershell
   Copy-Item .env.example .env
   ```

   Then edit `.env`:

   ```
   EXPO_PUBLIC_TMDB_ACCESS_TOKEN=eyJ...your token...
   ```

   > Security note: `EXPO_PUBLIC_*` vars are bundled into the app and can be
   > extracted from the binary. A read-only TMDB token is fine for this; never
   > put a secret/write key here. For production, proxy TMDB through a small
   > backend.

### 3. Run it

```powershell
npx expo start
```

Then:
- **Phone:** install **Expo Go** and scan the QR code.
- **iOS simulator:** press `i`  •  **Android emulator:** press `a`.

Without a token the app still launches and shows a friendly "add your TMDB
token" message instead of the feed.

---

## Useful scripts

```powershell
npm run typecheck   # tsc --noEmit (strict type check)
npm run start       # expo start
npm run android     # expo start --android
npm run ios         # expo start --ios
```

---

## Roadmap (built to extend)

- **Recommendations:** `src/recommendations/buildRecommendationDataset()` already
  assembles your taste profile (favorites > watched, minus skips) plus movie
  metadata — ready to feed a content-based or collaborative scorer.
- **Cloud sync:** swap the SQLite repositories for an API-backed implementation
  of the same interfaces.
- **More detail:** a movie detail screen, search, and streaming-availability.
