import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadSite, stubSectionBox } from './helpers/loadSite.js';

describe('navbar scroll state', () => {
    afterEach(() => {
        localStorage.clear();
    });

    it('adds the scrolled class only past 50px', async () => {
        const site = await loadSite();
        const navbar = document.getElementById('navbar');

        site.scroll(40);
        expect(navbar.classList.contains('scrolled')).toBe(false);

        site.scroll(120);
        expect(navbar.classList.contains('scrolled')).toBe(true);

        site.scroll(0);
        expect(navbar.classList.contains('scrolled')).toBe(false);
    });

    it('shows the scroll-to-top button only past 500px', async () => {
        const site = await loadSite();
        const scrollTopBtn = document.getElementById('scrollTopBtn');

        site.scroll(499);
        expect(scrollTopBtn.classList.contains('visible')).toBe(false);

        site.scroll(501);
        expect(scrollTopBtn.classList.contains('visible')).toBe(true);
    });

    it('scrolls smoothly back to the top when the button is clicked', async () => {
        const site = await loadSite();
        document.getElementById('scrollTopBtn').click();
        expect(site.scrollTo.calls).toEqual([{ top: 0, behavior: 'smooth' }]);
    });
});

describe('active section tracking', () => {
    afterEach(() => {
        localStorage.clear();
    });

    it('marks the nav link of the section under the scroll position', async () => {
        const site = await loadSite();
        stubSectionBox('home', { offsetTop: 0, offsetHeight: 800 });
        stubSectionBox('about', { offsetTop: 800, offsetHeight: 800 });
        stubSectionBox('projects', { offsetTop: 1600, offsetHeight: 800 });
        stubSectionBox('social', { offsetTop: 2400, offsetHeight: 800 });

        site.scroll(700); // +200 offset lands inside #about
        expect(activeSections()).toEqual(['about']);

        site.scroll(1500); // lands inside #projects
        expect(activeSections()).toEqual(['projects']);
    });

    function activeSections() {
        return [...document.querySelectorAll('.nav-link.active')].map((link) => link.getAttribute('data-section'));
    }
});

describe('mobile menu', () => {
    afterEach(() => {
        localStorage.clear();
    });

    it('toggles the overlay and body scroll lock from the hamburger', async () => {
        await loadSite();
        const hamburger = document.getElementById('hamburger');
        const overlay = document.getElementById('mobileMenuOverlay');

        hamburger.click();
        expect(hamburger.classList.contains('active')).toBe(true);
        expect(overlay.classList.contains('active')).toBe(true);
        expect(document.body.style.overflow).toBe('hidden');

        hamburger.click();
        expect(hamburger.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);
        expect(document.body.style.overflow).toBe('');
    });

    it('closes the overlay when a mobile link is used', async () => {
        await loadSite();
        const hamburger = document.getElementById('hamburger');
        const overlay = document.getElementById('mobileMenuOverlay');

        hamburger.click();
        document.querySelector('.mobile-link').click();

        expect(hamburger.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);
        expect(document.body.style.overflow).toBe('');
    });
});

describe('smooth scrolling nav links', () => {
    afterEach(() => {
        localStorage.clear();
    });

    it('prevents the default jump and scrolls to the target minus the navbar offset', async () => {
        const site = await loadSite();
        const link = document.querySelector('.nav-link[data-section="about"]');
        const target = document.getElementById('about');
        target.getBoundingClientRect = () => ({ top: 900, bottom: 0, left: 0, right: 0, width: 0, height: 0 });
        window.pageYOffset = 100;

        const event = new window.MouseEvent('click', { bubbles: true, cancelable: true });
        link.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(site.scrollTo.calls).toEqual([{ top: 920, behavior: 'smooth' }]);
    });

    it('does not scroll when the target section does not exist', async () => {
        const site = await loadSite();
        const link = document.querySelector('.nav-link[data-section="about"]');
        link.setAttribute('href', '#does-not-exist');

        link.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

        expect(site.scrollTo.calls).toEqual([]);
    });
});

describe('hero parallax', () => {
    afterEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('translates and fades the hero content while inside the hero section', async () => {
        const site = await loadSite();
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        const heroBgLayer = document.getElementById('heroBgLayer');
        Object.defineProperty(hero, 'offsetHeight', { value: 1000, configurable: true });

        site.scroll(200);
        site.flushFrames();

        expect(heroContent.style.transform).toBe('translateY(30px)');
        expect(Number(heroContent.style.opacity)).toBeCloseTo(0.76, 5);
        expect(heroBgLayer.style.transform).toBe('translate3d(0, 24px, 0)');
    });

    it('clamps the hero opacity at zero and stops updating past the hero', async () => {
        const site = await loadSite();
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        Object.defineProperty(hero, 'offsetHeight', { value: 1000, configurable: true });

        site.scroll(900);
        site.flushFrames();
        expect(heroContent.style.opacity).toBe('0');

        site.scroll(2000);
        site.flushFrames();
        expect(heroContent.style.transform).toBe('translateY(135px)');
    });

    it('coalesces multiple scroll events into a single animation frame', async () => {
        const site = await loadSite();
        const frameSpy = vi.spyOn(window, 'requestAnimationFrame');

        site.scroll(100);
        site.scroll(150);
        site.scroll(200);
        expect(frameSpy).toHaveBeenCalledTimes(1);

        site.flushFrames();
        site.scroll(250);
        expect(frameSpy).toHaveBeenCalledTimes(2);
    });

    it('leaves the background layer untouched for reduced motion', async () => {
        const site = await loadSite({ reducedMotion: true });
        const hero = document.querySelector('.hero');
        Object.defineProperty(hero, 'offsetHeight', { value: 1000, configurable: true });

        site.scroll(200);
        site.flushFrames();

        expect(document.getElementById('heroBgLayer').style.transform).toBe('');
        expect(document.querySelector('.hero-content').style.transform).toBe('translateY(30px)');
    });
});
