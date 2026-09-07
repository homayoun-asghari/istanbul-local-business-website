"use client";

import { useEffect, useRef } from "react";

/**
 * Liquid metal, raymarched.
 *
 * The previous attempt painted a conic gradient on a blob. That is a flat trick: it has
 * no volume, no self-shadowing and no silhouette, so it reads as a shiny fan rather than
 * as an object. This renders an actual surface — three spheres blended by a smooth
 * minimum, marched per pixel, shaded by reflecting the view ray into a procedural studio
 * environment. Curvature bends the reflection, which is the whole reason metal looks
 * like metal.
 *
 * Raw WebGL2 on purpose: no three.js, no CDN. This directory is copied verbatim into a
 * client's own repository, and it has to keep working there with no dependency to install.
 */

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Three spheres fused by a smooth minimum. Their drift is what makes it look poured
// rather than modelled — slow, uneven, never repeating on an obvious beat.
float map(vec3 p) {
  float t = uTime * 0.28;
  vec3 a = vec3(sin(t * 0.9) * 0.30, cos(t * 0.7) * 0.24, sin(t * 0.5) * 0.16);
  vec3 b = vec3(cos(t * 0.6) * 0.42 + 0.20, sin(t * 1.1) * 0.30 - 0.16, cos(t * 0.8) * 0.20);
  vec3 c = vec3(sin(t * 0.4) * 0.34 - 0.26, cos(t * 0.5) * 0.34 + 0.22, sin(t * 0.9) * 0.22);
  a.xy += uPointer * 0.30;
  b.xy += uPointer * 0.16;
  float d = length(p - a) - 0.72;
  d = smin(d, length(p - b) - 0.56, 0.52);
  d = smin(d, length(p - c) - 0.50, 0.48);
  return d;
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.0016, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

/**
 * A procedural studio rather than an image: a bright ceiling falling to a near-black
 * floor, crossed by softbox strips. The strips are what the eye reads as polish — a
 * smooth gradient alone looks like plastic.
 */
vec3 studio(vec3 r) {
  float v = r.y * 0.5 + 0.5;
  vec3 col = mix(vec3(0.030, 0.010, 0.026), vec3(0.34, 0.07, 0.16), smoothstep(0.00, 0.34, v));
  col = mix(col, vec3(0.98, 0.72, 0.44), smoothstep(0.34, 0.60, v));
  col = mix(col, vec3(1.00, 0.95, 0.88), smoothstep(0.66, 0.94, v));

  float ang = atan(r.z, r.x);
  float strip = sin(ang * 2.0 + r.y * 5.2);
  col += vec3(1.00, 0.95, 0.90) * smoothstep(0.80, 1.0, strip) * 0.70;

  float strip2 = sin(ang * 3.0 - r.y * 3.4 + 1.7);
  col += vec3(1.00, 0.82, 0.58) * smoothstep(0.90, 1.0, strip2) * 0.40;

  // A hard horizon: the single most metallic cue there is.
  col += vec3(1.0, 0.93, 0.84) * smoothstep(0.015, 0.0, abs(r.y - 0.06)) * 0.55;
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / min(uRes.x, uRes.y);
  vec3 ro = vec3(0.0, 0.0, 3.05);
  vec3 rd = normalize(vec3(uv * 0.86, -1.55));

  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < 90; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < 0.0012) { hit = true; break; }
    t += d * 0.86;
    if (t > 7.0) break;
  }

  if (!hit) { outColor = vec4(0.0); return; }

  vec3 p = ro + rd * t;
  vec3 n = normalAt(p);
  vec3 refl = reflect(rd, n);
  vec3 col = studio(refl);

  // Fresnel: grazing angles reflect almost everything, which builds the rim.
  float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.4);
  col += vec3(1.0, 0.88, 0.72) * fres * 0.85;

  // One hard specular so there is a point of true white to anchor the eye.
  vec3 lightDir = normalize(vec3(-0.45, 0.80, 0.62));
  col += vec3(1.0) * pow(max(dot(refl, lightDir), 0.0), 46.0) * 1.5;

  // Contact darkening in the concavities where the spheres fuse.
  float occ = smoothstep(0.0, 0.30, map(p + n * 0.16));
  col *= 0.42 + 0.58 * occ;

  col = col / (col + 0.72);            // filmic rolloff so highlights do not clip flat
  col = pow(col, vec3(0.4545));        // to sRGB

  float edge = smoothstep(0.0, 0.02, 1.0 - fres * 0.35);
  outColor = vec4(col, edge);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

export function ChromeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    // No WebGL2 — the CSS shape underneath stays visible rather than leaving a hole.
    if (!gl) return;
    canvas.dataset.live = "true";

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uPointer = gl.getUniformLocation(program, "uPointer");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Capped: the shader is fill-rate bound and a retina panel would quadruple the cost
    // for no visible gain on an object this soft.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const size = canvas.clientWidth;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const start = performance.now();

    const onPointer = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = -(event.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!still) window.addEventListener("pointermove", onPointer, { passive: true });

    const draw = (now: number) => {
      x += (targetX - x) * 0.05;
      y += (targetY - y) * 0.05;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, still ? 6.0 : (now - start) / 1000);
      gl.uniform2f(uPointer, x, y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!still) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={ref} className="chrome-canvas" aria-hidden="true" />;
}
