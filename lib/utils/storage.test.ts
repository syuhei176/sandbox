import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  saveEditorState,
  loadEditorState,
  clearEditorState,
  saveProject,
  loadCurrentProject,
  loadProject,
  loadProjectList,
  deleteProject,
  createProject,
  type EditorState,
} from './storage';
import { createTestGameObject, createTestScript } from '@/test/test-utils';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('EditorState persistence', () => {
    it('should save and load editor state', () => {
      const state: EditorState = {
        gameObjects: [createTestGameObject()],
        scripts: [createTestScript()],
        selectedObjectId: 'test-obj-1',
        selectedScriptId: 'test-script-1',
      };

      saveEditorState(state);
      const loaded = loadEditorState();

      expect(loaded).toEqual(state);
    });

    it('should return null when no state is saved', () => {
      const loaded = loadEditorState();
      expect(loaded).toBeNull();
    });

    it('should clear editor state', () => {
      const state: EditorState = {
        gameObjects: [],
        scripts: [],
        selectedObjectId: null,
        selectedScriptId: null,
      };

      saveEditorState(state);
      expect(loadEditorState()).not.toBeNull();

      clearEditorState();
      expect(loadEditorState()).toBeNull();
    });
  });

  describe('Project management', () => {
    it('should create a new project', () => {
      const project = createProject(
        'Test Project',
        [createTestGameObject()],
        [createTestScript()]
      );

      expect(project).toMatchObject({
        name: 'Test Project',
        gameSpec: {
          meta: {
            title: 'Test Project',
          },
        },
      });
      expect(project.id).toBeTruthy();
      expect(project.createdAt).toBeTruthy();
      expect(project.updatedAt).toBeTruthy();
    });

    it('should save and load current project', () => {
      const project = createProject(
        'My Game',
        [createTestGameObject()],
        [createTestScript()]
      );

      saveProject(project);
      const loaded = loadCurrentProject();

      expect(loaded).toEqual(project);
    });

    it('should load project by ID', () => {
      const project = createProject(
        'My Game',
        [createTestGameObject()],
        [createTestScript()]
      );

      saveProject(project);
      const loaded = loadProject(project.id);

      expect(loaded).toEqual(project);
    });

    it('should maintain project list', () => {
      const project1 = createProject('Project 1', [], []);
      const project2 = createProject('Project 2', [], []);

      saveProject(project1);
      saveProject(project2);

      const list = loadProjectList();

      expect(list).toHaveLength(2);
      expect(list.find(p => p.id === project1.id)).toBeTruthy();
      expect(list.find(p => p.id === project2.id)).toBeTruthy();
    });

    it('should update existing project', () => {
      const project = createProject('Original', [], []);
      saveProject(project);

      const updated = { ...project, name: 'Updated' };
      saveProject(updated);

      const list = loadProjectList();
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe('Updated');
    });

    it('should delete project', () => {
      const project1 = createProject('Project 1', [], []);
      const project2 = createProject('Project 2', [], []);

      saveProject(project1);
      saveProject(project2);

      deleteProject(project1.id);

      const list = loadProjectList();
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(project2.id);

      expect(loadProject(project1.id)).toBeNull();
    });

    it('should clear current project when deleted', () => {
      const project = createProject('Test', [], []);
      saveProject(project);

      expect(loadCurrentProject()).not.toBeNull();

      deleteProject(project.id);

      expect(loadCurrentProject()).toBeNull();
    });
  });

  describe('Project export/import', () => {
    it('should import valid project JSON', async () => {
      const project = createProject('Test', [createTestGameObject()], [createTestScript()]);
      const json = JSON.stringify(project);
      const file = new File([json], 'project.json', { type: 'application/json' });

      const { importProjectFromJSON } = await import('./storage');
      const imported = await importProjectFromJSON(file);

      expect(imported).toEqual(project);
    });

    it('should reject invalid JSON', async () => {
      const file = new File(['invalid json'], 'project.json', { type: 'application/json' });

      const { importProjectFromJSON } = await import('./storage');

      await expect(importProjectFromJSON(file)).rejects.toThrow('Failed to parse');
    });

    it('should reject malformed project', async () => {
      const badProject = { id: 'test', name: 'Test' }; // missing gameSpec
      const json = JSON.stringify(badProject);
      const file = new File([json], 'project.json', { type: 'application/json' });

      const { importProjectFromJSON } = await import('./storage');

      await expect(importProjectFromJSON(file)).rejects.toThrow('Invalid project file format');
    });
  });
});
