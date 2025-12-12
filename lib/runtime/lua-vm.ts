import type { GameObject } from "../types/gamespec";

// Import GameObjectInstance interface
interface GameObjectInstance {
  id: string;
  object3D: unknown;
  luaVM: LuaVM | null;
  gameObject: GameObject;
}

export class LuaVM {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private fengari: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private lua: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private lauxlib: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private lualib: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private to_luastring: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private to_jsstring: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private L: any;
  private allGameObjects: Map<string, GameObjectInstance> | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private gameEngine: any = null;
  private currentGameObjectId: string = "";

  // Timeout management
  private executionStartTime: number = 0;
  private isExecuting: boolean = false;
  private readonly MAX_EXECUTION_TIME_MS = 16; // ~1 frame at 60fps
  private readonly INSTRUCTION_CHECK_INTERVAL = 1000; // Check every N instructions
  private hasTimedOut: boolean = false;

  // Error tracking
  private lastError: string | null = null;
  private errorCount: number = 0;
  private readonly MAX_ERRORS_BEFORE_DISABLE = 10;

  constructor() {
    if (typeof window === "undefined") {
      throw new Error("LuaVM can only be used in browser environment");
    }
  }

  setGameEngine(engine: unknown, gameObjectId: string): void {
    this.gameEngine = engine;
    this.currentGameObjectId = gameObjectId;
  }

  async initialize(): Promise<void> {
    // Dynamically import fengari-web
    const fengari = await import("fengari-web");
    this.fengari = fengari;
    this.lua = fengari.lua;
    this.lauxlib = fengari.lauxlib;
    this.lualib = fengari.lualib;
    this.to_luastring = fengari.to_luastring;
    this.to_jsstring = fengari.to_jsstring;

    // Create new Lua state
    this.L = this.lauxlib.luaL_newstate();

    // ========================================
    // SANDBOXED ENVIRONMENT: Only open safe libraries
    // ========================================
    // DO NOT use luaL_openlibs() - it opens ALL libraries including dangerous ones (io, os, debug)
    // Instead, open only safe libraries individually:

    // Base library (print, type, tonumber, tostring, pairs, ipairs, etc.)
    this.lauxlib.luaL_requiref(
      this.L,
      this.to_luastring("_G"),
      this.lualib.luaopen_base,
      1,
    );
    this.lua.lua_pop(this.L, 1);

    // Math library (math.sin, math.cos, math.random, etc.)
    this.lauxlib.luaL_requiref(
      this.L,
      this.to_luastring("math"),
      this.lualib.luaopen_math,
      1,
    );
    this.lua.lua_pop(this.L, 1);

    // String library (string.sub, string.format, etc.)
    this.lauxlib.luaL_requiref(
      this.L,
      this.to_luastring("string"),
      this.lualib.luaopen_string,
      1,
    );
    this.lua.lua_pop(this.L, 1);

    // Table library (table.insert, table.sort, etc.)
    this.lauxlib.luaL_requiref(
      this.L,
      this.to_luastring("table"),
      this.lualib.luaopen_table,
      1,
    );
    this.lua.lua_pop(this.L, 1);

    // UTF8 library (utf8.char, utf8.len, etc.)
    this.lauxlib.luaL_requiref(
      this.L,
      this.to_luastring("utf8"),
      this.lualib.luaopen_utf8,
      1,
    );
    this.lua.lua_pop(this.L, 1);

    // ========================================
    // DISABLED LIBRARIES (for security):
    // - io: File I/O operations
    // - os: Operating system operations (execute, exit, etc.)
    // - debug: Debug library (can access/modify internals)
    // - package/require: Module loading
    // ========================================

    // Disable dangerous global functions
    this.disableDangerousFunctions();

    // Setup execution timeout using debug hooks
    this.setupTimeoutHook();

    // Register find_gameobject function
    // We use a simple Lua function that accesses the all_gameobjects global table
    // which is updated each frame with the latest GameObject positions
    this.registerStubFindGameObject();

    // Register animation control functions (stubs that will call gameEngine methods)
    this.registerAnimationFunctions();
  }

  private setupTimeoutHook(): void {
    // Set a debug hook that checks execution time every N instructions
    // This prevents infinite loops and excessive computation
    const hookMask = this.lua.LUA_MASKCOUNT;
    const hookCallback = (L: any) => {
      if (!this.isExecuting) return;

      const elapsed = performance.now() - this.executionStartTime;
      if (elapsed > this.MAX_EXECUTION_TIME_MS) {
        this.hasTimedOut = true;
        // Use luaL_error to throw a Lua error
        this.lauxlib.luaL_error(
          L,
          this.to_luastring(
            `Script execution timeout (>${this.MAX_EXECUTION_TIME_MS}ms). Possible infinite loop detected.`,
          ),
        );
      }
    };

    this.lua.lua_sethook(
      this.L,
      hookCallback,
      hookMask,
      this.INSTRUCTION_CHECK_INTERVAL,
    );
  }

  private disableDangerousFunctions(): void {
    // Disable functions that could load/execute arbitrary code
    const dangerousFunctions = [
      "dofile",
      "loadfile",
      "load",
      "loadstring",
      "require",
    ];

    for (const funcName of dangerousFunctions) {
      this.lua.lua_pushnil(this.L);
      this.lua.lua_setglobal(this.L, this.to_luastring(funcName));
    }

    // Also disable collectgarbage (could be used for timing attacks)
    this.lua.lua_pushnil(this.L);
    this.lua.lua_setglobal(this.L, this.to_luastring("collectgarbage"));
  }

  private registerStubFindGameObject(): void {
    // Register a Lua function that uses the all_gameobjects global table
    const stubCode = `
function find_gameobject(name)
  if all_gameobjects and all_gameobjects[name] then
    return all_gameobjects[name]
  end
  return nil
end
`;
    this.lauxlib.luaL_loadstring(this.L, this.to_luastring(stubCode));
    this.lua.lua_pcall(this.L, 0, 0, 0);
  }

  private registerAnimationFunctions(): void {
    // Register animation control functions
    // These are Lua wrappers that will call the _internal_* functions
    // which are implemented in TypeScript
    const animCode = `
function play_animation(clip_name, options)
  options = options or {}
  local loop = options.loop
  local speed = options.speed
  local fade = options.fadeTime or options.fade
  _internal_play_animation(clip_name, loop, speed, fade)
end

function pause_animation()
  _internal_pause_animation()
end

function resume_animation()
  _internal_resume_animation()
end

function stop_animation()
  _internal_stop_animation()
end

function set_animation_speed(speed)
  _internal_set_animation_speed(speed)
end

function set_animation_time(time)
  _internal_set_animation_time(time)
end
`;
    this.lauxlib.luaL_loadstring(this.L, this.to_luastring(animCode));
    this.lua.lua_pcall(this.L, 0, 0, 0);

    // Register the _internal_* functions that call gameEngine methods
    // These need to be set as global functions
    this.registerInternalAnimationFunctions();
  }

  private registerInternalAnimationFunctions(): void {
    // _internal_play_animation
    const playAnimCode = `
_internal_play_animation = function(clip_name, loop, speed, fade)
  -- This will be overridden when setGameEngine is called
  -- For now it's a no-op
end
`;
    this.lauxlib.luaL_loadstring(this.L, this.to_luastring(playAnimCode));
    this.lua.lua_pcall(this.L, 0, 0, 0);

    // Similar stubs for other functions
    const otherFuncsCode = `
_internal_pause_animation = function() end
_internal_resume_animation = function() end
_internal_stop_animation = function() end
_internal_set_animation_speed = function(speed) end
_internal_set_animation_time = function(time) end
`;
    this.lauxlib.luaL_loadstring(this.L, this.to_luastring(otherFuncsCode));
    this.lua.lua_pcall(this.L, 0, 0, 0);
  }

  updateInternalAnimationFunctions(): void {
    if (!this.gameEngine || !this.L) return;

    // Instead of trying to bind JS functions to Lua (which is complex with Fengari),
    // we use a simple approach: Lua functions set a global command table,
    // and GameEngine reads and executes these commands
    const simpleCode = `
_current_animation_command = nil

_internal_play_animation = function(clip_name, loop, speed, fade)
  _current_animation_command = {
    action = "play",
    clip_name = clip_name,
    loop = loop,
    speed = speed,
    fade = fade
  }
end

_internal_pause_animation = function()
  _current_animation_command = { action = "pause" }
end

_internal_resume_animation = function()
  _current_animation_command = { action = "resume" }
end

_internal_stop_animation = function()
  _current_animation_command = { action = "stop" }
end

_internal_set_animation_speed = function(speed)
  _current_animation_command = { action = "set_speed", speed = speed }
end

_internal_set_animation_time = function(time)
  _current_animation_command = { action = "set_time", time = time }
end
`;

    this.lauxlib.luaL_loadstring(this.L, this.to_luastring(simpleCode));
    this.lua.lua_pcall(this.L, 0, 0, 0);
  }

  getAnimationCommand(): {
    action: string;
    clip_name?: string;
    loop?: boolean;
    speed?: number;
    fade?: number;
    time?: number;
  } | null {
    if (!this.L) return null;

    // Get _current_animation_command global
    this.lua.lua_getglobal(this.L, this.to_luastring("_current_animation_command"));

    if (this.lua.lua_isnil(this.L, -1)) {
      this.lua.lua_pop(this.L, 1);
      return null;
    }

    if (!this.lua.lua_istable(this.L, -1)) {
      this.lua.lua_pop(this.L, 1);
      return null;
    }

    // Read table fields
    const command: {
      action: string;
      clip_name?: string;
      loop?: boolean;
      speed?: number;
      fade?: number;
      time?: number;
    } = {
      action: this.getStringField(-1, "action") || "",
    };

    const clipName = this.getStringField(-1, "clip_name");
    if (clipName) command.clip_name = clipName;

    const loop = this.getBooleanField(-1, "loop");
    if (loop !== null) command.loop = loop;

    const speed = this.getNumberField(-1, "speed");
    if (speed !== 0) command.speed = speed;

    const fade = this.getNumberField(-1, "fade");
    if (fade !== 0) command.fade = fade;

    const time = this.getNumberField(-1, "time");
    if (time !== 0) command.time = time;

    this.lua.lua_pop(this.L, 1);

    // Clear the command
    this.lua.lua_pushnil(this.L);
    this.lua.lua_setglobal(this.L, this.to_luastring("_current_animation_command"));

    return command;
  }

  private getStringField(tableIndex: number, fieldName: string): string | null {
    this.lua.lua_getfield(this.L, tableIndex, this.to_luastring(fieldName));
    if (this.lua.lua_isstring(this.L, -1)) {
      const value = this.lua.lua_tojsstring(this.L, -1);
      this.lua.lua_pop(this.L, 1);
      return value;
    }
    this.lua.lua_pop(this.L, 1);
    return null;
  }

  private getBooleanField(tableIndex: number, fieldName: string): boolean | null {
    this.lua.lua_getfield(this.L, tableIndex, this.to_luastring(fieldName));
    if (this.lua.lua_isboolean(this.L, -1)) {
      const value = this.lua.lua_toboolean(this.L, -1);
      this.lua.lua_pop(this.L, 1);
      return value;
    }
    this.lua.lua_pop(this.L, 1);
    return null;
  }

  loadScript(scriptCode: string, scriptId: string): boolean {
    if (!this.L) {
      console.error("LuaVM not initialized");
      return false;
    }

    try {
      // ========================================
      // ENVIRONMENT ISOLATION
      // ========================================
      // Protect global environment by preventing scripts from creating new globals
      // This catches typos and prevents accidental global pollution
      const sandboxSetup = `
-- Create a protected environment that warns on new global creation
local _allowed_globals = {}
local _global_mt = {
  __index = _G,
  __newindex = function(t, key, value)
    if _G[key] == nil then
      error("Attempt to create global variable '" .. tostring(key) .. "'. Use 'local' keyword for variables.", 2)
    end
    rawset(_G, key, value)
  end
}
setmetatable(_allowed_globals, _global_mt)
_ENV = _allowed_globals
`;

      // Load and execute sandbox setup
      const setupResult = this.lauxlib.luaL_loadstring(
        this.L,
        this.to_luastring(sandboxSetup),
      );

      if (setupResult !== this.lua.LUA_OK) {
        const errorMsg = this.lua.lua_tojsstring(this.L, -1);
        this.recordError(`Sandbox setup error: ${errorMsg}`);
        this.lua.lua_pop(this.L, 1);
        return false;
      }

      if (this.lua.lua_pcall(this.L, 0, 0, 0) !== this.lua.LUA_OK) {
        const errorMsg = this.lua.lua_tojsstring(this.L, -1);
        this.recordError(`Sandbox execution error: ${errorMsg}`);
        this.lua.lua_pop(this.L, 1);
        return false;
      }

      // Load user script
      const result = this.lauxlib.luaL_loadstring(
        this.L,
        this.to_luastring(scriptCode),
      );

      if (result !== this.lua.LUA_OK) {
        const errorMsg = this.lua.lua_tojsstring(this.L, -1);
        this.recordError(`Script syntax error: ${errorMsg}`);
        this.lua.lua_pop(this.L, 1);
        return false;
      }

      // Execute the script to define functions
      if (this.lua.lua_pcall(this.L, 0, 0, 0) !== this.lua.LUA_OK) {
        const errorMsg = this.lua.lua_tojsstring(this.L, -1);
        this.recordError(`Script execution error: ${errorMsg}`);
        this.lua.lua_pop(this.L, 1);
        return false;
      }

      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.recordError(`Failed to load script: ${errorMsg}`);
      return false;
    }
  }

  setGameObject(gameObject: GameObject): void {
    if (!this.L) return;

    // Create a Lua table for the game object
    this.lua.lua_newtable(this.L);

    // Set id
    this.lua.lua_pushstring(this.L, this.to_luastring("id"));
    this.lua.lua_pushstring(this.L, this.to_luastring(gameObject.id));
    this.lua.lua_settable(this.L, -3);

    // Set name
    this.lua.lua_pushstring(this.L, this.to_luastring("name"));
    this.lua.lua_pushstring(this.L, this.to_luastring(gameObject.name));
    this.lua.lua_settable(this.L, -3);

    // Set transform
    this.lua.lua_pushstring(this.L, this.to_luastring("transform"));
    this.lua.lua_newtable(this.L);

    // position
    this.lua.lua_pushstring(this.L, this.to_luastring("position"));
    this.pushVector3(gameObject.transform.position);
    this.lua.lua_settable(this.L, -3);

    // rotation
    this.lua.lua_pushstring(this.L, this.to_luastring("rotation"));
    this.pushVector3(gameObject.transform.rotation);
    this.lua.lua_settable(this.L, -3);

    // scale
    this.lua.lua_pushstring(this.L, this.to_luastring("scale"));
    this.pushVector3(gameObject.transform.scale);
    this.lua.lua_settable(this.L, -3);

    this.lua.lua_settable(this.L, -3);

    // Set as global 'gameobject'
    this.lua.lua_setglobal(this.L, this.to_luastring("gameobject"));
  }

  setInputState(keyboardState: { [key: string]: boolean }): void {
    if (!this.L) return;

    // Always create a new Lua table for input (even if empty)
    this.lua.lua_newtable(this.L);

    // Set each key state (including false values)
    // This ensures input table always exists and keys are explicitly false when not pressed
    for (const [key, isPressed] of Object.entries(keyboardState)) {
      this.lua.lua_pushstring(this.L, this.to_luastring(key));
      this.lua.lua_pushboolean(this.L, isPressed);
      this.lua.lua_settable(this.L, -3);
    }

    // Set as global 'input'
    this.lua.lua_setglobal(this.L, this.to_luastring("input"));
  }

  setMouseMovement(movement: { x: number; y: number }): void {
    if (!this.L) return;

    // Create a Lua table for mouse_movement
    this.lua.lua_newtable(this.L);

    this.lua.lua_pushstring(this.L, this.to_luastring("x"));
    this.lua.lua_pushnumber(this.L, movement.x);
    this.lua.lua_settable(this.L, -3);

    this.lua.lua_pushstring(this.L, this.to_luastring("y"));
    this.lua.lua_pushnumber(this.L, movement.y);
    this.lua.lua_settable(this.L, -3);

    // Set as global 'mouse_movement'
    this.lua.lua_setglobal(this.L, this.to_luastring("mouse_movement"));
  }

  setMouseClick(clicked: boolean): void {
    if (!this.L) return;

    // Set as global boolean 'mouse_click'
    this.lua.lua_pushboolean(this.L, clicked);
    this.lua.lua_setglobal(this.L, this.to_luastring("mouse_click"));
  }

  setAllGameObjects(gameObjects: Map<string, GameObjectInstance>): void {
    this.allGameObjects = gameObjects;

    // Also update the Lua global with all game objects for find_gameobject to use
    if (!this.L) return;

    this.lua.lua_newtable(this.L); // Create table for all_gameobjects

    for (const instance of gameObjects.values()) {
      // Use name as key
      this.lua.lua_pushstring(
        this.L,
        this.to_luastring(instance.gameObject.name),
      );

      // Create table for this game object
      this.lua.lua_newtable(this.L);

      // id
      this.lua.lua_pushstring(this.L, this.to_luastring("id"));
      this.lua.lua_pushstring(
        this.L,
        this.to_luastring(instance.gameObject.id),
      );
      this.lua.lua_settable(this.L, -3);

      // name
      this.lua.lua_pushstring(this.L, this.to_luastring("name"));
      this.lua.lua_pushstring(
        this.L,
        this.to_luastring(instance.gameObject.name),
      );
      this.lua.lua_settable(this.L, -3);

      // transform
      this.lua.lua_pushstring(this.L, this.to_luastring("transform"));
      this.lua.lua_newtable(this.L);

      // position
      this.lua.lua_pushstring(this.L, this.to_luastring("position"));
      this.pushVector3(instance.gameObject.transform.position);
      this.lua.lua_settable(this.L, -3);

      // rotation
      this.lua.lua_pushstring(this.L, this.to_luastring("rotation"));
      this.pushVector3(instance.gameObject.transform.rotation);
      this.lua.lua_settable(this.L, -3);

      // scale
      this.lua.lua_pushstring(this.L, this.to_luastring("scale"));
      this.pushVector3(instance.gameObject.transform.scale);
      this.lua.lua_settable(this.L, -3);

      this.lua.lua_settable(this.L, -3); // Set transform in game object table

      this.lua.lua_settable(this.L, -3); // Set game object in all_gameobjects table
    }

    this.lua.lua_setglobal(this.L, this.to_luastring("all_gameobjects"));
  }

  setAnimationState(animationData: {
    clipNames: string[];
    activeClipName: string | null;
    isPlaying: boolean;
    loop: boolean;
    speed: number;
    activeAction: { time: number; getClip: () => { duration: number } } | null;
  } | null): void {
    if (!this.L) return;

    if (!animationData) {
      // No animation data - set animation to nil
      this.lua.lua_pushnil(this.L);
      this.lua.lua_setglobal(this.L, this.to_luastring("animation"));
      return;
    }

    // Create animation table
    this.lua.lua_newtable(this.L);

    // clips array
    this.lua.lua_pushstring(this.L, this.to_luastring("clips"));
    this.lua.lua_newtable(this.L);
    for (let i = 0; i < animationData.clipNames.length; i++) {
      this.lua.lua_pushnumber(this.L, i + 1); // Lua arrays are 1-indexed
      this.lua.lua_pushstring(this.L, this.to_luastring(animationData.clipNames[i]));
      this.lua.lua_settable(this.L, -3);
    }
    this.lua.lua_settable(this.L, -3);

    // current (current clip name or nil)
    this.lua.lua_pushstring(this.L, this.to_luastring("current"));
    if (animationData.activeClipName) {
      this.lua.lua_pushstring(this.L, this.to_luastring(animationData.activeClipName));
    } else {
      this.lua.lua_pushnil(this.L);
    }
    this.lua.lua_settable(this.L, -3);

    // time (current playback time)
    this.lua.lua_pushstring(this.L, this.to_luastring("time"));
    this.lua.lua_pushnumber(this.L, animationData.activeAction?.time || 0);
    this.lua.lua_settable(this.L, -3);

    // duration (duration of current clip)
    this.lua.lua_pushstring(this.L, this.to_luastring("duration"));
    const duration = animationData.activeAction?.getClip().duration || 0;
    this.lua.lua_pushnumber(this.L, duration);
    this.lua.lua_settable(this.L, -3);

    // is_playing
    this.lua.lua_pushstring(this.L, this.to_luastring("is_playing"));
    this.lua.lua_pushboolean(this.L, animationData.isPlaying);
    this.lua.lua_settable(this.L, -3);

    // loop
    this.lua.lua_pushstring(this.L, this.to_luastring("loop"));
    this.lua.lua_pushboolean(this.L, animationData.loop);
    this.lua.lua_settable(this.L, -3);

    // speed
    this.lua.lua_pushstring(this.L, this.to_luastring("speed"));
    this.lua.lua_pushnumber(this.L, animationData.speed);
    this.lua.lua_settable(this.L, -3);

    // Set as global
    this.lua.lua_setglobal(this.L, this.to_luastring("animation"));
  }

  private pushVector3(vec: { x: number; y: number; z: number }): void {
    this.lua.lua_newtable(this.L);

    this.lua.lua_pushstring(this.L, this.to_luastring("x"));
    this.lua.lua_pushnumber(this.L, vec.x);
    this.lua.lua_settable(this.L, -3);

    this.lua.lua_pushstring(this.L, this.to_luastring("y"));
    this.lua.lua_pushnumber(this.L, vec.y);
    this.lua.lua_settable(this.L, -3);

    this.lua.lua_pushstring(this.L, this.to_luastring("z"));
    this.lua.lua_pushnumber(this.L, vec.z);
    this.lua.lua_settable(this.L, -3);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callFunction(functionName: string, ...args: any[]): any {
    if (!this.L) return null;

    // Skip execution if disabled due to errors
    const errorInfo = this.getErrorInfo();
    if (errorInfo.isDisabled) {
      return null;
    }

    // Start timeout tracking
    this.executionStartTime = performance.now();
    this.isExecuting = true;

    try {
      // Get the function from global scope
      this.lua.lua_getglobal(this.L, this.to_luastring(functionName));

      if (!this.lua.lua_isfunction(this.L, -1)) {
        this.lua.lua_pop(this.L, 1);
        return null;
      }

      // Push arguments
      for (const arg of args) {
        if (typeof arg === "number") {
          this.lua.lua_pushnumber(this.L, arg);
        } else if (typeof arg === "string") {
          this.lua.lua_pushstring(this.L, this.to_luastring(arg));
        } else if (typeof arg === "boolean") {
          this.lua.lua_pushboolean(this.L, arg);
        } else {
          this.lua.lua_pushnil(this.L);
        }
      }

      // Call function
      if (this.lua.lua_pcall(this.L, args.length, 1, 0) !== this.lua.LUA_OK) {
        const errorMsg = this.lua.lua_tojsstring(this.L, -1);
        this.recordError(`${functionName}: ${errorMsg}`);
        this.lua.lua_pop(this.L, 1);
        return null;
      }

      // Get return value
      let result = null;
      if (this.lua.lua_isnumber(this.L, -1)) {
        result = this.lua.lua_tonumber(this.L, -1);
      } else if (this.lua.lua_isstring(this.L, -1)) {
        result = this.lua.lua_tojsstring(this.L, -1);
      } else if (this.lua.lua_isboolean(this.L, -1)) {
        result = this.lua.lua_toboolean(this.L, -1);
      }

      this.lua.lua_pop(this.L, 1);
      return result;
    } finally {
      // Stop timeout tracking
      this.isExecuting = false;
    }
  }

  /**
   * Read back transform values from Lua gameobject table
   */
  getGameObjectTransform(): {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  } | null {
    if (!this.L) return null;

    this.lua.lua_getglobal(this.L, this.to_luastring("gameobject"));

    if (!this.lua.lua_istable(this.L, -1)) {
      this.lua.lua_pop(this.L, 1);
      return null;
    }

    this.lua.lua_getfield(this.L, -1, this.to_luastring("transform"));

    if (!this.lua.lua_istable(this.L, -1)) {
      this.lua.lua_pop(this.L, 2);
      return null;
    }

    const transform = {
      position: this.getVector3Field(-1, "position"),
      rotation: this.getVector3Field(-1, "rotation"),
      scale: this.getVector3Field(-1, "scale"),
    };

    this.lua.lua_pop(this.L, 2);

    return transform;
  }

  private getVector3Field(
    tableIndex: number,
    fieldName: string,
  ): { x: number; y: number; z: number } {
    this.lua.lua_getfield(this.L, tableIndex, this.to_luastring(fieldName));

    const vec = {
      x: this.getNumberField(-1, "x"),
      y: this.getNumberField(-1, "y"),
      z: this.getNumberField(-1, "z"),
    };

    this.lua.lua_pop(this.L, 1);
    return vec;
  }

  private getNumberField(tableIndex: number, fieldName: string): number {
    this.lua.lua_getfield(this.L, tableIndex, this.to_luastring(fieldName));
    const value = this.lua.lua_tonumber(this.L, -1);
    this.lua.lua_pop(this.L, 1);
    return value || 0;
  }

  onStart(): void {
    this.callFunction("on_start");
  }

  onUpdate(deltaTime: number): void {
    this.callFunction("on_update", deltaTime);
  }

  onCollision(otherObject: GameObject): void {
    this.callCollisionCallback("on_collision", otherObject);
  }

  onTriggerEnter(otherObject: GameObject): void {
    this.callCollisionCallback("on_trigger_enter", otherObject);
  }

  onTriggerExit(otherObject: GameObject): void {
    this.callCollisionCallback("on_trigger_exit", otherObject);
  }

  onAnimationComplete(clipName: string): void {
    if (!this.L) return;

    this.lua.lua_getglobal(this.L, this.to_luastring("on_animation_complete"));

    if (!this.lua.lua_isfunction(this.L, -1)) {
      this.lua.lua_pop(this.L, 1);
      return;
    }

    // Push clip name as argument
    this.lua.lua_pushstring(this.L, this.to_luastring(clipName));

    // Call function with 1 argument
    if (this.lua.lua_pcall(this.L, 1, 0, 0) !== this.lua.LUA_OK) {
      const errorMsg = this.lua.lua_tojsstring(this.L, -1);
      console.error(`Lua on_animation_complete error:`, errorMsg);
      this.lua.lua_pop(this.L, 1);
    }
  }

  private callCollisionCallback(
    funcName: string,
    otherObject: GameObject,
  ): void {
    if (!this.L) return;

    this.lua.lua_getglobal(this.L, this.to_luastring(funcName));

    if (!this.lua.lua_isfunction(this.L, -1)) {
      this.lua.lua_pop(this.L, 1);
      return;
    }

    // Push other object as table
    this.pushGameObjectTable(otherObject);

    if (this.lua.lua_pcall(this.L, 1, 0, 0) !== this.lua.LUA_OK) {
      const errorMsg = this.lua.lua_tojsstring(this.L, -1);
      console.error(`Lua ${funcName} error:`, errorMsg);
      this.lua.lua_pop(this.L, 1);
    }
  }

  private pushGameObjectTable(gameObject: GameObject): void {
    this.lua.lua_newtable(this.L);

    // id
    this.lua.lua_pushstring(this.L, this.to_luastring("id"));
    this.lua.lua_pushstring(this.L, this.to_luastring(gameObject.id));
    this.lua.lua_settable(this.L, -3);

    // name
    this.lua.lua_pushstring(this.L, this.to_luastring("name"));
    this.lua.lua_pushstring(this.L, this.to_luastring(gameObject.name));
    this.lua.lua_settable(this.L, -3);

    // transform
    this.lua.lua_pushstring(this.L, this.to_luastring("transform"));
    this.lua.lua_newtable(this.L);

    // transform.position
    this.lua.lua_pushstring(this.L, this.to_luastring("position"));
    this.lua.lua_newtable(this.L);
    this.lua.lua_pushstring(this.L, this.to_luastring("x"));
    this.lua.lua_pushnumber(this.L, gameObject.transform.position.x);
    this.lua.lua_settable(this.L, -3);
    this.lua.lua_pushstring(this.L, this.to_luastring("y"));
    this.lua.lua_pushnumber(this.L, gameObject.transform.position.y);
    this.lua.lua_settable(this.L, -3);
    this.lua.lua_pushstring(this.L, this.to_luastring("z"));
    this.lua.lua_pushnumber(this.L, gameObject.transform.position.z);
    this.lua.lua_settable(this.L, -3);
    this.lua.lua_settable(this.L, -3);

    // Set transform table
    this.lua.lua_settable(this.L, -3);
  }

  destroy(): void {
    if (this.L) {
      this.lua.lua_close(this.L);
      this.L = null;
    }
  }

  /**
   * Get error information for display to user
   */
  getErrorInfo(): {
    hasError: boolean;
    lastError: string | null;
    errorCount: number;
    isDisabled: boolean;
  } {
    return {
      hasError: this.lastError !== null || this.hasTimedOut,
      lastError: this.lastError,
      errorCount: this.errorCount,
      isDisabled: this.errorCount >= this.MAX_ERRORS_BEFORE_DISABLE || this.hasTimedOut,
    };
  }

  /**
   * Clear error state (e.g., after user fixes script)
   */
  clearErrors(): void {
    this.lastError = null;
    this.errorCount = 0;
    this.hasTimedOut = false;
  }

  private recordError(error: string): void {
    this.lastError = error;
    this.errorCount++;
    console.error(`[LuaVM Error #${this.errorCount}]`, error);

    if (this.errorCount >= this.MAX_ERRORS_BEFORE_DISABLE) {
      console.error(
        `Script disabled after ${this.MAX_ERRORS_BEFORE_DISABLE} errors`,
      );
    }
  }
}
