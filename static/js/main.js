// Main JavaScript file for the personal introduction website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive features
    initializeNavigation();
    initializeAnimations();
    initializeGallery();
    initializeContactForm();
    initializeScrollEffects();
    initializeTypingAnimation();
});

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
    
    // Navbar background opacity on scroll
    function updateNavbarBackground() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(33, 37, 41, 0.98)';
        } else {
            navbar.style.background = 'rgba(33, 37, 41, 0.95)';
        }
    }
    
    // Smooth scrolling for navigation links (only internal anchor links)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || !targetId.startsWith('#') || targetId === '#') return; // skip external/bare-hash links
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });
    
    // Update navigation on scroll
    window.addEventListener('scroll', function() {
        updateActiveNavLink();
        updateNavbarBackground();
    });
    
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
    const observerOptions = {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // All elements that animate on scroll
    const selectors = [
        '.interest-card',
        '.timeline-item',
        '.cert-compact-card',
        '.cert-featured',
        '.about-info-card',
        '.contact-card',
        '.section-header',
        '.stat-pill',
        '.skills-showcase',
        '.education-highlight',
        '.project-card',
        '.projects-coming-soon'
    ];

    const allElements = document.querySelectorAll(selectors.join(', '));

    // Group siblings by parent — apply stagger within each row
    const parentMap = new Map();
    allElements.forEach(el => {
        const key = el.parentElement;
        if (!parentMap.has(key)) parentMap.set(key, []);
        parentMap.get(key).push(el);
    });

    parentMap.forEach((siblings) => {
        siblings.forEach((el, i) => {
            el.style.setProperty('--stagger', i);
            observer.observe(el);
        });
    });

    // Add CSS for scroll animations
    const style = document.createElement('style');
    style.textContent = `
        .interest-card,
        .cert-compact-card,
        .cert-featured,
        .about-info-card,
        .contact-card,
        .skills-showcase,
        .education-highlight {
            opacity: 0;
            transform: translateY(28px);
            transition: opacity 0.55s ease calc(var(--stagger, 0) * 90ms),
                        transform 0.55s ease calc(var(--stagger, 0) * 90ms);
        }

        .timeline-item {
            opacity: 0;
            transform: translateX(-24px);
            transition: opacity 0.55s ease calc(var(--stagger, 0) * 100ms),
                        transform 0.55s ease calc(var(--stagger, 0) * 100ms);
        }

        .stat-pill {
            opacity: 0;
            transform: translateY(16px) scale(0.95);
            transition: opacity 0.5s ease calc(var(--stagger, 0) * 80ms),
                        transform 0.5s ease calc(var(--stagger, 0) * 80ms);
        }

        .section-header {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .scroll-visible {
            opacity: 1 !important;
            transform: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Gallery functionality
function initializeGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        const img = item.querySelector('.gallery-image');
        if (img) {
            // Add click event for potential modal or lightbox
            item.addEventListener('click', function() {
                // Could implement a lightbox here in the future
                console.log('Gallery item clicked:', img.alt);
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
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        // Form validation enhancement
        const inputs = contactForm.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            // Real-time validation feedback
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    validateField(this);
                }
            });
        });
        
        // Form submission handling
        contactForm.addEventListener('submit', function(e) {
            let isValid = true;
            
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('Please fix the errors in the form before submitting.', 'error');
            } else {
                showNotification('Sending your message...', 'info');
            }
        });
    }
    
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        
        // Remove existing validation classes
        field.classList.remove('is-valid', 'is-invalid');
        
        // Check if field is required and empty
        if (field.hasAttribute('required') && !value) {
            field.classList.add('is-invalid');
            isValid = false;
        }
        // Email validation
        else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.add('is-valid');
            }
        }
        // Text fields validation
        else if (value && value.length > 0) {
            field.classList.add('is-valid');
        }
        
        return isValid;
    }
    
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        notification.style.position = 'fixed';
        notification.style.top = '100px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
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
        });
    }

    // Scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #00d4ff, #8b5cf6);
        z-index: 9999;
        transition: width 0.1s ease;
        box-shadow: 0 0 8px rgba(0,212,255,0.6);
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    });
    
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
        });
        
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

window.addEventListener('scroll', debouncedScrollHandler);

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

        requestAnimationFrame(draw);
    }

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
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href') || '';
        const isCert = href.includes('/certificate/') || href.includes('view_cert');
        const isPdf  = /\.pdf($|\?)/i.test(href);
        const isCvDownload = link.hasAttribute('download'); // skip CV (downloads instantly)

        if ((isCert || isPdf) && !isCvDownload) {
            showLoader();
        }
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
