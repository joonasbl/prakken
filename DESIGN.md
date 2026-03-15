# Prakken – Design Document

A fantasy character management system for tabletop RPGs, built with Vue 3 and TypeScript.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Target Users](#2-target-users)
3. [Core Features](#3-core-features)
4. [Character Creation](#4-character-creation)
5. [Game Mechanics](#5-game-mechanics)
6. [Architecture](#6-architecture)
7. [Data Model](#7-data-model)
8. [User Interface](#8-user-interface)
9. [Technical Requirements](#9-technical-requirements)
10. [Deployment & DevOps](#10-deployment--devops)
11. [Future Roadmap](#11-future-roadmap)
12. [Design Principles](#12-design-principles)

---

## 1. Overview

**Prakken** is a web application for creating, managing, and tracking fantasy RPG characters. It provides a complete character creation wizard, skill management with point-buy system, and persistent character storage.

### Key Characteristics

- **Platform**: Web SPA (Single Page Application)
- **Tech Stack**: Vue 3, TypeScript, Pinia, Vite
- **Storage**: localStorage (offline-first), with future backend sync
- **Language**: Finnish UI (with i18n-ready architecture)
- **Theme**: Fantasy dark theme with gold accents

### Problem Solved

Prakken eliminates manual character sheet tracking by providing:

- Digital character creation with rule validation
- Automatic calculation of derived stats
- Skill point management and tracking
- Multiple character storage and quick switching
- Mobile-responsive design for tabletop use

---

## 2. Target Users

| User Type        | Needs                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------- |
| **Players**      | Always-available character sheet, quick stat/skill reference, HP tracking during play |
| **Game Masters** | Quick NPC generation, character viewing, rule reference                               |
| **New Players**  | Guided character creation, clear skill descriptions, point budget tracking            |

---

## 3. Core Features

### Current Features ✅

| Feature                      | Description                                                      |
| ---------------------------- | ---------------------------------------------------------------- |
| **8-Step Character Wizard**  | Guided creation from stat rolling to final summary               |
| **Multiple Characters**      | Create, save, load, delete, and switch between characters        |
| **localStorage Persistence** | All characters saved locally with version migration support      |
| **Background System**        | 11 backgrounds with unique stat bonuses and skill lists          |
| **Advantages/Disadvantages** | 36 of each, with special effects and conflict detection          |
| **Skill System**             | Learn/raise mechanics with point costs (max 15 skill level)      |
| **Derived Stats**            | Auto-calculated: Veripisteet, Vauriobonus, Syvä haava, Kantokyky |
| **Equipment Selection**      | Starter equipment choices during creation                        |
| **Character Sheet View**     | Detailed view with all stats, skills, and equipment              |
| **Character Rename**         | Edit character name from character sheet view                    |
| **Mobile Responsive**        | Touch-friendly controls, collapsible sections, mobile navigation |

### Planned Features 📋

| Priority   | Feature             | Description                                                   |
| ---------- | ------------------- | ------------------------------------------------------------- |
| **High**   | Play Mode View      | Active character view with HP tracker, XP, gold, wound status |
| **High**   | Equipment Weight    | Encumbrance system affecting movement and skills              |
| **Medium** | Export/Import       | JSON and PDF character export                                 |
| **Medium** | Character Portraits | Upload/display character images                               |
| **Low**    | Combat Tracker      | Turn-based combat integration                                 |
| **Low**    | Backend Sync        | Cloud storage with user accounts                              |

---

## 4. Character Creation

### 8-Step Wizard Flow

```
Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6 → Step 7 → Step 8
  ↓         ↓         ↓         ↓         ↓         ↓         ↓         ↓
Roll     Choose    Adv/     Sub-     Skills   Equip-    Name   Summary
Stats   Background Disadv   stats              ment     & Save
```

### Step Details

| Step  | Name       | User Actions                                     | Validation                          |
| ----- | ---------- | ------------------------------------------------ | ----------------------------------- |
| **1** | Roll Stats | Roll 4d6 drop lowest OR manually adjust (3-18)   | Total points displayed              |
| **2** | Background | Select 1 of 11 backgrounds                       | Auto-applies stat/skill bonuses     |
| **3** | Adv/Disadv | Select 1-5 advantages, 1-5 disadvantages         | Must be balanced (equal count)      |
| **4** | Sub-stats  | Auto-calculated from attributes                  | User confirms derived values        |
| **5** | Skills     | Learn new skills (2 pts), raise skills (1-2 pts) | Max 100 pts (or 70/120 with traits) |
| **6** | Equipment  | Select starter gear                              | Weight limits may apply             |
| **7** | Name       | Enter character name                             | Required, max 50 chars              |
| **8** | Summary    | Review all choices                               | Can go back to edit                 |

### Special Mechanics

#### Ottolapsi (Adopted Child)

Unique advantage allowing **two backgrounds**:

- **Primary background** → Grants attribute bonuses + skills
- **Secondary background** → Grants skills only
- **Modal selection** when Ottolapsi is chosen
- Skills from both backgrounds are free and cannot be unlearned

**Example:**

```
Primary:   Aatelinen → Karisma +2, skills: Heraldiikka, Ratsastus, Miekat...
Secondary: Pappi     → skills: Esiintyminen, Haavojen hoito, Uskonto...
Result:    Karisma +2 (from Aatelinen only), skills from BOTH backgrounds
```

#### Lahjakas (Talented)

- Player chooses **+1 to two attributes** (can be same attribute twice, max +2)
- Modal dialog for attribute selection
- Bonuses apply to final character stats

---

## 5. Game Mechanics

### Base Attributes

| Attribute     | Finnish   | Description                      |
| ------------- | --------- | -------------------------------- |
| **Strength**  | Voima     | Physical power, melee damage     |
| **Health**    | Terveys   | Constitution, disease resistance |
| **Agility**   | Ketteryys | Dexterity, reflexes, stealth     |
| **Vigilance** | Valppaus  | Perception, awareness            |
| **Grit**      | Sisukkuus | Willpower, mental fortitude      |
| **Charisma**  | Karisma   | Social influence, leadership     |

**Default value:** 10 (range: 3-18)

### Derived Stats (Sub-stats)

#### Veripisteet (Hit Points)

Based on **Terveys**:

| Terveys | HP  |     | Terveys | HP  |
| ------- | --- | --- | ------- | --- |
| 1       | 10  |     | 12-13   | 16  |
| 2-3     | 11  |     | 14-15   | 17  |
| 4-5     | 12  |     | 16-17   | 18  |
| 6-7     | 13  |     | 18-19   | 19  |
| 8-9     | 14  |     | 20      | 20  |
| 10-11   | 15  |     |         |     |

Representation in sheet:

```
NAARMUILLA                        HAAVOITTUNUT (+1N)                SHOKISSA
[ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]   [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]   [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
[ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]   [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]   [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
[ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]   [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]   [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]

[ ] KUOLLUT
```

#### Vauriobonus (Damage Bonus)

Based on **Voima**:

| Voima | Bonus |     | Voima | Bonus |
| ----- | ----- | --- | ----- | ----- |
| ≤5    | -2    |     | 15-17 | +1    |
| 6-9   | -1    |     | 18-19 | +2    |
| 10-14 | 0     |     | 20    | +3    |

#### Syvä haava (Severe Wound Threshold)

Based on **Voima + Terveys**:

| VOI+TER | Threshold |     | VOI+TER | Threshold |
| ------- | --------- | --- | ------- | --------- |
| ≤10     | 5         |     | 25-31   | 8         |
| 11-17   | 6         |     | 32-38   | 9         |
| 18-24   | 7         |     | 39-40   | 10        |

#### Kantokyky (Carrying Capacity)

**Formula:** `100 + (Voima × 20)` naula (1 naula = 100g)

**Example:** Voima 12 → 100 + (12 × 20) = 340 naulaa (34 kg)

---

### Skill System

#### Learning Skills

Skills must be **learned** before use:

| Action      | Cost          | Result                                             |
| ----------- | ------------- | -------------------------------------------------- |
| **Learn**   | 2 points      | Skill available at base level (attribute/2, min 6) |
| **Raise**   | 1-2 points    | +1 to skill level (1 pt if <10, 2 pts if ≥10)      |
| **Unlearn** | Refunds 2 pts | Only if skill hasn't been raised                   |

**Rules:**

- Background skills: **Automatically learned** (free)
- Max skill level: **15**
- Skill point budget: **100** (base), **70** (Nuori), **120** (Ikä ja kokemus)

**Example Progression:**

```
Learn skill (base 7):     2 pts → level 7
Raise to 8:              +1 pts → level 8
Raise to 9:              +1 pts → level 9
Raise to 10:             +2 pts → level 10
Total for level 10:       6 pts
```

---

### Backgrounds

| ID                 | Finnish        | Stat Bonuses                           | Skills                                                                                                        |
| ------------------ | -------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **aatelinen**      | Aatelinen      | Karisma +2                             | Heraldiikka, Kilvet, Lukutaito, Ratsastus, Uskonto, Veitset, Väistö                                           |
| **ritari**         | Ritari         | Karisma +1, Voima +1                   | Heraldiikka, Keihäät, Kilvet, Miekat, Ratsastus, Sotataito, Väistö                                            |
| **pappi**          | Pappi          | Karisma +1, Valppaus +1                | Esiintyminen, Haavojen hoito, Historia, Kilvet, Uskonto, Lukutaito, Väistö                                    |
| **porvari**        | Porvari        | Sisukkuus +1, Valppaus +1              | Esiintyminen, Kaupanhieronta, Kauppareitit, Kilvet, Lukutaito, Veitset, Väistö                                |
| **kaupunkilainen** | Kaupunkilainen | —                                      | Esiintyminen, Ihmistuntemus, Kadut ja kapakat, Kaupanhieronta, Kilvet, Kädentaidot, Tappelu, Veitset, Väistö  |
| **maalainen**      | Maalainen      | Terveys +1                             | Haavojen hoito, Kilvet, Kädentaidot, Lyömäaseet, Tappelu, Väistö                                              |
| **irtolainen**     | Irtolainen     | —                                      | Haavojen hoito, Hiivintä, Kadut ja kapakat, Kaupanhieronta, Kilvet, Sorminäppäryys, Tappelu, Uhkapeli, Väistö |
| **rosvo**          | Rosvo          | —                                      | Erätaidot, Haavojen hoito, Hiivintä, Kilvet, Kovistelu, Lyömäaseet, Tappelu, Uhkapeli, Väistö                 |
| **paimentolainen** | Paimentolainen | Ketteryys +2, Sisukkuus +1, Karisma -1 | Haavojen hoito, Heittäminen, Keihäät, Kilvet, Kirottu maa, Ratsastus, Tarut ja legendat, Väistö               |
| **vuoristolainen** | Vuoristolainen | Voima +2, Terveys +1, Ketteryys -1     | Hyppy ja kiipeily, Kilvet, Erätaidot, Kädentaidot, Kovistelu, Lyömäaseet, Tappelu, Uiminen, Väistö            |
| **metsäläinen**    | Metsäläinen    | Valppaus +2, Ketteryys +1, Karisma -1  | Erätaidot, Hiivintä, Jouset, Kilvet, Metsästys, Sorminäppäryys, Veitset, Väistö, Yrtit ja myrkyt              |

---

### Advantages & Disadvantages

**36 Advantages** and **36 Disadvantages** available. Players must select equal numbers of each (1-5).

#### Special Effects

| Trait              | Type         | Effect                                                 |
| ------------------ | ------------ | ------------------------------------------------------ |
| **Ikä ja kokemus** | Advantage    | Skill points: **120** (replaces base 100)              |
| **Nuori**          | Disadvantage | Skill points: **70** (replaces base 100)               |
| **Lahjakas**       | Advantage    | Choose **+1 to two attributes** (max +2 per attribute) |
| **Sitkeä**         | Advantage    | **+5 veripisteet**                                     |
| **Kookas**         | Advantage    | **+2 syvä haava**                                      |
| **Hentoluinen**    | Disadvantage | **-2 syvä haava**                                      |

**Notes:**

- Skill point effects don't stack (use highest)
- Substat modifiers are cumulative
- Conflicts prevent incompatible selections (e.g., Kookas + Hentoluinen)

---

## 6. Architecture

### Tech Stack

| Layer                  | Technology        | Version            |
| ---------------------- | ----------------- | ------------------ |
| **Frontend Framework** | Vue 3             | 3.x                |
| **Language**           | TypeScript        | 5.x                |
| **State Management**   | Pinia             | 2.x                |
| **Routing**            | Vue Router        | 4.x                |
| **Build Tool**         | Vite              | 5.x                |
| **Styling**            | Custom CSS        | Fantasy dark theme |
| **Testing**            | Vitest            | 2.x                |
| **Linting**            | ESLint + Prettier | Latest             |

### Project Structure

```
Prakken/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable Vue components
│   │   │   ├── character-creation/
│   │   │   │   ├── Step1RollStats.vue
│   │   │   │   ├── Step2Background.vue
│   │   │   │   ├── Step3AdvantagesDisadvantages.vue
│   │   │   │   ├── Step4SubStats.vue
│   │   │   │   ├── Step5Skills.vue
│   │   │   │   ├── Step6Equipment.vue
│   │   │   │   ├── Step7NameAndDetails.vue
│   │   │   │   ├── Step8Summary.vue
│   │   │   │   ├── AttributeChoiceModal.vue
│   │   │   │   └── SecondBackgroundModal.vue
│   │   │   ├── CharacterCard.vue
│   │   │   └── ModifierBadge.vue
│   │   ├── views/
│   │   │   ├── CharacterListView.vue
│   │   │   ├── CharacterSheetView.vue
│   │   │   └── CreateCharacterView.vue
│   │   ├── stores/
│   │   │   ├── characterCreation.ts
│   │   │   ├── characters.ts
│   │   │   ├── skills.ts
│   │   │   └── stats.ts
│   │   ├── types/
│   │   │   ├── character.ts
│   │   │   ├── skills.ts
│   │   │   └── attributes.ts
│   │   ├── utils/
│   │   │   ├── calculations.ts
│   │   │   ├── skills.ts
│   │   │   ├── storage.ts
│   │   │   └── skills.test.ts
│   │   ├── assets/
│   │   │   └── fantasy-theme.css
│   │   └── router/
│   │       └── index.ts
│   ├── nginx/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── backend/                    # Future: Go + Gin + PostgreSQL
├── .github/workflows/
│   ├── deploy.yml
│   └── frontend-ci.yml
├── docker-compose.yml
├── deploy.sh
└── DESIGN.md
```

### State Management

**Pinia Stores:**

| Store                 | Purpose                | Key State                                  |
| --------------------- | ---------------------- | ------------------------------------------ |
| **characterCreation** | Wizard state           | `draft`, `currentStep`, `attributeChoices` |
| **characters**        | Saved characters       | `characters[]`, `activeCharacterId`        |
| **skills**            | Skill definitions      | `skillList[]`                              |
| **stats**             | Active character stats | `attList[]`                                |

### Key Patterns

#### Effective Attributes Pattern

Always use bonuses when displaying attributes:

```typescript
// ✅ Correct - includes bonuses
const attrs = wizardStore.effectiveAttributes;

// ❌ Wrong - uses base attributes only
const attrs = wizardStore.draft.attributes;
```

#### Skill Calculation Pattern

```typescript
import { calculateSkillsWithLevels } from "@/utils/skills";

const skillsWithLevels = computed(() => {
  return calculateSkillsWithLevels(
    learnedSkills,
    skillsStore.skillList,
    effectiveAttributes, // Use effective attributes!
    background,
  );
});
```

#### localStorage Migration

```typescript
// In utils/storage.ts - always add backwards compatibility
if (anyChar.skills && !anyChar.learnedSkills) {
  anyChar.learnedSkills = anyChar.skills
    .filter((s: any) => s.learned)
    .map((s: any) => ({ name: s.name, bonus: s.bonus || 0 }));
  delete anyChar.skills;
}
```

---

## 7. Data Model

### Core Types

```typescript
// Character (stored in localStorage)
export type Character = {
  id: string;
  name: string;
  attributes: Attr[];
  learnedSkills: LearnedSkill[];
  background: Background | null;
  secondBackgroundId: string | null; // For Ottolapsi
  advantages: Advantage[];
  disadvantages: Disadvantage[];
  subStats: SubStats;
  equipment: Equipment[];
  createdAt: number;
  updatedAt: number;
  version: string;
};

// Draft (wizard state)
export type CharacterDraft = {
  name: string;
  attributes: Attr[];
  learnedSkills: LearnedSkill[];
  background: Background | null;
  secondBackgroundId: string | null;
  advantages: Advantage[];
  disadvantages: Disadvantage[];
  subStats: SubStats | null;
  equipment: Equipment[];
};

// Base attribute
export type Attr = {
  name: string;
  value: number;
};

// Learned skill
export type LearnedSkill = {
  name: string;
  bonus: number;
};

// Background
export type Background = {
  id: string;
  name: string;
  description: string;
  statBonuses: Partial<Record<string, number>>;
  skillBonuses: Partial<Record<string, number>>;
};

// Derived stats
export type SubStats = {
  veripisteet: number;
  vauriobonus: number;
  syvaHaava: number;
  kantokyky: number;
};
```

---

## 8. User Interface

### Design System

| Element            | Specification                                            |
| ------------------ | -------------------------------------------------------- |
| **Theme**          | Fantasy dark with gold accents                           |
| **Primary Colors** | `#d4af37` (gold), `#4a90d9` (blue), `#2ea043` (green)    |
| **Font Family**    | MedievalSharp (headings), Open Sans (body)               |
| **Touch Targets**  | Minimum 44px on mobile, 36px on desktop                  |
| **Breakpoints**    | 768px (tablet), 576px (large phone), 374px (extra small) |

### Key Views

#### CharacterListView

- Grid of character cards
- Quick stats preview
- Actions: View, Edit, Delete, Play (future)

#### CreateCharacterView

- 8-step wizard with progress indicator
- Step navigation (Previous/Next)
- Validation feedback per step

#### CharacterSheetView

- Collapsible sections for each category
- Editable character name with pen icon
- Full skill list with levels
- Equipment list

### Accessibility

- ARIA labels on icon buttons
- Keyboard navigation support
- Focus indicators
- Color contrast WCAG 2.1 AA compliant
- Screen reader friendly (semantic HTML)

---

## 9. Technical Requirements

### Performance Goals

| Metric                 | Target            |
| ---------------------- | ----------------- |
| Initial load           | < 2 seconds       |
| Character save/load    | < 500ms           |
| Bundle size            | < 500KB (gzipped) |
| First Contentful Paint | < 1.5 seconds     |

### Quality Gates

| Check          | Requirement            |
| -------------- | ---------------------- |
| **TypeScript** | 0 errors               |
| **ESLint**     | 0 errors               |
| **Unit Tests** | 100% pass (118+ tests) |
| **Build**      | Success                |

### Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile Safari (iOS 12+)
- Chrome for Android

---

## 10. Deployment & DevOps

### Environments

| Environment | URL                        | Purpose     |
| ----------- | -------------------------- | ----------- |
| **Local**   | `http://localhost:5173`    | Development |
| **VPS**     | `https://prakken.dedyn.io` | Production  |

### CI/CD Pipeline

**GitHub Actions Workflows:**

1. **frontend-ci.yml** - Runs on every push
   - `npm run type-check`
   - `npm run lint`
   - `npm run test:unit -- --run`
   - `npm run build`

2. **deploy.yml** - Runs on tag push
   - Creates GitHub release with auto-generated notes
   - Builds Docker image
   - Attaches Docker tar to release
   - Deploys to VPS via Podman

### Release Process

```bash
# 1. Create and push tag
git tag -a v1.2.0 -m "Prakken v1.2.0 - Feature name"
git push origin v1.2.0

# 2. GitHub Actions automatically:
#    - Creates release with notes
#    - Builds and deploys to VPS
```

### VPS Deployment (Podman)

```bash
# Manual deploy (alternative)
./deploy.sh
```

**Deploy steps:**

1. Build Docker image locally
2. Save to tar file
3. Transfer via scp to VPS
4. Load with Podman
5. Run container with SSL certificates

---

## 11. Future Roadmap

### Phase 2: Enhanced Features (Q2 2026)

| Feature                    | Priority | Status     |
| -------------------------- | -------- | ---------- |
| Play Mode View             | High     | 📋 Planned |
| Equipment Weight System    | High     | 📋 Planned |
| HP Tracker with Visual Bar | High     | 📋 Planned |
| Export/Import (JSON/PDF)   | Medium   | 📋 Planned |
| Character Portraits        | Medium   | 📋 Planned |

### Phase 3: Backend Integration (Q3-Q4 2026)

| Feature             | Priority | Status        |
| ------------------- | -------- | ------------- |
| Go Backend API      | Medium   | 🔨 Scaffolded |
| PostgreSQL Database | Medium   | 📋 Planned    |
| User Authentication | Low      | 📋 Planned    |
| Cloud Sync          | Low      | 📋 Planned    |

### Phase 4: Advanced Features (2027+)

| Feature               | Priority | Status     |
| --------------------- | -------- | ---------- |
| PWA Support           | Low      | 📋 Planned |
| Combat Tracker        | Low      | 📋 Planned |
| GM Tools              | Low      | 📋 Planned |
| Multi-language (i18n) | Low      | 📋 Planned |

---

## 12. Design Principles

1. **Offline-first** - App works fully without backend
2. **Progressive enhancement** - Basic features everywhere, advanced with backend
3. **Dark theme by default** - Fantasy aesthetic with excellent contrast
4. **Mobile-responsive** - Works on phones, tablets, desktop ✅
5. **Finnish language first** - UI in Finnish, i18n-ready architecture
6. **Accessibility** - WCAG 2.1 AA compliance
7. **Type safety** - TypeScript throughout, no `any` types
8. **Test coverage** - Tests for all critical functionality
9. **Backwards compatibility** - localStorage migrations for schema changes
10. **Defensive coding** - Optional chaining, fallback values, null handling

---

## Appendix A: Testing Strategy

### Unit Tests

- **Location**: `*.test.ts` alongside source files
- **Framework**: Vitest + Pinia test utils
- **Coverage**: Stores, utils, critical components

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

describe("Store Name", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("does something", () => {
    // Test implementation
  });
});
```

### Running Tests

```bash
cd frontend
npm run test:unit -- --run
```

---

## Appendix B: Development Commands

```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build production
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Run tests
npm run test:unit
```

---

_Last updated: March 2026_
_Version: 1.2.0_
