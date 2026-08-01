import { vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const indexHtml = readFileSync(resolve(rootDir, 'index.html'), 'utf8');

// Listeners registered on the (per-file, long-lived) window by a previous
// loadSite() call, so they can be detached before the next one.
let windowListeners = [];

/**
 * Renders index.html into the current jsdom document, installs the browser
 * APIs script.js relies on, then runs script.js and fires DOMContentLoaded.
 *
 * @param {{ reducedMotion?: boolean, innerWidth?: number, beforeReady?: () => void }} options
 */
export async function loadSite({ reducedMotion = false, innerWidth = 1280, beforeReady } = {}) {
    document.documentElement.innerHTML = extractHtml(indexHtml);
    document.documentElement.removeAttribute('data-theme');

    const observed = [];
    const unobserved = [];
    let observerCallback = null;
    let observerOptions = null;

    class TestIntersectionObserver {
        constructor(callback, options) {
            observerCallback = callback;
            observerOptions = options;
        }
        observe(el) {
            observed.push(el);
        }
        unobserve(el) {
            unobserved.push(el);
        }
        disconnect() {}
    }

    const frames = [];

    Object.defineProperty(window, 'innerWidth', { value: innerWidth, configurable: true, writable: true });
    window.matchMedia = (query) => ({
        media: query,
        matches: query.includes('prefers-reduced-motion') ? reducedMotion : false,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        onchange: null,
        dispatchEvent: () => false,
    });
    window.IntersectionObserver = TestIntersectionObserver;
    globalThis.IntersectionObserver = TestIntersectionObserver;
    window.requestAnimationFrame = (cb) => {
        frames.push(cb);
        return frames.length;
    };
    window.scrollTo = vitestScrollTo();
    window.pageYOffset = 0;
    window.scrollY = 0;

    windowListeners.forEach(([type, handler, options]) => window.removeEventListener(type, handler, options));
    windowListeners = [];
    const nativeWindowAdd = window.addEventListener.bind(window);
    window.addEventListener = (type, handler, options) => {
        windowListeners.push([type, handler, options]);
        nativeWindowAdd(type, handler, options);
    };

    // script.js does all of its work inside a DOMContentLoaded handler on the
    // document, which outlives a single test. Capture the handler instead of
    // registering it so handlers from earlier loads never run again.
    const nativeDocumentAdd = document.addEventListener.bind(document);
    let onReady = null;
    document.addEventListener = (type, handler, options) => {
        if (type === 'DOMContentLoaded') {
            onReady = handler;
            return;
        }
        nativeDocumentAdd(type, handler, options);
    };

    // Re-evaluate script.js from scratch for every test while keeping it
    // instrumented for coverage.
    vi.resetModules();
    await import('../../script.js');
    document.addEventListener = nativeDocumentAdd;
    beforeReady?.();
    onReady(new window.Event('DOMContentLoaded'));

    return {
        get observerCallback() {
            return observerCallback;
        },
        get observerOptions() {
            return observerOptions;
        },
        observed,
        unobserved,
        scrollTo: window.scrollTo,
        /** Runs every requestAnimationFrame callback queued so far. */
        flushFrames() {
            const queued = frames.splice(0, frames.length);
            queued.forEach((cb) => cb(performance.now()));
        },
        /** Sets the scroll offset and dispatches a scroll event. */
        scroll(offset) {
            window.pageYOffset = offset;
            window.scrollY = offset;
            window.dispatchEvent(new window.Event('scroll'));
        },
    };
}

/** Positions an element so updateActiveSection() treats it as a real section. */
export function stubSectionBox(id, { offsetTop, offsetHeight }) {
    const el = document.getElementById(id);
    Object.defineProperty(el, 'offsetTop', { value: offsetTop, configurable: true });
    Object.defineProperty(el, 'offsetHeight', { value: offsetHeight, configurable: true });
    return el;
}

function extractHtml(html) {
    const match = html.match(/<html[^>]*>([\s\S]*)<\/html>/i);
    return match ? match[1] : html;
}

function vitestScrollTo() {
    const calls = [];
    const fn = (...args) => {
        calls.push(args[0]);
    };
    fn.calls = calls;
    return fn;
}
