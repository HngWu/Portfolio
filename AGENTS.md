<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:parallel-agents-guidelines -->
# Parallel Agent Development Guidelines

To support running multiple AI agents in parallel:
- **State Management**: Zustand stores must be modular and split by feature/concern (e.g., `store/useThemeStore.ts`, `store/useNavigationStore.ts`) to avoid conflict on central state models.
- **Component Isolation**: Each component should reside in its own file under a feature subdirectory in `components/` (e.g., `components/bento/tiles/ContactTile.tsx`). Avoid monolithic files.
- **Branch Naming**: Run parallel agents in isolated feature branches prefixed with `feat/` or `fix/`.
- **Gitignore Local States**: Ensure local agent run caches (`.gemini/`, `.superpowers/`, `.playwright-mcp/`) are ignored in `.gitignore` to prevent session conflict.
<!-- END:parallel-agents-guidelines -->

<!-- BEGIN:git-session-scoping-rules -->
# Git Hygiene & Session-Scoped Commits Mandate

All AI agents, subagents, and automated workflows operating in this repository MUST follow these rules:
1. **Never Commit Documentation Artifacts**: Never stage or commit `docs/`, `.superpowers/`, specs, plans, scratch logs, or test reports. These are local session artifacts and must remain untracked.
2. **Selective Staging Only**: Never run blanket staging commands (`git add .`, `git add -A`, `git commit -a`, `git commit -am`). Always explicitly specify the exact files modified during the current session (`git add <file1> <file2>`).
3. **Session-Scoped Pushes**: When pushing to git (`git push`), verify that outgoing commits strictly only contain files modified during the current active session. Pre-existing uncommitted files or unrelated workspace modifications must remain untouched and unstaged.
<!-- END:git-session-scoping-rules -->
