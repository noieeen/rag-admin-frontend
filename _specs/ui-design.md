# UI Design Specification

## Design Principles
- Clean, monochrome interface with black/white base and semantic status colors (success green, error red, warning amber).
- Admin-focused layout prioritizing clarity of metadata, RAG readiness, and AI orchestration controls.
- Consistent spacing system (Tailwind 4/6/8 multiples) and 12px border radius tokens to mirror shadcn-vue defaults.
- Bilingual content (EN/TH) where available; typography uses Inter with 14px base body size.

## Layout Structure
- **Admin Shell**: Left sidebar navigation (desktop) and slide-in drawer (mobile) with primary sections: Overview, Databases, Tables, Columns, Relations, Templates, SQL Patterns, Business Metrics, AI Control.
- **Header Bar**: Breadcrumb trail, command palette trigger (`⌘K`), user status pill, responsive menu toggle.
- **Content Container**: Centered `container` class with 24px horizontal padding, cards grid for metrics, tables for catalog lists, dialogs for CRUD.
- **Responsive Behaviour**: Two-column card grids collapse to single column <1024px; sidebar hides <768px replaced by menu button.

## Component Library
- **Cards**: `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription` wrappers replicating shadcn pattern.
- **Tables**: Tailwind table styling with subtle row hover states and border separators.
- **Forms**: Inputs and selects styled with monochrome borders; validation states rely on border and helper text color changes.
- **Command Palette**: Modal command/search overlay listing entity links with category labels and keyboard binding.
- **Tenant Switcher**: Sidebar select toggling `brandRef`/`structure` context across app.
- **Dialogs**: Teleported modals for create/update flows, using fade transitions and 32px padding.

## Key Views
- **Overview Dashboard**: Summary cards for metadata coverage, top-level metrics; quick nav tabs; database status list showing connection health.
- **Metadata Lists**: Search inputs, filter selectors, paginated tables (future). `Details`/`Inspect` buttons open record drawers or route to detail pages (todo).
- **Templates & SQL Patterns**: Card/grid layout mirroring provided `_referenceUI` screenshots, including natural language prompt forms and saved pattern list.
- **Business Metrics**: Card grid summarizing domain, refresh cadence, and usage frequency; will evolve to include charts (sparklines, range chips).
- **AI Control Center**: Dual-column layout for model selection and embedding job queue, plus chat sandbox with scrollable transcript.

## Visual Assets & References
- Reference mockups stored in `/_referenceUI`; use them to validate spacing, hierarchy, and copy tone.
- Iconography via `lucide-vue-next`; keep stroke weight consistent (1.5px) and size 16px within nav.

## Accessibility & Interactions
- All interactive elements require focus states (Tailwind focus-visible ring).
- Contrast targets WCAG AA (text on background ≥4.5:1); ensure semantic colors include accessible foregrounds.
- Keyboard shortcuts: `⌘K`/`Ctrl+K` toggles command palette; Escape closes palette/dialogs.
- Internationalization: display EN strings by default; surfaces should gracefully show TH variants when user toggles locale (future enhancement).

## Pending Enhancements
- Add skeleton loaders for list/table fetches.
- Implement detailed views with tabbed metadata + embeddings.
- Dark theme toggle to swap CSS variables (already defined in Tailwind config).
