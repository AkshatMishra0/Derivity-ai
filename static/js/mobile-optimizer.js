// Mobile Enhancement and Performance JavaScript

class MobileOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.setupViewport();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupTouchOptimizations();
        this.setupPerformanceOptimizations();
        this.setupResponsiveImages();
        this.setupOrientationHandler();
    }

    setupViewport() {
        // Fix viewport issues on mobile
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        }

        // Prevent horizontal scroll
        document.body.style.overflowX = 'hidden';
        document.documentElement.style.overflowX = 'hidden';
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuClose = document.getElementById('mobile-menu-close');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openMobileMenu();
            });
        }

        if (mobileMenuClose && mobileMenu) {
            mobileMenuClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMobileMenu();
            });
        }

        // Close menu when clicking outside
        if (mobileMenu) {
            mobileMenu.addEventListener('click', (e) => {
                if (e.target === mobileMenu) {
                    this.closeMobileMenu();
                }
            });
        }

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
                this.closeMobileMenu();
            }
        });
    }

    openMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Animate menu items
            const menuItems = mobileMenu.querySelectorAll('a');
            menuItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    setupSmoothScrolling() {
        // Enhanced smooth scrolling for all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed header
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupTouchOptimizations() {
        // Improve touch responsiveness
        document.addEventListener('touchstart', function() {}, { passive: true });
        
        // Add touch feedback to buttons
        const buttons = document.querySelectorAll('button, .btn, a[class*="button"]');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            }, { passive: true });
            
            button.addEventListener('touchend', function() {
                this.style.transform = '';
            }, { passive: true });
        });

        // Prevent zoom on input focus (iOS)
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                }
            });
            
            input.addEventListener('blur', function() {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
                }
            });
        });
    }

    setupPerformanceOptimizations() {
        // Add JS class to enable animations only when JS is available
        document.documentElement.classList.add('js');
        
        // Ensure all content is visible by default
        this.ensureContentVisibility();
        
        // Intersection Observer for animations (only on larger screens)
        if (window.innerWidth > 768) {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, observerOptions);

            // Observe all animation targets
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                observer.observe(el);
            });
        } else {
            // On mobile, ensure all elements are visible
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                el.classList.add('animate-in');
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }

        // Lazy load images
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        // Preload critical resources
        this.preloadCriticalResources();
    }

    ensureContentVisibility() {
        // Make sure all main content elements are visible
        const mainElements = [
            '.hero-section',
            '.feature-card',
            '.stats-grid',
            '.button-group',
            '.cta-button',
            'section',
            'h1', 'h2', 'h3',
            'p'
        ];

        mainElements.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (!el.classList.contains('hidden') && !el.id.includes('mobile-menu')) {
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                }
            });
        });
    }

    preloadCriticalResources() {
        const criticalCSS = document.querySelector('link[rel="stylesheet"]');
        if (criticalCSS) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = criticalCSS.href;
            document.head.appendChild(link);
        }
    }

    setupResponsiveImages() {
        // Add responsive image handling
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            if (!img.hasAttribute('decoding')) {
                img.setAttribute('decoding', 'async');
            }
        });
    }

    setupOrientationHandler() {
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            // Force a reflow to fix layout issues
            setTimeout(() => {
                window.scrollTo(window.scrollX, window.scrollY);
            }, 100);
        });

        // Handle resize events
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }

        // Recalculate heights for mobile browsers
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Utility methods
    isMobile() {
        return window.innerWidth <= 768;
    }

    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    isAndroid() {
        return /Android/.test(navigator.userAgent);
    }
}

// Fast DOM content loaded handler
const fastDOMContentLoaded = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
};

// Initialize mobile optimizer
fastDOMContentLoaded(() => {
    // Set initial viewport height for mobile browsers
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // Initialize mobile optimizer
    new MobileOptimizer();

    // Add performance class to body
    document.body.classList.add('performance-optimized');

    // Remove loading class if present
    document.body.classList.remove('loading');
});

// Performance monitoring
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
                console.log('LCP:', entry.startTime);
            }
        }
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileOptimizer;
}
