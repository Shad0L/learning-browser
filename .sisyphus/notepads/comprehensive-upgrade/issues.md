## [2026-04-29] Blocker: Background exploration task failure

- Issue: A previously started exploration task (session ses_explore_map_001) failed with "Task not found for session" when resuming in background.
- Impact: Hinders parallel analysis progress for the upgrade plan.
- Action: Re-launch exploration with a fresh session_id; ensure persistent task_id mapping to avoid resume errors. Documented in this notepad for traceability.

## [2026-04-29] Blocker: Repeated background task failures across multiple sessions

- Issue: Several background exploration/librarian tasks (ses_explore_map_001, ses_explore_map_002, ses_explore_map_003, ses_explore_map_004, ses_explore_map_005, ses_explore_map_006, ses_explore_map_107, ses_explore_map_108) report "Task not found" when resuming in the same session or a new session, indicating systemic session-tracking instability in this environment.
- Impact: Prevents reliable parallel progress, blocks MVP Phase 1 completion.
- Action: Investigate the OpenCode agent session lifecycle; ensure each delegated task is assigned a durable session_id, and ensure tasks report completion only after successful finalization. Consider simplifying to sequential tasks if parallelization remains unstable.

## Phase 2 Rollover: Implement Client-Side Fallback for Adblock
- Due to IAM permission constraints, Phase 2.2 Adblocker is being addressed via a renderer-side fallback using default ad-domain list.

-## [2026-04-30] Blocker: Phase 2 tasks blocked by IAM permission
- Issue: Phase 2 tasks 2.1/2.2/2.3 failed due to IAM permission error: "cloudaicompanion.companions.generateChat" on project "projects/rising-fact-p41fc".
- Impact: Prevents progression from Phase 2 to Phase 3; blocks validation of IPC/security scaffolding.
- Action: Request or obtain necessary IAM permission to enable chat-assisted task delegation; document grant status and plan to retry tasks upon permission grant. Implemented offline fallback for Phase 2.3 and updated plan to retry once grant is granted.

## Pomodoro Analytics Issues
- Encountered a conflicting `STATS` tab implementation in `App.tsx` that was attempting to show "Screen Time" but had multiple type errors and missing imports. Replaced it with the requested Pomodoro Analytics view.
- Noticed `react-markdown` is imported dynamically in `App.tsx` but is not listed in `package.json`, leading to type errors that were suppressed with `@ts-ignore`.
- Missing `Volume2` and `VolumeX` icons in `App.tsx` caused build failures; added them to the `lucide-react` imports.
