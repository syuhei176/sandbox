import type { GameObject } from '../types/gamespec';

export class LuaVM {
  private fengari: any;
  private lua: any;
  private lauxlib: any;
  private lualib: any;
  private L: any;

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('LuaVM can only be used in browser environment');
    }
  }

  async initialize(): Promise<void> {
    // Dynamically import fengari-web
    const fengari = await import('fengari-web');
    this.fengari = fengari;
    this.lua = fengari.lua;
    this.lauxlib = fengari.lauxlib;
    this.lualib = fengari.lualib;

    // Create new Lua state
    this.L = this.lauxlib.luaL_newstate();
    this.lualib.luaL_openlibs(this.L);
  }

  loadScript(scriptCode: string, scriptId: string): boolean {
    if (!this.L) {
      console.error('LuaVM not initialized');
      return false;
    }

    try {
      const result = this.lauxlib.luaL_loadstring(
        this.L,
        this.lua.to_luastring(scriptCode)
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
    this.lua.lua_pushstring(this.L, this.lua.to_luastring('id'));
    this.lua.lua_pushstring(this.L, this.lua.to_luastring(gameObject.id));
    this.lua.lua_settable(this.L, -3);

    // Set name
    this.lua.lua_pushstring(this.L, this.lua.to_luastring('name'));
    this.lua.lua_pushstring(this.L, this.lua.to_luastring(gameObject.name));
    this.lua.lua_settable(this.L, -3);

    // Set transform
    this.lua.lua_pushstring(this.L, this.lua.to_luastring('transform'));
    this.lua.lua_newtable(this.L);

    // position
    this.lua.lua_pushstring(this.L, this.lua.to_luastring('position'));
    this.pushVector3(gameObject.transform.position);
    this.lua.lua_settable(this.L, -3);

    // rotation
    this.lua.lua_pushstring(this.L, this.lua.to_luastring('rotation'));
    this.pushVector3(gameObject.transform.rotation);
    this.lua.lua_settable(this.L, -3);

    // scale
    this.lua.lua_pushstring(this.L, this.lua.to_luastring('scale'));
    this.pushVector3(gameObject.transform.scale);
    this.lua.lua_settable(this.L, -3);

    this.lua.lua_settable(this.L, -3);

    // Set as global 'gameobject'
    this.lua.lua_setglobal(this.L, this.lua.to_luastring('gameobject'));
  }

  private pushVector3(vec: { x: number; y: number; z: number }): void {
    this.lua.lua_newtable(this.L);

    this.lua.lua_pushstring(this.L, this.lua.to_luastring('x'));
    this.lua.lua_pushnumber(this.L, vec.x);
    this.lua.lua_settable(this.L, -3);

    this.lua.lua_pushstring(this.L, this.lua.to_luastring('y'));
    this.lua.lua_pushnumber(this.L, vec.y);
    this.lua.lua_settable(this.L, -3);

    this.lua.lua_pushstring(this.L, this.lua.to_luastring('z'));
    this.lua.lua_pushnumber(this.L, vec.z);
    this.lua.lua_settable(this.L, -3);
  }

  callFunction(functionName: string, ...args: any[]): any {
    if (!this.L) return null;

    // Get the function from global scope
    this.lua.lua_getglobal(this.L, this.lua.to_luastring(functionName));

    if (!this.lua.lua_isfunction(this.L, -1)) {
      this.lua.lua_pop(this.L, 1);
      return null;
    }

    // Push arguments
    for (const arg of args) {
      if (typeof arg === 'number') {
        this.lua.lua_pushnumber(this.L, arg);
      } else if (typeof arg === 'string') {
        this.lua.lua_pushstring(this.L, this.lua.to_luastring(arg));
      } else if (typeof arg === 'boolean') {
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

  onStart(): void {
    this.callFunction('on_start');
  }

  onUpdate(deltaTime: number): void {
    this.callFunction('on_update', deltaTime);
  }

  destroy(): void {
    if (this.L) {
      this.lua.lua_close(this.L);
      this.L = null;
    }
  }
}
