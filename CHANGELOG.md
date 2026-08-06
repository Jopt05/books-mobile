# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

## [Sin release]

### ♻️ Refactorización

- Use safe area insets for dynamic padding
- Consolidate user and public profile into unified profile page

### ✨ Nuevas funcionalidades

- Add drawer navigation and gesture support
- Update auth token handling and reading progress data structures
- Add date picker, image picker, and HTML rendering support
- Add roboto condensed font support and app documentation
- Enforce HTTPS for image URLs across app
- Add status bar with theme support and improve typography
- Add progress tracking with page and percentage modes
- Add status action sheet with haptic feedback and long-press gestures
- Add user profile sync and context update capability
- Add book search screen and quick feed widget
- Add social and trending book recommendations
- Add pagination support to profile books shelf
- Add FadeIn component and apply to home and profile screens
- Implement infinite scroll pagination for book search results
- Implement pagination for book journal entries
- Add expandable review content with show more/less toggle
- Add community discussions and replies functionality
- Apply FadeIn animation to discussions, feed, and settings screens
- Add discussion start activity type and navigation
- Add show more/less toggle for review content
- Replace ActivityIndicator with custom animated loader
- Apply theme-aware styling to Loader component
- Add account deactivation functionality
- Migrate to expo-router file-based navigation system

### 🐛 Correcciones

- Adjust drawer padding and profile header height

### 📝 Documentación

- Update documentation for Librerio mobile app with new tech stack and spanish translations

### 🔧 Mantenimiento

- Update app configuration and remove EAS config file
- Add EAS configuration for build and deployment
- Rebrand app from Anaquel to Librerio
- Update app icon and splash image references
- Upgrade Expo SDK and add security/datetime plugins
- Adjust padding and safe area insets in drawer and status sheet
- Update app icons and branding configuration
- Enable React Native New Architecture
- Update package-lock.json devOptional flags to dev
- Remove integrity and resolved fields from package-lock.json
- Update package-lock.json dev flags and add legacy peer deps config

