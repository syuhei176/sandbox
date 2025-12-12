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

- `mesh` - Visual geometry (box, sphere, plane, cylinder, custom_model) with material properties
- `light` - Lighting (point, spot, directional)
- `camera` - Camera with FOV, aspect, near/far settings
- `collider`, `rigidbody`, `audio_source`, `particle_system` (defined but not yet implemented)

### 3D Model and Animation Support

#### Loading 3D Models

The platform supports loading custom 3D models in GLTF/GLB format through the `custom_model` geometry type:

```typescript
{
  type: "mesh",
  properties: {
    geometry: "custom_model",

    // Model loading (choose one):
    model_url: "https://example.com/character.glb",  // Load from URL
    model_id: "model-123",                            // Load from IndexedDB
    model_data: "data:application/octet-stream;..."  // Inline base64 data
  }
}
```

#### Animation System

Models with embedded animations are automatically detected and managed by the engine. Animation configuration properties:

```typescript
{
  type: "mesh",
  properties: {
    geometry: "custom_model",
    model_url: "https://example.com/animated-character.glb",

    // Animation configuration:
    autoPlayAnimation: true,      // Auto-play on load (default: true)
    defaultAnimation: "Idle",     // Clip name to play on start (default: first clip)
    animationLoop: true,          // Loop playback (default: true)
    animationSpeed: 1.0          // Playback speed multiplier (default: 1.0)
  }
}
```

**Lua Animation API**:

Animated GameObjects have access to an `animation` global table and control functions:

```lua
-- Read-only state table (updated each frame):
animation.clips        -- Array of available clip names: {"Walk", "Run", "Idle"}
animation.current      -- Currently playing clip name (or nil)
animation.time         -- Current playback time in seconds
animation.duration     -- Duration of current clip
animation.is_playing   -- Boolean playback state
animation.loop         -- Current loop mode
animation.speed        -- Current playback speed

-- Control functions:
play_animation("Walk")
play_animation("Attack", {loop = false, speed = 1.5, fadeTime = 0.3})
pause_animation()
resume_animation()
stop_animation()
set_animation_speed(2.0)
set_animation_time(1.5)  -- Seek to specific time

-- Lifecycle hook:
function on_animation_complete(clip_name)
  -- Called when non-looping animation finishes
  if clip_name == "Attack" then
    play_animation("Idle")
  end
end
```

**Example - Character with Animation State Machine**:

```lua
local state = "idle"
local detection_range = 15

function on_start()
  if animation and animation.clips then
    print("Available animations:", table.concat(animation.clips, ", "))
    play_animation("Idle")
  end
end

function on_update(dt)
  local player = find_gameobject("Player")
  if not player then return end

  local distance = calculate_distance(player)

  if distance < 3 then
    if state ~= "attack" then
      state = "attack"
      play_animation("Attack", {loop = false})
    end
  elseif distance < detection_range then
    if state ~= "chase" then
      state = "chase"
      play_animation("Run", {loop = true, speed = 1.2})
    end
    move_towards_player(player, dt)
  else
    if state ~= "idle" then
      state = "idle"
      play_animation("Idle")
    end
  end
end

function on_animation_complete(clip_name)
  if clip_name == "Attack" then
    state = "idle"
    play_animation("Idle")
  end
end
```

### Lua Script Lifecycle

Each GameObject can have an attached Lua script (via `script_id`). The Lua VM provides:

- `on_start()` - Called once when the object is instantiated
- `on_update(dt)` - Called every frame with deltaTime
- Global `gameobject` table containing: `id`, `name`, `transform.position`, `transform.rotation`, `transform.scale`

**Important**: The Lua VM uses fengari-web and is browser-only (will throw error in SSR context).

### Lua Sandbox Security

The Lua VM implements a sandboxed environment to protect against malicious or buggy scripts:

**Security Measures:**

1. **Restricted Libraries** - Only safe standard libraries are enabled:
   - ✅ Enabled: `base`, `math`, `string`, `table`, `utf8`
   - ❌ Disabled: `io` (file I/O), `os` (system calls), `debug` (introspection), `package` (module loading)

2. **Disabled Functions** - Dangerous functions are explicitly removed:
   - `dofile`, `loadfile`, `load`, `loadstring`, `require` (code execution)
   - `collectgarbage` (timing attacks)

3. **Environment Isolation** - Each GameObject script runs in a protected environment:
   - Scripts cannot create new global variables (prevents typos and pollution)
   - Must use `local` keyword for all variables
   - Attempting to create globals throws an error with helpful message

4. **Execution Timeout** - Scripts are monitored for excessive execution time:
   - Maximum execution time: 16ms per frame (~1 frame at 60fps)
   - Debug hook checks every 1000 instructions
   - Infinite loops are automatically detected and terminated

5. **Error Tracking** - Runtime errors are tracked and scripts are auto-disabled:
   - After 10 errors, script execution is halted
   - Timeout also disables the script
   - Errors are logged with context for debugging

**API for Error Handling:**

```typescript
// Check script health
const errorInfo = luaVM.getErrorInfo();
// { hasError: boolean, lastError: string | null, errorCount: number, isDisabled: boolean }

// Clear errors after fixing script
luaVM.clearErrors();
```

**Example Malicious Scripts (Now Blocked):**

```lua
-- ❌ Infinite loop - will timeout after 16ms
function on_update(dt)
  while true do end
end

-- ❌ Global variable typo - will error immediately
function on_start()
  palyer = find_gameobject("Player")  -- typo: should be 'local player'
end

-- ❌ File I/O - io library disabled
function on_start()
  local file = io.open("secret.txt", "r")  -- io is nil
end
```

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
