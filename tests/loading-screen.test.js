import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSite } from './helpers/loadSite.js';

describe('loading screen', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    it('locks page scrolling while the terminal is visible', async () => {
        await loadSite();
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('types the terminal lines one character at a time', async () => {
        await loadSite();
        const terminalBody = document.getElementById('terminalBody');

        expect(terminalBody.textContent).toBe('>');

        vi.advanceTimersByTime(40);
        expect(terminalBody.textContent).toBe('> ');

        vi.advanceTimersByTime(40 * 3);
        expect(terminalBody.textContent).toBe('> npx');
    });

    it('renders all terminal lines and the blinking cursor once typing finishes', async () => {
        await loadSite();
        const terminalBody = document.getElementById('terminalBody');

        vi.advanceTimersByTime(10_000);

        const lines = [...terminalBody.querySelectorAll('.terminal-line')].map((el) => el.textContent);
        expect(lines).toEqual(['> npx sora --awaken', 'loading starlight modules... ', 'ok', 'ready..._']);
        expect(terminalBody.querySelector('.terminal-prompt')).not.toBeNull();
        expect(terminalBody.querySelector('.terminal-ok').textContent).toBe('ok');
        expect(terminalBody.querySelector('.cursor')).not.toBeNull();
    });

    it('fades out, restores scrolling and removes itself after the transition', async () => {
        await loadSite();
        const loadingScreen = document.getElementById('loadingScreen');

        vi.advanceTimersByTime(10_000);
        expect(loadingScreen.classList.contains('done')).toBe(true);
        expect(loadingScreen.classList.contains('hidden')).toBe(true);
        expect(document.body.style.overflow).toBe('');

        loadingScreen.dispatchEvent(new window.Event('transitionend'));
        expect(document.getElementById('loadingScreen')).toBeNull();
    });

    it('falls back to a plain fade-out when the terminal body is missing', async () => {
        await loadSite({
            beforeReady: () => document.getElementById('terminalBody').remove(),
        });
        const loadingScreen = document.getElementById('loadingScreen');

        expect(document.body.style.overflow).toBe('hidden');

        vi.advanceTimersByTime(1300);
        expect(loadingScreen.classList.contains('done')).toBe(true);
        expect(loadingScreen.classList.contains('hidden')).toBe(true);
        expect(document.body.style.overflow).toBe('');

        loadingScreen.dispatchEvent(new window.Event('transitionend'));
        expect(document.getElementById('loadingScreen')).toBeNull();
    });

    it('skips the typewriter and shows the full terminal at once for reduced motion', async () => {
        await loadSite({ reducedMotion: true });
        const terminalBody = document.getElementById('terminalBody');

        expect(terminalBody.querySelectorAll('.terminal-line')).toHaveLength(3);
        expect(terminalBody.textContent).toContain('> npx sora --awaken');
        expect(terminalBody.textContent).toContain('ready...');
        expect(terminalBody.querySelector('.cursor')).toBeNull();

        vi.advanceTimersByTime(800);
        expect(document.getElementById('loadingScreen').classList.contains('hidden')).toBe(true);
        expect(document.body.style.overflow).toBe('');
    });
});
