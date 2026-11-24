import React, { useEffect, useRef } from 'react';

interface WindFieldCanvasProps {
  enabled: boolean;
  bearingDeg: number; // Direction wind pushes fire (degrees clockwise from North)
  windSpeedMph: number;
  intensity?: 'calm' | 'high' | 'extreme';
}

interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  speedScale: number;
  isEmber: boolean;
}

export const WindFieldCanvas: React.FC<WindFieldCanvasProps> = ({
  enabled,
  bearingDeg,
  windSpeedMph
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Convert compass bearing (0° = N, 90° = E, 180° = S, 270° = W) to screen vector (x right, y down)
    const rad = ((bearingDeg - 90) * Math.PI) / 180;
    const baseVx = Math.cos(rad);
    const baseVy = Math.sin(rad);
    const speedMag = Math.max(1.2, Math.min(5.2, windSpeedMph / 14));

    const count = windSpeedMph >= 45 ? 160 : 105;
    const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * (width || 1200),
      y: Math.random() * (height || 800),
      age: Math.floor(Math.random() * 90),
      maxAge: 65 + Math.floor(Math.random() * 65),
      speedScale: 0.72 + Math.random() * 0.65,
      isEmber: i % 5 === 0
    }));

    let tick = 0;

    const render = () => {
      tick += 0.015;
      // Smooth trail decay
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      for (const p of particles) {
        const prevX = p.x;
        const prevY = p.y;

        // Subtle topographic curl turbulence
        const curl = Math.sin(p.x * 0.0045 + tick) * 0.18 + Math.cos(p.y * 0.0045 - tick) * 0.18;
        const vx = (baseVx * Math.cos(curl) - baseVy * Math.sin(curl)) * speedMag * p.speedScale;
        const vy = (baseVx * Math.sin(curl) + baseVy * Math.cos(curl)) * speedMag * p.speedScale;

        p.x += vx;
        p.y += vy;
        p.age += 1;

        const lifeRatio = p.age / p.maxAge;
        const alpha = Math.sin(lifeRatio * Math.PI);

        if (p.isEmber) {
          ctx.strokeStyle = `rgba(251, 146, 60, ${alpha * 0.68})`;
          ctx.lineWidth = 1.8;
        } else {
          ctx.strokeStyle = `rgba(255, 247, 237, ${alpha * 0.24})`;
          ctx.lineWidth = 1.1;
        }

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        if (
          p.age >= p.maxAge ||
          p.x < -20 ||
          p.x > width + 20 ||
          p.y < -20 ||
          p.y > height + 20
        ) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.age = 0;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [enabled, bearingDeg, windSpeedMph]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="wind-field-overlay"
      aria-hidden="true"
    />
  );
};
