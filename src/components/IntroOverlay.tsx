import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundManager } from '../utils/audioAlert';

interface IntroOverlayProps {
  onEnter: () => void;
}

// Particle structure for the Fire Beast, Explosion, and Embers
interface FireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  initialSize: number;
  alpha: number;
  color: string;
  glowColor: string;
  life: number;
  maxLife: number;
  decay: number;
  type: 'head' | 'trail' | 'ember' | 'smoke' | 'shockwave' | 'ring';
}

const FIRE_PALETTE = [
  { core: '#ffffff', glow: 'rgba(255, 255, 255, 0.9)' },
  { core: '#ffeb3b', glow: 'rgba(255, 235, 59, 0.85)' },
  { core: '#ff9800', glow: 'rgba(255, 152, 0, 0.8)' },
  { core: '#f97316', glow: 'rgba(249, 115, 22, 0.75)' },
  { core: '#d50000', glow: 'rgba(213, 0, 0, 0.7)' },
  { core: '#b71c1c', glow: 'rgba(183, 28, 28, 0.6)' },
];

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [logoRevealed, setLogoRevealed] = useState(false);
  const [soundStarted, setSoundStarted] = useState(false);

  // Custom logo state loaded from localStorage or default official logo
  const [customLogoUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('serenazgo_custom_logo_2026');
      if (saved) return saved;
    }
    return '/logo-serenazgo.png';
  });

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const hasTriggeredImpactRef = useRef<boolean>(false);
  const particlesRef = useRef<FireParticle[]>([]);
  const shockwaveRadiusRef = useRef<number>(0);
  const shockwaveAlphaRef = useRef<number>(0);

  // Trigger sound on initial click/touch if browser blocked autoplay
  const startAudio = useCallback(() => {
    if (!soundStarted) {
      setSoundStarted(true);
      soundManager.playFireRoar();
    }
  }, [soundStarted]);

  // Dismiss and enter dashboard
  const handleDismiss = useCallback(() => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    soundManager.playSuccess();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setTimeout(() => {
      onEnter();
    }, 450);
  }, [isFadingOut, onEnter]);

  // Keyboard shortcut (Enter, Space, Escape to proceed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss]);

  // MAIN PARTICLE ENGINE & CANVAS LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let screenW = window.innerWidth;
    let screenH = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      screenW = window.innerWidth;
      screenH = window.innerHeight;
      canvas.width = screenW * dpr;
      canvas.height = screenH * dpr;
      canvas.style.width = `${screenW}px`;
      canvas.style.height = `${screenH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, screenW, screenH);
    };

    resize();
    window.addEventListener('resize', resize);

    // Initial audio attempt
    try {
      soundManager.playFireRoar();
    } catch {
      // Audio context may require click
    }

    startTimeRef.current = performance.now();
    hasTriggeredImpactRef.current = false;
    particlesRef.current = [];

    // Helper: spawn explosion particles at impact (1.3s)
    const triggerCenterExplosion = (cx: number, cy: number) => {
      soundManager.playBoomExplosion();
      shockwaveRadiusRef.current = 20;
      shockwaveAlphaRef.current = 1.0;

      // 280 radial burst particles
      const burstCount = 280;
      for (let i = 0; i < burstCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 18;
        const palette = FIRE_PALETTE[Math.floor(Math.random() * FIRE_PALETTE.length)];
        const size = 2 + Math.random() * 5.5;

        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          initialSize: size,
          alpha: 1.0,
          color: palette.core,
          glowColor: palette.glow,
          life: 0,
          maxLife: 0.8 + Math.random() * 1.6,
          decay: 0.94 - Math.random() * 0.03,
          type: 'head',
        });
      }

      // Golden sparks and embers
      for (let i = 0; i < 90; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 8;
        particlesRef.current.push({
          x: cx + (Math.random() - 0.5) * 40,
          y: cy + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: 1.5 + Math.random() * 3,
          initialSize: 2.5,
          alpha: 1.0,
          color: '#ffeb3b',
          glowColor: 'rgba(255, 235, 59, 0.9)',
          life: 0,
          maxLife: 2.0 + Math.random() * 1.5,
          decay: 0.98,
          type: 'ember',
        });
      }
    };

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(Math.max((currentTime - lastTime) / 1000, 0.001), 0.04);
      lastTime = currentTime;

      // Ensure elapsed is strictly non-negative to prevent Math.pow(negative, fractional) producing NaN
      const elapsed = Math.max(0, (currentTime - startTimeRef.current) / 1000);
      const curCenterX = (window.innerWidth || 1200) / 2;
      const curCenterY = (window.innerHeight || 800) / 2;

      // Pure black trailing canvas background (#000000)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // =========================================================================
      // FASE 1: 0 a 1.3s - FIERA DE FUEGO VIAJANDO DE IZQUIERDA A CENTRO
      // =========================================================================
      if (elapsed < 1.3) {
        // Easing curve: accelerating arrival clamped strictly between 0 and 1
        const t = Math.min(Math.max(elapsed / 1.3, 0), 1);
        const progress = Math.pow(t, 2.2);

        // Position of the beast's head
        const startX = -120;
        const startY = curCenterY + Math.sin(elapsed * 9) * 80;
        const beastX = startX + (curCenterX - startX) * progress;
        const beastY = startY + (curCenterY - startY) * progress + Math.sin(elapsed * 18) * (20 * (1 - progress));

        if (Number.isFinite(beastX) && Number.isFinite(beastY)) {
          // Spawn dense core particles for the beast's head (white-hot center + fire)
          const particlesPerFrame = 16;
          for (let k = 0; k < particlesPerFrame; k++) {
            const spreadAngle = Math.random() * Math.PI * 2;
            const spreadDist = Math.random() * 32 * (0.8 + progress * 0.5);
            const palette = FIRE_PALETTE[Math.floor(Math.random() * (progress > 0.7 ? 4 : FIRE_PALETTE.length))];

            particlesRef.current.push({
              x: beastX + Math.cos(spreadAngle) * spreadDist,
              y: beastY + Math.sin(spreadAngle) * spreadDist,
              vx: -Math.cos(spreadAngle) * (2 + Math.random() * 4) - 4 * (1 - progress),
              vy: (Math.random() - 0.5) * 3 - 0.8,
              size: 2.5 + Math.random() * 5,
              initialSize: 4.5,
              alpha: 1.0,
              color: palette.core,
              glowColor: palette.glow,
              life: 0,
              maxLife: 0.35 + Math.random() * 0.3,
              decay: 0.94,
              type: 'head',
            });
          }

          // Spawn long trailing incandescent sparks & smoke behind
          for (let k = 0; k < 10; k++) {
            const trailPalette = FIRE_PALETTE[2 + Math.floor(Math.random() * 4)];
            particlesRef.current.push({
              x: beastX - Math.random() * 30,
              y: beastY + (Math.random() - 0.5) * 20,
              vx: -3 - Math.random() * 12,
              vy: (Math.random() - 0.5) * 4 - 0.5,
              size: 1.5 + Math.random() * 3.5,
              initialSize: 3,
              alpha: 0.9,
              color: trailPalette.core,
              glowColor: trailPalette.glow,
              life: 0,
              maxLife: 0.5 + Math.random() * 0.4,
              decay: 0.93,
              type: 'trail',
            });
          }

          // Render head glow safely
          try {
            const headGlow = ctx.createRadialGradient(beastX, beastY, 4, beastX, beastY, 90);
            headGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            headGlow.addColorStop(0.25, 'rgba(255, 235, 59, 0.7)');
            headGlow.addColorStop(0.6, 'rgba(255, 152, 0, 0.4)');
            headGlow.addColorStop(1, 'rgba(213, 0, 0, 0)');
            ctx.fillStyle = headGlow;
            ctx.beginPath();
            ctx.arc(beastX, beastY, 90, 0, Math.PI * 2);
            ctx.fill();
          } catch {
            // Guard against gradient issues
          }
        }
      }

      // =========================================================================
      // FASE 2: 1.3s - IMPACTO MASIVO Y EXPLOSIÓN RADIAL
      // =========================================================================
      if (elapsed >= 1.3 && !hasTriggeredImpactRef.current) {
        hasTriggeredImpactRef.current = true;
        triggerCenterExplosion(curCenterX, curCenterY);
      }

      // Shockwave ring expansion
      if (shockwaveAlphaRef.current > 0.01) {
        shockwaveRadiusRef.current += dt * 550;
        shockwaveAlphaRef.current = Math.max(0, shockwaveAlphaRef.current - dt * 1.35);

        const safeRadius = Math.max(0.1, shockwaveRadiusRef.current);
        const safeAlpha = Math.max(0, Math.min(1, shockwaveAlphaRef.current));

        ctx.save();
        ctx.beginPath();
        ctx.arc(curCenterX, curCenterY, safeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 215, 0, ${safeAlpha * 0.9})`;
        ctx.lineWidth = Math.max(1, 8 * safeAlpha);
        ctx.stroke();

        // Secondary fiery shockwave ring
        const safeInnerRadius = Math.max(0.1, safeRadius - 25);
        ctx.beginPath();
        ctx.arc(curCenterX, curCenterY, safeInnerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(244, 63, 94, ${safeAlpha * 0.6})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // =========================================================================
      // FASE 3: 1.4 a 2.4s - REVELACIÓN DEL ESCUDO
      // =========================================================================
      if (elapsed >= 1.4 && !logoRevealed) {
        setLogoRevealed(true);
      }

      // Floating ambient vortex embers during Phase 3
      if (elapsed >= 1.4) {
        if (Math.random() < 0.35) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 110 + Math.random() * 40;
          particlesRef.current.push({
            x: curCenterX + Math.cos(angle) * dist,
            y: curCenterY + Math.sin(angle) * dist,
            vx: -Math.sin(angle) * (1.2 + Math.random() * 1.5),
            vy: -0.8 - Math.random() * 1.2,
            size: 1.2 + Math.random() * 2.2,
            initialSize: 2,
            alpha: 0.9,
            color: '#ffeb3b',
            glowColor: 'rgba(255, 152, 0, 0.8)',
            life: 0,
            maxLife: 1.4 + Math.random() * 1.0,
            decay: 0.97,
            type: 'ember',
          });
        }
      }

      // =========================================================================
      // UPDATE AND DRAW ALL ACTIVE PARTICLES
      // =========================================================================
      const aliveParticles: FireParticle[] = [];

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.life += dt;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= p.decay;
        p.vy *= p.decay;

        if (p.type === 'ember') {
          p.vy -= 0.04;
          p.x += Math.sin(p.life * 6) * 0.5;
        }

        if (p.life < p.maxLife && p.alpha > 0.02 && Number.isFinite(p.x) && Number.isFinite(p.y)) {
          aliveParticles.push(p);

          const safeSize = Math.max(0.1, p.size * (p.type === 'head' ? 1 : p.alpha));

          // Render glowing particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, safeSize, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
          ctx.fill();

          // Resplandor periférico
          if (p.size > 2) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.1, p.size * 2), 0, Math.PI * 2);
            ctx.fillStyle = p.glowColor;
            ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha * 0.35));
            ctx.fill();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      particlesRef.current = aliveParticles;

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      id="intro-overlay"
      onClick={startAudio}
      className={`fixed inset-0 z-50 bg-[#000000] flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 1. Canvas de partículas de la Fiera de Fuego en tiempo real sobre fondo negro puro */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none z-10 will-change-transform"
      />

      {/* 2. Resplandor Neón Dorado / Fuego Central Centrado */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.32)_0%,rgba(239,68,68,0.15)_45%,transparent_70%)] pointer-events-none z-20 transition-opacity duration-1000 ease-out ${
          logoRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      />

      {/* 3. INSIGNIA OFICIAL CLICKABLE INTERACTIVA */}
      <div
        className={`relative z-30 flex flex-col items-center justify-center text-center transition-all duration-700 ease-out ${
          logoRevealed
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-90 translate-y-3 pointer-events-none'
        }`}
      >
        {/* El propio logo/insignia es el botón interactivo de acceso */}
        <div
          onClick={handleDismiss}
          role="button"
          tabIndex={0}
          title="Haz clic en la insignia para ingresar a la Central de Mando"
          className="relative group p-1.5 sm:p-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_55px_rgba(245,158,11,0.7)] hover:shadow-[0_0_85px_rgba(245,158,11,0.95)] bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 select-none transform-gpu"
        >
          {/* Anillos de fuego y resplandor sutil pulsante */}
          <div className="absolute inset-0 rounded-full border-2 border-yellow-300/80 animate-ping opacity-25 pointer-events-none" />
          <div className="absolute -inset-2.5 rounded-full bg-amber-400/25 blur-xl animate-pulse pointer-events-none" />

          {/* Recuadro circular interior */}
          <div className="w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full overflow-hidden bg-[#001026] border-2 border-yellow-200/90 relative flex items-center justify-center shadow-inner">
            <img
              src={customLogoUrl}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('Logo%20-%20Serenazgo%202025.png')) {
                  target.src = '/Logo - Serenazgo 2025.png';
                } else if (!target.src.includes('logo_serenazgo.png')) {
                  target.src = '/logo_serenazgo.png';
                }
              }}
              alt="Insignia Oficial Serenazgo Nuevo Chimbote 2026"
              className="w-full h-full object-cover rounded-full select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Texto discreto debajo del logo */}
        <p
          onClick={handleDismiss}
          className="mt-6 text-xs sm:text-sm font-semibold tracking-widest text-amber-300/90 hover:text-white uppercase animate-pulse cursor-pointer transition-colors drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)] select-none"
        >
          Haz clic en la insignia para ingresar
        </p>
      </div>
    </div>
  );
};
