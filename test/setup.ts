import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock browser APIs not available in jsdom
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock HTMLCanvasElement methods for three.js
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
});

// Mock WebGL context for three.js
HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
  if (contextType === "webgl" || contextType === "webgl2") {
    const canvas = document.createElement("canvas");
    return {
      canvas,
      drawingBufferWidth: 800,
      drawingBufferHeight: 600,
      getExtension(name: string) {
        if (
          name === "WEBGL_depth_texture" ||
          name === "OES_texture_float" ||
          name === "OES_texture_half_float" ||
          name === "OES_element_index_uint"
        ) {
          return {};
        }
        return null;
      },
      getParameter(param: number) {
        // WebGL constants
        const GL_VERSION = 0x1f02;
        const GL_SHADING_LANGUAGE_VERSION = 0x8b8c;
        const GL_VENDOR = 0x1f00;
        const GL_RENDERER = 0x1f01;
        const GL_MAX_TEXTURE_SIZE = 0x0d33;
        const GL_MAX_VERTEX_ATTRIBS = 0x8869;
        const GL_MAX_VERTEX_UNIFORM_VECTORS = 0x8dfb;
        const GL_MAX_VARYING_VECTORS = 0x8dfc;
        const GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8b4d;
        const GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8b4c;
        const GL_MAX_TEXTURE_IMAGE_UNITS = 0x8872;
        const GL_MAX_FRAGMENT_UNIFORM_VECTORS = 0x8dfd;
        const GL_MAX_CUBE_MAP_TEXTURE_SIZE = 0x851c;
        const GL_MAX_RENDERBUFFER_SIZE = 0x84e8;

        // String parameters
        if (param === GL_VERSION) return "WebGL 1.0";
        if (param === GL_SHADING_LANGUAGE_VERSION) return "WebGL GLSL ES 1.0";
        if (param === GL_VENDOR) return "Vitest";
        if (param === GL_RENDERER) return "Vitest Renderer";

        // Numeric parameters
        if (param === GL_MAX_TEXTURE_SIZE) return 16384;
        if (param === GL_MAX_VERTEX_ATTRIBS) return 16;
        if (param === GL_MAX_VERTEX_UNIFORM_VECTORS) return 4096;
        if (param === GL_MAX_VARYING_VECTORS) return 30;
        if (param === GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS) return 32;
        if (param === GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS) return 16;
        if (param === GL_MAX_TEXTURE_IMAGE_UNITS) return 16;
        if (param === GL_MAX_FRAGMENT_UNIFORM_VECTORS) return 1024;
        if (param === GL_MAX_CUBE_MAP_TEXTURE_SIZE) return 16384;
        if (param === GL_MAX_RENDERBUFFER_SIZE) return 16384;

        // Default value for unknown parameters
        return 16;
      },
      getShaderPrecisionFormat: vi.fn(() => ({
        precision: 23,
        rangeMin: 127,
        rangeMax: 127,
      })),
      createShader: vi.fn(() => ({})),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn(() => true),
      createProgram: vi.fn(() => ({})),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      getProgramParameter: vi.fn(() => true),
      useProgram: vi.fn(),
      createBuffer: vi.fn(() => ({})),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      clear: vi.fn(),
      clearColor: vi.fn(),
      clearDepth: vi.fn(),
      clearStencil: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      viewport: vi.fn(),
      scissor: vi.fn(),
      drawArrays: vi.fn(),
      drawElements: vi.fn(),
      getUniformLocation: vi.fn(() => ({})),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      uniform3f: vi.fn(),
      uniform4f: vi.fn(),
      uniform1i: vi.fn(),
      uniformMatrix3fv: vi.fn(),
      uniformMatrix4fv: vi.fn(),
      createTexture: vi.fn(() => ({})),
      bindTexture: vi.fn(),
      texImage2D: vi.fn(),
      texParameteri: vi.fn(),
      createFramebuffer: vi.fn(() => ({})),
      bindFramebuffer: vi.fn(),
      framebufferTexture2D: vi.fn(),
      checkFramebufferStatus: vi.fn(() => 36053), // FRAMEBUFFER_COMPLETE
      createRenderbuffer: vi.fn(() => ({})),
      bindRenderbuffer: vi.fn(),
      renderbufferStorage: vi.fn(),
      framebufferRenderbuffer: vi.fn(),
      deleteShader: vi.fn(),
      deleteProgram: vi.fn(),
      deleteBuffer: vi.fn(),
      deleteTexture: vi.fn(),
      deleteFramebuffer: vi.fn(),
      deleteRenderbuffer: vi.fn(),
      getAttribLocation: vi.fn(() => 0),
      vertexAttrib1f: vi.fn(),
      blendFunc: vi.fn(),
      blendEquation: vi.fn(),
      depthFunc: vi.fn(),
      depthMask: vi.fn(),
      cullFace: vi.fn(),
      frontFace: vi.fn(),
      getError: vi.fn(() => 0), // NO_ERROR
      isContextLost: vi.fn(() => false),
    };
  }
  return null;
});
