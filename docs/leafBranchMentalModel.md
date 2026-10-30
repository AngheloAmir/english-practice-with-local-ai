# Branch & Leaf Component Architecture (Mental Model)

## 1. Overview & Core Philosophy

In our frontend codebase, all feature screens and modules adhere to the **"Branch & Leaf"** component architecture.

The core principle is simple:
> **An `index.tsx` is an orchestrator (Branch), not a dumping ground for markup.**
> Its sole responsibility is to arrange the layout, flow, and positioning of its child subcomponents (Leaves).

```
Module Directory (e.g. src/modules/dashboard/)
│
├── index.tsx                 <-- BRANCH: Orchestrates layout & positioning (< 20 lines)
├── DashboardMetrics.tsx      <-- LEAF: 3 KPI metric summary cards & timeframe toggle
└── DashboardTrendChart.tsx   <-- LEAF: Responsive SVG trend line chart & legends
```

---

## 2. Component Roles & Definitions

### 🌿 The Branch Component (`index.tsx`)
- **Role**: Layout Orchestrator & Coordinator.
- **Responsibilities**:
  1. Hold or coordinate top-level shared view state (e.g., `timeframe: "weekly" | "monthly"`).
  2. Define outer container styling, padding, scrolling, and flex/grid direction.
  3. Declaratively assemble Leaf components in their exact visual order.
- **Strict Constraints**:
  - **NO** deep low-level JSX blobs or nested trees.
  - **NO** raw SVG `<path>` vectors, grid calculations, or charting algorithms.
  - **NO** inline styling monoliths.
  - Should read like an executive table of contents:
    ```tsx
    return (
      <main className="flex-1 bg-[#fcfdfe] rounded-[28px] sm:rounded-[34px] p-6 shadow-2xl flex flex-col gap-6">
        <DashboardMetrics timeframe={timeframe} setTimeframe={setTimeframe} />
        <DashboardTrendChart timeframe={timeframe} />
      </main>
    );
    ```

### 🍃 The Leaf Components (`<ComponentName>.tsx`)
- **Role**: Specialized Feature & Presentation Units.
- **Responsibilities**:
  1. Fully encapsulate their own visual representation, micro-layout, and interactions.
  2. Handle their own local calculation logic, formatting helpers, and SVG rendering.
  3. Receive required props from the Branch or subscribe directly to zustand state slices.
- **Strict Constraints**:
  - A Leaf does not dictate the positioning of its sibling leaves.
  - Co-located inside the same module folder as its parent Branch.

---

## 3. Why We Enforce This Mental Model

1. **Zero Clutter**: Eliminates 500–1000 line monolithic files that are error-prone and hard to navigate.
2. **Instant Mental Clarity**: Anyone (developer or AI) opening `index.tsx` understands the entire page structure in 5 seconds.
3. **Safe & Isolated Iteration**: Modifying or removing a section (e.g., removing a chart or sidebar) only requires editing 1 line in `index.tsx` or updating that isolated Leaf file without risking regressions in other sections.
4. **AI-Friendly Collaboration**: AI coding assistants can easily pinpoint the exact Leaf component to adjust without touching or breaking other UI sections.

---

## 4. Reference Implementation (Dashboard Module)

### Branch: `src/modules/dashboard/index.tsx`
```tsx
import { useState } from "react";
import DashboardMetrics from "./DashboardMetrics";
import DashboardTrendChart from "./DashboardTrendChart";

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("weekly");

  return (
    <main className="flex-1 bg-[#fcfdfe] rounded-[28px] sm:rounded-[34px] p-4 sm:p-6 lg:p-7 shadow-2xl flex flex-col gap-6 overflow-y-auto min-h-full">
      <DashboardMetrics timeframe={timeframe} setTimeframe={setTimeframe} />
      <DashboardTrendChart timeframe={timeframe} />
    </main>
  );
}
```

### Leaves:
- **`DashboardMetrics.tsx`**: Renders the 3 top KPI summary cards (Total Time, Average Score, Sessions Completed) on the left, paired with the Weekly / Monthly timeframe toggle on the right.
- **`DashboardTrendChart.tsx`**: Renders the primary SVG line graph, metric toggle (`Score %` vs `Duration mins`), legends (`Grammar`, `Shadowing`), warm sand area gradient, and hover tooltips.

---

## 5. System Prompt for Future AI Assistants

Copy and paste this prompt when instructing an AI to create, refactor, or adjust components in this codebase:

```markdown
### SYSTEM INSTRUCTION: Branch & Leaf Component Pattern

When creating, updating, or refactoring UI modules in this repository, you MUST follow our "Branch & Leaf" architecture:

1. **The Branch Component (`index.tsx`)**:
   - `index.tsx` must ONLY serve as the layout orchestrator.
   - It must remain concise (< 20 lines) and declarative, only arranging the positioning of its child subcomponents.
   - NEVER dump large markup, raw SVGs, data transformation algorithms, or multi-section JSX directly inside `index.tsx`.

2. **The Leaf Components (`<SectionName>.tsx`)**:
   - Break every distinct section of the screen into its own Leaf component in the module directory (e.g., `src/modules/<module-name>/<SectionName>.tsx`).
   - Encapsulate internal SVG graphics, micro-layouts, and formatting inside the respective Leaf component.
   - Connect to state slices via Zustand selectors or receive clean props from the Branch.

3. **Refactoring Existing Monoliths**:
   - If an existing file is monolithic, split it by extracting sections into co-located Leaf components and simplify the `index.tsx` to just arrange their positioning.
```
