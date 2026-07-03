# Architecture Overview

## Component Hierarchy

```
App (Root Shell)
│
├── Skip Navigation Link
├── Header (Brand + Status)
│
├── Dashboard (Container Component)
│   │
│   ├── SummaryCards
│   │   ├── Revenue Card
│   │   ├── Units Sold Card
│   │   ├── Satisfaction Card
│   │   └── Products Card
│   │
│   ├── Filter Section
│   │   ├── CategoryFilter (select)
│   │   ├── RegionFilter (select)
│   │   ├── DateRangeFilter (2x date inputs)
│   │   ├── Active Filter Tags
│   │   └── Results Counter
│   │
│   ├── Charts Grid
│   │   ├── RevenueLineChart (full-width)
│   │   ├── CategoryBarChart (half-width)
│   │   └── RegionPieChart (half-width)
│   │
│   ├── Data Table (top 15 records)
│   │
│   ├── LoadingSpinner (conditional)
│   └── ErrorMessage (conditional)
│
└── Footer
```

## Data Flow Diagram

```
┌──────────────────────┐
│   mockData.json      │ (120 records, static JSON)
│   (Raw Data Source)   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  simulateFetch()     │ (Simulated API delay: 1000ms)
│  Returns Promise     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Dashboard State     │ ← useState: data, filters, isLoading, error
│  (Container)         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  filterData()        │ ← Category, Region, Date Range filters
│  (Pure Function)     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Memoized Pipeline   │
│  (useMemo)           │
├──────────────────────┤
│ aggregateByMonth()  ─┼──► RevenueLineChart
│ aggregateByCategory()┼──► CategoryBarChart
│ aggregateByRegion() ─┼──► RegionPieChart
│ calculateSummary()  ─┼──► SummaryCards
│ filteredData        ─┼──► Data Table
└──────────────────────┘
```

## State Management Strategy

```
Dashboard Component State:
├── data: []              ← Full dataset (loaded once)
├── filters: {
│   ├── category: 'all'   ← string ('all' | category name)
│   ├── region: 'all'     ← string ('all' | region name)
│   ├── startDate: ''     ← string (YYYY-MM-DD | empty)
│   └── endDate: ''       ← string (YYYY-MM-DD | empty)
│}
├── isLoading: false      ← boolean (initial load simulation)
└── error: null           ← string | null

Derived State (useMemo):
├── filteredData          ← filterData(data, filters)
├── monthlyData           ← aggregateByMonth(filteredData)
├── categoryData          ← aggregateByCategory(filteredData)
├── regionData            ← aggregateByRegion(filteredData)
├── summary               ← calculateSummary(filteredData)
├── isFiltered            ← boolean (any filter active?)
└── activeFilterTags      ← array of {key, label}
```

## CSS Architecture

```
Design Tokens (CSS Custom Properties)
├── Colors (20+ tokens)
│   ├── Backgrounds (6 tiers)
│   ├── Text (4 levels: primary, secondary, muted, accent)
│   ├── Borders (3 variants)
│   ├── Chart Colors (8 distinct hues)
│   └── Semantic (success, warning, danger)
├── Typography
│   ├── Font Family (Inter)
│   └── Font Sizes (xs through 3xl)
├── Spacing (xs through 3xl)
├── Border Radius (sm through full)
├── Shadows (sm through glow-strong)
├── Transitions (fast, base, slow, spring)
└── Gradients (primary, accent, card, header)

Responsive Breakpoints:
├── Mobile: < 768px
├── Tablet: 768px - 1024px
├── Desktop: 1024px - 1440px
└── Large: > 1440px
```

## Key Design Patterns

### Container/Presentational
- **Dashboard.jsx** is the only stateful container
- All other components receive data via props and render UI
- Clear separation between logic and presentation

### Composition
- Filter components compose into a filter section
- Chart components compose into a charts grid
- Error/Loading states are reusable across contexts

### Memoization Strategy
- `React.memo` wraps all leaf components
- `useMemo` wraps all data transformations
- `useCallback` wraps all event handlers

### Data Transformation Layer
Pure functions in `dataTransformers.js`:
- No side effects
- All functions return new data (immutable)
- Independently testable
- Handles null/undefined gracefully
