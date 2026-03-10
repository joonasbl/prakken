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

- Add **persistence** (local storage or backend API).
- Support **multiple characters** with quick switching.
- Add **theming and improved styling** (e.g., Tailwind, component libraries).
- Expand character sheet with **inventory management** and **equipment weight tracking**.
- Add **character export/import** functionality.

