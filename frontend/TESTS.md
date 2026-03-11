# Prakken Frontend Tests

## Test Suite Overview

The Prakken frontend has a comprehensive test suite covering stores, components, and utilities.

### Test Files

| File | Tests | Description |
|------|-------|-------------|
| `stores/stats.test.ts` | 4 | Stats store - attribute management |
| `stores/characters.test.ts` | 8 | Characters store - CRUD operations |
| `stores/characterCreation.test.ts` | 10 | Character creation wizard state |
| `utils/storage.test.ts` | 8 | localStorage utilities |
| `utils/calculations.test.ts` | 13 | Derived stats calculations |
| `components/CharacterCard.test.ts` | 9 | Character card component |
| `components/Step1RollStats.test.ts` | 6 | Stats rolling component |

**Total: 57 tests across 7 test files**

## Running Tests

```bash
cd frontend

# Run all tests
npm run test:unit

# Run tests in watch mode
npm run test:unit -- --watch

# Run with coverage
npm run test:unit -- --coverage
```

## Test Coverage

### Stores
- ✅ Stats Store - Attribute management and modifiers
- ✅ Characters Store - CRUD operations, sorting, active character
- ✅ Character Creation Store - Wizard state, advantages/disadvantages

### Utilities
- ✅ Storage Utils - localStorage save/load operations
- ✅ Calculations - All derived stats formulas (HP, damage bonus, etc.)

### Components
- ✅ CharacterCard - Display, events, date formatting
- ✅ Step1RollStats - Attribute rolling and manual adjustment

## Test Structure

### Store Tests
```typescript
describe('Stats Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default attributes', () => {
    const store = useStatsStore()
    expect(store.attList).toHaveLength(6)
  })
})
```

### Component Tests
```typescript
describe('CharacterCard', () => {
  it('renders character name', () => {
    const wrapper = shallowMount(CharacterCard, {
      props: { character }
    })
    expect(wrapper.text()).toContain('Test Character')
  })
})
```

### Utility Tests
```typescript
describe('Derived Stats Calculations', () => {
  it('calculates hit points for low Terveys', () => {
    expect(calculateVeripisteet(1)).toBe(10)
  })
})
```

## Mocking

### localStorage Mock
```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    clear: () => { store = {} },
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })
```

## Future Test Additions

Priority areas for additional test coverage:

1. **More Component Tests**
   - Step2ChooseBackground
   - Step3AdvantagesDisadvantages
   - Step5Skills
   - CharacterListView
   - CharacterSheetView

2. **Integration Tests**
   - Full character creation flow
   - Character save/load cycle

3. **E2E Tests** (when backend is integrated)
   - API integration tests
   - Full user workflows

## Test Status

- **Passing**: 57 tests (100%) ✅
- **Failing**: 0 tests
- **Coverage Goal**: 80%+ (currently ~70%)

All tests passing as of March 2026!
