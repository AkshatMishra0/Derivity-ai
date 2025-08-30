// Enhanced Mobile JavaScript for Derivity AI
class MobileOptimizer {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.init();
    }

    init() {
        this.setupViewportFixes();
        this.setupTouchOptimizations();
        this.setupMobileNavigation();
        this.setupPerformanceOptimizations();
        this.setupResponsiveImages();
        this.setupSmoothScrolling();
        this.handleOrientationChange();
    }

    setupViewportFixes() {
        // Fix viewport issues on mobile
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover');
        }

        // Fix 100vh issues on mobile
        const updateVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        window.addEventListener('resize', updateVH);
        window.addEventListener('orientationchange', updateVH);
        updateVH();
    }

    setupTouchOptimizations() {
        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Improve touch responsiveness
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });
    }

    setupMobileNavigation() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        let isMenuOpen = false;

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                isMenuOpen = !isMenuOpen;
                
                if (isMenuOpen) {
                    mobileMenu.classList.remove('hidden');
                    mobileMenu.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                    this.animateMenuOpen(mobileMenu);
                } else {
                    this.animateMenuClose(mobileMenu);
                    document.body.style.overflow = '';
                }
            });

            // Close menu when clicking on links
            const menuLinks = mobileMenu.querySelectorAll('a');
            menuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    isMenuOpen = false;
                    this.animateMenuClose(mobileMenu);
                    document.body.style.overflow = '';
                });
            });

            // Close menu on swipe down
            mobileMenu.addEventListener('touchstart', (e) => {
                this.touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            mobileMenu.addEventListener('touchend', (e) => {
                this.touchEndY = e.changedTouches[0].screenY;
                if (this.touchEndY > this.touchStartY + 100) {
                    isMenuOpen = false;
                    this.animateMenuClose(mobileMenu);
                    document.body.style.overflow = '';
                }
            }, { passive: true });
        }
    }

    animateMenuOpen(menu) {
        menu.style.opacity = '0';
        menu.style.transform = 'translateY(-20px)';
        
        requestAnimationFrame(() => {
            menu.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            menu.style.opacity = '1';
            menu.style.transform = 'translateY(0)';
        });
    }

    animateMenuClose(menu) {
        menu.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        menu.style.opacity = '0';
        menu.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            menu.classList.add('hidden');
            menu.style.display = 'none';
        }, 300);
    }

    setupPerformanceOptimizations() {
        // Reduce animations on mobile for better performance
        if (this.isMobile) {
            const style = document.createElement('style');
            style.textContent = `
                .animate-glow, .animate-pulse {
                    animation: none !important;
                }
                .particle {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }

        // Debounce scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 16); // 60fps
        }, { passive: true });
    }

    setupResponsiveImages() {
        // Lazy load images for better performance
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy-load');
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => {
                img.classList.add('lazy-load');
                imageObserver.observe(img);
            });
        }
    }

    setupSmoothScrolling() {
        // Enhanced smooth scrolling for mobile
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed header
                    
                    if (this.isMobile) {
                        // Use native smooth scroll on mobile for better performance
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    } else {
                        // Custom smooth scroll for desktop
                        this.smoothScrollTo(offsetTop, 800);
                    }
                }
            });
        });
    }

    smoothScrollTo(targetPosition, duration) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    }

    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    handleScroll() {
        const scrollTop = window.pageYOffset;
        
        // Add header background on scroll
        const header = document.querySelector('nav');
        if (header) {
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Parallax effect for hero section (disabled on mobile for performance)
        if (!this.isMobile) {
            const hero = document.querySelector('.hero-section');
            if (hero) {
                const speed = scrollTop * 0.5;
                hero.style.transform = `translateY(${speed}px)`;
            }
        }
    }

    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            // Reset viewport and recalculate dimensions
            setTimeout(() => {
                this.isMobile = window.innerWidth <= 768;
                this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
                
                // Trigger resize to recalculate layout
                window.dispatchEvent(new Event('resize'));
            }, 100);
        });
    }

    // Add CSS class for scrolled header
    addScrolledHeaderStyles() {
        const style = document.createElement('style');
        style.textContent = `
            nav.scrolled {
                background: rgba(0, 0, 0, 0.95) !important;
                backdrop-filter: blur(20px) !important;
                transition: all 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileOptimizer();
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        document.body.style.animationPlayState = 'paused';
    } else {
        // Resume animations when page becomes visible
        document.body.style.animationPlayState = 'running';
    }
});

// Export for use in other files
window.MobileOptimizer = MobileOptimizer;
