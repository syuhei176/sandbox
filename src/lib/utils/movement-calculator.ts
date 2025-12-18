/**
 * Calculate movement vectors based on camera rotation (Y-axis)
 * Used for FPS-style camera-relative movement
 */

export interface MovementVectors {
  forward: { x: number; z: number };
  right: { x: number; z: number };
}

/**
 * Calculate forward and right vectors from camera Y rotation
 *
 * @param rotationY - Camera rotation around Y axis in radians
 * @returns Movement vectors for forward and right directions
 *
 * Coordinate system:
 * - X+ is right
 * - Z+ is backward (camera looks toward -Z)
 * - Y+ is up
 *
 * Rotation 0 means looking toward -Z (north)
 */
export function calculateMovementVectors(rotationY: number): MovementVectors {
  // Forward direction: where the camera is looking
  const forward = {
    x: Math.sin(rotationY),
    z: -Math.cos(rotationY),
  };

  // Right direction: 90 degrees clockwise from forward
  const right = {
    x: Math.cos(rotationY),
    z: Math.sin(rotationY),
  };

  return { forward, right };
}

/**
 * Normalize a 2D vector
 */
export function normalize2D(x: number, z: number): { x: number; z: number } {
  const length = Math.sqrt(x * x + z * z);
  if (length === 0) {
    return { x: 0, z: 0 };
  }
  return {
    x: x / length,
    z: z / length,
  };
}
