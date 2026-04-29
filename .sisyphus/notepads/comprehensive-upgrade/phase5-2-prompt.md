## Phase 5.2 UI Polish Delegation Prompt (Ready to Dispatch)

### 1. TASK
- [ ] Phase 5.2 UI Polish: Ensure Dark Mode applies correctly to the new Split Views, Reader View, and Markdown Preview across the app.

### 2. EXPECTED OUTCOME
- [ ] Files created/modified: Minimal changes to existing theming variables; no new dependencies. If changes required, document in plan and notepad.
- [ ] Functionality: Dark mode visuals consistently applied in Split-Screen view, Reader View overlay, and Markdown rendering previews.
- [ ] Verification: Build passes, typecheck passes; manual QA validates UI appears correctly in all affected areas.

### 3. REQUIRED TOOLS
- [tool]: lsp_diagnostics
- context7: Look up dark theme guidelines (local)
- ast-grep: `sg --pattern 'dark|dark-theme|Dark' --lang typescript`

### 4. MUST DO
- Update CSS variables if needed; ensure no regressions in other UI areas.
- Append findings to notepad (never overwrite).

### 5. MUST NOT DO
- Do NOT create new global CSS files; limit to existing theming system.
- Do NOT add dependencies
- Do NOT skip verification

### 6. CONTEXT
### Notepad Paths
- READ: .sisyphus/notepads/comprehensive-upgrade/learnings.md
- WRITE: .sisyphus/notepads/comprehensive-upgrade/learnings.md

### Inherited Wisdom
- Phase 5 UI polish should preserve accessibility and readability in both panes.

### Environment notes
- The changes should be opt-in via a theme toggle; default remains stable.
- IAM blockers block live 5.x; offline skeleton parity is expected to be maintained until grant lands.

(End of prompt)
