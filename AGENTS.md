# react-pok-pui

Bun + Vite + React 19 + Three.js (R3F) + Rapier physics. A single-page 掷筊 divination app.

## Commands

```powershell
bun dev          # vite dev server on localhost:5173
bun run build    # tsc -b && vite build (typecheck first)
bun run lint     # eslint .
```

## TypeScript

- `verbatimModuleSyntax` is on — always use `import type` for type-only imports.
- `noUnusedLocals` / `noUnusedParameters` are on — every import and variable must be used.
- Build runs `tsc -b` before `vite build`; both must pass.

## Architecture

`src/main.tsx` → `App.tsx` (Canvas + UI overlay) → `Scene3D.tsx` (physics world) + `UI.tsx` (buttons, result card).

- **Scene3D** owns the Rapier `Physics` world, ground, 4 walls (left/right/back brick, front invisible collider), and two `ShengBeiBlock` children. Manages the throw/settle/result state machine via `useFrame`.
- **ShengBeiBlock** is a `forwardRef` half-ellipsoid mesh with `ConvexHullCollider`. The collider vertices are perturbed at the bottom rim (`sin(a*5+0.7)*0.006-0.006`) to prevent balancing on the flat edge.
- **State flow**: `idle → (button) → throwing → (effect teleports blocks to DROP_HEIGHT=2.5, sets linvel.y=-3, random angvel) → settling → (useFrame waits for bodies to sleep/slow, reads Quaternion rotation, calls determineResult) → result → (button) → idle`

## Physics gotchas

- Use **`setLinvel` / `setAngvel`** (velocity) not `applyImpulse` / `applyTorqueImpulse` (momentum) — the auto-computed mass from ConvexHull volume differs from the `mass` prop, making impulses unpredictable.
- Ground restitution: **0.55** (bouncy). Wall restitution: **0.06** (soft). Block restitution: **0.25**.
- Blocks drop from **y=2.5** with initial **Y velocity -3** and random angular velocity (2.5 rad/s).
- Settle detection: bodies must be sleeping OR speed < 0.08 for **both** blocks, with a minimum 0.6s wait and 4s timeout.

## Result logic

`determineResult` reads each block's world quaternion, checks if local +Y (rounded side) points up (y>0.3) or down (y<-0.3). If neither (block on edge), waits and retries.

## Key files

| File | Role |
|------|------|
| `src/App.tsx` | Shell: Canvas + UI overlay, manages Phase/ThrowResult state |
| `src/Scene3D.tsx` | Physics scene, throw/settle logic, procedural textures |
| `src/ShengBeiBlock.tsx` | 圣杯 block mesh + ConvexHullCollider |
| `src/UI.tsx` | Ask 掟 button, Reset button, result card |
| `src/utils/sound.ts` | Web Audio API wood-impact synthesis |
| `src/utils/textures.ts` | Canvas-based brick + tile textures |
