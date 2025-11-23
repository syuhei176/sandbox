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

  constructor() {
    if (typeof window === "undefined") {
      throw new Error("LuaVM can only be used in browser environment");
    }
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
    this.lualib.luaL_openlibs(this.L);

    // Register find_gameobject function
    // We use a simple Lua function that accesses the all_gameobjects global table
    // which is updated each frame with the latest GameObject positions
    this.registerStubFindGameObject();
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

  loadScript(scriptCode: string, scriptId: string): boolean {
    if (!this.L) {
      console.error("LuaVM not initialized");
      return false;
    }

    try {
      const result = this.lauxlib.luaL_loadstring(
        this.L,
        this.to_luastring(scriptCode),
      );

      if (result !== this.lua.LUA_OK) {
        const errorMsg = this.lua.lua_tojsstring(this.L, -1);
        console.error(`Lua script load error [${scriptId}]:`, errorMsg);
        this.lua.lua_pop(this.L, 1);
        return false;
      }

      // Execute the script to define functions
      if (this.lua.lua_pcall(this.L, 0, 0, 0) !== this.lua.LUA_OK) {
        const errorMsg = this.lua.lua_tojsstring(this.L, -1);
        console.error(`Lua script execution error [${scriptId}]:`, errorMsg);
        this.lua.lua_pop(this.L, 1);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Failed to load Lua script [${scriptId}]:`, error);
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

    // Create a Lua table for input
    this.lua.lua_newtable(this.L);

    // Set each key state
    for (const [key, isPressed] of Object.entries(keyboardState)) {
      this.lua.lua_pushstring(this.L, this.to_luastring(key));
      this.lua.lua_pushboolean(this.L, isPressed);
      this.lua.lua_settable(this.L, -3);
    }

    // Set as global 'input'
    this.lua.lua_setglobal(this.L, this.to_luastring("input"));
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
      console.error(`Lua function call error [${functionName}]:`, errorMsg);
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

  destroy(): void {
    if (this.L) {
      this.lua.lua_close(this.L);
      this.L = null;
    }
  }
}
