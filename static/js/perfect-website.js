// Perfect Website Experience - Enhanced JavaScript

class PerfectWebsite {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.setupViewport();
        this.setupNavigation();
        this.setupAnimations();
        this.setupPerformance();
        this.setupAccessibility();
        this.setupParticles();
        this.addDebugInfo();
    }

    setupViewport() {
        // Fix viewport height for mobile browsers
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => {
            setTimeout(setVH, 100);
        });

        // Prevent zoom on input focus for iOS
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (this.isIOS()) {
                    document.querySelector('meta[name="viewport"]').setAttribute(
                        'content', 
                        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                    );
                }
            });

            input.addEventListener('blur', () => {
                if (this.isIOS()) {
                    document.querySelector('meta[name="viewport"]').setAttribute(
                        'content', 
                        'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
                    );
                }
            });
        });
    }

    setupNavigation() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuClose = document.getElementById('mobile-menu-close');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openMobileMenu();
            });
        }

        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMobileMenu();
            });
        }

        // Close menu on outside click
        if (mobileMenu) {
            mobileMenu.addEventListener('click', (e) => {
                if (e.target === mobileMenu) {
                    this.closeMobileMenu();
                }
            });
        }

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });

        // Handle navigation scroll effect
        this.setupNavScroll();
    }

    openMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    setupNavScroll() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                nav.style.background = 'rgba(0, 0, 0, 0.95)';
                nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.2)';
            } else {
                nav.style.background = 'rgba(0, 0, 0, 0.8)';
                nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
            }

            lastScrollY = currentScrollY;
        }, { passive: true });
    }

    setupAnimations() {
        // Add fade-in animation class to elements
        document.body.classList.add('js-enabled');

        // Intersection Observer for scroll animations
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            // Observe elements that should animate
            document.querySelectorAll('.animate-on-scroll, .feature-card, .stat-item').forEach(el => {
                observer.observe(el);
            });
        } else {
            // Fallback for older browsers
            document.querySelectorAll('.animate-on-scroll, .feature-card, .stat-item').forEach(el => {
                el.classList.add('animate-in');
            });
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupPerformance() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Preload critical resources
        this.preloadCriticalResources();

        // Add performance monitoring
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'largest-contentful-paint') {
                            console.log('LCP:', entry.startTime);
                        }
                    }
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // Silent fail for unsupported browsers
            }
        }
    }

    preloadCriticalResources() {
        // Preload hero section images and fonts
        const criticalResources = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
        ];

        criticalResources.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = href;
            document.head.appendChild(link);
        });
    }

    setupAccessibility() {
        // Add focus management
        this.addFocusManagement();
        
        // Add keyboard navigation
        this.addKeyboardNavigation();
        
        // Add screen reader improvements
        this.addScreenReaderSupport();
    }

    addFocusManagement() {
        // Improve focus visibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('using-keyboard');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('using-keyboard');
        });
    }

    addKeyboardNavigation() {
        // Add keyboard support for mobile menu
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openMobileMenu();
                }
            });
        }

        // Add keyboard support for buttons
        document.querySelectorAll('.btn, button').forEach(btn => {
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
    }

    addScreenReaderSupport() {
        // Add ARIA labels where needed
        const nav = document.querySelector('nav');
        if (nav && !nav.getAttribute('aria-label')) {
            nav.setAttribute('aria-label', 'Main navigation');
        }

        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn && !mobileMenuBtn.getAttribute('aria-label')) {
            mobileMenuBtn.setAttribute('aria-label', 'Open mobile menu');
        }

        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && !mobileMenu.getAttribute('aria-label')) {
            mobileMenu.setAttribute('aria-label', 'Mobile navigation menu');
        }
    }

    setupParticles() {
        const container = document.getElementById('particles-container');
        if (!container) return;

        // Only add particles on larger screens for performance
        if (window.innerWidth > 768) {
            this.createParticles(container);
        }

        // Add resize listener
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && container.children.length === 0) {
                this.createParticles(container);
            } else if (window.innerWidth <= 768) {
                container.innerHTML = '';
            }
        });
    }

    createParticles(container) {
        const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 4 + 1;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            
            particle.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, rgba(0, 122, 255, 0.3) 0%, transparent 70%);
                border-radius: 50%;
                animation: float ${duration}s ${delay}s infinite ease-in-out;
                pointer-events: none;
            `;
            
            container.appendChild(particle);
        }
    }

    addDebugInfo() {
        // Add debug info in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Perfect Website initialized');
            console.log('Device type:', this.getDeviceType());
            console.log('Browser:', this.getBrowser());
            console.log('Screen size:', `${window.innerWidth}x${window.innerHeight}`);
        }
    }

    // Utility methods
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    isAndroid() {
        return /Android/.test(navigator.userAgent);
    }

    isMobile() {
        return window.innerWidth <= 768;
    }

    getDeviceType() {
        if (this.isIOS()) return 'iOS';
        if (this.isAndroid()) return 'Android';
        if (this.isMobile()) return 'Mobile';
        return 'Desktop';
    }

    getBrowser() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }
}

// Initialize the perfect website experience
new PerfectWebsite();

// Add CSS keyframes for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.3;
        }
        33% { 
            transform: translateY(-20px) rotate(120deg); 
            opacity: 0.8;
        }
        66% { 
            transform: translateY(10px) rotate(240deg); 
            opacity: 0.5;
        }
    }

    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }

    .js-enabled .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .using-keyboard *:focus {
        outline: 2px solid #007aff !important;
        outline-offset: 2px !important;
    }
`;
document.head.appendChild(style);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerfectWebsite;
}
