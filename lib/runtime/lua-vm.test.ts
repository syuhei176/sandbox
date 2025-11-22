import { describe, it, expect, beforeEach, vi } from "vitest";
import { LuaVM } from "./lua-vm";
import { createTestGameObject } from "@/test/test-utils";

// Mock fengari-web module
vi.mock("fengari-web", () => ({
  lua: {
    lua_newtable: vi.fn(),
    lua_pushstring: vi.fn(),
    lua_pushnumber: vi.fn(),
    lua_settable: vi.fn(),
    lua_setglobal: vi.fn(),
    lua_getglobal: vi.fn(() => 1), // LUA_TFUNCTION
    lua_pcall: vi.fn(() => 0), // LUA_OK
    lua_pop: vi.fn(),
    lua_gettop: vi.fn(() => 0),
    lua_isnil: vi.fn(() => false),
    lua_isfunction: vi.fn(() => true),
    lua_tonumber: vi.fn(() => 42),
    lua_toboolean: vi.fn(() => true),
    lua_tostring: vi.fn(() => "test"),
    lua_tojsstring: vi.fn((L: unknown, idx: number) => "test string"),
    lua_type: vi.fn(() => 3), // LUA_TNUMBER
  },
  lauxlib: {
    luaL_newstate: vi.fn(() => ({})),
    luaL_loadstring: vi.fn(() => 0),
  },
  lualib: {
    luaL_openlibs: vi.fn(),
  },
  to_luastring: vi.fn((str: string) => str),
  to_jsstring: vi.fn((str: string) => str),
}));

describe("LuaVM", () => {
  let vm: LuaVM;

  beforeEach(async () => {
    vm = new LuaVM();
    await vm.initialize();
  });

  describe("initialization", () => {
    it("should create a LuaVM instance", () => {
      expect(vm).toBeInstanceOf(LuaVM);
    });

    it("should initialize successfully", async () => {
      const newVm = new LuaVM();
      await expect(newVm.initialize()).resolves.not.toThrow();
    });

    it("should throw error when used in non-browser environment", () => {
      // Temporarily remove window
      const windowBackup = global.window;
      // @ts-expect-error - testing undefined window
      delete global.window;

      expect(() => new LuaVM()).toThrow("browser environment");

      // Restore window
      global.window = windowBackup;
    });
  });

  describe("loadScript", () => {
    it("should load a valid Lua script", () => {
      const script = `
function on_start()
  print("Hello")
end
      `.trim();

      expect(() => vm.loadScript("test-script", script)).not.toThrow();
    });

    it("should handle empty script", () => {
      expect(() => vm.loadScript("empty", "")).not.toThrow();
    });

    it("should handle script with syntax errors gracefully", () => {
      const invalidScript = "this is not valid lua {{{{";

      // Should not crash (may log error internally)
      expect(() => vm.loadScript("invalid", invalidScript)).not.toThrow();
    });
  });

  describe("setGameObject", () => {
    it("should set GameObject in Lua global scope", () => {
      const obj = createTestGameObject();

      expect(() => vm.setGameObject(obj)).not.toThrow();
    });

    it("should handle GameObject with all transform properties", () => {
      const obj = createTestGameObject({
        transform: {
          position: { x: 1, y: 2, z: 3 },
          rotation: { x: 0, y: 45, z: 0 },
          scale: { x: 2, y: 2, z: 2 },
        },
      });

      expect(() => vm.setGameObject(obj)).not.toThrow();
    });
  });

  describe("callFunction", () => {
    it("should call a Lua function", () => {
      const script = `
function test_func()
  return 42
end
      `.trim();

      vm.loadScript("test", script);

      expect(() => vm.callFunction("test_func")).not.toThrow();
    });

    it("should call function with arguments", () => {
      const script = `
function add(a, b)
  return a + b
end
      `.trim();

      vm.loadScript("test", script);

      expect(() => vm.callFunction("add", 5, 3)).not.toThrow();
    });

    it("should handle non-existent function gracefully", () => {
      expect(() => vm.callFunction("non_existent")).not.toThrow();
    });
  });

  describe("update lifecycle", () => {
    it("should call on_start", () => {
      const script = `
function on_start()
  print("Started")
end
      `.trim();

      vm.loadScript("lifecycle", script);

      expect(() => vm.callFunction("on_start")).not.toThrow();
    });

    it("should call on_update with deltaTime", () => {
      const script = `
function on_update(dt)
  print("Update: " .. dt)
end
      `.trim();

      vm.loadScript("lifecycle", script);

      expect(() => vm.callFunction("on_update", 0.016)).not.toThrow();
    });
  });

  describe("GameObject integration", () => {
    it("should make gameobject accessible in Lua", () => {
      const obj = createTestGameObject({
        id: "test-obj",
        name: "Test Object",
      });

      const script = `
function on_start()
  if gameobject then
    print(gameobject.id)
    print(gameobject.name)
  end
end
      `.trim();

      vm.setGameObject(obj);
      vm.loadScript("test", script);

      expect(() => vm.callFunction("on_start")).not.toThrow();
    });

    it("should allow modifying transform in Lua", () => {
      const obj = createTestGameObject();

      const script = `
function on_update(dt)
  if gameobject then
    gameobject.transform.position.y = gameobject.transform.position.y + dt
    gameobject.transform.rotation.y = gameobject.transform.rotation.y + dt
  end
end
      `.trim();

      vm.setGameObject(obj);
      vm.loadScript("test", script);

      expect(() => vm.callFunction("on_update", 0.016)).not.toThrow();
    });
  });
});
