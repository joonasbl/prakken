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
- [x] Full multi-step character creator (wizard) with 8 stages
- [x] Persist stats and characters locally (localStorage)
- [x] Support multiple characters and quick switching
- [x] Add derived stats and validation (veripisteet, vauriobonus, syvä haava, kantokyky)
- [x] Introduce routing-based views (Characters, Create Character, Character Sheet)
- Display a list of base attributes with default numeric values.
- Allow inline editing of each attribute via numeric input.
- Centralize attribute state in a dedicated store for predictable updates.
- Display numerical skill levels derived from attributes, with a point-buy system and caps.

**Planned / Future**
- Active Character View (Play Mode) with HP, XP, gold tracking
- Equipment weight and encumbrance system
- Export/Import character data (JSON/PDF)
- Character portraits and customization
- Combat tracker integration
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

### 9. Derived Stats (Sub-stats)

The following derived stats are calculated from base attributes:

#### Veripisteet (Hit Points)
Based on **Terveys**:

| Terveys | Veripisteet |
|---------|-------------|
| 1       | 10          |
| 2-3     | 11          |
| 4-5     | 12          |
| 6-7     | 13          |
| 8-9     | 14          |
| 10-11   | 15          |
| 12-13   | 16          |
| 14-15   | 17          |
| 16-17   | 18          |
| 18-19   | 19          |
| 20      | 20          |

#### Vauriobonus (Damage Bonus)
Based on **Voima**:

| Voima   | Vauriobonus |
|---------|-------------|
| ...5    | -2          |
| 6-9     | -1          |
| 10-14   | 0           |
| 15-17   | +1          |
| 18-19   | +2          |
| 20      | +3          |

#### Syvä haava (Severe Wound Threshold)
Based on **Voima + Terveys** sum:

| VOI+TER  | Syvä haava |
|----------|------------|
| ...10    | 5          |
| 11-17    | 6          |
| 18-24    | 7          |
| 25-31    | 8          |
| 32-38    | 9          |
| 39-40    | 10         |

#### Kantokyky (Carrying Capacity)
Simple formula: **Voima × 20**

### 10. Character Creation Wizard

Implemented 8-step wizard for creating new characters:

1. **Roll Stats** - 4d6 drop lowest for each attribute, or manual adjustment
2. **Choose Background** - 6 backgrounds with stat and skill bonuses
3. **Advantages & Disadvantages** - Select 1-5 of each (must be balanced)
4. **Sub-stats** - Auto-calculate derived stats
5. **Skills** - Learn and raise skills with point-buy system
6. **Equipment** - Select starter equipment
7. **Name & Details** - Enter character name
8. **Summary** - Review and save character

#### Skill Learning System

Skills must be **learned** before they can be raised:

| Action | Cost | Description |
|--------|------|-------------|
| **Learn skill** | 2 points | Makes skill available; sets level to base (attribute/2, min 6) |
| **Raise skill** | 1-2 points | Increases level by +1 (cost 1 if level < 10, cost 2 if level ≥ 10) |
| **Unlearn skill** | Refunds 2 points | Only possible if skill hasn't been raised |

**Rules:**
- Background skills are **automatically learned** with +1 bonus (no learning cost)
- Maximum skill level: 15
- Unlearned skills show level as 0 and cannot be used
- Learning a skill doesn't raise it—only makes it available at base level

**Point costs example:**
- Learn skill (base 7): 2 points → level 7
- Raise to 8: +1 point → level 8
- Raise to 9: +1 point → level 9
- Raise to 10: +2 points → level 10
- Total for level 10: 6 points

#### Advantages (36 total)
Aarre, Alkemisti, Asiantuntija, Eläinkuiskaaja, Haukankatse, Huuliltalukija, Hyvämaineinen, Ikä ja kokemus, Jääverinen, Kahlekuningas, Kaunis, Kissajalat, Kookas, Kovanaama, Lahjakas, Laskupää, Lemmikki, Nopea, Onnekas, Ottolapsi, Rautavatsa, Rohkea, Sitkeä, Suhteita, Sukeltaja, Suuntavaisto, Tarkkakorvainen, Tarkkamuistinen, Uhkaava, Vaikukoira, Vaisto, Valevainu, Velhonverta, Viinapää, Ystävä, Yösilmät

#### Disadvantages (36 total)
Ahne, Arpi, Hentoluinen, Hidas, Huono kuulo, Hämäräsokea, Irstas, Juoppo, Kammo, Kostonhimoinen, Kunniallinen, Käsipuoli, Kääpiö, Lainsuojaton, Lähinäköinen, Lähimmäisiä, Muotopuoli, Mykkä, Nuori, Oikku, Pahamaineinen, Painajaisia, Peluri, Rampa, Rasisti, Riippuvuus, Silmäpuoli, Taikauskoinen, Tuntomerkki, Uninen, Uskovainen, Vallanahne, Vasalli, Velkaa, Vihollinen, Äkkipikainen

#### Backgrounds (11 total)

| Background | Stat Bonuses | Skills Learned |
|------------|--------------|----------------|
| **Aatelinen** | Karisma +2 | Heraldiikka, Kilvet, Lukutaito, Ratsastus, Uskonto, Veitset, Väistö |
| **Ritari** | Karisma +1, Voima +1 | Heraldiikka, Keihäät, Kilvet, Miekat, Ratsastus, Sotataito, Väistö |
| **Pappi** | Karisma +1, Valppaus +1 | Esiintyminen, Haavojen hoito, Historia, Kilvet, Uskonto, Lukutaito, Väistö |
| **Porvari** | Sisukkuus +1, Valppaus +1 | Esiintyminen, Kaupanhieronta, Kauppareitit, Kilvet, Lukutaito, Veitset, Väistö |
| **Kaupunkilainen** | — | Esiintyminen, Ihmistuntemus, Kadut ja kapakat, Kaupanhieronta, Kilvet, Kädentaidot, Tappelu, Veitset, Väistö |
| **Maalainen** | Terveys +1 | Haavojen hoito, Kilvet, Kädentaidot, Lyömäaseet, Tappelu, Väistö |
| **Irtolainen** | — | Haavojen hoito, Hiivintä, Kadut ja kapakat, Kaupanhieronta, Kilvet, Sorminäppäryys, Tappelu, Uhkapeli, Väistö |
| **Rosvo** | — | Erätaidot, Haavojen hoito, Hiivintä, Kilvet, Kovistelu, Lyömäaseet, Tappelu, Uhkapeli, Väistö |
| **Paimentolainen** | Ketteryys +2, Sisukkuus +1, Karisma -1 | Haavojen hoito, Heittäminen, Keihäät, Kilvet, Kirottu maa, Ratsastus, Tarut ja legendat, Väistö |
| **Vuoristolainen** | Voima +2, Terveys +1, Ketteryys -1 | Hyppy ja kiipeily, Kilvet, Erätaidot, Kädentaidot, Kovistelu, Lyömäaseet, Tappelu, Uiminen, Väistö |
| **Metsäläinen** | Valppaus +2, Ketteryys +1, Karisma -1 | Erätaidot, Hiivintä, Jouset, Kilvet, Metsästys, Sorminäppäryys, Veitset, Väistö, Yrtit ja myrkyt |

**Note:** Background skills are automatically **learned** (no learning cost), but start at base level (no bonus). Players can raise them with skill points if desired.

#### Advantage & Disadvantage Special Effects

Some advantages and disadvantages have special effects beyond their basic description:

| Trait | Type | Effect |
|-------|------|--------|
| **Ikä ja kokemus** | Advantage | Sets skill point pool to **120 points** (instead of 100) |
| **Nuori** | Disadvantage | Sets skill point pool to **70 points** (instead of 100) |
| **Lahjakas** | Advantage | Player chooses **+1 to two attributes** (can be same attribute twice, max +2 per attribute) |
| **Sitkeä** | Advantage | **+5 veripisteet** (hit points) |
| **Kookas** | Advantage | **+2 syvä haava** (severe wound threshold) |
| **Hentoluinen** | Disadvantage | **-2 syvä haava** (severe wound threshold) |

**Notes:**
- Skill point effects replace the base 100 points entirely (they don't stack)
- Substat modifiers (veripisteet, syvä haava) are cumulative if multiple sources exist
- Lahjakas opens a modal dialog for attribute selection when chosen
- Attribute choices from Lahjakas are tracked separately and applied to final character stats

### 11. Future Enhancements & Direction

#### Phase 1: Core Improvements (Current Sprint)
- ✅ **Fantasy theme overhaul** - Dark theme with gold accents, improved contrast
- ✅ **Character creation wizard** - 8-step flow fully implemented
- ✅ **Skill system** - Learn/raise mechanics with point costs
- ✅ **Advantages/Disadvantages** - 36 of each with special effects
- ✅ **Multiple character support** - List view with save/load/delete

#### Phase 2: Enhanced Features (Next)
- [x] **Mobile responsiveness**
  - [x] Mobile-first stylesheet overhaul
  - [x] Touch-friendly controls and gestures
  - [x] Collapsible sections for small screens
  - [x] Mobile navigation menu
- [ ] **Active Character View** (Play Mode)
  - [ ] Health tracker (current/max HP) with quick adjust buttons
  - [ ] Experience points tracker
  - [ ] Money/gold counter
  - [ ] Severe wound tracker with status indicators
  - [ ] Quick equipment access (favorites/equipped items)
  - [ ] In-game notes section
  - [ ] One-click healing/rest recovery
- [ ] **Character sheet improvements**
  - [ ] Inventory management with weight tracking
  - [ ] Equipment weight encumbrance effects
  - [ ] Combat tracker integration
  - [ ] Spell/magic system (if applicable)
- [ ] **Export/Import functionality**
  - [ ] JSON export/import for character sharing
  - [ ] PDF character sheet generation
  - [ ] Print-friendly styling
- [ ] **Advanced character options**
  - [ ] Character portraits/images
  - [ ] Custom backgrounds (user-defined)
  - [ ] Custom advantages/disadvantages
  - [ ] Level-up system and experience tracking

#### Phase 3: Backend Integration (Future)
- [ ] **Go Backend API** (scaffolded in `/backend`)
  - [ ] PostgreSQL database integration
  - [ ] RESTful API endpoints for characters
  - [ ] User authentication (optional)
  - [ ] Cloud sync for characters
- [ ] **Frontend API Integration**
  - [ ] Replace localStorage with API calls
  - [ ] Offline-first architecture with sync
  - [ ] Real-time updates (WebSocket)
- [ ] **Multi-user Features**
  - [ ] User accounts and authentication
  - [ ] Character sharing between users
  - [ ] Campaign/group management
  - [ ] GM tools for viewing player characters

#### Phase 4: Advanced Features (Long-term)
- [ ] **Mobile App**
  - [ ] Responsive design improvements
  - [ ] PWA (Progressive Web App) support
  - [ ] Native mobile app (React Native/Flutter)
- [ ] **Game Master Tools**
  - [ ] NPC generator
  - [ ] Encounter builder
  - [ ] Loot/random table rollers
  - [ ] Session notes and tracking
- [ ] **Community Features**
  - [ ] Public character gallery
  - [ ] Homebrew content sharing
  - [ ] Rules reference integration
  - [ ] Multi-language support (i18n)

### 12. Technical Roadmap

#### Current Architecture
```
Prakken/
├── frontend/           # Vue 3 + TypeScript + Pinia
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/     # Pinia state management
│   │   ├── types/      # TypeScript types
│   │   └── assets/     # CSS (fantasy dark theme)
│   └── Storage: localStorage (current)
├── backend/            # Go + Gin + PostgreSQL (future)
│   ├── cmd/
│   ├── api/
│   └── internal/
└── docker-compose.yml  # Full stack orchestration
```

#### Migration Path to Backend
1. **Keep localStorage** for development and offline use
2. **Add API service layer** in frontend for backend calls
3. **Implement sync logic** - localStorage first, sync to backend when available
4. **Add authentication** when multi-user features are needed
5. **Deploy** - Docker Compose for full stack, or frontend-only for localStorage mode

#### Performance Goals
- Initial load: < 2 seconds
- Character save/load: < 500ms
- Offline support: Full functionality without backend
- Bundle size: Keep under 500KB (gzipped)

#### Deployment & CI/CD
- **GitHub Actions workflows** configured for:
  - Frontend CI (lint, test, build) on push to `main`
  - Auto-deploy to VPS on release publish (tagged releases)
- **Release workflow**: Create a git tag (e.g., `v1.0.0`) and publish release on GitHub to trigger automatic deployment
- **VPS**: Podman containers with SSL via acme.sh

### 13. Design Principles

1. **Offline-first**: App works fully without backend
2. **Progressive enhancement**: Basic features work everywhere, advanced features require backend
3. **Dark theme by default**: Fantasy aesthetic with excellent contrast
4. **Mobile-responsive**: Works on phones, tablets, and desktop ✅
5. **Finnish language first**: UI in Finnish, with i18n support for future languages
6. **Accessibility**: WCAG 2.1 AA compliance for contrast and keyboard navigation


### 14. Active Character View (Play Mode) – Implementation Plan

#### Overview
A dedicated view for active gameplay, optimized for quick reference and real-time tracking during game sessions.

---

#### Data Model Changes

**Add to `Character` type** (`src/types/character.ts`):

```typescript
export type Character = {
  // ... existing fields ...
  
  // Play Mode fields
  currentHp: number                    // Current hit points
  experience: number                   // Experience points
  gold: number                         // Gold pieces
  woundStatus: 'none' | 'minor' | 'severe'  // Wound state
  equippedItems: string[]              // Array of equipment IDs
  notes: string                        // In-game notes
}
```

**Initial values for new characters:**
- `currentHp`: equals `subStats.veripisteet`
- `experience`: 0
- `gold`: 0
- `woundStatus`: 'none'
- `equippedItems`: []
- `notes`: ''

---

#### Store Changes

**Extend `characters.ts` store** with play mode actions:

```typescript
actions: {
  // ... existing actions ...
  
  updatePlayState(id: string, playState: Partial<PlayState>): boolean
  adjustHp(id: string, delta: number): boolean
  adjustExperience(id: string, delta: number): boolean
  adjustGold(id: string, delta: number): boolean
  toggleEquipment(id: string, equipmentId: string): boolean
  restAndHeal(id: string): boolean
}
```

---

#### New Components

**`src/views/PlayView.vue`** – Main play mode view

Features:
- Large, touch-friendly HP controls with visual bar
- Quick +/- buttons for XP and gold
- Wound status toggle buttons
- Collapsible equipped items list
- Expandable notes textarea
- Rest/heal action buttons

**Layout (mobile-first):**
```
┌─────────────────────────────────┐
│ ← Back    CHARACTER NAME    ⚙️  │
├─────────────────────────────────┤
│  ❤️ HP: [−] 12/14 [+]          │
│     ████████████░░  (bar)      │
├─────────────────────────────────┤
│  ⚔️ Vauriobonus: +1             │
│  🩸 Syvä haava: 7               │
├─────────────────────────────────┤
│  ✨ XP: [−] 45 [+]             │
│  💰 Gold: [−] 120 [+]          │
├─────────────────────────────────┤
│  🎒 Equipped (3) [▼]           │
│    • Longsword                 │
│    • Shield                    │
│    • Armor                     │
├─────────────────────────────────┤
│  📝 Notes [✏️]                 │
│    [text area...]              │
├─────────────────────────────────┤
│  [REST] [HEAL +5] [HEAL +10]   │
└─────────────────────────────────┘
```

---

#### Route Changes

**Add to `src/router/index.ts`:**

```typescript
{
  path: '/play/:id',
  name: 'PlayView',
  component: PlayView,
}
```

**Add navigation:**
- "Play" button on CharacterListView (each character card)
- "Play" button on CharacterSheetView
- "Back to Sheet" link on PlayView

---

#### Implementation Tasks

**Phase 2.1: Data Layer**
- [ ] Update `Character` type with play state fields
- [ ] Add play state actions to `characters.ts` store
- [ ] Update storage to persist play state fields

**Phase 2.2: Play View Component**
- [ ] Create `PlayView.vue` with HP tracker
- [ ] Add XP and gold trackers
- [ ] Add wound status toggle
- [ ] Add equipped items list
- [ ] Add notes section
- [ ] Add rest/heal buttons

**Phase 2.3: Navigation**
- [ ] Add route for `/play/:id`
- [ ] Add "Play" button to CharacterListView
- [ ] Add "Play" button to CharacterSheetView
- [ ] Add "Back" navigation in PlayView

**Phase 2.4: Polish**
- [ ] HP visual bar (color-coded: green→yellow→red)
- [ ] Wound status visual indicators
- [ ] Confirmation dialogs for rest/heal
- [ ] Mobile-responsive layout testing

---

#### Future Enhancements (Post-Phase 2)

- Equipment weight calculation and encumbrance
- Combat tracker integration
- Spell/magic slot tracking
- Character portrait display
- Multiple play states per character (different campaigns)
