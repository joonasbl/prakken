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
  - `StatsPage.vue`: Main stats view/component rendered by `App.vue`.
  - `NameComponent.vue` and other components: Shared, reusable UI pieces.
- **`src/views/`**:
  - `AboutView.vue`: Example routed view (if enabled via router).
- **`src/stores/`**:
  - `stats.ts`: Pinia store(s) for managing application statistics and related state.
- **`src/types/`**:
  - `attributes.ts`: Shared TypeScript types and interfaces used across components and stores.

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

