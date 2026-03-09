## Project Documentation

**Project name**: Prakken  
**Stack**: Vue 3, TypeScript, Pinia, Vue Router, Vite

---

### 1. Overview

Prakken is a Vue 3 single-page application built with Vite. It uses:

- **Vue 3** with the Composition API and single-file components.
- **TypeScript** for static typing.
- **Pinia** for state management.
- **Vue Router** for client-side routing.
- **Vite** for fast development server and production builds.

The entry point `App.vue` currently renders a `StatsPage` component as the main content.

---

### 2. Project Structure (high level)

- **`src/App.vue`**: Root Vue component that sets up the main layout and renders `StatsPage`.
- **`src/components/`**:
  - `StatsPage.vue`: Main stats and skills view/component rendered by `App.vue`.
  - `NameComponent.vue`: Displays/edits the character’s name.
  - `SkillsList.vue`: Displays skills, their derived base levels, and point-buy bonuses.
- **`src/views/`**:
  - `HomeView.vue`: Main landing page.
  - `AboutView.vue`: Example routed view.
  - (Planned) `CreateCharacterView.vue`: Multi-step character creation wizard (8 stages).
- **`src/stores/`**:
  - `stats.ts`: Pinia store for managing base attributes.
  - `skills.ts`: Pinia store for skills configuration and point-buy bonuses.
  - (Planned) `characterCreation.ts`: Store for the in-progress character draft across all 8 steps.
- **`src/types/`**:
  - `attributes.ts`: Shared TypeScript types used across components and stores.
  - `skills.ts`: Types describing skills, base codes, and bonuses.

> Note: Some paths are inferred from the repo and may evolve as the project grows.

---

### 3. Scripts and Tooling

Defined in `package.json`:

- **`npm run dev`**: Start the Vite development server with hot-module reloading.
- **`npm run build`**: Type-check, compile, and bundle the app for production.
- **`npm run preview`**: Preview the built production bundle.
- **`npm run test:unit`**: Run unit tests with Vitest.
- **`npm run type-check`**: Run `vue-tsc` type-checking.
- **`npm run lint`**: Run ESLint and automatically fix simple issues.
- **`npm run format`**: Format the `src/` directory using Prettier.

---

### 4. Development Workflow

1. **Install dependencies**

   ```sh
   npm install
   ```

2. **Run locally**

   ```sh
   npm run dev
   ```

3. **Run tests**

   ```sh
   npm run test:unit
   ```

4. **Lint and format**

   ```sh
   npm run lint
   npm run format
   ```

5. **Build for production**

   ```sh
   npm run build
   ```

---

### 5. Extending the App

- **Add new views**: Create new `.vue` files under `src/views/` and register routes in the router configuration.
- **Add shared components**: Place reusable components in `src/components/` and import them where needed.
- **Add state**: Define new Pinia stores under `src/stores/` and import them via `useXxxStore()` in components.
- **Add types**: Put shared interfaces and types in `src/types/` to keep type definitions centralized.

---

### 6. Notes

- For IDE support, use VS Code with the **Volar** extension (and disable Vetur), as recommended in `README.md`.
- See the official [Vite configuration reference](https://vite.dev/config/) if you need to customize the build or dev server behavior.

