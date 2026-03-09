## Prakken – Design Document

### 1. Purpose and Problem Statement

Prakken is a small web application for managing and adjusting character attributes (e.g., for tabletop RPGs or similar games).  
The app provides a simple interface where a user can:

- Enter or display a **character name**.
- View a list of **character attributes** (e.g. `Voima`, `Terveys`, `Ketteryys`, `Valppaus`, `Sisukkuus`, `Karisma`).
- Quickly **adjust numeric values** for each attribute.

The primary goal is to make attribute management fast, clear, and visually organized, avoiding manual tracking on paper or scattered notes.

### 2. Target Users

- Players who need an always-available, lightweight character sheet for tracking stats.
- Game masters who want a quick way to view or tweak NPC attributes.
- Anyone who needs a simple numeric attribute panel for experimentation or prototyping.

### 3. High-Level Goals

- **Clarity**: Stats and their labels should be easy to read and adjust.
- **Speed**: Minimal navigation; the main stats screen should load immediately.
- **Persistence-ready**: Architecture should make it straightforward to add persistence later (e.g., local storage, backend).
- **Extensibility**: It should be easy to:
  - Add new attributes.
  - Add new character-related views (e.g., inventory, skills).
  - Add calculations or derived stats (e.g., total power, modifiers).

### 4. Core Features (Current & Planned)

**Current**
- Display a list of base attributes with default numeric values.
- Allow inline editing of each attribute via numeric input.
- Centralize attribute state in a dedicated store for predictable updates.
- Display numerical skill levels derived from attributes, with a point-buy system and caps.

**Planned / Future**
- Full multi-step character creator (wizard) with 8 stages in order:
  1. Roll stats
  2. Choose background
  3. Advantages and disadvantages
  4. Sub-stats
  5. Skills
  6. Equipment
  7. Name and additional details
  8. Summary and save
- Persist stats and characters locally (e.g., browser storage) so they survive reloads.
- Support multiple characters and quick switching between them.
- Add derived stats and validation (e.g., min/max values, total points).
- Introduce routing-based views (e.g., `About`, `Settings`, `Character list`, `Create character`).

### 5. UX & Interaction Design

- **Single main screen** focused on the stat list.
- **Name header** component (`NameComponent`) used to show or edit the character name at the top.
- Attributes are laid out in responsive columns:
  - Label on one side, numeric input on the other.
  - Inputs are compact, visually distinct, and easy to click/tap.
- Input changes:
  - Immediately update the central store.
  - Can be extended to trigger derived calculations or downstream effects.

### 6. Architecture Overview

- **View layer**
  - `App.vue`:
    - Root component.
    - Renders the main layout shell (header) and the `StatsPage` component.
  - `StatsPage.vue`:
    - Main stats screen.
    - Connects to the stats store (`useStatsStore`).
    - Renders `NameComponent` and a list of inputs for each attribute in `attList`.
  - `NameComponent.vue`:
    - Responsible for rendering and (potentially) editing the character name.

- **State management**
  - `src/stores/stats.ts`:
    - Pinia store defining:
      - `attList`: array of attributes (name + value).
      - `setVal(name, value)`: action to update a specific attribute’s value.
    - Designed so any component can read/update stats consistently.

- **Types**
  - `src/types/attributes.ts`:
    - Defines the attribute shape used in the store and components.
    - Keeps attribute-related types centralized.

- **Routing**
  - `src/views/AboutView.vue`:
    - Example standalone view for static content.
    - Can be expanded with more routes as the app grows.

### 7. Data Model

- **Attribute**

  ```ts
  export type Attr = {
    name: string
    value: number
  }
  ```

- **Stats store state**

  ```ts
  type StatsState = {
    attList: Attr[]
  }
  ```

Data currently lives entirely in-memory. Persistence, validation rules, and derived fields can be added on top of this model.

### 8. Non-Functional Requirements

- **Performance**: Small, client-side SPA with minimal overhead; should feel instant on modern devices.
- **Maintainability**:
  - Clear separation between UI (`StatsPage`, `NameComponent`) and state (`useStatsStore`).
  - Types defined once and reused across components.
- **Extensibility**:
  - Easy to add new attributes or views without refactoring the core architecture.
  - Store structure supports additional fields and actions in a straightforward way.

### 9. Future Enhancements & Direction

- Add **persistence** (local storage or backend API).
- Introduce **validation and constraints** (e.g., total points cap, minimum/maximum per stat).
- Add **theming and improved styling** (e.g., Tailwind, component libraries) to modernize the UI.
- Expand to a full **character sheet** with additional modules like equipment, skills, and notes.

