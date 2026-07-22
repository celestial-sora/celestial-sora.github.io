/* ===========================
   Sora Tempest — Portfolio
   Clean Interactive JavaScript
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== Loading Screen (Terminal Typewriter) =====
    const loadingScreen = document.getElementById('loadingScreen');
    const terminalBody = document.getElementById('terminalBody');

    if (loadingScreen && terminalBody && !prefersReducedMotion) {
        document.body.style.overflow = 'hidden';

        // Typewriter effect
        const lines = [
            { type: 'prompt', text: '> npx sora --awaken' },
            { type: 'output', text: 'loading starlight modules... ' },
            { type: 'output-ok', text: 'ok' },
            { type: 'ready', text: 'ready..._' }
        ];

        let currentLineIdx = 0;
        let currentCharIdx = 0;
        const typewriterSpeed = 40; // ms per character

        function typeNextChar() {
            if (currentLineIdx >= lines.length) {
                // All done, start exit after delay
                setTimeout(() => {
                    loadingScreen.classList.add('done');
                    setTimeout(() => {
                        loadingScreen.classList.add('hidden');
                        document.body.style.overflow = '';
                        loadingScreen.addEventListener('transitionend', () => {
                            loadingScreen.remove();
                        }, { once: true });
                    }, 300);
                }, 400);
                return;
            }

            const line = lines[currentLineIdx];
            const textToType = line.text;

            // Create or update line element
            let lineEl = terminalBody.querySelector(`.terminal-line[data-line="${currentLineIdx}"]`);
            if (!lineEl) {
                lineEl = document.createElement('div');
                lineEl.className = 'terminal-line';
                lineEl.setAttribute('data-line', currentLineIdx);
                
                if (line.type === 'prompt') {
                    lineEl.innerHTML = `<span class="terminal-prompt"></span>`;
                } else if (line.type === 'output') {
                    lineEl.innerHTML = `<span class="terminal-text"></span>`;
                } else if (line.type === 'output-ok') {
                    lineEl.innerHTML = `<span class="terminal-ok"></span>`;
                } else if (line.type === 'ready') {
                    lineEl.innerHTML = `<span class="terminal-text"></span>`;
                }
                
                terminalBody.appendChild(lineEl);
            }

            const span = lineEl.querySelector('span');
            
            if (currentCharIdx < textToType.length) {
                // Type one character
                span.textContent += textToType[currentCharIdx];
                currentCharIdx++;
                setTimeout(typeNextChar, typewriterSpeed);
            } else {
                // Line done
                if (line.type === 'output-ok') {
                    // Add cursor to ready line
                    currentLineIdx++;
                    currentCharIdx = 0;
                    setTimeout(typeNextChar, 200);
                } else if (line.type === 'ready') {
                    // Add cursor after "ready..."
                    const cursor = document.createElement('span');
                    cursor.className = 'cursor';
                    span.appendChild(cursor);
                    
                    // Exit after showing cursor
                    setTimeout(() => {
                        loadingScreen.classList.add('done');
                        setTimeout(() => {
                            loadingScreen.classList.add('hidden');
                            document.body.style.overflow = '';
                            loadingScreen.addEventListener('transitionend', () => {
                                loadingScreen.remove();
                            }, { once: true });
                        }, 300);
                    }, 800);
                } else {
                    // Move to next line
                    currentLineIdx++;
                    currentCharIdx = 0;
                    setTimeout(typeNextChar, 150);
                }
            }
        }

        typeNextChar();
    } else if (loadingScreen && terminalBody && prefersReducedMotion) {
        // Reduced motion: show everything at once, quick fade
        document.body.style.overflow = 'hidden';
        
        terminalBody.innerHTML = `
            <div class="terminal-line">
                <span class="terminal-prompt">> npx sora --awaken</span>
            </div>
            <div class="terminal-line">
                <span class="terminal-text">loading starlight modules... <span class="terminal-ok">ok</span></span>
            </div>
            <div class="terminal-line">
                <span class="terminal-text">ready...</span>
            </div>
        `;

        setTimeout(() => {
            loadingScreen.classList.add('done');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                document.body.style.overflow = '';
                loadingScreen.addEventListener('transitionend', () => {
                    loadingScreen.remove();
                }, { once: true });
            }, 200);
        }, 600);
    } else if (loadingScreen) {
        // Fallback: just fade out
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            loadingScreen.classList.add('done');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                document.body.style.overflow = '';
                loadingScreen.addEventListener('transitionend', () => {
                    loadingScreen.remove();
                }, { once: true });
            }, 300);
        }, 1000);
    }


    // ===== Theme Toggle =====
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('sora-theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('sora-theme', next);
    });

    // ===== Navigation =====
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const hamburger = document.getElementById('hamburger');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    // Scroll effects
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (currentScroll > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }

        updateActiveSection();
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Active section tracking
    function updateActiveSection() {
        const sections = ['home', 'about', 'projects', 'social'];
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                const top = element.offsetTop;
                const bottom = top + element.offsetHeight;

                if (scrollPosition >= top && scrollPosition < bottom) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === section) {
                            link.classList.add('active');
                        }
                    });
                }
            }
        });
    }

    // Mobile menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Smooth scroll for nav links
    [...navLinks, ...mobileLinks].forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ===== Scroll Reveal Animation =====
    const revealElements = document.querySelectorAll(
        '.about-image-card, .about-text-card, .project-card, .social-card, .section-header, .donation-hub-container, .social-grid-header'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });
    revealElements.forEach(el => revealObserver.observe(el));

    // ===== Staggered Reveal for Grids =====
    const gridContainers = document.querySelectorAll('.projects-grid, .social-grid');

    gridContainers.forEach(grid => {
        const children = grid.children;
        Array.from(children).forEach((child, index) => {
            child.style.transitionDelay = `${index * 0.08}s`;
        });
    });

    // ===== Hero Immersive Background: Floating Petals =====
    const heroPetals = document.getElementById('heroPetals');

    if (heroPetals && !prefersReducedMotion) {
        const petalCount = window.innerWidth < 640 ? 8 : 16;

        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('span');
            petal.className = 'petal';

            const size = 6 + Math.random() * 8;          // 6–14px
            const left = Math.random() * 100;             // 0–100%
            const duration = 11 + Math.random() * 9;      // 11–20s
            const delay = Math.random() * -18;             // start mid-fall
            const drift = Math.round(Math.random() * 120 - 60); // -60–60px

            petal.style.left = `${left}%`;
            petal.style.width = `${size}px`;
            petal.style.height = `${size}px`;
            petal.style.animationDuration = `${duration}s`;
            petal.style.animationDelay = `${delay}s`;
            petal.style.setProperty('--drift', `${drift}px`);

            heroPetals.appendChild(petal);
        }
    }

    // ===== Hero Parallax (background layer + content) =====
    const heroContent = document.querySelector('.hero-content');
    const heroSection = document.querySelector('.hero');
    const heroBgLayer = document.getElementById('heroBgLayer');
    let heroTicking = false;

    function updateHeroParallax() {
        if (!heroSection) { heroTicking = false; return; }

        const scrolled = window.pageYOffset;
        const heroHeight = heroSection.offsetHeight;

        if (scrolled < heroHeight) {
            if (heroContent) {
                heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
                heroContent.style.opacity = Math.max(1 - (scrolled / heroHeight) * 1.2, 0);
            }
            if (heroBgLayer && !prefersReducedMotion) {
                heroBgLayer.style.transform = `translate3d(0, ${scrolled * 0.12}px, 0)`;
            }
        }
        heroTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!heroTicking) {
            requestAnimationFrame(updateHeroParallax);
            heroTicking = true;
        }
    }, { passive: true });

    // ===== Init =====
    updateActiveSection();
    console.log('✦ Sora Tempest Portfolio loaded ✦');
});
