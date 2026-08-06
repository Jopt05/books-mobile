# Librerio — Mobile

App móvil de Librerio, una red social de lectura. Construida con React Native, Expo y TypeScript.

## Tech Stack

- React Native 0.81
- Expo SDK 54 (New Architecture)
- TypeScript
- Expo Router 6 (file-based routing)
- Axios
- Roboto Condensed (`@expo-google-fonts/roboto-condensed`)
- Expo Secure Store (token storage)
- Expo Image Picker
- Expo Document Picker
- React Native Reanimated
- React Native Gesture Handler
- React Native Pager View + Tab View

## Tipografía

La app usa **Roboto Condensed** (igual que el frontend web) para consistencia visual.

### Funcionamiento

1. Fuentes cargadas en `App.tsx` vía `useFonts` de `@expo-google-fonts/roboto-condensed`.
2. `Text.defaultProps` aplica `fonts.regular` globalmente.
3. Bold usa `fontFamily: fonts.bold` en StyleSheet.
4. **No se usa `fontWeight`** — solo `fontFamily`.

### Configuración

Toda la tipografía vive en `src/theme/typography.ts`:

| Preset         | Font    | Size | Equivalente web |
|----------------|---------|------|-----------------|
| `pageTitle`    | bold    | 28px | text-3xl/4xl    |
| `sectionTitle` | bold    | 20px | text-xl         |
| `body`         | regular | 16px | text-base       |
| `caption`      | regular | 14px | text-sm         |
| `bodyBold`     | bold    | 16px | text-base bold  |
| `captionBold`  | bold    | 14px | text-sm bold    |

### Reglas

- Nunca usar `fontWeight`. Usar `fontFamily: fonts.bold` o `fonts.regular`.
- Tamaño mínimo de fuente: 14px.
- Para cambiar la fuente globalmente, editar solo `src/theme/typography.ts` y el `useFonts` en `App.tsx`.

## Estructura del Proyecto

```
app/                  # Expo Router (file-based routing)
├── _layout.tsx       # Root layout
├── index.tsx         # Entry redirect
├── (auth)/           # Auth flow screens
└── (main)/           # Authenticated screens

src/
├── api/          # Servicios HTTP (client, auth, books, userBooks, feed, follows, journal, reviews, users, discussions, importBooks, recommendations)
├── components/   # Componentes reutilizables (AppHeader, BookCard, ActivityCard, ShelfButton, SearchBar, StatusActionSheet, SwipeTabs, DrawerContent, Loader, UserAvatar, ConfirmModal, ReviewCard, StarRating, ReadingStats, StreakBanner, CurrentlyReading, DiscussionCard, ReplyCard, RecommendationsSection, QuickFeed, QuickJournalCard, ProfileBooksTab, ProfileReviewsTab, EditableDate, FadeIn)
├── context/      # Providers (AuthContext, ThemeContext, LanguageContext)
├── hooks/        # Custom hooks (useAuthForm, useBooks, useSearchBooks, useBookDetail, useFeed, useQuickFeed, useFollow, useImport, useJournal, useQuickJournal, useNetwork, useProfilePage, useProfileBooks, useReadingProgress, useReadingStats, useRecommendations, useReviews, useDiscussions, useDiscussionDetail, useShelfButton, useStatusSheet, useTheme)
├── i18n/         # Archivos de traducción (en.json, es.json)
├── screens/      # Componentes de pantalla (Home, BookDetail, Feed, Auth, Search, UserProfile, Network, Settings, Discussions, CreateDiscussion, DiscussionDetail, Import, ForgotPassword)
├── theme/        # Tokens de tipografía y estilo
├── types/        # Interfaces TypeScript (book, auth, user, domain)
└── utils/        # Funciones utilitarias (mapBook)
```

## Features

- Autenticación (login/registro) con JWT + refresh token
- Reseteo de contraseña por email
- Modo oscuro/claro con paleta cálida
- Internacionalización (inglés/español)
- Búsqueda de libros con Google Books API (capa de abstracción)
- Detalle de libro con metadata, journal y reseñas
- Estantería personal con estados (Quiero leer, Leyendo, Leído, No terminado)
- Action sheet nativo para cambio de estado
- Perfil de usuario con avatar y bio editable
- Perfiles públicos de otros usuarios
- Sistema de seguir/dejar de seguir con contadores
- Red de seguidores/siguiendo
- Feed social con pestañas personal y global (SwipeTabs)
- Paginación infinita (cursor-based)
- Journal de lectura con progreso por página/porcentaje
- Widget "Leyendo actualmente" con barras de progreso
- Estadísticas de lectura (mensual/anual) y racha
- Recomendaciones: "Lo que leen tus amigos" + "Trending en Librerio"
- Sistema de discusiones con respuestas y likes
- Rating con estrellas y reseñas con manejo de spoilers
- Importación de CSV de Goodreads
- Pull-to-refresh en todas las pantallas
- Navegación con Drawer y ajustes

## Setup

```bash
npm install
cp .env.example .env
npx expo start
```

## Scripts

| Script             | Descripción                     |
|--------------------|---------------------------------|
| `npm start`        | Expo dev server                 |
| `npm run android`  | Iniciar en Android              |
| `npm run ios`      | Iniciar en iOS                  |
| `npm run web`      | Iniciar en web                  |
| `npm run lint`     | Lint con ESLint                 |
| `npm run ts:check` | Verificar tipos TypeScript      |
| `npm test`         | Ejecutar tests con Jest         |

## Variables de Entorno

| Variable              | Descripción           |
|-----------------------|-----------------------|
| `EXPO_PUBLIC_API_URL` | URL del API backend   |

## Build (EAS)

El proyecto está configurado con EAS Build. Ver `eas.json` para perfiles de build.

```bash
npx eas build --platform android
npx eas build --platform ios
```
