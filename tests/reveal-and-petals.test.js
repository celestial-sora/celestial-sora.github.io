import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadSite } from './helpers/loadSite.js';

const REVEAL_SELECTOR =
    '.about-image-card, .about-text-card, .project-card, .social-card, .section-header, .donation-hub-container, .social-grid-header';

describe('scroll reveal', () => {
    afterEach(() => {
        localStorage.clear();
    });

    it('marks every revealable element and observes it', async () => {
        const site = await loadSite();
        const elements = [...document.querySelectorAll(REVEAL_SELECTOR)];

        expect(elements.length).toBeGreaterThan(0);
        expect(elements.every((el) => el.classList.contains('reveal'))).toBe(true);
        expect(site.observed).toEqual(elements);
        expect(site.observerOptions).toEqual({ threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    });

    it('reveals intersecting elements once and then stops observing them', async () => {
        const site = await loadSite();
        const [first, second] = site.observed;

        site.observerCallback([
            { target: first, isIntersecting: true },
            { target: second, isIntersecting: false },
        ]);

        expect(first.classList.contains('visible')).toBe(true);
        expect(second.classList.contains('visible')).toBe(false);
        expect(site.unobserved).toEqual([first]);
    });

    it('staggers the transition delay of grid children', async () => {
        await loadSite();
        const grids = [...document.querySelectorAll('.projects-grid, .social-grid')];
        expect(grids.length).toBeGreaterThan(0);

        grids.forEach((grid) => {
            const delays = [...grid.children].map((child) => child.style.transitionDelay);
            expect(delays).toEqual(delays.map((_, index) => `${index * 0.08}s`));
        });
    });
});

describe('hero petals', () => {
    afterEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('spawns 16 randomised petals on wide viewports', async () => {
        await loadSite({ innerWidth: 1280 });
        const petals = [...document.getElementById('heroPetals').querySelectorAll('.petal')];

        expect(petals).toHaveLength(16);
        petals.forEach((petal) => {
            const size = Number.parseFloat(petal.style.width);
            expect(size).toBeGreaterThanOrEqual(6);
            expect(size).toBeLessThanOrEqual(14);
            expect(petal.style.height).toBe(petal.style.width);
            expect(Number.parseFloat(petal.style.left)).toBeGreaterThanOrEqual(0);
            expect(Number.parseFloat(petal.style.left)).toBeLessThanOrEqual(100);
            const duration = Number.parseFloat(petal.style.animationDuration);
            expect(duration).toBeGreaterThanOrEqual(11);
            expect(duration).toBeLessThanOrEqual(20);
            expect(Number.parseFloat(petal.style.animationDelay)).toBeLessThanOrEqual(0);
            const drift = Number.parseFloat(petal.style.getPropertyValue('--drift'));
            expect(drift).toBeGreaterThanOrEqual(-60);
            expect(drift).toBeLessThanOrEqual(60);
        });
    });

    it('halves the petal count on narrow viewports', async () => {
        await loadSite({ innerWidth: 480 });
        expect(document.getElementById('heroPetals').querySelectorAll('.petal')).toHaveLength(8);
    });

    it('spawns no petals for reduced motion', async () => {
        await loadSite({ reducedMotion: true });
        expect(document.getElementById('heroPetals').querySelectorAll('.petal')).toHaveLength(0);
    });
});
