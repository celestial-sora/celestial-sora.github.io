/* ===========================
   Sora Tempest - About Me
   Interactive JavaScript
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

    // ===== Particle System =====
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    let isMouseMoving = false;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.6 + 0.1;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
            this.fadeDirection = 1;
            this.hue = 260 + Math.random() * 30; // Purple range
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse repulsion effect
            if (isMouseMoving) {
                const dx = this.x - mouseX;
                const dy = this.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    this.x += (dx / dist) * force * 1.5;
                    this.y += (dy / dist) * force * 1.5;
                }
            }

            // Pulsing opacity
            this.opacity += this.fadeSpeed * this.fadeDirection;
            if (this.opacity >= 0.7) this.fadeDirection = -1;
            if (this.opacity <= 0.1) this.fadeDirection = 1;

            // Wrap around
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.y < -10) this.y = canvas.height + 10;
            if (this.y > canvas.height + 10) this.y = -10;
        }

        draw() {
            const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
            const color = isDark
                ? `hsla(${this.hue}, 60%, 70%, ${this.opacity})`
                : `hsla(${this.hue}, 50%, 50%, ${this.opacity * 0.6})`;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Glow effect
            if (this.size > 1.5) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = isDark
                    ? `hsla(${this.hue}, 60%, 70%, ${this.opacity * 0.1})`
                    : `hsla(${this.hue}, 50%, 50%, ${this.opacity * 0.05})`;
                ctx.fill();
            }
        }
    }

    // Create particles
    const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connecting lines between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
                    const opacity = (1 - dist / 120) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = isDark
                        ? `rgba(155, 126, 216, ${opacity})`
                        : `rgba(123, 94, 196, ${opacity * 0.6})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // ===== Mouse Glow Effect =====
    const mouseGlow = document.getElementById('mouseGlow');
    let mouseTimeout;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseMoving = true;

        mouseGlow.style.left = mouseX + 'px';
        mouseGlow.style.top = mouseY + 'px';
        mouseGlow.classList.add('active');

        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            isMouseMoving = false;
        }, 100);
    });

    document.addEventListener('mouseleave', () => {
        mouseGlow.classList.remove('active');
        isMouseMoving = false;
    });

    // ===== Theme Toggle =====
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Load saved theme
    const savedTheme = localStorage.getItem('sora-theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('sora-theme', next);

        // Animate button
        themeToggle.style.transform = 'rotate(360deg) scale(0.8)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 400);
    });

    // ===== Navigation =====
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const hamburger = document.getElementById('hamburger');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    // Scroll effects
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Navbar state
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Scroll to top visibility
        if (currentScroll > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }

        // Active section tracking
        updateActiveSection();

        lastScroll = currentScroll;
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

    // Close mobile menu on link click
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

    // ===== Magnetic Card Effect =====
    const magneticCards = document.querySelectorAll('.magnetic-card');

    magneticCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            card.style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                card.style.transition = '';
            }, 500);
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });

    // ===== Character Card Tilt =====
    const characterCard = document.getElementById('characterCard');
    if (characterCard) {
        characterCard.addEventListener('mousemove', (e) => {
            const rect = characterCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 12;
            const rotateY = (centerX - x) / 12;

            characterCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;

            // Move glow effect
            const glowEl = characterCard.querySelector('.card-glow');
            if (glowEl) {
                glowEl.style.left = x - rect.width + 'px';
                glowEl.style.top = y - rect.height + 'px';
            }
        });

        characterCard.addEventListener('mouseleave', () => {
            characterCard.style.transform = '';
            characterCard.style.transition = 'transform 0.6s ease';
            setTimeout(() => {
                characterCard.style.transition = '';
            }, 600);
        });
    }

    // ===== Scroll Reveal Animation =====
    const revealElements = document.querySelectorAll(
        '.about-image-card, .about-text-card, .skill-card, .social-card, .contact-card, .section-header'
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
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ===== Skill Bar Animation =====
    const skillBars = document.querySelectorAll('.skill-progress');

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.getAttribute('data-progress');
                entry.target.style.width = progress + '%';
                entry.target.classList.add('animated');
                skillObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    skillBars.forEach(bar => skillObserver.observe(bar));

    // ===== Staggered reveal for grids =====
    const gridContainers = document.querySelectorAll('.skills-grid, .social-grid');

    gridContainers.forEach(grid => {
        const children = grid.children;
        Array.from(children).forEach((child, index) => {
            child.style.transitionDelay = `${index * 0.1}s`;
        });
    });

    // ===== Ripple Effect on Buttons =====
    document.querySelectorAll('.btn, .contact-social-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // ===== Typing Effect for Hero Subtitle =====
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        const text = subtitle.textContent;
        subtitle.textContent = '';
        subtitle.style.opacity = '1';

        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                subtitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 80);
            }
        }

        // Delay for animation sync
        setTimeout(typeWriter, 1200);
    }

    // ===== Parallax on Hero Elements =====
    const heroContent = document.querySelector('.hero-content');
    const floatingElements = document.querySelectorAll('.float-element');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = document.querySelector('.hero').offsetHeight;

        if (scrolled < heroHeight) {
            const speed = scrolled * 0.3;
            if (heroContent) {
                heroContent.style.transform = `translateY(${speed}px)`;
                heroContent.style.opacity = 1 - (scrolled / heroHeight) * 1.2;
            }

            floatingElements.forEach((el, i) => {
                const s = scrolled * (0.1 + i * 0.05);
                el.style.transform = `translateY(${-s}px)`;
            });
        }
    });

    // ===== Cursor Trail Effect =====
    let trailDots = [];
    const trailCount = 8;

    for (let i = 0; i < trailCount; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: fixed;
            width: ${8 - i}px;
            height: ${8 - i}px;
            background: var(--accent-primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            opacity: ${0.5 - i * 0.06};
            transition: transform ${0.1 + i * 0.03}s ease;
            transform: translate(-50%, -50%);
        `;
        document.body.appendChild(dot);
        trailDots.push({ el: dot, x: 0, y: 0 });
    }

    // Check if it's a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        document.addEventListener('mousemove', (e) => {
            trailDots[0].x = e.clientX;
            trailDots[0].y = e.clientY;
        });

        function animateTrail() {
            for (let i = trailDots.length - 1; i > 0; i--) {
                trailDots[i].x += (trailDots[i - 1].x - trailDots[i].x) * 0.35;
                trailDots[i].y += (trailDots[i - 1].y - trailDots[i].y) * 0.35;
            }

            trailDots.forEach(dot => {
                dot.el.style.left = dot.x + 'px';
                dot.el.style.top = dot.y + 'px';
            });

            requestAnimationFrame(animateTrail);
        }

        animateTrail();
    } else {
        // Remove trail dots on touch devices
        trailDots.forEach(dot => dot.el.remove());
        trailDots = [];
    }

    // ===== Initial Animation Trigger =====
    updateActiveSection();

    console.log('✦ Sora Tempest Portfolio loaded successfully! ✦');
});
