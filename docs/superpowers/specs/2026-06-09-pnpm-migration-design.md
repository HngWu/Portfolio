# Design Specification: Migrate Project from npm to pnpm

## 1. Goal
Transition the package manager of the Lume-Glass Portfolio project from `npm` to `pnpm` to improve installation performance, optimize disk space, and establish clean lockfiles. Additionally, configure Vercel for native pnpm compatibility.

## 2. Scope & Requirements
- **Lockfile Conversion**: Convert `package-lock.json` to `pnpm-lock.yaml` to retain version consistency.
- **Cleanup**: Delete `package-lock.json` and the old `node_modules` directory.
- **Dependency Installation**: Perform a clean install with `pnpm`.
- **Documentation**: Update references to `npm` in `README.md` to `pnpm`.
- **Deployment Platform**: Configure a `vercel.json` file for explicit Vercel build command overrides.

## 3. Architecture & Design

### 3.1 Lockfile Transition
We will use `pnpm import` to convert the dependency tree from the existing `package-lock.json`.
```bash
pnpm import
```
This preserves the exact dependency resolutions tested previously.

### 3.2 Vercel Configuration (`vercel.json`)
Vercel naturally detects `pnpm-lock.yaml` and handles pnpm builds. We will add a `vercel.json` file to explicitly define:
- `buildCommand`: `pnpm run build`
- `devCommand`: `pnpm run dev`
- `installCommand`: `pnpm install`
- `framework`: `nextjs`

```json
{
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

### 3.3 Documentation Updates
All references to `npm run dev` or other `npm` commands in [README.md](file:///C:/Projects/Portfolio/README.md) will be updated to `pnpm`.

## 4. Verification Plan
- Verify lockfile generation (`pnpm-lock.yaml`).
- Check that `package-lock.json` has been deleted.
- Run a verification build (`pnpm run build`) and linting (`pnpm run lint`) to confirm that all packages resolve correctly.
- Test dev server start-up locally to verify dev mode.
