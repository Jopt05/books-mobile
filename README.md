# Books Mobile

Mobile app for the books application built with React Native, Expo and TypeScript.

## Tech Stack

- React Native 0.79
- Expo SDK 53
- TypeScript
- React Navigation (Stack, Tabs, Drawer)
- Axios
- Roboto Condensed (`@expo-google-fonts/roboto-condensed`)
- AsyncStorage
- Expo Image Picker
- Expo Document Picker
- React Native Reanimated
- React Native Gesture Handler

## Project Structure

```
src/
├── api/          # HTTP services (client, auth, books, userBooks, feed, follows, journal, reviews, users, importBooks, recommendations)
├── components/   # Reusable components (BookCard, ActivityCard, AppHeader, SearchBar, ShelfButton, ReviewCard, RecommendationsSection, etc.)
├── context/      # Providers (AuthContext, ThemeContext, LanguageContext)
├── hooks/        # Custom hooks (useBooks, useBookDetail, useFeed, useProfile, useFollow, useJournal, useRecommendations, etc.)
├── i18n/         # Translation files (en.json, es.json)
├── navigation/   # Navigation config (RootNavigator, AuthStack, MainTabs)
├── screens/      # Screen components (Home, BookDetail, Feed, Auth, Profile, Settings, etc.)
├── theme/        # Typography and visual tokens
├── types/        # TypeScript interfaces (book, auth, user, domain)
└── utils/        # Utility functions (mapBook)
```

## Typography

The app uses **Roboto Condensed** (same as the web frontend) for visual consistency across platforms.

### How it works

1. Fonts are loaded in `App.tsx` via `useFonts` from `@expo-google-fonts/roboto-condensed`.
2. `Text.defaultProps` applies `fonts.regular` globally — all text renders in Roboto Condensed without explicit config.
3. Bold text uses `fontFamily: fonts.bold` in its StyleSheet.
4. **No `fontWeight` is used anywhere** — only `fontFamily`.

### Configuration

All typography lives in `src/theme/typography.ts`:

```ts
import { fonts } from '../theme/typography';

// Regular text — inherited automatically via defaultProps
// Bold text — explicit in StyleSheet:
{ fontFamily: fonts.bold }
```

Available presets:

| Preset        | Font     | Size | Web equivalent |
|---------------|----------|------|----------------|
| `pageTitle`   | bold     | 28px | text-3xl/4xl   |
| `sectionTitle`| bold     | 20px | text-xl        |
| `body`        | regular  | 16px | text-base      |
| `caption`     | regular  | 14px | text-sm        |
| `bodyBold`    | bold     | 16px | text-base bold |
| `captionBold` | bold     | 14px | text-sm bold   |

### Rules

- Never use `fontWeight`. Use `fontFamily: fonts.bold` or `fonts.regular`.
- Minimum font size: 14px.
- To change the font app-wide, edit only `src/theme/typography.ts` and the `useFonts` call in `App.tsx`.

## Features

- Authentication (login/register) with JWT + refresh token
- Password reset via email
- Dark/light mode with warm color palette
- Internationalization (English/Spanish)
- Book search powered by Google Books API (with abstraction layer)
- Book detail with full metadata, journal, and reviews
- Personal bookshelf with statuses (Want to Read, Reading, Read, Did Not Finish)
- User profile with avatar upload and bio editing
- Public user profiles
- Follow/unfollow system with follower/following counts
- Social feed with personal (following) and global tabs
- Infinite scroll pagination (cursor-based)
- Reading journal with page/percentage progress tracking
- Currently Reading widget with progress bars
- Reading stats (monthly/yearly)
- Reading streak tracking
- Recommendations: "What your friends are reading" (social) + "Trending on Anaquel" (popular)
- Star rating and review system with spoiler handling
- Goodreads CSV import
- Pull-to-refresh on all screens
- Drawer navigation with settings access

## Setup

```bash
npm install
cp .env.example .env
npx expo start
```

## Environment Variables

| Variable              | Description     |
|-----------------------|-----------------|
| EXPO_PUBLIC_API_URL   | Backend API URL |
