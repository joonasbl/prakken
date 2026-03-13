# AGENTS.md - Prakken Project Guide

## Project Overview

**Prakken** is a fantasy character management system for tabletop RPGs, built with Vue 3 and Go.

### Tech Stack
- **Frontend**: Vue 3, TypeScript, Pinia, Vue Router, Vite
- **Backend**: Go 1.21, Gin Framework (future)
- **Database**: PostgreSQL 15 (future)
- **Deployment**: Docker (local), Podman (VPS)
- **Styling**: Custom fantasy dark theme with gold accents

### Project Structure
```
Prakken/
├── frontend/           # Vue 3 Source Code
│   ├── src/
│   │   ├── components/     # Reusable Vue components
│   │   ├── views/          # Page-level components
│   │   ├── stores/         # Pinia state management
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   ├── assets/         # CSS and static files
│   │   └── router/         # Vue Router configuration
│   └── nginx/              # Nginx config for production
├── backend/            # Go Source Code (future)
├── docker-compose.yml  # Full stack orchestration
└── deploy.sh           # VPS deployment script
```

## Development Commands

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Run tests
npm run test:unit
```

### Deployment
```bash
# Deploy frontend to VPS
./deploy.sh
```

## Key Conventions

### 1. TypeScript Types
- All types defined in `src/types/`
- Use `type` for object shapes, not `interface`
- Finnish naming for domain concepts (e.g., `Ominaisuus`, `Taito`)

### 2. Pinia Stores
- Stores in `src/stores/`
- Use `defineStore` with setup function
- State should be serializable for localStorage
- Actions should handle persistence

### 3. Component Structure
```vue
<script setup lang="ts">
// Imports: Vue, stores, types, utils
// Props with defineProps<{...}>()
// Emits with defineEmits<{...}>()
// Computed properties
// Functions
</script>

<template>
  <!-- Semantic HTML -->
</template>

<style scoped>
@import '@/assets/fantasy-theme.css';
/* Component styles */
</style>
```

### 4. Naming Conventions
- **Files**: PascalCase for Vue components, camelCase for utils/types
- **Variables/Functions**: camelCase
- **Types**: PascalCase
- **CSS Classes**: BEM-like with fantasy theme variables
- **UI Text**: Finnish language

### 5. localStorage Persistence
- Characters stored with version key for migrations
- Always add backwards compatibility for old data formats
- Use `utils/storage.ts` for all storage operations
- Migration example:
```typescript
// Migrate old 'skills' field to 'learnedSkills'
if (anyChar.skills && !anyChar.learnedSkills) {
  anyChar.learnedSkills = anyChar.skills
    .filter((s: any) => s.learned)
    .map((s: any) => ({ name: s.name, bonus: s.bonus || 0 }))
  delete anyChar.skills
}
```

### 6. Defensive Coding
- Always use optional chaining (`?.`) for nested properties
- Provide fallback values (`|| 0`, `|| []`)
- Handle null/undefined in stores and components
- Example:
```typescript
subStats: draft.subStats ?? {
  veripisteet: 10,
  vauriobonus: 0,
  syvaHaava: 5,
  kantokyky: 200,
}
```

## Common Patterns

### Effective Attributes Pattern
When displaying/calculating with attributes, always use bonuses:
```typescript
// In store getter
effectiveAttributes: (state): Attr[] => {
  const baseAttrs = state.draft.attributes.map((attr) => ({ ...attr }))
  
  // Apply background bonuses
  if (background) {
    for (const [attrName, bonus] of Object.entries(background.statBonuses)) {
      const attr = baseAttrs.find((a) => a.name === attrName)
      if (attr && bonus) attr.value += bonus
    }
  }
  
  // Apply advantage bonuses (e.g., Lahjakas)
  for (const [attrName, bonus] of Object.entries(attributeChoices)) {
    const attr = baseAttrs.find((a) => a.name === attrName)
    if (attr && bonus && bonus > 0) attr.value += bonus
  }
  
  return baseAttrs
}
```

### Skill Calculation Pattern
```typescript
import { calculateSkillsWithLevels } from '@/utils/skills'

const skillsWithLevels = computed(() => {
  return calculateSkillsWithLevels(
    learnedSkills,
    skillsStore.skillList,
    effectiveAttributes,  // Use effective attributes with bonuses!
    background
  )
})
```

### Modal Cancel Pattern
When a modal can cancel an action:
```typescript
// In parent component
const handleModalCancel = () => {
  // Reverse the action that opened the modal
  if (hasAdvantage('lahjakas')) {
    wizardStore.toggleAdvantage(lahjakasAdvantage)
  }
}

// In template
<AttributeChoiceModal 
  v-model="showModal" 
  @cancel="handleModalCancel" 
/>
```

## Testing Guidelines

### Unit Tests
- Test files alongside source: `*.test.ts`
- Use Vitest + Pinia test utils
- Mock localStorage for storage tests
- Test edge cases: empty data, null values, migrations

### Test Structure
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('Store Name', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('does something', () => {
    // Test implementation
  })

  describe('nested feature', () => {
    it('handles edge case', () => {
      // Test implementation
    })
  })
})
```

## Deployment

### Local Development
```bash
docker-compose up -d
# Frontend: http://localhost:5173
# Backend: http://localhost:8080
```

### VPS Deployment (Podman)
```bash
./deploy.sh
# Deploys to: https://prakken.dedyn.io
```

The deploy script:
1. Builds Docker image locally
2. Saves to tar file
3. Transfers via scp to VPS
4. Loads with Podman
5. Runs container with SSL certificates

## Common Issues & Solutions

### Issue: Characters not loading after schema change
**Solution**: Add migration in `utils/storage.ts`:
```typescript
// Check for old field names and migrate
if (parsed.characters && Array.isArray(parsed.characters)) {
  for (const char of parsed.characters) {
    const anyChar = char as any
    if (anyChar.oldField && !anyChar.newField) {
      anyChar.newField = transformOldToNew(anyChar.oldField)
      delete anyChar.oldField
    }
  }
}
```

### Issue: Attribute bonuses not applying
**Solution**: Use `effectiveAttributes` getter, not `draft.attributes`:
```typescript
// ❌ Wrong - uses base attributes
const attrs = wizardStore.draft.attributes

// ✅ Correct - includes bonuses
const attrs = wizardStore.effectiveAttributes
```

### Issue: Modal closes but action persists
**Solution**: Emit `cancel` event and reverse action:
```typescript
const handleClose = () => {
  const wasIncomplete = pendingChoices.value > 0
  isOpen.value = false
  if (wasIncomplete) {
    emit('cancel')  // Parent reverses the action
  } else {
    emit('close')
  }
}
```

## Code Quality Checklist

Before committing:
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run test:unit -- --run` passes
- [ ] `npm run build` succeeds
- [ ] Finnish text updated if UI changed
- [ ] Tests added for new features
- [ ] Backwards compatibility maintained

## Git Commit Convention

Semantic commits without scope:
```
feat: add new feature
fix: bug fix
refactor: code refactoring
style: formatting, UI tweaks
test: add/update tests
docs: documentation changes
```

Examples:
- `feat: add deployment script for VPS with Podman`
- `fix: remove Lahjakas advantage when modal is cancelled`
- `refactor: extract skill calculation logic to utility function`

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/stores/characterCreation.ts` | Character creation wizard state |
| `src/stores/characters.ts` | Saved characters management |
| `src/utils/skills.ts` | Skill calculation utilities |
| `src/utils/storage.ts` | localStorage with migrations |
| `src/types/character.ts` | Character type definitions |
| `src/types/skills.ts` | Skill type definitions |
| `deploy.sh` | VPS deployment automation |
