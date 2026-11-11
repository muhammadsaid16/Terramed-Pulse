import React, { useEffect, useRef } from 'react';

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uReduced;
uniform float uLight;

float hash(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime * 0.028;

  vec3 col = mix(vec3(0.012, 0.021, 0.036), vec3(0.945, 0.957, 0.972), uLight);

  // Star field, sparse and cold. Day side: no stars.
  vec2 starCell = floor(gl_FragCoord.xy / 1.7);
  float starSeed = hash(starCell);
  float star = step(0.9972, starSeed);
  float twinkle = 0.55 + 0.45 * sin(uTime * 1.2 + starSeed * 42.0);
  col += vec3(0.62, 0.76, 0.9) * star * twinkle * 0.55 * (1.0 - uLight);

  // Slow atmospheric plasma.
  vec2 q = p * 1.25;
  q += vec2(fbm(q + t), fbm(q - t + 3.1)) * 0.55;
  float plasma = fbm(q * 1.6 + t * 0.6);

  // Earth limb, upper right.
  float limbD = length((uv - vec2(0.93, 1.04)) * vec2(1.0, 1.28));
  float limb = smoothstep(0.92, 0.0, limbD);
  vec3 limbCol = mix(vec3(0.06, 0.52, 0.82), vec3(0.16, 0.52, 0.78), uLight);
  col += limbCol * limb * (0.22 + plasma * 0.55) * mix(1.0, 0.45, uLight);

  // Desert heat signature, lower left.
  float heatD = length((uv - vec2(0.0, -0.02)) * vec2(0.82, 1.18));
  float heat = smoothstep(0.78, 0.0, heatD);
  col += vec3(0.78, 0.3, 0.12) * heat * plasma * mix(0.20, 0.10, uLight);

  // Faint horizon.
  col += vec3(0.1, 0.55, 0.85) * mix(0.05, 0.025, uLight) * smoothstep(0.035, 0.0, abs(uv.y - 0.06));

  // Instrument scan lines.
  float scan = smoothstep(0.965, 1.0, sin(uv.y * 260.0 + uTime * 0.35) * 0.5 + 0.5);
  col += vec3(0.2, 0.6, 0.85) * scan * mix(0.012, 0.005, uLight);

  // Vignette: darkens the night side, whitens toward paper in daylight.
  float vig = smoothstep(0.34, 1.15, length(uv - 0.5));
  vec3 vigTarget = mix(vec3(0.0), vec3(0.976, 0.98, 0.988), uLight);
  col = mix(col, vigTarget, vig * mix(0.58, 0.42, uLight));

  // Fine grain to kill banding.
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * mix(0.014, 0.009, uLight);

  col = clamp(col, 0.0, 1.0);
  float alpha = uReduced > 0.5 ? 1.0 : 1.0;
  gl_FragColor = vec4(col, alpha);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * AtmosphericField — a hand-written GLSL Earth-limb field.
 * Slows to a single static frame under reduced motion, stops off-screen,
 * and leaves the CSS gradients in place if WebGL is unavailable.
 */
export default function AtmosphericField({ className = '', theme = 'dark' }) {
  const isLight = theme === 'light';
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let gl = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'low-power'
      });
    } catch {
      gl = null;
    }
    if (!gl) {
      canvas.dataset.failed = 'true';
      return undefined;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      canvas.dataset.failed = 'true';
      return undefined;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.dataset.failed = 'true';
      return undefined;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uReduced = gl.getUniformLocation(program, 'uReduced');
    const uLight = gl.getUniformLocation(program, 'uLight');
    gl.uniform1f(uReduced, reduced ? 1 : 0);
    gl.uniform1f(uLight, isLight ? 1 : 0);

    let raf = 0;
    let visible = true;
    let running = false;
    const startedAt = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.85;
      const w = Math.max(1, Math.floor(rect.width * scale));
      const h = Math.max(1, Math.floor(rect.height * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const draw = (now) => {
      resize();
      gl.uniform1f(uTime, reduced ? 0 : (now - startedAt) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now) => {
      if (!running) return;
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduced || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // First frame is always painted, motion or not.
    draw(performance.now());

    const resizeObserver = new ResizeObserver(() => {
      if (reduced) draw(performance.now());
    });
    resizeObserver.observe(canvas);

    let intersectionObserver = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible) start();
          else stop();
        },
        { threshold: 0 }
      );
      intersectionObserver.observe(canvas);
    }

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [isLight]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
