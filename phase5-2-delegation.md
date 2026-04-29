# Phase 5.2 UI Polish Delegation Prompt

## 1. TASK
- [ ] Phase 5.2 UI Polish: Ensure Dark Mode applies correctly to the new Split Views, Reader View, and Markdown Preview across the app.
- [ ] Implement live UI polish once IAM permissions (`cloudaicompanion.generateChat`) are granted, transitioning from offline skeletons to live integrated features.

## 2. EXPECTED OUTCOME
- [ ] Files created/modified: Minimal changes to existing theming variables; no new dependencies. If changes required, document in plan and notepad.
- [ ] Functionality: Dark mode visuals consistently applied in Split-Screen view, Reader View overlay, and Markdown rendering previews.
- [ ] Verification: Build passes, typecheck passes; manual QA validates UI appears correctly in all affected areas.
- [ ] Readiness: Complete Phase 5.2 six-section delegation text ready for dispatch once IAM lands, including fallback offline skeleton references.

## 3. REQUIRED TOOLS
- [tool]: lsp_diagnostics
- context7: Look up dark theme guidelines (local)
- ast-grep: `sg --pattern 'dark|dark-theme|Dark' --lang typescript`

## 4. MUST DO
- Update CSS variables if needed; ensure no regressions in other UI areas.
- Append findings to notepad (never overwrite).
- Follow the established six-section structure exactly.
- Ensure accessibility and readability are preserved in both panes of the Split View.
- Maintain offline skeleton parity until the IAM grant officially lands.

## 5. MUST NOT DO
- Do NOT create new global CSS files; limit to existing theming system.
- Do NOT add dependencies.
- Do NOT skip verification or QA steps.
- Do NOT modify core logic or UI files beyond theming requirements.

## 6. CONTEXT
### Notepad Paths
- READ: .sisyphus/notepads/comprehensive-upgrade/learnings.md
- READ: .sisyphus/notepads/comprehensive-upgrade/phase5-blockages.md

### Inherited Wisdom
- **IAM Gating**: Phase 2 and Phase 5 live features are currently gated by IAM permissions (`cloudaicompanion.generateChat`). Offline fallbacks (localStorage, skeletons) are in place to maintain progress.
- **Traceability**: Importance of capturing learnings and blockers in notepads for cross-delegation continuity.
- **Resilience**: Phase 3 and 4 demonstrated the viability of offline-first implementations (analytics, white noise) when external dependencies or permissions are delayed.
- **UI Consistency**: Phase 5 UI polish must ensure that the theme toggle remains the single source of truth and that default states remain stable.
- **Blocker Status**: Phase 5.2 UI Polish is currently blocked from live deployment but has an offline skeleton ready for immediate handoff once authorization is granted.
