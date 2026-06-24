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
