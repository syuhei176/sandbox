import { describe, it, expect } from "vitest";
import { calculateMovementVectors, normalize2D } from "./movement-calculator";

describe("calculateMovementVectors", () => {
  it("should calculate correct forward vector for rotation 0 (looking north)", () => {
    const vectors = calculateMovementVectors(0);

    expect(vectors.forward.x).toBeCloseTo(0, 10);
    expect(vectors.forward.z).toBeCloseTo(-1, 10);
    expect(vectors.right.x).toBeCloseTo(1, 10);
    expect(vectors.right.z).toBeCloseTo(0, 10);
  });

  it("should calculate correct forward vector for rotation π/2 (looking east)", () => {
    const vectors = calculateMovementVectors(Math.PI / 2);

    expect(vectors.forward.x).toBeCloseTo(1, 10);
    expect(vectors.forward.z).toBeCloseTo(0, 10);
    expect(vectors.right.x).toBeCloseTo(0, 10);
    expect(vectors.right.z).toBeCloseTo(1, 10);
  });

  it("should calculate correct forward vector for rotation π (looking south)", () => {
    const vectors = calculateMovementVectors(Math.PI);

    expect(vectors.forward.x).toBeCloseTo(0, 10);
    expect(vectors.forward.z).toBeCloseTo(1, 10);
    expect(vectors.right.x).toBeCloseTo(-1, 10);
    expect(vectors.right.z).toBeCloseTo(0, 10);
  });

  it("should calculate correct forward vector for rotation -π/2 (looking west)", () => {
    const vectors = calculateMovementVectors(-Math.PI / 2);

    expect(vectors.forward.x).toBeCloseTo(-1, 10);
    expect(vectors.forward.z).toBeCloseTo(0, 10);
    expect(vectors.right.x).toBeCloseTo(0, 10);
    expect(vectors.right.z).toBeCloseTo(-1, 10);
  });

  it("should calculate correct forward vector for rotation π/4 (northeast)", () => {
    const vectors = calculateMovementVectors(Math.PI / 4);

    const sqrt2over2 = Math.sqrt(2) / 2;
    expect(vectors.forward.x).toBeCloseTo(sqrt2over2, 10);
    expect(vectors.forward.z).toBeCloseTo(-sqrt2over2, 10);
    expect(vectors.right.x).toBeCloseTo(sqrt2over2, 10);
    expect(vectors.right.z).toBeCloseTo(sqrt2over2, 10);
  });

  it("should calculate correct forward vector for rotation -π/4 (northwest)", () => {
    const vectors = calculateMovementVectors(-Math.PI / 4);

    const sqrt2over2 = Math.sqrt(2) / 2;
    expect(vectors.forward.x).toBeCloseTo(-sqrt2over2, 10);
    expect(vectors.forward.z).toBeCloseTo(-sqrt2over2, 10);
    expect(vectors.right.x).toBeCloseTo(sqrt2over2, 10);
    expect(vectors.right.z).toBeCloseTo(-sqrt2over2, 10);
  });

  it("should return normalized vectors (length = 1)", () => {
    const testAngles = [0, Math.PI / 4, Math.PI / 2, Math.PI, -Math.PI / 2];

    testAngles.forEach((angle) => {
      const vectors = calculateMovementVectors(angle);

      const forwardLength = Math.sqrt(
        vectors.forward.x ** 2 + vectors.forward.z ** 2
      );
      const rightLength = Math.sqrt(
        vectors.right.x ** 2 + vectors.right.z ** 2
      );

      expect(forwardLength).toBeCloseTo(1, 10);
      expect(rightLength).toBeCloseTo(1, 10);
    });
  });
});

describe("normalize2D", () => {
  it("should normalize a vector to length 1", () => {
    const result = normalize2D(3, 4);

    expect(result.x).toBeCloseTo(0.6, 10);
    expect(result.z).toBeCloseTo(0.8, 10);

    const length = Math.sqrt(result.x ** 2 + result.z ** 2);
    expect(length).toBeCloseTo(1, 10);
  });

  it("should handle zero vector", () => {
    const result = normalize2D(0, 0);

    expect(result.x).toBe(0);
    expect(result.z).toBe(0);
  });

  it("should handle already normalized vector", () => {
    const result = normalize2D(1, 0);

    expect(result.x).toBeCloseTo(1, 10);
    expect(result.z).toBeCloseTo(0, 10);
  });
});
