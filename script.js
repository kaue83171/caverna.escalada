/**
 * Caverna Ginásio de Escalada - Main JavaScript
 * Interações: mobile nav, scroll reveal, counter animation, form handling, particles
 */

// ============================================
// UTILITIES
// ============================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
const throttle = (fn, wait) => {
    let last = 0;
    return (...args) => {
        const now = Date.now();
        if (now - last >= wait) { last = now; fn(...args); }
    };
};

// ============================================
// MOBILE NAVIGATION
// ============================================
function initMobileNav() {
    const toggle = $('#navToggle');
    const menu = $('#navMenu');
    const links = $$('.nav__link', menu);

    if (!toggle || !menu) return;

    const closeMenu = () => {
        menu.classList.remove('nav__menu--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    const openMenu = () => {
        menu.classList.add('nav__menu--open');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    };

    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        expanded ? closeMenu() : openMenu();
    });

    // Close on link click
    links.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('nav__menu--open')) {
            closeMenu();
            toggle.focus();
        }
    });

    // Close on resize > 768px
    window.addEventListener('resize', throttle(() => {
        if (window.innerWidth > 768) closeMenu();
    }, 250));
}

// ============================================
// SCROLL REVEAL (IntersectionObserver)
// ============================================
function initScrollReveal() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
        $$('.reveal').forEach(el => el.classList.add('reveal--visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal--visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    });

    $$('.reveal').forEach(el => observer.observe(el));
}

// Add reveal classes to elements
function addRevealClasses() {
    const sections = [
        { selector: '.about__content > *', stagger: true },
        { selector: '.about__feature', stagger: true },
        { selector: '.about__visual', stagger: false },
        { selector: '.event-card', stagger: true },
        { selector: '.schedule__week', stagger: true },
        { selector: '.contact__card', stagger: true },
        { selector: '.contact__form', stagger: false },
        { selector: '.cta__card', stagger: false },
    ];

    sections.forEach(({ selector, stagger }) => {
        $$(selector).forEach((el, i) => {
            el.classList.add('reveal');
            if (stagger) el.style.transitionDelay = `${i * 100}ms`;
        });
    });
}

// ============================================
// COUNTER ANIMATION
// ============================================
function initCounterAnimation() {
    const counters = $$('.hero__stat-number');
    if (!counters.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animateCounter = (el) => {
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;

        if (prefersReduced) {
            el.textContent = target.toLocaleString('pt-BR');
            return;
        }

        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

        const update = (now) => {
            const progress = clamp((now - startTime) / duration, 0, 1);
            const eased = easeOutQuart(progress);
            const current = Math.round(start + (target - start) * eased);
            el.textContent = current.toLocaleString('pt-BR');

            if (progress < 1) requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

// ============================================
// PARTICLES BACKGROUND
// ============================================
function initParticles() {
    const container = $('#heroParticles');
    if (!container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const particleCount = 20;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 8}s`;
        particle.style.animationDuration = `${8 + Math.random() * 8}s`;
        container.appendChild(particle);
        particles.push(particle);
    }
}

// ============================================
// NAV BACKGROUND ON SCROLL
// ============================================
function initNavScroll() {
    const nav = $('#nav');
    if (!nav) return;

    const handleScroll = throttle(() => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(13, 13, 13, 0.95)';
            nav.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.4)';
        } else {
            nav.style.background = 'rgba(13, 13, 13, 0.9)';
            nav.style.boxShadow = 'none';
        }
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
function initSmoothScroll() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const navHeight = $('#nav')?.offsetHeight || 72;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Update URL without scroll
        history.pushState(null, '', href);

        // Focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
    });
}

// ============================================
// FORM HANDLING
// ============================================
function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    const toast = $('#toast');
    const toastMsg = $('.toast__message', toast);
    const toastIcon = $('.toast__icon', toast);

    const showToast = (message, type = 'success') => {
        toastMsg.textContent = message;
        toast.className = 'toast toast--show';
        if (type === 'success') toast.classList.add('toast--success');
        if (type === 'error') toast.classList.add('toast--error');

        // Announce for screen readers
        toast.setAttribute('role', 'alert');
        toast.hidden = false;

        setTimeout(() => {
            toast.classList.remove('toast--show');
            setTimeout(() => { toast.hidden = true; }, 300);
        }, 4000);
    };

    const validateField = (field) => {
        const value = field.value.trim();
        let valid = true;
        let message = '';

        if (field.hasAttribute('required') && !value) {
            valid = false; message = 'Este campo é obrigatório';
        } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            valid = false; message = 'E-mail inválido';
        } else if (field.type === 'tel' && value && !/^[\d\s\(\)\-\+]{10,}$/.test(value)) {
            valid = false; message = 'Telefone inválido';
        }

        // Remove existing error
        const existingError = field.parentNode.querySelector('.form__error');
        if (existingError) existingError.remove();

        if (!valid) {
            field.setAttribute('aria-invalid', 'true');
            const error = document.createElement('span');
            error.className = 'form__error';
            error.style.cssText = 'display:block; color:#E74C3C; font-size:0.8rem; margin-top:4px;';
            error.textContent = message;
            field.parentNode.appendChild(error);
        } else {
            field.removeAttribute('aria-invalid');
        }

        return valid;
    };

    // Real-time validation
    $$('input, select, textarea', form).forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            if (field.hasAttribute('aria-invalid')) validateField(field);
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fields = $$('input, select, textarea', form);
        const allValid = [...fields].map(validateField).every(v => v);

        if (!allValid) {
            showToast('Por favor, corrija os erros no formulário', 'error');
            return;
        }

        const submitBtn = $('button[type="submit"]', form);
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        // Simulate form submission (replace with real endpoint)
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            // TODO: Replace with actual API endpoint
            // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
            await new Promise(r => setTimeout(r, 1000)); // Simulate network

            showToast('Mensagem enviada! Responderemos em até 24h 💜');
            form.reset();
        } catch (err) {
            showToast('Erro ao enviar. Tente pelo WhatsApp 📱', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// ============================================
// HERO SCROLL INDICATOR HIDE
// ============================================
function initHeroScrollHide() {
    const scrollIndicator = $('.hero__scroll');
    if (!scrollIndicator) return;

    const handleScroll = throttle(() => {
        const hero = $('#inicio');
        if (!hero) return;

        const heroBottom = hero.getBoundingClientRect().bottom;
        if (heroBottom < window.innerHeight * 0.5) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.pointerEvents = 'none';
        } else {
            scrollIndicator.style.opacity = '';
            scrollIndicator.style.pointerEvents = '';
        }
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
}

// ============================================
// ACTIVE NAV LINK ON SCROLL
// ============================================
function initActiveNavLink() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav__link[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('nav__link--active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    });

    sections.forEach(section => observer.observe(section));
}

// Add active link styles dynamically
const activeLinkStyles = `
    .nav__link--active { color: var(--color-primary) !important; }
    .nav__link--active::after { transform: scaleX(1) !important; transform-origin: left !important; }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = activeLinkStyles;
document.head.appendChild(styleSheet);

// ============================================
// PARALLAX EFFECT ON HERO
// ============================================
function initParallax() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const heroVisual = $('.hero__visual');
    const heroLogo = $('.hero__logo-large');
    if (!heroVisual || !heroLogo) return;

    let ticking = false;

    const handleScroll = () => {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const heroHeight = $('#inicio')?.offsetHeight || window.innerHeight;
            const progress = clamp(scrollY / heroHeight, 0, 1);

            // Subtle parallax on logo
            heroLogo.style.transform = `translateY(${progress * 30}px) rotate(${progress * 2}deg)`;

            ticking = false;
        });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
}

// ============================================
// LOGO ANIMATION LOOP
// ============================================
function initLogoAnimation() {
    // Simple hover effect on hero logo image
    const heroLogoImg = $('.hero__logo-img');
    if (heroLogoImg) {
        heroLogoImg.addEventListener('mouseenter', () => {
            heroLogoImg.style.transform = 'scale(1.02)';
        });
        heroLogoImg.addEventListener('mouseleave', () => {
            heroLogoImg.style.transform = '';
        });
    }
}

// ============================================
// KEYBOARD NAVIGATION HELPERS
// ============================================
function initKeyboardNavigation() {
    // Trap focus in mobile menu when open
    const menu = $('#navMenu');
    const toggle = $('#navToggle');
    if (!menu || !toggle) return;

    const focusableElements = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

    menu.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab' || !menu.classList.contains('nav__menu--open')) return;

        const focusables = $$(focusableElements, menu);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });
}

// ============================================
// PERFORMANCE: LAZY LOAD IMAGES (if any added later)
// ============================================
function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;

    const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imgObserver.unobserve(img);
            }
        });
    });

    $$('img[data-src]').forEach(img => imgObserver.observe(img));
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }

    // Core functionality
    initMobileNav();
    addRevealClasses();
    initScrollReveal();
    initCounterAnimation();
    initParticles();
    initNavScroll();
    initSmoothScroll();
    initContactForm();
    initHeroScrollHide();
    initActiveNavLink();
    initParallax();
    initLogoAnimation();
    initKeyboardNavigation();
    initLazyImages();

    // Mark body as loaded for CSS animations
    document.body.classList.add('js-loaded');

    console.log('🧗 Caverna site initialized');
}

// Start
init();

// Export for potential external use
window.CavernaSite = {
    // Public API if needed
};