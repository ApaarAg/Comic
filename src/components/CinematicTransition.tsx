import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  computeShaderTransitionEnvelope,
  type TransitionEffectKind,
} from '../story/scrollMath';
import { MOTION_EASING } from '../story/motionSystem';
import { sceneAudioManager } from '../audio/SceneAudioManager';
import { characterVoicePlayer } from '../audio/CharacterVoicePlayer';

gsap.registerPlugin(ScrollTrigger);

let threeModulePromise: Promise<typeof import('three')> | null = null;
const loadThree = () => {
  if (!threeModulePromise) {
    threeModulePromise = import('three');
  }
  return threeModulePromise;
};

interface CinematicTransitionProps {
  kind: TransitionEffectKind;
  fromColor: string;
  toColor: string;
  accentColor: string;
  eyebrow: string;
  caption: string;
  reducedMotion: boolean;
  artworkUrl?: string;
  altText?: string;
}

const KIND_INDEX: Record<TransitionEffectKind, number> = {
  'ink-spread': 0,
  'panel-slice': 1,
  'celestial-portal': 2,
  'temporal-split': 3,
  'storm-dissolve': 4,
  'kinetic-sweep': 5,
  'dawn-mist': 6,
};

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uProgress;
  uniform float uIntensity;
  uniform float uKind;
  uniform vec3 uFromColor;
  uniform vec3 uToColor;
  uniform vec3 uAccentColor;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 3; i++) {
      v += amp * noise(p);
      p *= 2.04;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec3 baseGrad = mix(uFromColor, uToColor, smoothstep(0.0, 1.0, 1.0 - uv.y));
    vec3 col = baseGrad;

    if (uKind < 0.5) {
      // 0: Ink-wash organic bleed reveal
      float n = fbm(uv * vec2(4.2, 3.0) + vec2(uTime * 0.1, -uProgress * 0.6));
      float bleed = smoothstep(0.32, 0.68, n + (uIntensity - 0.45) * 0.45);
      col = mix(baseGrad, uAccentColor * 0.48 + vec3(0.04), bleed * 0.65 * uIntensity);
    } else if (uKind < 1.5) {
      // 1: Comic panel kinetic fracture slices
      float band = floor(uv.y * 7.0);
      float shift = sin(band * 1.9 + uProgress * 6.28) * 0.07 * uIntensity;
      float edge = abs(fract(uv.y * 7.0) - 0.5);
      float seam = smoothstep(0.46, 0.5, edge);
      float streak = fbm(vec2(uv.x * 5.0 + shift * 6.0, band));
      col = mix(baseGrad, uAccentColor * 0.68, streak * 0.38 * uIntensity);
      col += uAccentColor * seam * 0.28 * uIntensity;
    } else if (uKind < 2.5) {
      // 2: Celestial tower portal / cloud aperture
      vec2 p = uv - vec2(0.5, 0.5);
      p.x *= 1.5;
      float r = length(p);
      float ring = exp(-pow((r - (0.18 + uProgress * 0.34)) * 6.5, 2.0));
      float clouds = fbm(uv * 3.6 + vec2(uTime * 0.08, uTime * 0.04));
      col = mix(baseGrad, mix(uToColor, uAccentColor, 0.55), (clouds * 0.45 + ring * 0.8) * uIntensity);
    } else if (uKind < 3.5) {
      // 3: Parallel reality temporal split
      float splitLine = smoothstep(0.015, 0.0, abs(uv.x - 0.5 + sin(uv.y * 8.0 + uTime) * 0.01 * uIntensity));
      float wave = fbm(vec2(uv.x * 4.0, uv.y * 6.0 - uTime * 0.22));
      vec3 leftTint = mix(uFromColor, vec3(0.94, 0.42, 0.49), 0.32);
      vec3 rightTint = mix(uToColor, vec3(0.42, 0.77, 0.88), 0.32);
      col = mix(baseGrad, mix(leftTint, rightTint, step(0.5, uv.x)), wave * 0.52 * uIntensity);
      col += uAccentColor * splitLine * 0.75 * uIntensity;
    } else if (uKind < 4.5) {
      // 4: Storm lightning veins + cosmic particle embers
      float boltNoise = abs(fbm(vec2(uv.x * 6.0, uv.y * 3.5 - uProgress * 2.0)) - 0.5);
      float vein = smoothstep(0.045, 0.0, boltNoise);
      float ember = smoothstep(0.76, 0.94, noise(uv * 28.0 + vec2(0.0, uTime * 0.8)));
      col = mix(baseGrad, uAccentColor, (vein * 0.9 + ember * 0.5) * uIntensity);
    } else if (uKind < 5.5) {
      // 5: Directional nocturnal speed streaks
      float streak = fbm(vec2(uv.x * 1.4 - uTime * 0.42, uv.y * 12.0));
      float bandGlow = smoothstep(0.48, 0.88, streak);
      col = mix(baseGrad, uAccentColor * 0.82, bandGlow * 0.48 * uIntensity);
    } else {
      // 6: Dawn mist golden horizon dissolve
      float mist = fbm(uv * vec2(3.2, 2.2) + vec2(uTime * 0.07, 0.0));
      float horizonGlow = exp(-pow((uv.y - 0.48) * 3.4, 2.0));
      col = mix(baseGrad, uAccentColor, (mist * 0.35 + horizonGlow * 0.54) * uIntensity);
    }

    // Soft top and bottom seamless edge feathering into adjacent sections
    float edgeFade = smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.8, uv.y);
    col = mix(baseGrad, col, edgeFade);
    gl_FragColor = vec4(col, edgeFade * uIntensity);
  }
`;

export const CinematicTransition: React.FC<CinematicTransitionProps> = React.memo(({
  kind,
  fromColor,
  toColor,
  accentColor,
  eyebrow,
  caption,
  reducedMotion,
  artworkUrl,
  altText,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number>(0.5);
  const [isNearViewport, setIsNearViewport] = useState(false);

  // Intersection gate so only the nearby transition mounts a WebGL context
  useEffect(() => {
    if (reducedMotion || !containerRef.current || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        setIsNearViewport(Boolean(entries[0]?.isIntersecting));
      },
      { rootMargin: '80px 0px' },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  // Synchronized editorial caption drift + subtle transition audio cue
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      if (!reducedMotion && copyRef.current) {
        gsap.fromTo(
          copyRef.current,
          { y: 18, opacity: 0.35 },
          {
            y: -8,
            opacity: 1,
            ease: MOTION_EASING.cinematic,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 90%',
              end: 'center center',
              scrub: 0.4,
            },
          },
        );
      }

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 72%',
        onEnter: () => {
          characterVoicePlayer.setActiveScene(null);
          characterVoicePlayer.stop(160, 'scene_changed');
          sceneAudioManager.triggerCue('transition');
        },
        onEnterBack: () => {
          characterVoicePlayer.setActiveScene(null);
          characterVoicePlayer.stop(160, 'scene_changed');
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Mount Three.js shader transition when active near viewport
  useEffect(() => {
    if (reducedMotion || !isNearViewport || !canvasHostRef.current || !containerRef.current) {
      return;
    }

    let disposed = false;
    let renderer: any = null;
    let geometry: any = null;
    let material: any = null;
    let st: ScrollTrigger | null = null;
    let resizeObs: ResizeObserver | null = null;
    let frameId = 0;
    const host = canvasHostRef.current;
    const container = containerRef.current;

    loadThree().then((THREE) => {
      if (disposed || !canvasHostRef.current || !containerRef.current) return;

      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: 'default',
        });
      } catch {
        return;
      }

      const gl = renderer.getContext() as WebGL2RenderingContext;
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const glRenderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
      const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(glRenderer);

      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setPixelRatio(isSoftwareGl ? 0.5 : Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      geometry = new THREE.PlaneGeometry(2, 2);
      material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: progressRef.current },
          uIntensity: { value: 0.7 },
          uKind: { value: KIND_INDEX[kind] },
          uFromColor: { value: new THREE.Color(fromColor) },
          uToColor: { value: new THREE.Color(toColor) },
          uAccentColor: { value: new THREE.Color(accentColor) },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
      });

      const quad = new THREE.Mesh(geometry, material);
      scene.add(quad);

      const startTime = performance.now();

      const afterDraw = (cb: () => void) => {
        if (typeof gl.fenceSync === 'function') {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          const poll = () => {
            if (disposed) {
              if (sync) gl.deleteSync(sync);
              return;
            }
            const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
            if (state === gl.UNSIGNALED) {
              frameId = window.setTimeout(poll, 16);
            } else {
              if (sync) gl.deleteSync(sync);
              frameId = window.setTimeout(cb, 280);
            }
          };
          frameId = window.setTimeout(poll, 16);
        } else {
          frameId = window.setTimeout(cb, 280);
        }
      };

      let lastRenderTime = 0;
      let stationaryFrames = 0;
      let lastProgress = -1;

      const drawFrame = (now: number = performance.now()) => {
        if (disposed || !renderer) return;

        const isStationary = Math.abs(progressRef.current - lastProgress) < 0.0005;
        lastProgress = progressRef.current;
        if (isStationary) {
          stationaryFrames++;
        } else {
          stationaryFrames = 0;
        }

        // Throttle idle loop to ~15fps after 60 stationary frames to conserve GPU
        if (stationaryFrames > 60 && (now - lastRenderTime) < 66) {
          frameId = window.requestAnimationFrame(drawFrame);
          return;
        }

        lastRenderTime = now;
        const elapsed = (now - startTime) * 0.001;
        const env = computeShaderTransitionEnvelope(progressRef.current, kind);
        material.uniforms.uTime.value = elapsed;
        material.uniforms.uProgress.value = progressRef.current;
        material.uniforms.uIntensity.value = env.intensity;
        renderer.render(scene, camera);

        if (isSoftwareGl) {
          afterDraw(() => drawFrame(performance.now()));
        } else {
          frameId = window.requestAnimationFrame(drawFrame);
        }
      };

      st = ScrollTrigger.create({
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });

      resizeObs = new ResizeObserver((entries) => {
        if (disposed || !renderer) return;
        const entry = entries[0];
        if (!entry) return;
        const w = Math.max(1, Math.floor(entry.contentRect.width));
        const h = Math.max(1, Math.floor(entry.contentRect.height));
        renderer.setSize(w, h, false);
      });
      resizeObs.observe(host);

      drawFrame();
    });

    return () => {
      disposed = true;
      window.clearTimeout(frameId);
      window.cancelAnimationFrame(frameId);
      st?.kill();
      resizeObs?.disconnect();
      geometry?.dispose();
      material?.dispose();
      if (renderer) {
        try {
          renderer.forceContextLoss();
          const gl = renderer.getContext();
          gl?.getExtension('WEBGL_lose_context')?.loseContext();
        } catch {
          // ignore context release errors gracefully
        }
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode === host) {
          host.removeChild(renderer.domElement);
        }
        renderer = null;
      }
    };
  }, [accentColor, fromColor, isNearViewport, kind, reducedMotion, toColor]);

  return (
    <div
      ref={containerRef}
      data-testid={`cinematic-transition-${kind}`}
      aria-label={caption}
      className="relative min-h-[280px] sm:min-h-[340px] md:min-h-[380px] w-full overflow-hidden flex items-center justify-center py-12"
      style={{
        background: `linear-gradient(180deg, ${fromColor} 0%, ${toColor} 100%)`,
      }}
    >
      {/* Real Comic Panel Artwork Layer (replaces empty dark placeholder screens) */}
      {artworkUrl && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={artworkUrl}
            alt={altText || eyebrow}
            className="w-full h-full object-cover object-center filter brightness-[0.40] contrast-[1.18] saturate-[0.85] scale-105 will-change-transform"
          />
          {/* Depth vignette and gradient edge feathering */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 80% 70% at 50% 50%, transparent 20%, ${fromColor}d9 75%, ${toColor} 100%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${fromColor} 0%, transparent 25%, transparent 75%, ${toColor} 100%)`,
            }}
          />
        </div>
      )}

      {/* Software/Reduced-motion atmospheric wash fallback */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-1"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${accentColor}26, transparent 74%)`,
        }}
      />

      {/* Three.js WebGL Shader Layer */}
      <div
        ref={canvasHostRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-2 mix-blend-screen opacity-85"
      />

      {/* Editorial Narrative Bridge Copy */}
      <div
        ref={copyRef}
        className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto"
      >
        <span
          className="inline-block px-3 py-1 rounded-full bg-black/40 border border-white/10 font-mono text-[11px] uppercase tracking-[0.28em] backdrop-blur-md mb-3"
          style={{ color: accentColor }}
        >
          {eyebrow}
        </span>
        <p className="font-display max-w-2xl text-xl sm:text-2xl md:text-3xl italic leading-snug text-[#f7f2eb] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] [text-wrap:balance]">
          &ldquo;{caption}&rdquo;
        </p>
      </div>
    </div>
  );
});

CinematicTransition.displayName = 'CinematicTransition';
