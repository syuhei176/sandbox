export { basicPlatformTemplate } from "./basic-platform";
export { fpsTemplate } from "./fps";
export { emptyTemplate } from "./empty";
export { sideScrollActionTemplate } from "./side-scroll-action";
export type { GameTemplate } from "./types";

import { basicPlatformTemplate } from "./basic-platform";
import { fpsTemplate } from "./fps";
import { emptyTemplate } from "./empty";
import { sideScrollActionTemplate } from "./side-scroll-action";
import type { GameTemplate } from "./types";

export const gameTemplates: GameTemplate[] = [
  basicPlatformTemplate,
  fpsTemplate,
  sideScrollActionTemplate,
  emptyTemplate,
];

export function getTemplateById(id: string): GameTemplate | undefined {
  return gameTemplates.find((template) => template.id === id);
}
