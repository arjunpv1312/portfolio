// Main JavaScript file for the personal introduction website

// ── Theme: apply immediately before DOM renders to avoid flash ──
(function() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    document.documentElement.setAttribute('data-bs-theme', saved);
})();

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive features
    initializeThemeToggle();
    initializeNavigation();
    initializeAnimations();
    initializeGallery();
    initializeContactForm();
    initializeScrollEffects();
    initializeProjectCarousels();
    initializeRecognition();
    initializeResume();
    initializeSkillBars();
    initializeCounters();
    initializeHeroRoleTypewriter();
    initializeTypingAnimation();
});

// Theme toggle
function initializeThemeToggle() {
    const btn  = document.getElementById('themeToggleBtn');
    const html = document.documentElement;
    if (!btn) return;

    // Apply a theme and persist it
    function applyTheme(theme, save) {
        html.setAttribute('data-theme', theme);
        html.setAttribute('data-bs-theme', theme);
        if (save) localStorage.setItem('theme', theme);

        // Update button tooltip
        btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        btn.setAttribute('aria-label', btn.title);

        // Update navbar background immediately
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (theme === 'light') {
                navbar.style.background = 'rgba(240,244,251,0.97)';
            } else {
                navbar.style.background = window.scrollY > 50
                    ? 'rgba(8,11,20,0.98)'
                    : 'rgba(8,11,20,0.85)';
            }
        }
    }

    // Set initial state from localStorage (already set by inline script, just sync UI)
    const initial = localStorage.getItem('theme') || 'dark';
    applyTheme(initial, false);

    // Toggle on click
    btn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme') || 'dark';
        const next    = current === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
    });
}

function initializeHeroRoleTypewriter() {
    const el     = document.getElementById('hero-role-typed');
    const cursor = document.querySelector('.hero-role-cursor');
    if (!el || !cursor) return;

    const text    = 'AI & Data Science Engineer';
    const speed   = 55;   // ms per character
    const startAt = 600;  // delay before typing begins (ms)

    let i = 0;
    cursor.style.opacity = '1'; // show cursor as soon as we start

    function tick() {
        if (i <= text.length) {
            el.textContent = text.slice(0, i);
            i++;
            setTimeout(tick, speed);
        }
        // cursor keeps blinking via CSS after typing ends
    }
    setTimeout(tick, startAt);
}

function initializeTypingAnimation() {
    const phrases = [
        'Generative AI',
        'Machine Learning',
        'Data Science & Analytics',
        'AI Tool Development',
        'Cloud & AWS',
        'Python Engineering'
    ];

    const heroH1 = document.querySelector('.hero-intro h1');
    if (!heroH1) return;

    const prefix = document.querySelector('.hero-intro h4');
    if (prefix) prefix.textContent = 'Exploring the Frontiers of';

    heroH1.innerHTML = '<span id="typed-text"></span><span class="typed-cursor">|</span>';
    heroH1.style.minHeight = '1.2em';

    const typedEl = document.getElementById('typed-text');
    const cursor = document.querySelector('.typed-cursor');

    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = `
        .typed-cursor {
            display: inline-block;
            color: #0dcaf0;
            font-weight: 300;
            animation: blink 0.7s infinite;
            margin-left: 2px;
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
    `;
    document.head.appendChild(cursorStyle);

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 80;
    const deleteSpeed = 40;
    const pauseAfterType = 1800;
    const pauseAfterDelete = 400;

    function type() {
        const current = phrases[phraseIndex];

        if (!isDeleting) {
            typedEl.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            if (charIndex === current.length) {
                isDeleting = true;
                setTimeout(type, pauseAfterType);
                return;
            }
            setTimeout(type, typeSpeed);
        } else {
            typedEl.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(type, pauseAfterDelete);
                return;
            }
            setTimeout(type, deleteSpeed);
        }
    }

    setTimeout(type, 800);
}

// Navigation functionality
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Sections that live inside the "Work" dropdown
    const WORK_SECTIONS = ['certificates', 'projects'];
    const workToggle = document.getElementById('workDropdown');

    // Add active class to current section's nav link (or Work dropdown toggle)
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop    = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId     = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
                // Highlight "Work" toggle when Certificates or Projects is in view
                if (workToggle) {
                    if (WORK_SECTIONS.includes(sectionId)) {
                        workToggle.classList.add('active');
                    } else {
                        workToggle.classList.remove('active');
                    }
                }
            }
        });
    }

    // Close mobile navbar & dropdown when a dropdown item is clicked
    document.querySelectorAll('.nav-dropdown-menu .dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            // Close mobile navbar collapse
            const navCollapse = document.getElementById('navbarNav');
            if (navCollapse && navCollapse.classList.contains('show')) {
                navCollapse.classList.remove('show');
            }
            // Close the dropdown itself
            const dropMenu = document.querySelector('.nav-dropdown-menu');
            if (dropMenu) dropMenu.classList.remove('show');
            if (workToggle) workToggle.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Navbar background opacity on scroll — theme-aware
    function updateNavbarBackground() {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        if (theme === 'light') {
            navbar.style.background = 'rgba(240,244,251,0.97)';
        } else if (window.scrollY > 50) {
            navbar.style.background = 'rgba(8,11,20,0.98)';
        } else {
            navbar.style.background = 'rgba(8,11,20,0.85)';
        }
    }
    
    // Smooth scrolling for navigation links (only internal anchor links)
    // Also closes the mobile navbar collapse when a link is tapped
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || !targetId.startsWith('#') || targetId === '#') return;
            e.preventDefault();
            // Close mobile navbar on link tap
            const navCollapse = document.getElementById('navbarNav');
            if (navCollapse && navCollapse.classList.contains('show')) {
                navCollapse.classList.remove('show');
                const toggler = document.querySelector('.navbar-toggler');
                if (toggler) toggler.setAttribute('aria-expanded', 'false');
            }
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });
    
    // Update navigation on scroll
    window.addEventListener('scroll', function() {
        updateActiveNavLink();
        updateNavbarBackground();
    }, { passive: true });
    
    // Close mobile menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });
}

// Animation functionality
function initializeAnimations() {
    // Skip reduced-motion users
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'; // smooth decelerate

    // Each group: selector, animation type, stagger-ms, duration-ms, threshold
    const groups = [
        // Section headings — fade up, no stagger
        { sel: '.section-header',      type: 'up',    dur: 650, stag: 0,   thresh: 0.1 },

        // Hero stat pills — scale up, tight stagger
        { sel: '.stat-pill',           type: 'scale', dur: 550, stag: 80,  thresh: 0.2 },

        // About photo — slide from left
        { sel: '.about-photo-wrapper', type: 'left',  dur: 700, stag: 0,   thresh: 0.15 },

        // About bio + skills — slide from right
        { sel: '.about-bio',           type: 'right', dur: 650, stag: 0,   thresh: 0.1 },
        { sel: '.about-skills-grid',   type: 'up',    dur: 600, stag: 0,   thresh: 0.1 },

        // About info cards — scale up with stagger
        { sel: '.about-info-card',     type: 'scale', dur: 500, stag: 90,  thresh: 0.15 },

        // Interest cards — slide up, staggered
        { sel: '.interest-card',       type: 'up',    dur: 560, stag: 80,  thresh: 0.1 },

        // Timeline — slide from left, staggered
        { sel: '.timeline-item',       type: 'left',  dur: 580, stag: 110, thresh: 0.08 },

        // Gemini card — scale in
        { sel: '.gemini-card-wrap',    type: 'scale', dur: 700, stag: 0,   thresh: 0.1 },

        // Cert category labels — fade only
        { sel: '.cert-category-label', type: 'fade',  dur: 500, stag: 0,   thresh: 0.2 },

        // Featured cert cards — slide up, staggered
        { sel: '.cert-featured',       type: 'up',    dur: 580, stag: 100, thresh: 0.08 },

        // Compact cert cards — slide up, staggered
        { sel: '.cert-compact-card',   type: 'up',    dur: 500, stag: 70,  thresh: 0.06 },

        // Currently-learning cards — slide up
        { sel: '#learning .cert-compact-card', type: 'up', dur: 520, stag: 75, thresh: 0.06 },

        // Project cards — slide up, staggered
        { sel: '.project-card',        type: 'up',    dur: 580, stag: 100, thresh: 0.08 },

        // Contact cards — scale up, staggered
        { sel: '.contact-card',        type: 'scale', dur: 520, stag: 80,  thresh: 0.1 },

        // Contact form
        { sel: '.contact-form-wrap',   type: 'up',    dur: 600, stag: 0,   thresh: 0.08 },
    ];

    // Starting transforms for each type
    const startTransform = {
        up:    'translateY(32px)',
        left:  'translateX(-30px)',
        right: 'translateX(30px)',
        scale: 'translateY(20px) scale(0.96)',
        fade:  'translateY(10px)',
    };

    // Build a single <style> block with all hidden states
    const selectorsByType = {};
    groups.forEach(g => {
        const t = g.type;
        if (!selectorsByType[t]) selectorsByType[t] = [];
        selectorsByType[t].push(g.sel);
    });

    let css = '';
    Object.entries(selectorsByType).forEach(([type, sels]) => {
        css += `${sels.join(', ')} { opacity: 0; transform: ${startTransform[type]}; will-change: opacity, transform; }\n`;
    });
    css += `.reveal-done { opacity: 1 !important; transform: none !important; }\n`;

    const styleTag = document.createElement('style');
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    // Create one observer per group (different thresholds)
    const seenEls = new Set(); // avoid double-observing same element

    groups.forEach(({ sel, dur, stag, thresh }) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const delay = parseFloat(el.dataset.revealDelay || 0);
                el.style.transition = `opacity ${dur}ms ${EASE} ${delay}ms, transform ${dur}ms ${EASE} ${delay}ms`;
                el.classList.add('reveal-done');
                observer.unobserve(el);
            });
        }, { threshold: thresh, rootMargin: '0px 0px -30px 0px' });

        // Group siblings within same parent for stagger
        const elements = document.querySelectorAll(sel);
        const parentMap = new Map();
        elements.forEach(el => {
            if (seenEls.has(el)) return;
            seenEls.add(el);
            const parent = el.parentElement;
            if (!parentMap.has(parent)) parentMap.set(parent, []);
            parentMap.get(parent).push(el);
        });

        parentMap.forEach(siblings => {
            siblings.forEach((el, i) => {
                el.dataset.revealDelay = i * stag;
                observer.observe(el);
            });
        });
    });
}

// Gallery functionality
function initializeGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        const img = item.querySelector('.gallery-image');
        if (img) {
            // Add click event for potential modal or lightbox
            item.addEventListener('click', function() {
                // Reserved for future lightbox implementation
            });
            
            // Add loading animation
            img.addEventListener('load', function() {
                item.classList.add('loaded');
            });
            
            // Error handling for images
            img.addEventListener('error', function() {
                console.warn('Failed to load image:', img.src);
                item.style.display = 'none';
            });
        }
    });
}

// Contact form functionality
function initializeContactForm() {
    const form        = document.getElementById('contactForm');
    const successCard = document.getElementById('contactSuccess');
    const sendAnother = document.getElementById('contactSendAnother');
    const submitBtn   = document.getElementById('cfSubmitBtn');
    if (!form) return;

    // ── Validation rules per field ────────────────────────────
    const RULES = {
        name:    { min: 2, label: 'Name',    msg: v => !v ? 'Please enter your name.' : v.length < 2 ? 'Name must be at least 2 characters.' : '' },
        email:   { label: 'Email',   msg: v => !v ? 'Please enter your email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address.' : '' },
        subject: { min: 3, label: 'Subject', msg: v => !v ? 'Please enter a subject.' : v.length < 3 ? 'Subject must be at least 3 characters.' : '' },
        message: { min: 10, label: 'Message', msg: v => !v ? 'Please write a message.' : v.length < 10 ? 'Message must be at least 10 characters.' : '' }
    };

    // ── Validate a single field, return true if OK ────────────
    function validateField(input, showFeedback) {
        const id   = input.id;
        const rule = RULES[id];
        if (!rule) return true;
        const val  = input.value.trim();
        const err  = rule.msg(val);
        const fb   = document.getElementById(id + 'Feedback');

        input.classList.remove('cf-valid', 'cf-invalid', 'cf-shake');

        if (err) {
            input.classList.add('cf-invalid');
            if (fb && showFeedback) {
                fb.textContent = err;
                fb.className   = 'cf-feedback cf-fb-error';
            }
            return false;
        } else {
            input.classList.add('cf-valid');
            if (fb) {
                fb.textContent = val ? '✓ Looks good' : '';
                fb.className   = val ? 'cf-feedback cf-fb-ok' : 'cf-feedback';
            }
            return true;
        }
    }

    // ── Attach live validation listeners ─────────────────────
    Object.keys(RULES).forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        let touched = false;

        // Show feedback only after first blur (not while fresh)
        input.addEventListener('blur', () => {
            touched = true;
            validateField(input, true);
        });
        input.addEventListener('input', () => {
            if (touched) validateField(input, true);
        });
    });

    // ── Submit handler ────────────────────────────────────────
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate all fields and collect results
        let allValid = true;
        let firstInvalid = null;
        Object.keys(RULES).forEach(id => {
            const input = document.getElementById(id);
            if (!input) return;
            const ok = validateField(input, true);
            if (!ok) {
                allValid = false;
                if (!firstInvalid) firstInvalid = input;
                // Shake animation — re-trigger by removing and re-adding
                input.classList.remove('cf-shake');
                void input.offsetWidth;
                input.classList.add('cf-shake');
                input.addEventListener('animationend', () => input.classList.remove('cf-shake'), { once: true });
            }
        });

        if (!allValid) {
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        // ── Show loading state ────────────────────────────────
        submitBtn.classList.add('is-loading');

        const data = new FormData(form);

        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        fetch(form.action, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrfToken ? csrfToken.getAttribute('content') : ''
            },
            body: data
        })
        .then(res => res.json())
        .then(json => {
            submitBtn.classList.remove('is-loading');
            if (json.success) {
                // Show success card, hide form
                form.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                form.style.opacity = '0';
                form.style.transform = 'translateY(-8px)';
                setTimeout(() => {
                    form.style.display = 'none';
                    successCard.style.display = 'block';
                    successCard.style.animation = 'none';
                    void successCard.offsetWidth;
                    successCard.style.animation = '';
                    successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            } else {
                showFormError(json.error || 'Something went wrong. Please try again.');
            }
        })
        .catch(() => {
            submitBtn.classList.remove('is-loading');
            showFormError('Network error. Please check your connection and try again.');
        });
    });

    // ── "Send another" button resets the form ─────────────────
    if (sendAnother) {
        sendAnother.addEventListener('click', () => {
            successCard.style.display = 'none';
            form.style.display = '';
            form.style.opacity = '1';
            form.style.transform = '';
            form.reset();
            Object.keys(RULES).forEach(id => {
                const input = document.getElementById(id);
                const fb    = document.getElementById(id + 'Feedback');
                if (input) input.classList.remove('cf-valid', 'cf-invalid');
                if (fb)    { fb.textContent = ''; fb.className = 'cf-feedback'; }
            });
        });
    }

    // ── File attachment widget ────────────────────────────────
    const fileInput  = document.getElementById('attachment');
    const fileLabel  = document.getElementById('cfFileLabel');
    const fileNameEl = document.getElementById('cfFileName');
    const fileClear  = document.getElementById('cfFileClear');
    const attachHint = document.getElementById('attachmentHint');

    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const MAX  = 16 * 1024 * 1024;
                if (file.size > MAX) {
                    fileNameEl.textContent = 'File too large (max 16 MB)';
                    fileLabel.classList.add('cf-file-error');
                    fileLabel.classList.remove('cf-file-ready');
                    if (attachHint) {
                        attachHint.textContent = 'Please choose a file under 16 MB.';
                        attachHint.className = 'cf-feedback cf-fb-error';
                    }
                    this.value = '';
                    if (fileClear) fileClear.style.display = 'none';
                    return;
                }
                fileNameEl.textContent = file.name;
                fileLabel.classList.remove('cf-file-error');
                fileLabel.classList.add('cf-file-ready');
                if (attachHint) {
                    attachHint.textContent = `${(file.size / 1024).toFixed(1)} KB — ready to send`;
                    attachHint.className = 'cf-feedback cf-fb-ok';
                }
                if (fileClear) fileClear.style.display = 'inline-flex';
            }
        });
        if (fileClear) {
            fileClear.addEventListener('click', () => {
                fileInput.value = '';
                fileNameEl.textContent = 'Choose a file…';
                fileLabel.classList.remove('cf-file-ready', 'cf-file-error');
                if (attachHint) { attachHint.textContent = ''; attachHint.className = 'cf-feedback'; }
                fileClear.style.display = 'none';
            });
        }
    }

    // ── Inline form-level error banner ─────────────────────────
    function showFormError(msg) {
        let banner = form.querySelector('.cf-form-error');
        if (!banner) {
            banner = document.createElement('div');
            banner.className = 'cf-form-error alert alert-danger mt-3 mb-0';
            form.appendChild(banner);
        }
        banner.textContent = msg;
        banner.style.display = 'block';
        setTimeout(() => { if (banner) banner.style.display = 'none'; }, 6000);
    }
}

// Animated achievement counters
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-counter-num');
    if (!counters.length) return;

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    function animateCounter(el) {
        const target   = parseInt(el.dataset.target, 10);
        const prefix   = el.dataset.prefix || '';
        const suffix   = el.dataset.suffix || '';
        // Use 2000–2500 ms so the count-up is clearly visible
        const duration = parseInt(el.dataset.duration, 10) || 2000;
        const bar      = el.closest('.stat-counter-card')?.querySelector('.stat-counter-bar');
        let start      = null;
        let rafId      = null;

        // Reset to zero just before animating (HTML shows final value until then)
        el.textContent = prefix + '0';
        el.classList.add('counting');

        function step(timestamp) {
            if (!start) start = timestamp;
            const elapsed  = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = easeOutQuart(progress);
            const current  = Math.round(eased * target);

            el.textContent = prefix + current + suffix;

            if (progress < 1) {
                rafId = requestAnimationFrame(step);
            } else {
                // Guarantee the exact final value is written
                el.textContent = prefix + target + suffix;
                el.classList.remove('counting');
                el.classList.add('done');
                if (bar) {
                    setTimeout(() => bar.classList.add('filled'), 100);
                }
                el.addEventListener('animationend', () => el.classList.remove('done'), { once: true });
            }
        }
        rafId = requestAnimationFrame(step);
    }

    let hasRun = false;

    function runCounters() {
        if (hasRun) return;
        hasRun = true;

        counters.forEach(el => {
            // Stagger each counter by its data-delay (default 0 / 200 / 400 ms)
            const delay = parseInt(el.dataset.delay, 10) || 0;
            setTimeout(() => animateCounter(el), delay);
        });
    }

    // Use IntersectionObserver so animation fires when the section is
    // actually visible — handles page-load overlays and mid-page visits
    const target = document.getElementById('heroCounters');
    if (!target) { runCounters(); return; }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Small buffer so the element has fully painted before we count
                setTimeout(runCounters, 150);
                observer.disconnect();
            }
        });
    }, { threshold: 0.25 });

    observer.observe(target);

    // Fallback: if the element never intersects within 4 s (e.g. hidden by CSS),
    // run the counters anyway so values are never stuck at 0
    setTimeout(() => { observer.disconnect(); runCounters(); }, 4000);
}

// Skill bars animation
// Recognition & Awards scroll reveal
function initializeRecognition() {
    const items = document.querySelectorAll('.recog-reveal');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(item => observer.observe(item));
}

// Résumé section — scroll-reveal via IntersectionObserver
function initializeResume() {
    const items = document.querySelectorAll('.resume-reveal');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Read per-item delay from inline CSS custom property
                const styleText = entry.target.getAttribute('style') || '';
                const match = styleText.match(/--resume-delay:\s*([\d.]+)s/);
                const ms = match ? parseFloat(match[1]) * 1000 : 0;
                setTimeout(() => entry.target.classList.add('resume-is-visible'), ms);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    items.forEach(item => observer.observe(item));
}

// Project screenshot carousels
function initializeProjectCarousels() {
    document.querySelectorAll('.proj-carousel').forEach(carousel => {
        const slides = carousel.querySelectorAll('.proj-slide');
        const dots   = carousel.querySelectorAll('.proj-dot');
        const prev   = carousel.querySelector('.proj-arrow-prev');
        const next   = carousel.querySelector('.proj-arrow-next');
        if (!slides.length) return;
        let current = 0;
        let isAnimating = false;

        function goTo(n) {
            if (isAnimating || n === current) return;
            isAnimating = true;
            slides[current].classList.remove('is-active');
            dots[current].classList.remove('is-active');
            dots[current].setAttribute('aria-selected', 'false');
            current = ((n % slides.length) + slides.length) % slides.length;
            slides[current].classList.add('is-active');
            dots[current].classList.add('is-active');
            dots[current].setAttribute('aria-selected', 'true');
            setTimeout(() => { isAnimating = false; }, 460);
        }

        if (prev) prev.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); goTo(current - 1); });
        if (next) next.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); goTo(current + 1); });

        dots.forEach((dot, i) => {
            dot.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); goTo(i); });
        });

        // Touch / swipe support
        let touchStartX = 0;
        let touchStartY = 0;
        carousel.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        carousel.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                goTo(dx < 0 ? current + 1 : current - 1);
            }
        }, { passive: true });

        // Keyboard: left/right arrows when carousel is focused
        carousel.setAttribute('tabindex', '0');
        carousel.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
        });
    });
}

function initializeSkillBars() {
    const fills = document.querySelectorAll('.skill-bar-fill');
    if (!fills.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
            if (!entry.isIntersecting) return;
            const fill = entry.target;
            const pct  = fill.style.getPropertyValue('--pct') || '0%';
            // Stagger each bar by 80ms
            const delay = idx * 80;
            setTimeout(() => {
                fill.style.width = pct;
                fill.classList.add('is-filled');
            }, delay);
            observer.unobserve(fill);
        });
    }, { threshold: 0.3, rootMargin: '0px 0px -40px 0px' });

    // Observe all fills together so stagger is relative to the grid entering view
    const grid = document.getElementById('skillsBarsGrid');
    if (grid) {
        const gridObserver = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            fills.forEach((fill, i) => {
                const pct = fill.style.getPropertyValue('--pct') || '0%';
                setTimeout(() => {
                    fill.style.width = pct;
                    fill.classList.add('is-filled');
                }, i * 100);
            });
            gridObserver.unobserve(grid);
        }, { threshold: 0.25 });
        gridObserver.observe(grid);
    } else {
        fills.forEach(f => observer.observe(f));
    }
}

// Scroll effects
function initializeScrollEffects() {
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-section');
    
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            
            if (scrolled < window.innerHeight) {
                const content = heroSection.querySelector('.hero-content');
                if (content) {
                    content.style.transform = `translateY(${rate}px)`;
                    content.style.opacity = 1 - (scrolled / window.innerHeight);
                }
            }
        }, { passive: true });
    }

    // Scroll progress bar is handled by the dedicated #scroll-progress-bar element (see bottom IIFE)
    
    // Back to top button
    createBackToTopButton();
    
    function createBackToTopButton() {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTopBtn.className = 'btn btn-info btn-floating';
        backToTopBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: none;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
        `;
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Show/hide based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 500) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        }, { passive: true });
        
        document.body.appendChild(backToTopBtn);
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization for scroll events
const debouncedScrollHandler = debounce(function() {
    // Any expensive scroll operations can go here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler, { passive: true });

// ── Neural Network Particle Background ───────────────
function initializeParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const isMobile = window.innerWidth < 600;

    // Counts
    const NEURON_COUNT   = isMobile ? 7  : 12;   // hub nodes
    const PARTICLE_COUNT = isMobile ? 28 : 58;   // regular drifting nodes
    const CONNECT_DIST   = isMobile ? 120 : 165; // regular connections
    const NEURON_DIST    = isMobile ? 200 : 280; // neuron-to-neuron connections
    const REPEL_DIST     = 110;
    const ATTRACT_DIST   = 180;
    const MAX_SPEED      = 1.2;
    const BASE_SPEED     = 0.36;
    const DAMPEN         = 0.97;

    // Brand palette — cyan → violet
    const COLORS = [
        { h: 192, s: 100, l: 60 },
        { h: 210, s:  90, l: 65 },
        { h: 230, s:  85, l: 65 },
        { h: 260, s:  75, l: 65 },
        { h: 275, s:  70, l: 62 },
    ];
    const randColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

    // ── Neuron hub nodes ─────────────────────────────
    const neurons = Array.from({ length: NEURON_COUNT }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = BASE_SPEED * 0.28;
        const c = randColor();
        return {
            x: canvas.width  * (0.1 + Math.random() * 0.8),
            y: canvas.height * (0.1 + Math.random() * 0.8),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: Math.random() * 1.8 + 2.8,
            alpha: 0.75 + Math.random() * 0.2,
            c,
            pulsePhase: Math.random() * Math.PI * 2,
            ringPhase:  Math.random() * Math.PI * 2,
        };
    });

    // ── Regular drifting nodes ────────────────────────
    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = BASE_SPEED * (0.5 + Math.random());
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: Math.random() * 1.4 + 0.5,
            alpha: Math.random() * 0.3 + 0.12,
            c: randColor(),
            pulsePhase: Math.random() * Math.PI * 2,
        };
    });

    // ── Signal pulses (travel along neuron connections) ─
    const pulses = [];
    function maybeSpawnPulse() {
        if (pulses.length >= (isMobile ? 6 : 14)) return;
        for (let i = 0; i < neurons.length; i++) {
            for (let j = i + 1; j < neurons.length; j++) {
                const dx = neurons[i].x - neurons[j].x;
                const dy = neurons[i].y - neurons[j].y;
                if (Math.sqrt(dx*dx + dy*dy) < NEURON_DIST && Math.random() < 0.012) {
                    pulses.push({
                        from: neurons[i], to: neurons[j],
                        prog: 0,
                        spd: 0.004 + Math.random() * 0.007,
                        c: Math.random() < 0.5 ? neurons[i].c : neurons[j].c,
                        rev: Math.random() < 0.5,
                    });
                }
            }
        }
    }

    // Mouse / touch
    const mouse = { x: null, y: null, down: false };
    window.addEventListener('mousemove',  e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    window.addEventListener('mousedown',  () => { mouse.down = true; });
    window.addEventListener('mouseup',    () => { mouse.down = false; });

    window.addEventListener('touchmove', e => {
        const t = e.touches[0];
        mouse.x = t.clientX; mouse.y = t.clientY;
    }, { passive: true });
    window.addEventListener('touchend',  () => { mouse.x = null; mouse.y = null; });
    window.addEventListener('touchstart', e => {
        const t = e.touches[0];
        bursts.push({ x: t.clientX, y: t.clientY, r: 0, alpha: 0.6 });
        [...neurons, ...particles].forEach(p => {
            const dx = p.x - t.clientX, dy = p.y - t.clientY;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < 180 && d > 0) { const f = (180-d)/180*3; p.vx += dx/d*f; p.vy += dy/d*f; }
        });
    }, { passive: true });

    // Click burst
    const bursts = [];
    window.addEventListener('click', e => {
        bursts.push({ x: e.clientX, y: e.clientY, r: 0, alpha: 0.6 });
        [...neurons, ...particles].forEach(p => {
            const dx = p.x - e.clientX, dy = p.y - e.clientY;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < 180 && d > 0) { const f = (180-d)/180*3.5; p.vx += dx/d*f; p.vy += dy/d*f; }
        });
    });

    // ── Hex grid — baked to offscreen canvas (drawn once, reused every frame) ──
    let hexCache = null;
    function buildHexCache() {
        if (!canvas.width || !canvas.height) return;  // skip before layout is ready
        hexCache = document.createElement('canvas');
        hexCache.width  = canvas.width;
        hexCache.height = canvas.height;
        const hx = hexCache.getContext('2d');
        const size = 55, w = size * Math.sqrt(3), h = size * 2;
        hx.strokeStyle = 'rgba(0,212,255,0.028)';
        hx.lineWidth = 0.6;
        for (let col = -1; col < canvas.width / w + 1; col++) {
            for (let row = -1; row < canvas.height / (h * 0.75) + 1; row++) {
                const cx = col * w + (row % 2) * (w / 2);
                const cy = row * h * 0.75;
                hx.beginPath();
                for (let side = 0; side < 6; side++) {
                    const angle = Math.PI / 180 * (60 * side - 30);
                    const px = cx + size * Math.cos(angle);
                    const py = cy + size * Math.sin(angle);
                    side === 0 ? hx.moveTo(px, py) : hx.lineTo(px, py);
                }
                hx.closePath();
                hx.stroke();
            }
        }
    }
    buildHexCache();
    window.addEventListener('resize', buildHexCache);

    function drawHexGrid() {
        if (!hexCache || !hexCache.width || !hexCache.height) buildHexCache();
        if (hexCache && hexCache.width > 0 && hexCache.height > 0) {
            ctx.drawImage(hexCache, 0, 0);
        }
    }

    // ── Scroll-reactive section themes ───────────────────────
    // 7 sections × 4 properties — all blend smoothly as you scroll.
    const SECTION_IDS = ['home', 'gallery', 'interests', 'journey', 'certificates', 'projects', 'contact'];
    const THEMES = [
        // home       — Neural network: full cyan-violet, crisp, normal
        { hueShift:   0, connOp: 0.85, ringScale: 1.00, pulseSpd: 1.00 },
        // gallery    — Data streams: deep violet, slower, expanded rings
        { hueShift:  45, connOp: 0.55, ringScale: 1.20, pulseSpd: 0.55 },
        // interests  — Constellation: warm amber, sparse connections, dreamy
        { hueShift:  90, connOp: 0.35, ringScale: 0.75, pulseSpd: 0.40 },
        // journey    — Flow: teal-green, strong connections, steady pulses
        { hueShift: 145, connOp: 0.80, ringScale: 1.15, pulseSpd: 1.15 },
        // certs      — Achievement: golden amber, glowing rings
        { hueShift:  55, connOp: 0.90, ringScale: 1.45, pulseSpd: 0.80 },
        // projects   — Code: lime green, crisp pulses
        { hueShift: 148, connOp: 0.75, ringScale: 1.00, pulseSpd: 1.20 },
        // contact    — Convergence: pink-magenta, soft, slow, wide rings
        { hueShift: -30, connOp: 0.48, ringScale: 1.35, pulseSpd: 0.50 },
    ];

    // Live theme (drawn) — lerps toward tgt each frame
    let theme = { hueShift: 0, connOp: 1.0, ringScale: 1.0, pulseSpd: 1.0 };
    let tgt   = { ...theme };

    function lerpVal(a, b, f) { return a + (b - a) * f; }

    function updateScrollTheme() {
        const sy  = window.scrollY;
        const els = SECTION_IDS.map(id => document.getElementById(id));
        let idx = 0, frac = 0;

        // Find which section the viewport mid-point is in
        for (let i = 0; i < els.length; i++) {
            if (!els[i]) continue;
            const top = els[i].getBoundingClientRect().top + sy;
            if (sy + window.innerHeight * 0.45 >= top) idx = i;
        }

        // Compute how far through this section we are (0→1), toward the next
        const cur = els[idx];
        const nxt = els[Math.min(idx + 1, els.length - 1)];
        if (cur && nxt && cur !== nxt) {
            const curTop = cur.getBoundingClientRect().top + sy;
            const nxtTop = nxt.getBoundingClientRect().top + sy;
            frac = Math.max(0, Math.min(1,
                (sy + window.innerHeight * 0.45 - curTop) / (nxtTop - curTop)
            ));
        }

        const A = THEMES[idx];
        const B = THEMES[Math.min(idx + 1, THEMES.length - 1)];
        tgt.hueShift  = lerpVal(A.hueShift,  B.hueShift,  frac);
        tgt.connOp    = lerpVal(A.connOp,    B.connOp,    frac);
        tgt.ringScale = lerpVal(A.ringScale, B.ringScale, frac);
        tgt.pulseSpd  = lerpVal(A.pulseSpd,  B.pulseSpd,  frac);
    }

    window.addEventListener('scroll', updateScrollTheme, { passive: true });
    updateScrollTheme(); // set initial theme based on current scroll

    let t = 0;

    function moveNode(p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0)             { p.x = 0;            p.vx =  Math.abs(p.vx); }
        if (p.x > canvas.width)  { p.x = canvas.width; p.vx = -Math.abs(p.vx); }
        if (p.y < 0)             { p.y = 0;            p.vy =  Math.abs(p.vy); }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy = -Math.abs(p.vy); }
        if (mouse.x !== null) {
            const dx = p.x - mouse.x, dy = p.y - mouse.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < REPEL_DIST && d > 0) {
                const f = ((REPEL_DIST-d)/REPEL_DIST) * (mouse.down ? 0.85 : 0.5);
                p.vx += dx/d*f; p.vy += dy/d*f;
            } else if (d < ATTRACT_DIST && d > REPEL_DIST) {
                const f = ((ATTRACT_DIST-d)/ATTRACT_DIST) * 0.035;
                p.vx -= dx/d*f; p.vy -= dy/d*f;
            }
        }
        const spd = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        if (spd > MAX_SPEED) { p.vx = p.vx/spd*MAX_SPEED; p.vy = p.vy/spd*MAX_SPEED; }
        if (spd > BASE_SPEED) { p.vx *= DAMPEN; p.vy *= DAMPEN; }
    }

    function drawGlowDot(p, radiusMult, alphaBoost) {
        const pulse = Math.sin(t * 1.4 + p.pulsePhase) * 0.35 + 1;
        const r = p.r * pulse * (radiusMult || 1);
        const h = (p.c.h + theme.hueShift + 360) % 360;   // scroll-reactive hue
        const { s, l } = p.c;
        const a = Math.min(1, p.alpha + (alphaBoost || 0));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.5);
        g.addColorStop(0,   `hsla(${h},${s}%,${l}%,${a})`);
        g.addColorStop(0.4, `hsla(${h},${s}%,${l}%,${a*0.35})`);
        g.addColorStop(1,   `hsla(${h},${s}%,${l}%,0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, r*3.5, 0, Math.PI*2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${h},${s}%,${l+12}%,${a+0.1})`;
        ctx.fill();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t += 0.011;

        // Smoothly lerp live theme toward scroll target (0.022 = ~45 frames to settle)
        const TF = 0.022;
        theme.hueShift  += (tgt.hueShift  - theme.hueShift)  * TF;
        theme.connOp    += (tgt.connOp    - theme.connOp)    * TF;
        theme.ringScale += (tgt.ringScale - theme.ringScale) * TF;
        theme.pulseSpd  += (tgt.pulseSpd  - theme.pulseSpd)  * TF;

        // 1. Hex grid
        drawHexGrid();

        // 2. Burst rings
        for (let i = bursts.length - 1; i >= 0; i--) {
            const b = bursts[i];
            b.r += 5; b.alpha -= 0.017;
            if (b.alpha <= 0) { bursts.splice(i, 1); continue; }
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
            const brstH = (192 + theme.hueShift + 360) % 360;
            ctx.strokeStyle = `hsla(${brstH},100%,60%,${b.alpha})`; ctx.lineWidth = 1.5; ctx.stroke();
        }

        // 3. Neuron-to-neuron connections (brighter, thicker)
        for (let i = 0; i < neurons.length; i++) {
            for (let j = i + 1; j < neurons.length; j++) {
                const a = neurons[i], b = neurons[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                if (d < NEURON_DIST) {
                    const op = (1 - d/NEURON_DIST) * 0.38 * theme.connOp;
                    const ah = (a.c.h + theme.hueShift + 360) % 360;
                    const bh = (b.c.h + theme.hueShift + 360) % 360;
                    const lg = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
                    lg.addColorStop(0, `hsla(${ah},${a.c.s}%,${a.c.l}%,${op})`);
                    lg.addColorStop(1, `hsla(${bh},${b.c.s}%,${b.c.l}%,${op})`);
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = lg; ctx.lineWidth = 1.1; ctx.stroke();
                }
            }
        }

        // 4. Regular particle connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                if (d < CONNECT_DIST) {
                    const op = (1 - d/CONNECT_DIST) * 0.16 * theme.connOp;
                    const ah = (a.c.h + theme.hueShift + 360) % 360;
                    const bh = (b.c.h + theme.hueShift + 360) % 360;
                    const lg = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
                    lg.addColorStop(0, `hsla(${ah},${a.c.s}%,${a.c.l}%,${op})`);
                    lg.addColorStop(1, `hsla(${bh},${b.c.s}%,${b.c.l}%,${op})`);
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = lg; ctx.lineWidth = 0.5; ctx.stroke();
                }
            }
        }

        // 5. Signal pulses along neuron connections
        maybeSpawnPulse();
        for (let i = pulses.length - 1; i >= 0; i--) {
            const p = pulses[i];
            p.prog += p.spd * theme.pulseSpd;
            if (p.prog >= 1) { pulses.splice(i, 1); continue; }
            const frac = p.rev ? 1 - p.prog : p.prog;
            const px = p.from.x + (p.to.x - p.from.x) * frac;
            const py = p.from.y + (p.to.y - p.from.y) * frac;
            const ease = Math.sin(p.prog * Math.PI);
            const h = (p.c.h + theme.hueShift + 360) % 360;
            const { s, l } = p.c;
            const gr = ctx.createRadialGradient(px, py, 0, px, py, 10);
            gr.addColorStop(0,   `hsla(${h},${s}%,${l+15}%,${0.9*ease})`);
            gr.addColorStop(0.5, `hsla(${h},${s}%,${l}%,${0.4*ease})`);
            gr.addColorStop(1,   `hsla(${h},${s}%,${l}%,0)`);
            ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI*2);
            ctx.fillStyle = gr; ctx.fill();
            ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI*2);
            ctx.fillStyle = `hsla(${h},${s}%,95%,${0.95*ease})`; ctx.fill();
        }

        // 6. Regular particles
        particles.forEach(p => { moveNode(p); drawGlowDot(p); });

        // 7. Neuron hubs (on top, with animated ring)
        neurons.forEach(n => {
            moveNode(n);
            // Outer animated ring
            const rScale = Math.sin(t * 1.1 + n.ringPhase) * 0.3 + 1;
            const ringR  = n.r * 4.5 * rScale * theme.ringScale;
            const ringA  = (Math.sin(t * 1.1 + n.ringPhase) * 0.15 + 0.25);
            const nh = (n.c.h + theme.hueShift + 360) % 360;
            ctx.beginPath(); ctx.arc(n.x, n.y, ringR, 0, Math.PI*2);
            ctx.strokeStyle = `hsla(${nh},${n.c.s}%,${n.c.l}%,${ringA})`;
            ctx.lineWidth = 0.8; ctx.stroke();
            // Core glow (brighter than regular dots)
            drawGlowDot(n, 1.4, 0.15);
        });

        if (!document.hidden) requestAnimationFrame(draw);
    }

    // Pause canvas loop when tab is in background — saves battery on mobile
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) requestAnimationFrame(draw);
    });

    draw();
}

initializeParticles();

// Loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Add fade-in animation to hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        setTimeout(() => {
            heroContent.classList.add('fade-in');
        }, 300);
    }
});

// Error handling for any JavaScript errors
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could implement error reporting here
});

/* ─────────── Certificate / PDF Loading Overlay (Random Animation) ─────────── */
(function () {
    const loader = document.getElementById('pdfLoader');
    if (!loader) return;

    const stage = document.getElementById('pdfAnimStage');
    const anims = stage ? stage.querySelectorAll('.pdf-anim') : [];
    const SHOW_MS = 1200;
    let hideTimer = null;
    let lastIndex = -1;

    function pickRandomAnim() {
        if (!anims.length) return;
        // Avoid repeating the same animation twice in a row
        let i;
        do {
            i = Math.floor(Math.random() * anims.length);
        } while (anims.length > 1 && i === lastIndex);
        lastIndex = i;
        anims.forEach(a => a.classList.remove('is-active'));
        anims[i].classList.add('is-active');
    }

    function showLoader() {
        clearTimeout(hideTimer);
        pickRandomAnim();
        loader.classList.add('is-active');
        loader.setAttribute('aria-hidden', 'false');
        hideTimer = setTimeout(hideLoader, SHOW_MS);
    }
    function hideLoader() {
        loader.classList.remove('is-active');
        loader.setAttribute('aria-hidden', 'true');
    }

    // Trigger on any link that opens a certificate / PDF
    const OPEN_DELAY = 850; // show animation first, then open PDF tab
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href') || '';
        if (!href || href === '#') return;

        const isCert = href.includes('/certificate/') || href.includes('view_cert');
        const isPdf  = /\.pdf($|\?)/i.test(href);
        const isCvDownload = link.hasAttribute('download'); // skip CV (downloads instantly)
        if (!(isCert || isPdf) || isCvDownload) return;

        // Stop the browser from opening the tab instantly so the user sees the animation
        e.preventDefault();
        const target = link.getAttribute('target') || '_blank';
        showLoader();
        setTimeout(function () {
            window.open(href, target);
        }, OPEN_DELAY);
    });

    // Hide overlay if user comes back to the tab
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) hideLoader();
    });
    // Hide on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') hideLoader();
    });
})();


/* ═══════════════════════════════════════════════════════════════
   Unique Features: Scroll Progress · Command Palette · Floating CTA · Cursor Glow
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── Scroll progress bar ─────────────────────────────────────
    var progressBar = document.getElementById('scroll-progress-bar');
    function updateProgress() {
        if (!progressBar) return;
        var doc   = document.documentElement;
        var total = doc.scrollHeight - doc.clientHeight;
        var pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
        progressBar.style.width = Math.min(pct, 100) + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    // ── Cursor spotlight ────────────────────────────────────────
    if (window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', function (e) {
            document.body.style.setProperty('--cx', e.clientX + 'px');
            document.body.style.setProperty('--cy', e.clientY + 'px');
        }, { passive: true });
        document.addEventListener('mouseleave', function () {
            document.body.style.setProperty('--cx', '-9999px');
            document.body.style.setProperty('--cy', '-9999px');
        });
    }

    // ── Floating "Available" CTA ────────────────────────────────
    var floatingCta = document.getElementById('floatingCta');
    function toggleFloatingCta() {
        if (!floatingCta) return;
        if (window.scrollY > 400) {
            floatingCta.classList.add('cta-visible');
        } else {
            floatingCta.classList.remove('cta-visible');
        }
    }
    window.addEventListener('scroll', toggleFloatingCta, { passive: true });
    toggleFloatingCta();

    // ── Command Palette ─────────────────────────────────────────
    var overlay    = document.getElementById('cmdPalette');
    var inputEl    = document.getElementById('cmdInput');
    var resultsEl  = document.getElementById('cmdResults');
    var navBtn     = document.getElementById('cmdPaletteBtn');
    var activeIdx  = -1;

    // Only initialise on pages that contain the palette HTML
    if (!overlay || !inputEl || !resultsEl) return;

    // All commands
    var CMD = [
        // Navigate
        { group: 'Navigate', icon: 'fas fa-house',         title: 'Home',               desc: 'Back to the top',                    action: function() { scrollTo('#home'); } },
        { group: 'Navigate', icon: 'fas fa-user',          title: 'About Me',            desc: 'Skills, background & photo',         action: function() { scrollTo('#gallery'); } },
        { group: 'Navigate', icon: 'fas fa-heart',         title: 'Interests',           desc: 'What I love',                        action: function() { scrollTo('#interests'); } },
        { group: 'Navigate', icon: 'fas fa-road',          title: 'Journey',             desc: 'My education timeline',              action: function() { scrollTo('#journey'); } },
        { group: 'Navigate', icon: 'fas fa-briefcase',     title: 'Experience',          desc: 'Roles & responsibilities',           action: function() { scrollTo('#experience'); } },
        { group: 'Navigate', icon: 'fas fa-certificate',   title: 'Certifications',      desc: '20+ industry certificates',          action: function() { scrollTo('#certificates'); } },
        { group: 'Navigate', icon: 'fas fa-brain',         title: 'Currently Learning',  desc: 'LangChain, RAG, Fine-tuning…',       action: function() { scrollTo('#learning'); } },
        { group: 'Navigate', icon: 'fas fa-rocket',        title: 'Projects',            desc: 'AI & web projects',                  action: function() { scrollTo('#projects'); } },
        { group: 'Navigate', icon: 'fas fa-trophy',        title: 'Recognition',         desc: 'Awards & achievements',              action: function() { scrollTo('#recognition'); } },
        { group: 'Navigate', icon: 'fas fa-file-lines',    title: 'Résumé',              desc: 'Download & view CV',                 action: function() { scrollTo('#resume'); } },
        { group: 'Navigate', icon: 'fas fa-envelope',      title: 'Contact',             desc: 'Send me a message',                  action: function() { scrollTo('#contact'); } },
        // Actions
        { group: 'Actions',  icon: 'fas fa-file-arrow-down', title: 'Download Resume',   desc: 'Opens printable resume page',        action: function() { window.open('/resume', '_blank'); } },
        { group: 'Actions',  icon: 'fab fa-linkedin',        title: 'View LinkedIn',     desc: 'linkedin.com/in/arjun-pv1312',       action: function() { window.open('https://www.linkedin.com/in/arjun-pv1312', '_blank'); } },
        { group: 'Actions',  icon: 'fas fa-copy',            title: 'Copy Email Address',desc: 'Pvarjun527@gmail.com',               action: function() { copyEmail(); } },
        { group: 'Actions',  icon: 'fas fa-circle-half-stroke', title: 'Toggle Theme',   desc: 'Switch dark / light mode',           action: function() { var b = document.getElementById('themeToggleBtn'); if (b) b.click(); } },
        { group: 'Actions',  icon: 'fas fa-arrow-up-to-line',  title: 'Back to Top',     desc: 'Scroll to top of page',              action: function() { window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    ];

    function scrollTo(hash) {
        var el = document.querySelector(hash);
        if (el) {
            var offset = 72;
            var y = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
        closeCmd();
    }

    function copyEmail() {
        var email = 'Pvarjun527@gmail.com';
        if (navigator.clipboard) {
            navigator.clipboard.writeText(email).then(function () { showCopiedToast(email); });
        } else {
            var ta = document.createElement('textarea');
            ta.value = email;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showCopiedToast(email);
        }
        closeCmd();
    }

    function showCopiedToast(text) {
        var t = document.createElement('div');
        t.textContent = '✓ Copied: ' + text;
        t.style.cssText = [
            'position:fixed', 'bottom:5rem', 'left:50%', 'transform:translateX(-50%)',
            'background:#0f172a', 'color:#4ade80', 'border:1px solid rgba(74,222,128,0.3)',
            'border-radius:8px', 'padding:.55rem 1.2rem', 'font-size:.82rem',
            'font-weight:600', 'z-index:99999', 'pointer-events:none',
            'box-shadow:0 4px 20px rgba(0,0,0,0.4)',
            'animation:fadeInUp .2s ease',
        ].join(';');
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 2200);
    }

    function highlight(text, query) {
        if (!query) return escHtml(text);
        var re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        return escHtml(text).replace(re, '<span class="cmd-match">$1</span>');
    }
    function escHtml(s) { return s.replace(/[&<>"]/g, function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]);}); }

    function renderResults(query) {
        activeIdx = -1;
        var q     = (query || '').toLowerCase().trim();
        var items = q ? CMD.filter(function (c) {
            return (c.title + ' ' + c.desc + ' ' + c.group).toLowerCase().indexOf(q) !== -1;
        }) : CMD;

        if (!items.length) { resultsEl.innerHTML = ''; return; }

        var html   = '';
        var groups = [];
        var seen   = {};
        items.forEach(function(c){ if (!seen[c.group]){ groups.push(c.group); seen[c.group]=true; } });

        groups.forEach(function (g) {
            html += '<div class="cmd-group-label">' + escHtml(g) + '</div>';
            items.filter(function(c){ return c.group === g; }).forEach(function (c, i) {
                var globalIdx = items.indexOf(c);
                html += '<button class="cmd-item" role="option" data-idx="' + globalIdx + '">' +
                    '<span class="cmd-item-icon"><i class="' + escHtml(c.icon) + '"></i></span>' +
                    '<span class="cmd-item-body">' +
                        '<span class="cmd-item-title">' + highlight(c.title, q) + '</span>' +
                        '<span class="cmd-item-desc">'  + highlight(c.desc,  q) + '</span>' +
                    '</span>' +
                '</button>';
            });
        });

        resultsEl.innerHTML = html;

        resultsEl.querySelectorAll('.cmd-item').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(btn.getAttribute('data-idx'), 10);
                if (items[idx]) items[idx].action();
            });
            btn.addEventListener('mouseenter', function () {
                clearActive();
                btn.classList.add('cmd-active');
                activeIdx = parseInt(btn.getAttribute('data-idx'), 10);
            });
        });
    }

    function clearActive() {
        resultsEl.querySelectorAll('.cmd-item').forEach(function(b){ b.classList.remove('cmd-active'); });
    }

    function navigateItems(dir) {
        var btns = Array.from(resultsEl.querySelectorAll('.cmd-item'));
        if (!btns.length) return;
        clearActive();
        var curIdx = btns.findIndex(function(b){ return b.getAttribute('data-idx') === String(activeIdx); });
        var next   = curIdx + dir;
        if (next < 0) next = btns.length - 1;
        if (next >= btns.length) next = 0;
        btns[next].classList.add('cmd-active');
        activeIdx = parseInt(btns[next].getAttribute('data-idx'), 10);
        btns[next].scrollIntoView({ block: 'nearest' });
    }

    function openCmd() {
        overlay.classList.add('cmd-open');
        overlay.setAttribute('aria-hidden', 'false');
        inputEl.value = '';
        renderResults('');
        setTimeout(function(){ inputEl.focus(); }, 30);
        document.body.style.overflow = 'hidden';
    }

    function closeCmd() {
        overlay.classList.remove('cmd-open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        activeIdx = -1;
    }

    function selectActive() {
        var filtered = activeIdx === -1 ? null : CMD[activeIdx];
        if (filtered) { filtered.action(); return; }
        // fallback: activate first visible item
        var first = resultsEl.querySelector('.cmd-item');
        if (first) first.click();
    }

    // Keyboard: open
    document.addEventListener('keydown', function (e) {
        var meta = e.metaKey || e.ctrlKey;
        if (meta && e.key === 'k') {
            e.preventDefault();
            overlay.classList.contains('cmd-open') ? closeCmd() : openCmd();
            return;
        }
        if (!overlay.classList.contains('cmd-open')) return;
        if (e.key === 'Escape')    { e.preventDefault(); closeCmd(); }
        else if (e.key === 'ArrowDown')  { e.preventDefault(); navigateItems(1); }
        else if (e.key === 'ArrowUp')    { e.preventDefault(); navigateItems(-1); }
        else if (e.key === 'Enter')      { e.preventDefault(); selectActive(); }
    });

    // Click overlay backdrop to close
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeCmd(); });

    // Navbar button
    if (navBtn) navBtn.addEventListener('click', openCmd);

    // Search input
    inputEl.addEventListener('input', function () { renderResults(inputEl.value); activeIdx = -1; });

    // Fade-in-up keyframe (used by toast)
    if (!document.getElementById('cmdExtraKf')) {
        var s = document.createElement('style');
        s.id  = 'cmdExtraKf';
        s.textContent = '@keyframes fadeInUp{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
        document.head.appendChild(s);
    }
})();

// ═══════════════════════════════════════════════════════════
//  GLOBAL SAFETY NET — catches every unhandled JS error so
//  a broken animation / feature never crashes the whole page
// ═══════════════════════════════════════════════════════════
(function () {
    'use strict';

    // ── 1. Window-level error catcher ────────────────────────
    window.onerror = function (msg, src, line, col, err) {
        console.warn('[Safety] Uncaught error:', msg, 'at', src + ':' + line);
        return true; // suppress default browser error overlay
    };

    // ── 2. Unhandled promise rejections ──────────────────────
    window.addEventListener('unhandledrejection', function (e) {
        console.warn('[Safety] Unhandled promise rejection:', e.reason);
        e.preventDefault();
    });

    // ── 3. Image load error graceful fallback ────────────────
    document.addEventListener('error', function (e) {
        if (e.target && e.target.tagName === 'IMG') {
            if (!e.target.dataset.errHandled) {
                e.target.dataset.errHandled = '1';
                e.target.style.opacity = '0.3';
                e.target.alt = e.target.alt || 'Image unavailable';
            }
        }
    }, true);

    // ── 6. Network reconnect banner ──────────────────────────
    var _banner = null;
    function showOfflineBanner() {
        if (_banner) return;
        _banner = document.createElement('div');
        _banner.id = 'offlineBanner';
        Object.assign(_banner.style, {
            position: 'fixed', bottom: '1.5rem', left: '50%',
            transform: 'translateX(-50%)', zIndex: '9999',
            background: 'rgba(18,24,38,0.96)',
            border: '1px solid rgba(239,68,68,0.6)',
            borderRadius: '2rem', padding: '0.6rem 1.4rem',
            color: '#fca5a5', fontSize: '0.875rem',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 24px rgba(239,68,68,0.18)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            animation: 'fadeInUp 0.3s ease both',
        });
        _banner.innerHTML = '<span style="font-size:1rem">&#9888;</span> You\'re offline — check your connection';
        document.body.appendChild(_banner);
    }
    function hideOfflineBanner() {
        if (_banner) {
            _banner.style.animation = 'none';
            _banner.style.opacity   = '0';
            _banner.style.transition = 'opacity 0.3s';
            setTimeout(function () {
                if (_banner && _banner.parentNode) _banner.parentNode.removeChild(_banner);
                _banner = null;
            }, 350);
        }
    }
    window.addEventListener('offline',  showOfflineBanner, { passive: true });
    window.addEventListener('online',   function () {
        hideOfflineBanner();
        // show reconnected toast
        var t = document.createElement('div');
        Object.assign(t.style, {
            position: 'fixed', bottom: '1.5rem', left: '50%',
            transform: 'translateX(-50%)', zIndex: '9999',
            background: 'rgba(18,24,38,0.96)',
            border: '1px solid rgba(0,212,255,0.4)',
            borderRadius: '2rem', padding: '0.6rem 1.4rem',
            color: '#67e8f9', fontSize: '0.875rem',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 24px rgba(0,212,255,0.15)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            animation: 'fadeInUp 0.3s ease both',
        });
        t.innerHTML = '<span style="font-size:1rem">&#10003;</span> Back online!';
        document.body.appendChild(t);
        setTimeout(function () {
            t.style.opacity = '0';
            t.style.transition = 'opacity 0.4s';
            setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 450);
        }, 2500);
    }, { passive: true });

})();

// ── Alternating project card slide directions ─────────────────────────────
// Mark odd cards as 'left', even cards as 'right' so the CSS can target them
(function () {
    function tagProjectCards() {
        var cards = document.querySelectorAll('.project-card');
        cards.forEach(function (card, i) {
            card.setAttribute('data-proj-alt', i % 2 === 0 ? 'left' : 'right');
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tagProjectCards);
    } else {
        tagProjectCards();
    }
})();

/* ── Certificate category filter ─────────────────────── */
(function () {
    var bar = document.querySelector('.cert-filter-bar');
    if (!bar) return;
    var groups = document.querySelectorAll('.cert-group');
    var btns   = bar.querySelectorAll('.cert-filter-btn');

    btns.forEach(function (b) {
        b.setAttribute('role', 'button');
        b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false');
        b.setAttribute('tabindex', '0');
    });

    function applyFilter(filter) {
        btns.forEach(function (b) {
            var on = b.dataset.filter === filter;
            b.classList.toggle('active', on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        groups.forEach(function (g) {
            var show = filter === 'all' || g.dataset.cat === filter;
            g.classList.toggle('cert-hidden', !show);
        });
    }

    bar.addEventListener('click', function (e) {
        var btn = e.target.closest('.cert-filter-btn');
        if (btn) applyFilter(btn.dataset.filter);
    });

    bar.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            var btn = e.target.closest('.cert-filter-btn');
            if (btn) { e.preventDefault(); applyFilter(btn.dataset.filter); }
        }
    });
})();

/* ── Certificate lightbox ────────────────────────────────────── */
(function () {
    var lb      = document.getElementById('certLightbox');
    var lbImg   = lb && lb.querySelector('.cert-lightbox-img');
    var lbClose = lb && lb.querySelector('.cert-lightbox-close');
    if (!lb || !lbImg) return;

    function openLightbox(src, alt) {
        lbImg.src = src;
        lbImg.alt = alt || 'Certificate';
        lb.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        if (lbClose) lbClose.focus();
    }
    function closeLightbox() {
        lb.classList.remove('is-open');
        document.body.style.overflow = '';
        lbImg.src = '';
    }

    document.addEventListener('click', function (e) {
        /* Enlarge button */
        var btn = e.target.closest('.cert-enlarge-btn');
        if (btn) {
            var card = btn.closest('.cert-grid-card');
            if (card && card.dataset.img) {
                e.preventDefault();
                openLightbox(card.dataset.img, card.dataset.alt);
            }
            return;
        }
        /* Click directly on the image thumbnail */
        var img = e.target.closest('.cert-thumb--img');
        if (img) {
            var card2 = img.closest('.cert-grid-card');
            if (card2 && card2.dataset.img) {
                e.preventDefault();
                openLightbox(card2.dataset.img, card2.dataset.alt);
            }
        }
    });

    /* Close on overlay click or close button */
    lb.addEventListener('click', function (e) {
        if (e.target === lb || e.target.closest('.cert-lightbox-close')) {
            closeLightbox();
        }
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lb.classList.contains('is-open')) {
            closeLightbox();
        }
    });
})();

/* ── Cert filter: smooth animation on reveal (appended, runs after existing handler) */
(function () {
    var bar = document.querySelector('.cert-filter-bar');
    if (!bar) return;
    var groups = document.querySelectorAll('.cert-group');
    bar.addEventListener('click', function (e) {
        if (!e.target.closest('.cert-filter-btn')) return;
        requestAnimationFrame(function () {
            groups.forEach(function (g) {
                if (!g.classList.contains('cert-hidden')) {
                    g.classList.remove('cert-anim');
                    void g.offsetWidth;
                    g.classList.add('cert-anim');
                }
            });
        });
    });
})();

/* ── Hero neural network canvas animation ─────────────────────────────── */
(function () {
    var canvas = document.getElementById('heroNeuralCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var nodes = [];
    var NODE_COUNT = 48;
    var MAX_DIST   = 155;
    var raf;

    function resize() {
        var section = canvas.parentElement;
        canvas.width  = section.offsetWidth;
        canvas.height = section.offsetHeight;
    }

    function init() {
        resize();
        nodes = [];
        for (var i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x:  Math.random() * canvas.width,
                y:  Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.38,
                vy: (Math.random() - 0.5) * 0.38,
                r:  Math.random() * 1.8 + 0.7
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        /* edges */
        for (var i = 0; i < nodes.length; i++) {
            for (var j = i + 1; j < nodes.length; j++) {
                var dx   = nodes[i].x - nodes[j].x;
                var dy   = nodes[i].y - nodes[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(0,212,255,' + ((1 - dist / MAX_DIST) * 0.22) + ')';
                    ctx.lineWidth   = 0.85;
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        /* nodes */
        nodes.forEach(function (n) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,212,255,0.55)';
            ctx.fill();
        });
    }

    function update() {
        nodes.forEach(function (n) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
            if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        });
    }

    function loop() {
        update();
        draw();
        raf = requestAnimationFrame(loop);
    }

    /* Pause when tab hidden — saves CPU */
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { cancelAnimationFrame(raf); }
        else { loop(); }
    });

    window.addEventListener('resize', resize);
    init();
    loop();
})();
