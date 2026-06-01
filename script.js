/* ===========================
   Sora Tempest — Portfolio
   Clean Interactive JavaScript
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

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

    // ===== Language Toggle (TH / EN) =====
    const langToggle = document.getElementById('langToggle');
    const langActive = langToggle.querySelector('.lang-active');
    const langInactive = langToggle.querySelector('.lang-inactive');

    let currentLang = localStorage.getItem('sora-lang') || 'th';

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('sora-lang', lang);

        // Update button label
        langActive.textContent = lang === 'th' ? 'TH' : 'EN';
        langInactive.textContent = lang === 'th' ? 'EN' : 'TH';

        // Update html lang attribute
        document.documentElement.lang = lang === 'th' ? 'th' : 'en';

        // Apply translations — only on elements that are pure text nodes (no child elements)
        document.querySelectorAll('[data-th], [data-en]').forEach(el => {
            // Skip elements that have child element nodes (e.g. buttons with icons, headings with spans)
            const hasChildElements = Array.from(el.childNodes).some(n => n.nodeType === 1);
            if (hasChildElements) return;

            const text = lang === 'th' ? el.getAttribute('data-th') : el.getAttribute('data-en');
            if (text) el.textContent = text;
        });
    }

    // Load saved language on init
    applyLanguage(currentLang);

    langToggle.addEventListener('click', () => {
        const next = currentLang === 'th' ? 'en' : 'th';

        // Animate the button
        langToggle.style.transform = 'scale(0.85)';
        setTimeout(() => {
            langToggle.style.transform = '';
        }, 200);

        applyLanguage(next);
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
        const sections = ['home', 'about', 'skills', 'social', 'contact'];
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
        '.about-image-card, .about-text-card, .skill-card, .social-card, .contact-card, .section-header, .donation-hub-container, .social-grid-header'
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

    // ===== Skill Bar Animation =====
    const skillBars = document.querySelectorAll('.skill-progress');

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.getAttribute('data-progress');
                entry.target.style.width = progress + '%';
                skillObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    skillBars.forEach(bar => skillObserver.observe(bar));

    // ===== Staggered Reveal for Grids =====
    const gridContainers = document.querySelectorAll('.skills-grid, .social-grid');

    gridContainers.forEach(grid => {
        const children = grid.children;
        Array.from(children).forEach((child, index) => {
            child.style.transitionDelay = `${index * 0.08}s`;
        });
    });

    // ===== Subtle Hero Parallax =====
    const heroContent = document.querySelector('.hero-content');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (!hero) return;
        const heroHeight = hero.offsetHeight;

        if (scrolled < heroHeight && heroContent) {
            const speed = scrolled * 0.15;
            heroContent.style.transform = `translateY(${speed}px)`;
            heroContent.style.opacity = 1 - (scrolled / heroHeight) * 1.2;
        }
    });

    // ===== Init =====
    updateActiveSection();
    console.log('✦ Sora Tempest Portfolio loaded ✦');
});
