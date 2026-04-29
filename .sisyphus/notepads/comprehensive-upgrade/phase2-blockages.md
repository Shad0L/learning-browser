## Phase 2 Blockages
- Blockers exist; retry planning prepared for after credential alignments or alternative fallbacks.
### Phase 2 Notes
- 2.1 Context Menus: basic functionality; localFallback ready.
- 2.2 Adblocker: main-process approach with renderer fallback.
- 2.3 Web Clipper IPC: offline fallback via localStorage implemented.
- 2.4 Retry scheduling: defined; retry sequencing is in plan.
- 2.5 Grant draft: exists.
- 2.6 Fallback Paths: prepared with a FeatureAvailabilityService concept.

### Phase 2 Retry Strategy (Post-Grant)

| Task | Action | Fallback Path | Decision Gate |
| :--- | :--- | :--- | :--- |
| 2.1 Context Menus | Integrate AI-driven context actions. | Basic Copy/Paste/Open menu. | If API fails after retries, revert to basic and log. |
| 2.2 Adblocker | Move logic to main process. | Renderer-side domain list. | If performance drops >20%, revert to renderer-side. |
| 2.3 Web Clipper | IPC for saving clips; offline localStorage. | LocalStorage. | If OS permission blocks FS, keep localStorage. |
| 2.6 Fallback Paths | FeatureAvailabilityService. | Hardcoded feature flags. | If service fails, default to Safe Mode. |
(End of file)
