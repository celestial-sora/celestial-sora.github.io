import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadSite } from './helpers/loadSite.js';

describe('theme toggle', () => {
    afterEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('defaults to the dark theme when nothing is stored', async () => {
        await loadSite();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('restores the persisted theme on load', async () => {
        localStorage.setItem('sora-theme', 'light');
        await loadSite();
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('flips the theme and persists it on click', async () => {
        await loadSite();
        const themeToggle = document.getElementById('themeToggle');

        themeToggle.click();
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(localStorage.getItem('sora-theme')).toBe('light');

        themeToggle.click();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(localStorage.getItem('sora-theme')).toBe('dark');
    });
});
