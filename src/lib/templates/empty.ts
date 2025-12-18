import type { GameTemplate } from "./types";

export const emptyTemplate: GameTemplate = {
  id: "empty",
  name: "空のプロジェクト",
  description: "カメラとライトのみ。ゼロから作りたい時に。",
  gameObjects: [
    {
      id: "obj-camera",
      name: "MainCamera",
      transform: {
        position: { x: 0, y: 5, z: 10 },
        rotation: { x: -0.4, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      components: [
        {
          type: "camera",
          properties: {
            fov: 60,
            aspect: 16 / 9,
            near: 0.1,
            far: 1000,
            isMainCamera: true,
          },
        },
      ],
    },
    {
      id: "obj-light",
      name: "MainLight",
      transform: {
        position: { x: 5, y: 10, z: 5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      components: [
        {
          type: "light",
          properties: {
            lightType: "point",
            color: 0xffffff,
            intensity: 2,
            distance: 50,
          },
        },
      ],
    },
  ],
  scripts: [],
};
