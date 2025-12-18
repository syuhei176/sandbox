import type {
  GameSpec,
  GameObject,
  ScriptDefinition,
} from "@/lib/types/gamespec";

const STORAGE_KEYS = {
  CURRENT_PROJECT: "ai-game-platform:current-project",
  PROJECT_LIST: "ai-game-platform:projects",
  AUTOSAVE: "ai-game-platform:autosave",
} as const;

export interface EditorState {
  gameObjects: GameObject[];
  scripts: ScriptDefinition[];
  selectedObjectId: string | null;
  selectedScriptId: string | null;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project extends ProjectMetadata {
  gameSpec: GameSpec;
}

/**
 * Save editor state to localStorage
 */
export function saveEditorState(state: EditorState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTOSAVE, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save editor state:", error);
  }
}

/**
 * Load editor state from localStorage
 */
export function loadEditorState(): EditorState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTOSAVE);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to load editor state:", error);
    return null;
  }
}

/**
 * Clear autosaved editor state
 */
export function clearEditorState(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTOSAVE);
  } catch (error) {
    console.error("Failed to clear editor state:", error);
  }
}

/**
 * Save a project
 */
export function saveProject(project: Project): void {
  try {
    // Save to current project slot
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, JSON.stringify(project));

    // Update project list
    const projects = loadProjectList();
    const existingIndex = projects.findIndex((p) => p.id === project.id);

    const metadata: ProjectMetadata = {
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      projects[existingIndex] = metadata;
    } else {
      projects.push(metadata);
    }

    localStorage.setItem(STORAGE_KEYS.PROJECT_LIST, JSON.stringify(projects));

    // Also save full project data under its ID
    localStorage.setItem(
      `ai-game-platform:project:${project.id}`,
      JSON.stringify(project),
    );
  } catch (error) {
    console.error("Failed to save project:", error);
    throw new Error("Failed to save project");
  }
}

/**
 * Load current project
 */
export function loadCurrentProject(): Project | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to load current project:", error);
    return null;
  }
}

/**
 * Load a specific project by ID
 */
export function loadProject(id: string): Project | null {
  try {
    const saved = localStorage.getItem(`ai-game-platform:project:${id}`);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to load project:", error);
    return null;
  }
}

/**
 * Load list of all projects (metadata only)
 */
export function loadProjectList(): ProjectMetadata[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECT_LIST);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to load project list:", error);
    return [];
  }
}

/**
 * Delete a project
 */
export function deleteProject(id: string): void {
  try {
    // Remove from project list
    const projects = loadProjectList();
    const filtered = projects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECT_LIST, JSON.stringify(filtered));

    // Remove project data
    localStorage.removeItem(`ai-game-platform:project:${id}`);

    // If it was the current project, clear it
    const current = loadCurrentProject();
    if (current && current.id === id) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
    }
  } catch (error) {
    console.error("Failed to delete project:", error);
    throw new Error("Failed to delete project");
  }
}

/**
 * Create a new project from editor state
 */
export function createProject(
  name: string,
  gameObjects: GameObject[],
  scripts: ScriptDefinition[],
): Project {
  const now = new Date().toISOString();
  const id = `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const gameSpec: GameSpec = {
    meta: {
      title: name,
      description: "Created in editor",
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

  return {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    gameSpec,
  };
}

/**
 * Export project as JSON file
 */
export function exportProjectAsJSON(project: Project): void {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import project from JSON file
 */
export function importProjectFromJSON(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const project = JSON.parse(content) as Project;

        // Validate project structure
        if (!project.id || !project.name || !project.gameSpec) {
          throw new Error("Invalid project file format");
        }

        resolve(project);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Invalid project file format"
        ) {
          reject(error);
        } else {
          reject(new Error("Failed to parse project file"));
        }
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}
