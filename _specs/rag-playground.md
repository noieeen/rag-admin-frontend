# RAG Playground Design

## Page Title & Navigation
- **Route Name**: `RAG Playground`
- **Path**: `/rag-playground`
- **Purpose**: Let admins validate retrieval quality, execute semantic searches, and inspect metadata coverage.

## Layout Overview
1. **Header**
   - Primary title: "RAG Playground"
   - Subtitle: "Test RAG queries across curated metadata and control retrieval filters."
   - `ToggleGroup` for quick modes: `Testing`, `Playground`, `Diagnostics` (defaults to Testing).
2. **Query Panel (left column)**
   - `Textarea` for natural language query.
   - Buttons: `Run Query`, `Clear`, optional `Save as Template`.
   - Model selector (dropdown) pulling from `/ai/models`.
   - `Switch` to enable/disable "Use chat history".
3. **Mode Switch & Metadata Toggles (sidebar / collapsible panel)**
   - `SegmentedControl` to switch between **Preview** (non-AI) and **Ask AI** modes.
   - `Toggle All` switch (master control).
   - Sectioned toggles for entity families:
     - Databases
     - Tables
     - Columns
     - Business Metrics
     - Query Templates
     - Synonym Mappings (optional, if exposed)
   - Each section includes multi-select list to refine items; defaults to "All" when master toggle is active.
4. **Filters Bar**
   - Tag filters (`Autocomplete` from metadata tags).
   - `brandRef` and `structure` indicators (read-only from tenant store).
   - Score threshold slider (0–1) to adjust vector similarity floor.
5. **Result Area (right column)**
   - In **Preview** mode, show filtered metadata results (tabbed by entity type) with similarity scores and contextual snippets; no AI generation yet.
   - Display `Send to AI` primary button to run generation using visible preview results as context.
   - In **Ask AI** mode (post-run), show:
     - Chat response text.
     - Retrieval insights referencing the preview items used.
     - Diagnostics tab (when toggled) for raw payload (JSON viewer), token usage, latency.
6. **History Panel**
   - Vertical list of previous questions; clicking replays query with stored filters.

## Interaction Notes
- The master "Select All" toggles automatically enable all metadata entity types. Deselecting makes them individually controllable.
- If no entity type is selected, show inline alert and disable `Run Query`.
- Persist recent settings in local storage scoped by tenant so switching brands resets to defaults.

## Accessibility & UX
- Keyboard shortcuts: `Cmd/Ctrl+Enter` to run query; `Cmd/Ctrl+K` still opens global command palette.
- Display badges for selected metadata filters under query panel for quick removal.
- Provide a textual explanation when filters limit recall, e.g., "Searching 2 tables, 5 columns".

## Future Enhancements
- Add side-by-side comparison for multiple models.
- Incorporate visualization (e.g., bar chart) for similarity scores.
- Allow exporting query session (JSON) for debugging.
