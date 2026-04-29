
## Phase 4.1 Architectural Decisions
- **Global Store for Screen Time**: Decided to move `useScreenTime` into `AppProvider` (via `appStore.tsx`) to ensure continuous tracking. If kept in a component, tracking would stop when the component unmounts.
- **Sidebar Componentization**: Chose to refactor the entire sidebar into a separate component rather than just the Stats tab. This follows best practices for React and prepares the codebase for future Phase 4 refactors.
- **Minimalist Aesthetic**: Opted for a clean, data-focused design for the Stats view, using subtle gradients and generous spacing to make the information easily digestible.
