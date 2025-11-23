/**
 * IndexedDB wrapper for storing 3D model files (GLB/GLTF) in the browser.
 *
 * This module provides persistent storage for custom 3D models used in the game editor.
 * Models are stored as ArrayBuffers along with metadata like name, format, creation date,
 * and optional AI generation prompt.
 */

const DB_NAME = "GameEditorModels";
const DB_VERSION = 1;
const STORE_NAME = "models";

export interface StoredModel {
  id: string;
  name: string;
  data: ArrayBuffer;
  format: "glb" | "gltf";
  prompt?: string;
  created_at: string;
  file_size: number;
  thumbnail?: string;
}

class ModelStorage {
  private db: IDBDatabase | null = null;

  /**
   * Initialize the IndexedDB database.
   * Creates the object store if it doesn't exist.
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
    });
  }

  /**
   * Ensure database is initialized before operations.
   */
  private async ensureDb(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  /**
   * Save a 3D model to IndexedDB.
   * If a model with the same ID exists, it will be overwritten.
   */
  async saveModel(model: StoredModel): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(model);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve a 3D model from IndexedDB as a Blob.
   * Throws an error if the model is not found.
   */
  async getModel(id: string): Promise<Blob> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const model = request.result as StoredModel | undefined;
        if (model) {
          resolve(new Blob([model.data], { type: "model/gltf-binary" }));
        } else {
          reject(new Error(`Model not found: ${id}`));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get metadata for a specific model without loading the full data.
   */
  async getModelMetadata(id: string): Promise<Omit<StoredModel, "data"> | null> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const model = request.result as StoredModel | undefined;
        if (model) {
          const { data, ...metadata } = model;
          resolve(metadata);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * List all stored models with their metadata (excluding binary data).
   */
  async listModels(): Promise<Omit<StoredModel, "data">[]> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const models = request.result as StoredModel[];
        // Exclude binary data from list to save memory
        const metadata = models.map(({ data, ...meta }) => meta);
        resolve(metadata);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a model from IndexedDB.
   * Silently succeeds if the model doesn't exist.
   */
  async deleteModel(id: string): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all models from storage.
   * Use with caution - this operation cannot be undone.
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get the total storage size used by all models.
   */
  async getStorageSize(): Promise<number> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const models = request.result as StoredModel[];
        const totalSize = models.reduce((sum, model) => sum + model.file_size, 0);
        resolve(totalSize);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const modelStorage = new ModelStorage();
