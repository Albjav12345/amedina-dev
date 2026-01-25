import React, { useRef, useEffect } from 'react';
import { useHardwareQuality } from '../../hooks/useHardwareQuality';

const ReactiveBackground = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const quality = useHardwareQuality();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.size = Math.random() * 1.5 + 0.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Interaction
                const dx = mouseRef.current.x - this.x;
                const dy = mouseRef.current.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    this.x -= dx * 0.01;
                    this.y -= dy * 0.01;
                }

                if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                    this.reset();
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 255, 153, 0.1)';
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            // Reduce density significantly on low tier
            const divisor = quality.tier === 'low' ? 60000 : 25000;
            const count = Math.floor((canvas.width * canvas.height) / divisor);

            // Hard cap for low end to prevent O(N^2) explosion if they have massive screens but slow CPUs
            const maxParticles = quality.tier === 'low' ? 30 : 150;
            const finalCount = Math.min(count, maxParticles);

            for (let i = 0; i < finalCount; i++) {
                particles.push(new Particle());
            }
        };

        const drawLines = () => {
            // Disable expensive line connections on low tier
            if (quality.tier === 'low') return;

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        // Optimize alpha calculation
                        const alpha = 0.05 * (1 - dist * 0.01);
                        ctx.strokeStyle = `rgba(0, 255, 153, ${alpha})`;
                        ctx.stroke();
                    }
                }
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawLines();
            animationFrameId = requestAnimationFrame(render);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        });

        // Throttle resize for perf
        let timeout;
        window.addEventListener('resize', () => {
            clearTimeout(timeout);
            timeout = setTimeout(resize, 200);
        });

        resize();
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[-1] opacity-50"
        />
    );
};

// ReactiveBackground component is now a named export for optimized lazy loading
export { ReactiveBackground };
