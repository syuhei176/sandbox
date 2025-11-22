# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Game Platform - A platform for generating and editing 3D games from natural language. Games are defined using **JSON (GameSpec) + Lua scripts** and rendered in the browser using **Next.js + three.js + React Three Fiber**.

**Key concept**: LLMs generate game specifications in JSON format along with Lua scripts for object behavior. The runtime engine parses the GameSpec JSON and constructs a 3D world using three.js, executing attached Lua scripts for dynamic behavior.

## Development Commands

```bash
# Start development server (default: http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

### Core Architecture

The project has two main modes of operation:

1. **Editor Mode** (`/editor`) - Unity-like visual editor for creating games
2. **Runtime Mode** (`/runtime`) - Executes and renders games from GameSpec JSON

### Key Directories

- `lib/types/gamespec.ts` - TypeScript type definitions for the GameSpec JSON format
- `lib/runtime/` - Core game engine implementation
  - `game-engine.ts` - Main game engine that constructs three.js scenes from GameSpec
  - `lua-vm.ts` - Lua VM wrapper (using fengari-web) for executing game object scripts
- `components/editor/` - Editor UI components (SceneHierarchy, Inspector, Viewport3D, ScriptEditor)
- `app/editor/page.tsx` - Editor page (manages game object state and user interactions)
- `app/runtime/page.tsx` - Runtime page (initializes GameEngine and runs the game)

### GameSpec Format

Games are defined by a `GameSpec` object containing:

- `meta` - Game title, description, version
- `players` - Min/max players and spawn points
- `worlds[]` - Array of World objects, each containing:
  - `environment` - Skybox, ambient light, directional light settings
  - `objects[]` - GameObject array with transform, components, and optional script_id
- `scripts[]` - Lua script definitions referenced by GameObject.script_id

### Component System

GameObjects have a component-based architecture. Currently supported component types:

- `mesh` - Visual geometry (box, sphere, plane, cylinder) with material properties
- `light` - Lighting (point, spot, directional)
- `camera` - Camera with FOV, aspect, near/far settings
- `collider`, `rigidbody`, `audio_source`, `particle_system` (defined but not yet implemented)

### Lua Script Lifecycle

Each GameObject can have an attached Lua script (via `script_id`). The Lua VM provides:

- `on_start()` - Called once when the object is instantiated
- `on_update(dt)` - Called every frame with deltaTime
- Global `gameobject` table containing: `id`, `name`, `transform.position`, `transform.rotation`, `transform.scale`

**Important**: The Lua VM uses fengari-web and is browser-only (will throw error in SSR context).

## Path Aliases

TypeScript is configured with path alias `@/*` mapping to repository root, so imports use:

```typescript
import { GameSpec } from '@/lib/types/gamespec';
import { GameEngine } from '@/lib/runtime/game-engine';
```

## ExecPlan Workflow

This repository follows an **ExecPlan** methodology for complex features or refactors (see `.agent/PLANS.md` and `AGENTS.md`).

When implementing significant features:

1. Create a self-contained ExecPlan document following `.agent/PLANS.md` structure
2. ExecPlans must be living documents with mandatory sections: `Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`
3. Update the plan as work proceeds - plans must always be self-contained and allow a novice to restart from scratch
4. Write in narrative prose, not checklists (except in Progress section)
5. Define all terms of art and repository context explicitly
6. Focus on observable, verifiable outcomes

Key principles from PLANS.md:
- Self-contained: No external references, embed all necessary knowledge
- Novice-guiding: Assume reader has zero context
- Outcome-focused: Describe what user can do after the change and how to verify it
- Living document: Update Progress, Decision Log, and other sections continuously

## Development Notes

- **Next.js App Router**: This project uses Next.js 16 with the App Router (not Pages Router)
- **Client Components**: 3D rendering and game runtime require `'use client'` directive
- **TypeScript**: Strict mode enabled, ES2017 target
- **Styling**: Tailwind CSS 4
- **3D Libraries**: three.js, @react-three/fiber, @react-three/drei
- **Lua Runtime**: fengari-web for browser-based Lua execution

## Spec Documents

- `spec.md` - Japanese language specification of the platform architecture (JSON+Lua format, LLM role, runtime role)
- `README.md` - Standard Next.js starter README
- `AGENTS.md` - Brief note referencing the ExecPlan workflow
- `.agent/PLANS.md` - Comprehensive ExecPlan methodology and requirements
