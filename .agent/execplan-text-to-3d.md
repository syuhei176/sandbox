# Text-to-3D Model Generation for Game Editor

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with `/Users/syuhei/work/sandbox/.agent/PLANS.md`.


## Purpose / Big Picture

After this change, users of the AI Game Platform editor will be able to create custom 3D models in two ways: (1) by uploading existing GLB or GLTF files from their computer, and (2) by typing a natural language description (for example, "a wooden medieval chair with carved details") and having an AI service generate a 3D model automatically. These custom models will appear in the 3D viewport just like the built-in primitive shapes (box, sphere, cylinder, plane), can be positioned and scaled using the transform gizmo, and will work in both the editor and the runtime game player.

To see it working, a user will select a GameObject in the editor, change its mesh geometry type to "Custom Model" in the Inspector panel, either upload a GLB file or click "Generate from AI" to type a description, wait for generation to complete (approximately 2-3 minutes), and then see the generated 3D model appear in the viewport. The model will be saved in the browser's IndexedDB storage so it persists across sessions and can be reused for other GameObjects. When the user clicks "Play", the custom model will also render correctly in the runtime player.


## Progress

- [ ] Milestone 1: Extend GameSpec schema to support custom models
- [ ] Milestone 2: Implement IndexedDB storage for 3D model files
- [ ] Milestone 3: Add custom model rendering in Viewport3D using useGLTF
- [ ] Milestone 4: Add file upload UI in Inspector for GLB/GLTF files
- [ ] Milestone 5: Update runtime engine to load custom models
- [ ] Milestone 6: Create Next.js API routes for text-to-3D generation
- [ ] Milestone 7: Build ModelGenerator UI component for AI generation
- [ ] Milestone 8: Integrate ModelGenerator into Inspector
- [ ] Milestone 9: End-to-end testing and validation


## Surprises & Discoveries

(This section will be populated as implementation proceeds)


## Decision Log

- Decision: Use Meshy AI API for text-to-3D generation instead of self-hosted solutions like Shap-E or Point-E
  Rationale: Meshy AI provides a production-ready REST API with good quality output (GLB format), reasonable pricing (free tier available), and 2-3 minute generation time. Self-hosted solutions would require significant infrastructure setup and maintenance. Meshy AI's GLB output format is directly compatible with three.js/React Three Fiber via the useGLTF hook that is already installed in the project.
  Date: 2025-11-23

- Decision: Use IndexedDB for model storage in the editor, with future option for external URLs in production
  Rationale: IndexedDB allows storing binary GLB files (which can be 1-10MB) in the browser without hitting localStorage's 5-10MB limit. This keeps the editor self-contained and offline-capable. For production games, we will add support for external URLs later, but IndexedDB is sufficient for the editor use case and doesn't require setting up cloud storage infrastructure.
  Date: 2025-11-23

- Decision: Implement in two phases: Phase 1 (file upload) then Phase 2 (AI generation)
  Rationale: File upload is simpler and provides immediate value, allowing users to use existing 3D models. It also validates the entire architecture (schema, storage, rendering, runtime) before adding the complexity of API integration and polling. If AI generation has issues, users can still use uploaded models.
  Date: 2025-11-23


## Outcomes & Retrospective

(This section will be populated at completion)


## Context and Orientation

This is a Next.js 16.0.3 application using the App Router, React 19.2.0, TypeScript, and Tailwind CSS. The project is a browser-based game editor and runtime for 3D games. Games are defined using a JSON format called "GameSpec" (defined in `/Users/syuhei/work/sandbox/lib/types/gamespec.ts`) which specifies game objects, their components (mesh, light, camera), transforms, and attached Lua scripts. The editor is located at `/Users/syuhei/work/sandbox/app/editor/page.tsx` and provides a Unity-like interface with a scene hierarchy panel (left), 3D viewport (center), Inspector panel (right), and script editor (bottom). The 3D viewport uses React Three Fiber (a React renderer for three.js) and is implemented in `/Users/syuhei/work/sandbox/components/editor/Viewport3D.tsx`.

Currently, the editor only supports four primitive mesh geometries: box, sphere, plane, and cylinder. These are hardcoded in the `MeshComponent` (lines 239-309 of Viewport3D.tsx) which creates three.js geometries based on the `geometry` property in the mesh component's properties object. When a user creates a GameObject and adds a mesh component, they can select from these four geometry types in the Inspector panel (`/Users/syuhei/work/sandbox/components/editor/Inspector.tsx`, lines 520-577).

The runtime engine (`/Users/syuhei/work/sandbox/lib/runtime/game-engine.ts`) takes a GameSpec JSON and constructs a three.js scene by iterating through game objects and adding meshes, lights, and cameras. The `addMeshComponent` method (lines 168-203) creates three.js geometry objects matching the GameSpec definitions.

The project already has `@react-three/drei` version 10.7.7 installed, which provides the `useGLTF` hook for loading GLB and GLTF model files. The `three` package (version 0.181.2) includes `GLTFLoader` in `three/examples/jsm/loaders/GLTFLoader`.

Key terms defined:
- **GameSpec**: A JSON object containing meta information, player config, worlds array (each with environment settings and game objects), and scripts array. It is the serializable representation of a game.
- **GameObject**: An entity in the game world with an ID, name, transform (position/rotation/scale), and array of components. Defined in gamespec.ts.
- **Component**: A piece of functionality attached to a GameObject, such as mesh (visual), light, camera, or rigidbody. Each component has a type string and a properties object.
- **Mesh Component**: A component with type "mesh" that renders 3D geometry. Properties include geometry type (box/sphere/etc), color, dimensions, metalness, roughness.
- **IndexedDB**: A browser API for storing large amounts of structured data including files and blobs. Unlike localStorage (5-10MB limit), IndexedDB can store hundreds of megabytes or more depending on browser and available disk space.
- **GLB**: Binary format for GLTF (GL Transmission Format), a standard 3D model format. GLB files are single-file packages containing geometry, materials, textures, and animations. Widely supported by three.js and 3D tools.
- **GLTF**: JSON-based 3D model format. Can be a .gltf JSON file with separate .bin and image files, or a single .glb binary file.
- **useGLTF**: A React hook from @react-three/drei that loads GLTF/GLB files and returns a three.js scene object. Supports Suspense for loading states and automatic caching.
- **Meshy AI**: A commercial text-to-3D generation service with a REST API. Takes a text prompt and generates a 3D model in GLB format. Free tier provides 200 credits per month (approximately 20-40 models). API uses a two-step flow: POST to create a task, then poll GET endpoint until generation is complete (2-3 minutes).


## Plan of Work

We will implement this feature in two major phases, with Phase 1 establishing the foundation for custom model support and Phase 2 adding AI generation capabilities.

**Phase 1: Custom Model Upload Support**

First, we extend the GameSpec TypeScript types in `/Users/syuhei/work/sandbox/lib/types/gamespec.ts` to add "custom_model" as a new geometry type alongside box, sphere, plane, cylinder. We add optional properties to mesh components: `model_id` (a string referencing an IndexedDB entry), `model_url` (a URL for remote models), `model_data` (base64-encoded GLB data for inline storage), and `model_prompt` (the original text prompt if generated by AI).

Next, we create a new file `/Users/syuhei/work/sandbox/lib/utils/model-storage.ts` that wraps IndexedDB operations. This module exports a singleton `modelStorage` object with async methods: `init()` to open the database, `saveModel(model)` to store a model with metadata, `getModel(id)` to retrieve a model as a Blob, `listModels()` to get all stored models, and `deleteModel(id)` to remove a model. The storage schema uses a single object store named "models" with documents containing: id (string), name (string), data (ArrayBuffer), format ("glb" or "gltf"), prompt (optional string), created_at (ISO date string), file_size (number), and thumbnail (optional base64 image string).

In `/Users/syuhei/work/sandbox/components/editor/Viewport3D.tsx`, we add a new React component `CustomModelRenderer` that uses the `useGLTF` hook from @react-three/drei. This component receives the mesh properties object, determines whether to load from model_id (IndexedDB), model_url (remote), or model_data (inline base64), and renders the loaded three.js scene using a `<primitive object={scene} />` element. We wrap this in a Suspense boundary to show a placeholder box while loading. We modify the existing `MeshComponent` to check if `properties.geometry === "custom_model"` and render `CustomModelRenderer` instead of primitive geometries.

In `/Users/syuhei/work/sandbox/components/editor/Inspector.tsx`, we add "Custom Model" as a new option in the geometry type select dropdown (around line 530). When the user selects custom_model, we show a new UI section with a file input that accepts .glb and .gltf files. When a file is selected, we read it as an ArrayBuffer, generate a unique ID (`model-${Date.now()}`), save it to IndexedDB via `modelStorage.saveModel()`, and update the GameObject's mesh properties to set geometry to "custom_model" and model_id to the generated ID.

In `/Users/syuhei/work/sandbox/lib/runtime/game-engine.ts`, we extend the `addMeshComponent` method (lines 168-203) to detect when `geometry === "custom_model"`. We import `GLTFLoader` from `three/examples/jsm/loaders/GLTFLoader` and use it to load the model from the URL or data. Because the runtime runs in the browser, we can access IndexedDB to load models by ID. We create a helper method `loadCustomModel(object3D, props)` that handles the async loading and adds the loaded scene to the object3D parent.

At this point, Milestone 5 is complete and we can test: open the editor, create a GameObject, set geometry to Custom Model, upload a GLB file, see it render in the viewport, click Play, and verify it renders in the runtime.

**Phase 2: AI Text-to-3D Generation**

We create a new Next.js API route at `/Users/syuhei/work/sandbox/app/api/generate-3d/route.ts`. This file exports an async POST handler that accepts a JSON body with `prompt` (string), `art_style` (optional, defaults to "realistic"), and `negative_prompt` (optional, defaults to empty string). The handler reads `process.env.MESHY_API_KEY` and calls the Meshy AI API at `https://api.meshy.ai/v2/text-to-3d` with the prompt and style. Meshy returns a task_id. Our handler returns JSON: `{ task_id: string, status: "pending" }`.

We create a second API route at `/Users/syuhei/work/sandbox/app/api/generate-3d/[task_id]/route.ts` that exports an async GET handler. This handler calls `https://api.meshy.ai/v2/text-to-3d/${task_id}` to check the generation status. Meshy returns an object with `status` ("PENDING", "IN_PROGRESS", "SUCCEEDED", or "FAILED") and, when succeeded, `model_urls.glb` (a download URL) and `thumbnail_url`. Our handler maps these to a simplified response: `{ status: "completed" | "pending" | "failed", model_url?: string, thumbnail_url?: string, progress?: number }`.

We create a new React component `/Users/syuhei/work/sandbox/components/editor/ModelGenerator.tsx`. This component renders a modal dialog with a textarea for the text prompt, a select dropdown for art style (realistic, cartoon, low-poly), and a "Generate" button. When the user clicks Generate, the component calls `fetch('/api/generate-3d', { method: 'POST', body: JSON.stringify({ prompt, art_style }) })` to start the task, receives the task_id, and then polls `fetch('/api/generate-3d/${task_id}')` every 3 seconds using setInterval. It displays a progress bar that updates based on the `progress` field in the response. When status becomes "completed", it downloads the GLB file from model_url using `fetch(model_url).then(r => r.blob())`, converts it to an ArrayBuffer, saves it to IndexedDB via `modelStorage.saveModel()`, clears the polling interval, and calls a callback prop `onModelGenerated(modelId, modelUrl)` to notify the parent.

In `/Users/syuhei/work/sandbox/components/editor/Inspector.tsx`, we add a "Generate from AI" button in the Custom Model section (shown when geometry is "custom_model"). Clicking this button opens the ModelGenerator modal. When the modal calls `onModelGenerated`, we update the GameObject's mesh properties to set model_id to the new model ID.

We add environment variable documentation in a comment or README: users must create a `.env.local` file with `MESHY_API_KEY=your_api_key_here`. For development, we can sign up for a free Meshy AI account at https://www.meshy.ai/ to get an API key.

At this point, all milestones are complete. We test end-to-end: open editor, create GameObject, set geometry to Custom Model, click Generate from AI, type "a red wooden chair", wait for generation, see the model appear, position it, click Play, verify it renders in runtime.


## Concrete Steps

**Milestone 1: Extend GameSpec schema**

Working directory: `/Users/syuhei/work/sandbox`

1. Open `lib/types/gamespec.ts`
2. Find the line where mesh component properties are defined (currently there is no explicit type, but properties are used in components)
3. Before the `Component` interface, add a new type alias:

       type GeometryType = "box" | "sphere" | "plane" | "cylinder" | "custom_model";

4. Add a comment above the `Component` interface explaining that mesh components with geometry "custom_model" should have additional properties: `model_id?: string`, `model_url?: string`, `model_data?: string`, `model_prompt?: string`

No command to run. This is a type-only change. Verify by running:

    npm run build

Expected: TypeScript compilation succeeds with no errors.

**Milestone 2: Implement IndexedDB storage**

Working directory: `/Users/syuhei/work/sandbox`

1. Create file `lib/utils/model-storage.ts`
2. Implement the IndexedDB wrapper as described in Plan of Work
3. Export interface `StoredModel` and singleton `modelStorage`

Test by opening browser console in the editor, importing the module, and calling methods:

    import { modelStorage } from '@/lib/utils/model-storage';
    await modelStorage.init();
    await modelStorage.listModels();

Expected: Empty array initially, no errors.

**Milestone 3: Add custom model rendering in Viewport3D**

Working directory: `/Users/syuhei/work/sandbox`

1. Open `components/editor/Viewport3D.tsx`
2. Add imports: `import { useGLTF } from '@react-three/drei';` and `import { Suspense, useState, useEffect } from 'react';`
3. Create `CustomModelRenderer` component as described in Plan of Work
4. Modify `MeshComponent` to check geometry type and render `CustomModelRenderer` when appropriate

Test: Not yet testable until Inspector UI is added in Milestone 4.

**Milestone 4: Add file upload UI in Inspector**

Working directory: `/Users/syuhei/work/sandbox`

1. Open `components/editor/Inspector.tsx`
2. Find the geometry select dropdown (around line 530)
3. Add `<option value="custom_model">Custom Model</option>`
4. Below the select, add conditional rendering: when `properties.geometry === "custom_model"`, show a file input and upload button
5. Implement the file reading and IndexedDB saving logic as described in Plan of Work

Test by running:

    npm run dev

Navigate to http://localhost:3000/editor, create a GameObject, open Inspector, select "Custom Model" from geometry dropdown, upload a test GLB file (download a free model from https://sketchfab.com or https://poly.pizza), observe the model appearing in the viewport.

Expected: The uploaded model renders in the 3D viewport with correct position and scale.

**Milestone 5: Update runtime engine**

Working directory: `/Users/syuhei/work/sandbox`

1. Open `lib/runtime/game-engine.ts`
2. Add import: `import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';`
3. Modify `addMeshComponent` method to detect custom_model geometry and call a new helper method
4. Implement `loadCustomModel` async helper as described in Plan of Work

Test by creating a project with a custom model in the editor, clicking Play button:

    npm run dev

Navigate to http://localhost:3000/editor, load a project with custom model, click Play, observe the runtime page at http://localhost:3000/runtime.

Expected: The custom model renders in the runtime player with the same appearance as in the editor.

**Milestone 6: Create Next.js API routes**

Working directory: `/Users/syuhei/work/sandbox`

1. Create directory `app/api/generate-3d`
2. Create file `app/api/generate-3d/route.ts` with POST handler as described in Plan of Work
3. Create file `app/api/generate-3d/[task_id]/route.ts` with GET handler as described in Plan of Work
4. Create `.env.local` file with `MESHY_API_KEY=test_key_placeholder`

Test by calling the API from command line (requires a real Meshy API key):

    curl -X POST http://localhost:3000/api/generate-3d \
      -H "Content-Type: application/json" \
      -d '{"prompt":"a red cube"}'

Expected response (example):

    {"task_id":"abc123","status":"pending"}

Then poll the status endpoint:

    curl http://localhost:3000/api/generate-3d/abc123

Expected: Status updates from pending to completed over 2-3 minutes, then returns model_url.

**Milestone 7: Build ModelGenerator UI component**

Working directory: `/Users/syuhei/work/sandbox`

1. Create file `components/editor/ModelGenerator.tsx`
2. Implement the modal component with prompt input, style selector, generate button, and polling logic as described in Plan of Work

Test: Not yet testable standalone, will test in Milestone 8 when integrated.

**Milestone 8: Integrate ModelGenerator into Inspector**

Working directory: `/Users/syuhei/work/sandbox`

1. Open `components/editor/Inspector.tsx`
2. Import `ModelGenerator` component
3. Add state for modal visibility: `const [showModelGenerator, setShowModelGenerator] = useState(false);`
4. In the Custom Model section, add a button "Generate from AI" that sets `setShowModelGenerator(true)`
5. Render `{showModelGenerator && <ModelGenerator onModelGenerated={handleModelGenerated} onClose={() => setShowModelGenerator(false)} />}`
6. Implement `handleModelGenerated` to update GameObject properties with the new model_id

Test by running:

    npm run dev

Navigate to http://localhost:3000/editor, create GameObject, set geometry to Custom Model, click "Generate from AI", type "a wooden medieval chair", click Generate, wait for progress bar to complete.

Expected: After 2-3 minutes, the generated chair model appears in the viewport. User can rotate, scale, and position it. Clicking Play shows the model in the runtime.

**Milestone 9: End-to-end testing and validation**

Working directory: `/Users/syuhei/work/sandbox`

Run the full development server:

    npm run dev

Test scenario 1 (File Upload):
1. Open http://localhost:3000/editor
2. Click "New" to start fresh project
3. Click "Add Object" to create GameObject
4. Select the object in hierarchy
5. In Inspector, change geometry to "Custom Model"
6. Click file input, upload a GLB file (test with a small free model)
7. Verify model appears in viewport
8. Use transform gizmo (W key) to move the model
9. Click "Play" button
10. Verify model appears in runtime at http://localhost:3000/runtime
11. Return to editor, click "Save" to save project
12. Reload browser tab
13. Verify model persists (loaded from IndexedDB)

Expected: All steps succeed, model is visible and interactive throughout.

Test scenario 2 (AI Generation):
1. Open http://localhost:3000/editor
2. Create new GameObject
3. Set geometry to "Custom Model"
4. Click "Generate from AI" button
5. Type prompt: "a blue ceramic vase with gold trim"
6. Select art style: "realistic"
7. Click "Generate"
8. Observe progress bar for 2-3 minutes
9. Verify generated vase appears in viewport
10. Position and scale the vase
11. Click "Play" and verify in runtime
12. Save project and reload
13. Verify vase persists

Expected: All steps succeed, AI-generated model is indistinguishable from uploaded models in functionality.

Test scenario 3 (Multiple Models):
1. Create three GameObjects
2. Upload a GLB file to first object
3. Generate a model for second object (e.g., "a tree")
4. Reuse the uploaded model for third object (by uploading same file again, or in future by browsing library)
5. Verify all three render correctly
6. Click Play, verify all three render in runtime

Expected: Multiple custom models coexist without conflict.

Test scenario 4 (Error Handling):
1. Try uploading a non-GLB file (e.g., .txt or .jpg)
2. Verify graceful error message
3. Try generating with empty prompt
4. Verify button is disabled or shows validation error
5. Simulate API failure by using invalid Meshy API key
6. Verify error message appears in ModelGenerator

Expected: Errors are handled gracefully with user-friendly messages.


## Validation and Acceptance

After completing all milestones, validation is performed by running the test scenarios in Milestone 9. The feature is considered complete when:

1. A user can upload a GLB file via the Inspector and see it render in the viewport with the same visual fidelity as primitive geometries
2. A user can generate a 3D model by typing a natural language prompt, waiting for generation, and seeing the result in the viewport
3. Custom models persist across browser sessions via IndexedDB
4. Custom models render correctly in the runtime player (not just the editor)
5. The transform gizmo (translate/rotate/scale) works correctly on custom models
6. Multiple custom models can exist in the same scene without conflicts
7. The feature does not break existing projects that use primitive geometries
8. Error cases are handled gracefully (invalid files, API failures, empty prompts)

To verify, run:

    npm run dev

Complete all test scenarios in Milestone 9. All scenarios should pass without errors or visual glitches.

Additionally, check browser console for errors. There should be no warnings or errors related to model loading, IndexedDB, or API calls during normal operation.

Performance validation: Loading a 5MB GLB file should take less than 2 seconds. Rendering a scene with 5-10 custom models should maintain 60fps in the viewport. Generation via Meshy AI should complete within 3-5 minutes (dependent on Meshy's service, not our code).


## Idempotence and Recovery

Most steps are naturally idempotent. Running `npm run dev` multiple times, creating files that already exist (via file write tool), and uploading the same model multiple times are all safe operations.

IndexedDB operations are idempotent by design: saving a model with the same ID will overwrite the previous entry, deleting a non-existent model will silently succeed, and listing models is read-only.

API routes are stateless and can be called repeatedly. Polling the Meshy API status endpoint is safe to call many times.

If implementation is interrupted mid-milestone:
- After Milestone 1-2: No user-visible changes, safe to continue from any point
- After Milestone 3: Viewport3D has new code but Inspector doesn't yet expose it, editor still functions normally
- After Milestone 4: Users can upload models but runtime won't load them yet, editor will show models but Play button will break for projects with custom models
- After Milestone 5: Full upload workflow works, safe to use
- After Milestone 6-7: API routes exist but no UI to call them yet, no impact on users
- After Milestone 8: Full feature is functional

If browser storage quota is exceeded, IndexedDB operations will throw quota errors. To recover: open browser DevTools, navigate to Application > Storage, and clear IndexedDB for localhost:3000. User will lose stored models but can re-upload or regenerate.

If Meshy API is unavailable, generation will fail with an error message. Users can still use the upload functionality. To retry, simply click Generate again.

To completely rollback this feature, revert changes to:
- `lib/types/gamespec.ts`
- `components/editor/Viewport3D.tsx`
- `components/editor/Inspector.tsx`
- `lib/runtime/game-engine.ts`

And delete:
- `lib/utils/model-storage.ts`
- `components/editor/ModelGenerator.tsx`
- `app/api/generate-3d/` directory

Existing projects with custom models will fail to load those models, but the editor will not crash (models will render as error placeholder boxes).


## Artifacts and Notes

Example IndexedDB schema (conceptual):

    Database: GameEditorModels
    Object Store: models
    Key Path: id
    
    Document structure:
    {
      id: "model-1732387200000",
      name: "wooden medieval chair",
      data: ArrayBuffer(2458624),  // GLB binary data
      format: "glb",
      prompt: "a wooden medieval chair with carved details",
      created_at: "2025-11-23T10:30:00.000Z",
      file_size: 2458624,
      thumbnail: "data:image/png;base64,iVBORw0KG..."
    }

Example Meshy API request/response:

Request to create task:

    POST https://api.meshy.ai/v2/text-to-3d
    Authorization: Bearer YOUR_API_KEY
    Content-Type: application/json
    
    {
      "prompt": "a red wooden chair",
      "art_style": "realistic",
      "negative_prompt": "low quality"
    }

Response:

    {
      "result": "task_abc123def456"
    }

Request to check status:

    GET https://api.meshy.ai/v2/text-to-3d/task_abc123def456
    Authorization: Bearer YOUR_API_KEY

Response (in progress):

    {
      "status": "IN_PROGRESS",
      "progress": 45
    }

Response (completed):

    {
      "status": "SUCCEEDED",
      "model_urls": {
        "glb": "https://assets.meshy.ai/downloads/abc123/model.glb",
        "fbx": "https://assets.meshy.ai/downloads/abc123/model.fbx",
        "usdz": "https://assets.meshy.ai/downloads/abc123/model.usdz"
      },
      "thumbnail_url": "https://assets.meshy.ai/downloads/abc123/thumbnail.png"
    }

Example useGLTF usage in CustomModelRenderer:

    function ModelContent({ url }: { url: string }) {
      const { scene } = useGLTF(url);
      const clonedScene = scene.clone();
      return <primitive object={clonedScene} />;
    }
    
    export function CustomModelRenderer({ properties }: Props) {
      const [blobUrl, setBlobUrl] = useState<string | null>(null);
      
      useEffect(() => {
        if (properties.model_id) {
          modelStorage.getModel(properties.model_id as string)
            .then(blob => setBlobUrl(URL.createObjectURL(blob)));
        }
        return () => {
          if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
      }, [properties.model_id]);
      
      const url = blobUrl || properties.model_url || properties.model_data;
      
      if (!url) return <ErrorPlaceholder />;
      
      return (
        <Suspense fallback={<LoadingPlaceholder />}>
          <ModelContent url={url} />
        </Suspense>
      );
    }


## Interfaces and Dependencies

**TypeScript Types (lib/types/gamespec.ts):**

Add type alias:

    type GeometryType = "box" | "sphere" | "plane" | "cylinder" | "custom_model";

Mesh component properties (as used in Component.properties):

    {
      geometry: GeometryType;
      
      // For primitive geometries:
      color?: number;
      width?: number;
      height?: number;
      depth?: number;
      radius?: number;
      radiusTop?: number;
      radiusBottom?: number;
      metalness?: number;
      roughness?: number;
      
      // For custom models:
      model_id?: string;
      model_url?: string;
      model_data?: string;
      model_prompt?: string;
    }

**Model Storage Interface (lib/utils/model-storage.ts):**

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
      init(): Promise<void>;
      saveModel(model: StoredModel): Promise<void>;
      getModel(id: string): Promise<Blob>;
      listModels(): Promise<StoredModel[]>;
      deleteModel(id: string): Promise<void>;
    }
    
    export const modelStorage: ModelStorage;

**CustomModelRenderer Component (components/editor/Viewport3D.tsx):**

    interface CustomModelRendererProps {
      properties: Record<string, unknown>;
      isSelected: boolean;
      gameObjectId: string;
      onSelect?: (id: string) => void;
    }
    
    function CustomModelRenderer(props: CustomModelRendererProps): ReactElement;

**ModelGenerator Component (components/editor/ModelGenerator.tsx):**

    interface ModelGeneratorProps {
      onModelGenerated: (modelId: string, modelUrl: string) => void;
      onClose: () => void;
    }
    
    export function ModelGenerator(props: ModelGeneratorProps): ReactElement;

**API Routes:**

    // app/api/generate-3d/route.ts
    export async function POST(request: NextRequest): Promise<NextResponse>;
    
    // Request body:
    {
      prompt: string;
      art_style?: "realistic" | "cartoon" | "low-poly";
      negative_prompt?: string;
    }
    
    // Response:
    {
      task_id: string;
      status: "pending";
    }
    
    // app/api/generate-3d/[task_id]/route.ts
    export async function GET(
      request: NextRequest,
      context: { params: { task_id: string } }
    ): Promise<NextResponse>;
    
    // Response:
    {
      status: "pending" | "in_progress" | "completed" | "failed";
      progress?: number;
      model_url?: string;
      thumbnail_url?: string;
    }

**External Dependencies:**

All required dependencies are already installed in package.json:
- `@react-three/fiber` version 9.4.0 for React Three.js integration
- `@react-three/drei` version 10.7.7 for useGLTF hook
- `three` version 0.181.2 for GLTFLoader

The Meshy AI API is an external HTTP service, no npm package required. Access via fetch() with API key from environment variable.

**Environment Variables (.env.local):**

    MESHY_API_KEY=your_meshy_api_key_here

To obtain an API key, sign up at https://www.meshy.ai/ and navigate to the API section. Free tier provides 200 credits per month.


---

Document created: 2025-11-23
Last updated: 2025-11-23
Status: Ready for implementation
