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
        'Artificial Intelligence',
        'Data Science',
        'Machine Learning',
        'Python Development',
        'AI Innovation'
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
    
    // Add active class to current section
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
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
            if (!targetId || !targetId.startsWith('#')) return; // skip external links
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
        '.education-highlight'
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

// ── Particle Background ──────────────────────────────
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
    const COUNT = isMobile ? 55 : 120;
    const CONNECT_DIST = isMobile ? 100 : 150;
    const REPEL_DIST   = 110;
    const ATTRACT_DIST = 220;
    const MAX_SPEED    = 2.2;
    const BASE_SPEED   = 0.45;
    const DAMPEN       = 0.97;

    // Brand palette — cyan → violet only
    const COLORS = [
        { h: 192, s: 100, l: 60 }, // #00d4ff cyan
        { h: 210, s:  90, l: 65 }, // blue-cyan
        { h: 230, s:  85, l: 65 }, // blue
        { h: 260, s:  75, l: 65 }, // indigo
        { h: 275, s:  70, l: 62 }, // violet #8b5cf6
    ];

    function randColor() {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    const particles = Array.from({ length: COUNT }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = BASE_SPEED * (0.5 + Math.random());
        const c = randColor();
        return {
            x:  Math.random() * canvas.width,
            y:  Math.random() * canvas.height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r:  Math.random() * 2.2 + 0.8,
            alpha: Math.random() * 0.45 + 0.2,
            c,
            pulsePhase: Math.random() * Math.PI * 2,
        };
    });

    // Mouse / touch
    const mouse = { x: null, y: null, down: false };
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    window.addEventListener('mousedown', () => { mouse.down = true; });
    window.addEventListener('mouseup',   () => { mouse.down = false; });

    // Click burst
    const bursts = [];
    // Touch support — mirror mouse interactions
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        const t = e.touches[0];
        mouse.x = t.clientX;
        mouse.y = t.clientY;
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
        mouse.x = null;
        mouse.y = null;
    });

    canvas.addEventListener('touchstart', e => {
        const t = e.touches[0];
        bursts.push({ x: t.clientX, y: t.clientY, r: 0, maxR: 160, alpha: 0.6 });
        particles.forEach(p => {
            const dx = p.x - t.clientX;
            const dy = p.y - t.clientY;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 180 && d > 0) {
                const force = (180 - d) / 180 * 3.5;
                p.vx += (dx / d) * force;
                p.vy += (dy / d) * force;
            }
        });
    }, { passive: true });

    window.addEventListener('click', e => {
        bursts.push({ x: e.clientX, y: e.clientY, r: 0, maxR: 160, alpha: 0.6 });
        // Push nearby particles outward
        particles.forEach(p => {
            const dx = p.x - e.clientX;
            const dy = p.y - e.clientY;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 180 && d > 0) {
                const force = (180 - d) / 180 * 3.5;
                p.vx += (dx / d) * force;
                p.vy += (dy / d) * force;
            }
        });
    });

    let t = 0;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t += 0.012;

        // Draw click burst rings
        for (let i = bursts.length - 1; i >= 0; i--) {
            const b = bursts[i];
            b.r   += 5;
            b.alpha -= 0.018;
            if (b.alpha <= 0) { bursts.splice(i, 1); continue; }
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0,212,255,${b.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        particles.forEach((p, i) => {
            // Natural drift
            p.x += p.vx;
            p.y += p.vy;

            // Soft bounce off edges
            if (p.x < 0)             { p.x = 0;            p.vx = Math.abs(p.vx); }
            if (p.x > canvas.width)  { p.x = canvas.width; p.vx = -Math.abs(p.vx); }
            if (p.y < 0)             { p.y = 0;            p.vy = Math.abs(p.vy); }
            if (p.y > canvas.height) { p.y = canvas.height; p.vy = -Math.abs(p.vy); }

            // Mouse interaction
            if (mouse.x !== null) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const d  = Math.sqrt(dx * dx + dy * dy);

                if (d < REPEL_DIST && d > 0) {
                    // Repel — push away
                    const force = ((REPEL_DIST - d) / REPEL_DIST) * (mouse.down ? 0.9 : 0.55);
                    p.vx += (dx / d) * force;
                    p.vy += (dy / d) * force;
                } else if (d < ATTRACT_DIST && d > REPEL_DIST) {
                    // Attract gently — pull toward cursor
                    const force = ((ATTRACT_DIST - d) / ATTRACT_DIST) * 0.04;
                    p.vx -= (dx / d) * force;
                    p.vy -= (dy / d) * force;
                }
            }

            // Speed cap + natural dampening back to base speed
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > MAX_SPEED) {
                p.vx = (p.vx / speed) * MAX_SPEED;
                p.vy = (p.vy / speed) * MAX_SPEED;
            }
            if (speed > BASE_SPEED) {
                p.vx *= DAMPEN;
                p.vy *= DAMPEN;
            }

            // Pulsing glow radius
            const pulse = Math.sin(t * 1.5 + p.pulsePhase) * 0.4 + 1;
            const radius = p.r * pulse;

            // Glow via radial gradient
            const { h, s, l } = p.c;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3.5);
            grad.addColorStop(0,   `hsla(${h},${s}%,${l}%,${p.alpha})`);
            grad.addColorStop(0.4, `hsla(${h},${s}%,${l}%,${p.alpha * 0.4})`);
            grad.addColorStop(1,   `hsla(${h},${s}%,${l}%,0)`);

            ctx.beginPath();
            ctx.arc(p.x, p.y, radius * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Solid core dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${h},${s}%,${l + 10}%,${p.alpha + 0.15})`;
            ctx.fill();

            // Draw connections — only brand colours, gradient line
            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dx = p.x - q.x;
                const dy = p.y - q.y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < CONNECT_DIST) {
                    const opacity = (1 - d / CONNECT_DIST) * 0.22;
                    const linGrad = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
                    linGrad.addColorStop(0, `hsla(${p.c.h},${p.c.s}%,${p.c.l}%,${opacity})`);
                    linGrad.addColorStop(1, `hsla(${q.c.h},${q.c.s}%,${q.c.l}%,${opacity})`);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = linGrad;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
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
