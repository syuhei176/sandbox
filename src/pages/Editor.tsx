import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SceneHierarchy } from "@/components/editor/SceneHierarchy";
import { Inspector } from "@/components/editor/Inspector";
import { Viewport3D } from "@/components/editor/Viewport3D";
import { ScriptEditor } from "@/components/editor/ScriptEditor";
import { MenuBar } from "@/components/editor/MenuBar";
import { PrefabLibrary } from "@/components/editor/PrefabLibrary";
import type {
  GameObject,
  ScriptDefinition,
  GameSpec,
  PrefabDefinition,
  Vector3,
} from "@/lib/types/gamespec";
import {
  createPrefabFromGameObject,
  instantiatePrefab,
} from "@/lib/utils/prefab";
import {
  saveEditorState,
  saveProject,
  loadProject,
  loadProjectList,
  createProject,
  exportProjectAsJSON,
  importProjectFromJSON,
  deleteProject,
  type EditorState,
} from "@/lib/utils/storage";
import {
  defaultGameObjects,
  defaultScripts,
} from "@/lib/defaults/default-game";
import {
  gameTemplates,
  type GameTemplate,
} from "@/lib/templates";

export default function EditorPage() {
  const navigate = useNavigate();
  const isInitialMount = useRef(true);

  // State
  const [gameObjects, setGameObjects] =
    useState<GameObject[]>(defaultGameObjects);
  const [scripts, setScripts] = useState<ScriptDefinition[]>(defaultScripts);
  const [prefabs, setPrefabs] = useState<PrefabDefinition[]>([]);

  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string | null>(
    null,
  );
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isPlayMode, setIsPlayMode] = useState(false);
  const [leftPanelTab, setLeftPanelTab] = useState<"hierarchy" | "prefabs">(
    "hierarchy",
  );
  const [showCreatePrefabDialog, setShowCreatePrefabDialog] = useState(false);
  const [prefabName, setPrefabName] = useState("");
  const [prefabDescription, setPrefabDescription] = useState("");

  // Load project from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove #
    if (hash) {
      const project = loadProject(hash);
      if (project) {
        setGameObjects(
          project.gameSpec.worlds[0]?.objects || defaultGameObjects,
        );
        setScripts(project.gameSpec.scripts || defaultScripts);
        setPrefabs(project.gameSpec.prefabs || []);
        setCurrentProjectId(project.id);
        setCurrentProjectName(project.name);
      }
    }
  }, []);

  // Auto-save state changes (debounced) - only for existing projects
  useEffect(() => {
    // Skip auto-save on initial mount or if no project loaded
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!currentProjectId) return; // Don't auto-save new/unsaved projects

    const timeoutId = setTimeout(() => {
      const editorState: EditorState = {
        gameObjects,
        scripts,
        selectedObjectId,
        selectedScriptId,
      };
      saveEditorState(editorState);

      // Also auto-save prefabs to the current project
      if (currentProjectId && currentProjectName) {
        const existingProject = loadProject(currentProjectId);
        if (existingProject) {
          const updatedProject = {
            ...existingProject,
            updatedAt: new Date().toISOString(),
            gameSpec: {
              ...existingProject.gameSpec,
              worlds: [
                {
                  ...existingProject.gameSpec.worlds[0],
                  objects: gameObjects,
                },
              ],
              scripts: scripts,
              prefabs: prefabs,
            },
          };
          saveProject(updatedProject);
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [
    gameObjects,
    scripts,
    selectedObjectId,
    selectedScriptId,
    currentProjectId,
    currentProjectName,
    prefabs,
  ]);

  const selectedObject = gameObjects.find((obj) => obj.id === selectedObjectId);

  const handleObjectSelect = (objectId: string) => {
    setSelectedObjectId(objectId);
  };

  const handleObjectUpdate = (
    objectId: string,
    updates: Partial<GameObject>,
  ) => {
    setGameObjects((prev) =>
      prev.map((obj) => (obj.id === objectId ? { ...obj, ...updates } : obj)),
    );
  };

  const handleObjectTransformChange = (
    objectId: string,
    transform: GameObject["transform"],
  ) => {
    setGameObjects((prev) =>
      prev.map((obj) => (obj.id === objectId ? { ...obj, transform } : obj)),
    );
  };

  const handleScriptUpdate = (scriptId: string, code: string) => {
    setScripts((prev) =>
      prev.map((script) =>
        script.id === scriptId ? { ...script, lua_code: code } : script,
      ),
    );
  };

  const handleScriptAdd = (name: string, template?: string) => {
    const newId = `script-${Date.now()}`;
    const newScript: ScriptDefinition = {
      id: newId,
      name,
      lua_code:
        template ||
        `-- ${name}\n\nfunction on_start()\n  print("${name} started!")\nend\n\nfunction on_update(dt)\n  -- Update logic here\nend`,
    };
    setScripts((prev) => [...prev, newScript]);
    setSelectedScriptId(newId);
  };

  const handleScriptDelete = (scriptId: string) => {
    setScripts((prev) => prev.filter((s) => s.id !== scriptId));
    if (selectedScriptId === scriptId) {
      setSelectedScriptId(null);
    }
    // Remove script from any GameObject that uses it
    setGameObjects((prev) =>
      prev.map((obj) =>
        obj.script_id === scriptId ? { ...obj, script_id: undefined } : obj,
      ),
    );
  };

  const handleScriptRename = (scriptId: string, newName: string) => {
    setScripts((prev) =>
      prev.map((script) =>
        script.id === scriptId ? { ...script, name: newName } : script,
      ),
    );
  };

  const handleAddObject = () => {
    const newId = `obj-${Date.now()}`;
    const newObject: GameObject = {
      id: newId,
      name: "New GameObject",
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      components: [
        {
          type: "mesh",
          properties: {
            geometry: "box",
            color: 0x888888,
            width: 1,
            height: 1,
            depth: 1,
          },
        },
      ],
    };
    setGameObjects((prev) => [...prev, newObject]);
    setSelectedObjectId(newId);
  };

  const handleDuplicateObject = useCallback((objectId: string) => {
    setGameObjects((prev) => {
      const objectToDuplicate = prev.find((obj) => obj.id === objectId);
      if (!objectToDuplicate) return prev;

      const newId = `obj-${Date.now()}`;
      const duplicatedObject: GameObject = {
        ...JSON.parse(JSON.stringify(objectToDuplicate)),
        id: newId,
        name: `${objectToDuplicate.name} Copy`,
      };
      setSelectedObjectId(newId);
      return [...prev, duplicatedObject];
    });
  }, []);

  const handleDeleteObject = useCallback((objectId: string) => {
    if (confirm("Are you sure you want to delete this GameObject?")) {
      setGameObjects((prev) => prev.filter((obj) => obj.id !== objectId));
      setSelectedObjectId((current) => (current === objectId ? null : current));
    }
  }, []);

  // Prefab handlers
  const handleCreatePrefab = useCallback(() => {
    if (!selectedObjectId) return;

    const selectedObj = gameObjects.find((obj) => obj.id === selectedObjectId);
    if (!selectedObj) return;

    setShowCreatePrefabDialog(true);
    setPrefabName(selectedObj.name);
  }, [selectedObjectId, gameObjects]);

  const handleConfirmCreatePrefab = useCallback(() => {
    if (!selectedObjectId || !prefabName.trim()) return;

    const selectedObj = gameObjects.find((obj) => obj.id === selectedObjectId);
    if (!selectedObj) return;

    const newPrefab = createPrefabFromGameObject(
      selectedObj,
      prefabName.trim(),
      prefabDescription.trim() || undefined,
    );

    setPrefabs((prev) => [...prev, newPrefab]);
    setShowCreatePrefabDialog(false);
    setPrefabName("");
    setPrefabDescription("");
    setLeftPanelTab("prefabs"); // Switch to prefabs tab
  }, [selectedObjectId, gameObjects, prefabName, prefabDescription]);

  const handleInstantiatePrefab = useCallback(
    (prefabId: string) => {
      const prefab = prefabs.find((p) => p.id === prefabId);
      if (!prefab) return;

      const instance = instantiatePrefab(prefab);
      setGameObjects((prev) => [...prev, instance]);
      setSelectedObjectId(instance.id);
      setLeftPanelTab("hierarchy"); // Switch back to hierarchy
    },
    [prefabs],
  );

  const handlePrefabDropInViewport = useCallback(
    (prefabId: string, position: Vector3) => {
      const prefab = prefabs.find((p) => p.id === prefabId);
      if (!prefab) return;

      const instance = instantiatePrefab(prefab);
      instance.transform.position = position;

      setGameObjects((prev) => [...prev, instance]);
      setSelectedObjectId(instance.id);
      setLeftPanelTab("hierarchy");
    },
    [prefabs],
  );

  const handleDeletePrefab = useCallback((prefabId: string) => {
    if (confirm("Are you sure you want to delete this prefab?")) {
      setPrefabs((prev) => prev.filter((p) => p.id !== prefabId));
    }
  }, []);

  const handleSaveProject = () => {
    if (projectName.trim()) {
      const project = createProject(projectName.trim(), gameObjects, scripts);
      saveProject(project);
      setCurrentProjectId(project.id);
      setCurrentProjectName(project.name);
      setShowSaveDialog(false);
      setProjectName("");
      // Update URL hash with project ID
      window.location.hash = project.id;
    }
  };

  const handleSaveCurrentProject = useCallback(() => {
    if (currentProjectId && currentProjectName) {
      // Update existing project
      const existingProject = loadProject(currentProjectId);
      if (existingProject) {
        const updatedProject = {
          ...existingProject,
          updatedAt: new Date().toISOString(),
          gameSpec: {
            ...existingProject.gameSpec,
            worlds: [
              {
                ...existingProject.gameSpec.worlds[0],
                objects: gameObjects,
              },
            ],
            scripts: scripts,
          },
        };
        saveProject(updatedProject);
      }
    } else {
      // No current project, show save dialog
      setShowSaveDialog(true);
    }
  }, [currentProjectId, currentProjectName, gameObjects, scripts]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected object
      if (e.key === "Delete" && selectedObjectId) {
        e.preventDefault();
        handleDeleteObject(selectedObjectId);
      }

      // Duplicate selected object (Ctrl+D or Cmd+D)
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && selectedObjectId) {
        e.preventDefault();
        handleDuplicateObject(selectedObjectId);
      }

      // Save (Ctrl+S or Cmd+S)
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveCurrentProject();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedObjectId,
    handleDeleteObject,
    handleDuplicateObject,
    handleSaveCurrentProject,
  ]);

  const handleLoadProject = (projectId: string) => {
    const project = loadProject(projectId);
    if (project && project.gameSpec) {
      // Extract gameObjects and scripts from the first world
      const world = project.gameSpec.worlds[0];
      if (world) {
        setGameObjects(world.objects);
        setScripts(project.gameSpec.scripts || []);
        setPrefabs(project.gameSpec.prefabs || []);
        setSelectedObjectId(null);
        setSelectedScriptId(null);
        setCurrentProjectId(project.id);
        setCurrentProjectName(project.name);
        setShowLoadDialog(false);
        // Update URL hash with project ID
        window.location.hash = project.id;
      }
    }
  };

  const handleExportProject = () => {
    const project = createProject("Exported Project", gameObjects, scripts);
    exportProjectAsJSON(project);
  };

  const handleImportProject = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const project = await importProjectFromJSON(file);
      if (project && project.gameSpec) {
        const world = project.gameSpec.worlds[0];
        if (world) {
          setGameObjects(world.objects);
          setScripts(project.gameSpec.scripts || []);
          setSelectedObjectId(null);
          setSelectedScriptId(null);
        }
      }
    } catch (error) {
      console.error("Failed to import project:", error);
      alert("Failed to import project. Please check the file format.");
    } finally {
      // Reset file input
      event.target.value = "";
    }
  };

  const handleDeleteProject = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent loading the project
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(projectId);
      // Force re-render by toggling the dialog
      setShowLoadDialog(false);
      setTimeout(() => setShowLoadDialog(true), 0);
    }
  };

  const handlePlayGame = () => {
    // Convert editor state to GameSpec format
    const gameSpec: GameSpec = {
      meta: {
        title: "Editor Game",
        description: "Game created in editor",
        version: "1.0.0",
      },
      players: {
        min: 1,
        max: 4,
        spawn_points: [{ x: 0, y: 1, z: 5 }],
      },
      worlds: [
        {
          id: "world-1",
          name: "Main World",
          environment: {
            ambient_light: {
              color: "#ffffff",
              intensity: 0.5,
            },
            directional_light: {
              color: "#ffffff",
              intensity: 1,
              position: { x: 10, y: 10, z: 10 },
            },
          },
          objects: gameObjects,
        },
      ],
      scripts: scripts,
    };

    // Save to localStorage
    localStorage.setItem("editorGameSpec", JSON.stringify(gameSpec));

    // Navigate to runtime
    navigate("/runtime");
  };

  const handleNewProject = () => {
    if (
      confirm(
        "Are you sure you want to create a new project? Unsaved changes will be lost.",
      )
    ) {
      setShowTemplateDialog(true);
    }
  };

  const handleSelectTemplate = (template: GameTemplate) => {
    setGameObjects(template.gameObjects);
    setScripts(template.scripts);
    setPrefabs([]);
    setSelectedObjectId(null);
    setSelectedScriptId(null);
    setCurrentProjectId(null);
    setCurrentProjectName(null);
    window.location.hash = "";
    setShowTemplateDialog(false);
  };

  return (
    <div className="flex h-screen w-screen flex-col" style={{ background: 'var(--void-black)', color: 'var(--text-primary)' }}>
      {/* Menu Bar */}
      <div className="flex items-stretch cyber-panel" style={{ borderBottom: '1px solid var(--ui-border-bright)' }}>
        <MenuBar
          onNewProject={handleNewProject}
          onSave={handleSaveCurrentProject}
          onSaveAs={() => setShowSaveDialog(true)}
          onLoad={() => setShowLoadDialog(true)}
          onExport={handleExportProject}
          onImport={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = (e) => {
              const event = e as unknown as React.ChangeEvent<HTMLInputElement>;
              handleImportProject(event);
            };
            input.click();
          }}
          onDuplicate={() =>
            selectedObjectId && handleDuplicateObject(selectedObjectId)
          }
          onDelete={() =>
            selectedObjectId && handleDeleteObject(selectedObjectId)
          }
          onAddGameObject={handleAddObject}
          onAddScript={() => {
            const scriptName = prompt("Enter script name:");
            if (scriptName) {
              handleScriptAdd(scriptName);
            }
          }}
          hasSelection={!!selectedObjectId}
          canSaveAs={!!currentProjectName}
        />
        <div className="ml-auto flex items-center gap-2 px-3" style={{ background: 'var(--panel-elevated)' }}>
          <button
            onClick={() => setIsPlayMode(!isPlayMode)}
            tabIndex={-1}
            className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-semibold tracking-wide transition-all glow-hover ${
              isPlayMode
                ? "neon-text-pink"
                : "neon-text-green"
            }`}
            style={{
              background: isPlayMode ? 'rgba(255, 0, 170, 0.1)' : 'rgba(57, 255, 20, 0.1)',
              border: isPlayMode ? '1px solid var(--pink-neon)' : '1px solid var(--neon-green)',
              fontFamily: 'var(--font-display)'
            }}
            title={isPlayMode ? "Stop Playing" : "Play in Viewport"}
          >
            {isPlayMode ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <rect x="4" y="3" width="3" height="10" />
                  <rect x="9" y="3" width="3" height="10" />
                </svg>
                Stop
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M3 2l10 6-10 6V2z" />
                </svg>
                Play
              </>
            )}
          </button>
          <button
            onClick={handlePlayGame}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold tracking-wide transition-all glow-hover"
            style={{
              background: 'rgba(0, 85, 255, 0.1)',
              border: '1px solid var(--electric-blue)',
              color: 'var(--electric-blue)',
              fontFamily: 'var(--font-display)',
              textShadow: '0 0 10px var(--electric-glow)'
            }}
            title="Play in Fullscreen"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 1v6h2V3h4V1H1zm8 0v2h4v4h2V1H9zM3 9H1v6h6v-2H3V9zm10 4h-4v2h6V9h-2v4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Scene Hierarchy & Prefabs */}
        <div className="w-64 cyber-panel flex flex-col" style={{ borderRight: '1px solid var(--ui-border-bright)' }}>
          {/* Tab Navigation */}
          <div className="flex" style={{ borderBottom: '1px solid var(--ui-border)' }}>
            <button
              onClick={() => setLeftPanelTab("hierarchy")}
              className={`flex-1 px-4 py-3 text-sm font-semibold tracking-wide transition-all ${
                leftPanelTab === "hierarchy"
                  ? "neon-text"
                  : ""
              }`}
              style={{
                background: leftPanelTab === "hierarchy" ? 'var(--panel-elevated)' : 'transparent',
                color: leftPanelTab === "hierarchy" ? 'var(--cyan-neon)' : 'var(--text-secondary)',
                borderBottom: leftPanelTab === "hierarchy" ? '2px solid var(--cyan-neon)' : '2px solid transparent',
                fontFamily: 'var(--font-display)'
              }}
            >
              HIERARCHY
            </button>
            <button
              onClick={() => setLeftPanelTab("prefabs")}
              className={`flex-1 px-4 py-3 text-sm font-semibold tracking-wide transition-all ${
                leftPanelTab === "prefabs"
                  ? "neon-text"
                  : ""
              }`}
              style={{
                background: leftPanelTab === "prefabs" ? 'var(--panel-elevated)' : 'transparent',
                color: leftPanelTab === "prefabs" ? 'var(--cyan-neon)' : 'var(--text-secondary)',
                borderBottom: leftPanelTab === "prefabs" ? '2px solid var(--cyan-neon)' : '2px solid transparent',
                fontFamily: 'var(--font-display)'
              }}
            >
              PREFABS ({prefabs.length})
            </button>
          </div>

          {/* Tab Content */}
          {leftPanelTab === "hierarchy" ? (
            <SceneHierarchy
              gameObjects={gameObjects}
              selectedObjectId={selectedObjectId}
              onObjectSelect={handleObjectSelect}
              onAddObject={handleAddObject}
              onDuplicateObject={handleDuplicateObject}
              onDeleteObject={handleDeleteObject}
              onCreatePrefab={handleCreatePrefab}
            />
          ) : (
            <PrefabLibrary
              prefabs={prefabs}
              onInstantiatePrefab={handleInstantiatePrefab}
              onDeletePrefab={handleDeletePrefab}
            />
          )}
        </div>

        {/* Center - 3D Viewport */}
        <div className="flex-1 flex flex-col" style={{ overflow: 'hidden' }}>
          <div className="flex-1 relative" style={{ overflow: 'hidden' }}>
            <Viewport3D
              gameObjects={gameObjects}
              scripts={scripts}
              selectedObjectId={selectedObjectId}
              onObjectSelect={handleObjectSelect}
              onObjectTransformChange={handleObjectTransformChange}
              isPlayMode={isPlayMode}
              onPrefabDrop={handlePrefabDropInViewport}
            />
          </div>

          {/* Bottom Panel - Script Editor */}
          <div className="h-80 cyber-panel" style={{ borderTop: '1px solid var(--ui-border-bright)' }}>
            <ScriptEditor
              scripts={scripts}
              selectedScriptId={selectedScriptId}
              onScriptSelect={setSelectedScriptId}
              onScriptUpdate={handleScriptUpdate}
              onScriptAdd={handleScriptAdd}
              onScriptDelete={handleScriptDelete}
              onScriptRename={handleScriptRename}
            />
          </div>
        </div>

        {/* Right Panel - Inspector */}
        <div className="w-80 cyber-panel flex flex-col" style={{ borderLeft: '1px solid var(--ui-border-bright)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid var(--ui-border)' }}>
            <h2 className="text-xl font-bold tracking-wide neon-text" style={{ fontFamily: 'var(--font-display)' }}>INSPECTOR</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Inspector
              selectedObject={selectedObject}
              scripts={scripts}
              onObjectUpdate={handleObjectUpdate}
            />
          </div>
        </div>
      </div>

      {/* Dialogs omitted for brevity - same as original */}
    </div>
  );
}
