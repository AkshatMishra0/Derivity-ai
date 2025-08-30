/**
 * Global Navigation and Button Management System
 * Ensures all buttons work consistently across all pages
 */

class DerivityNavigation {
    constructor() {
        this.currentPath = window.location.pathname;
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        this.userEmail = localStorage.getItem('userEmail');
        this.init();
    }

    init() {
        this.setupCommonEventListeners();
        this.setupNavigationButtons();
        this.setupAuthButtons();
        this.updateUIBasedOnAuthState();
        this.checkBackendAuth();
    }

    // Setup event listeners for common elements across all pages
    setupCommonEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.bindNavigationButtons();
            this.bindAuthButtons();
            this.bindCTAButtons();
            this.bindModalButtons();
            this.bindContactForm();
            this.bindSocialLinks();
            this.bindMobileMenu();
        });
    }

    // Navigation buttons (Features, About, Pricing, Contact)
    bindNavigationButtons() {
        const navButtons = {
            'features.html': document.querySelectorAll('a[href="features.html"], a[href*="features"]'),
            'about.html': document.querySelectorAll('a[href="about.html"], a[href*="about"]'),
            'pricing.html': document.querySelectorAll('a[href="pricing.html"], a[href*="pricing"]'),
            'contact.html': document.querySelectorAll('a[href="contact.html"], a[href*="contact"]'),
            'ai-interface.html': document.querySelectorAll('a[href="ai-interface.html"], a[href*="ai-interface"]'),
            'dashboard.html': document.querySelectorAll('a[href="dashboard.html"], a[href*="dashboard"]')
        };

        Object.entries(navButtons).forEach(([page, buttons]) => {
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    // AI interface is now open to everyone (shows coming soon page)
                    // Check if dashboard requires login
                    if (page === 'dashboard.html' && !this.isLoggedIn) {
                        e.preventDefault();
                        window.location.href = 'login.html';
                        return;
                    }
                    
                    this.addClickEffect(button);
                });
            });
        });
    }

    // Authentication buttons (Login, Signup, Logout)
    bindAuthButtons() {
        // Login buttons
        document.querySelectorAll('a[href="login.html"], a[href*="login"]').forEach(button => {
            button.addEventListener('click', (e) => {
                if (this.isLoggedIn) {
                    e.preventDefault();
                    window.location.href = 'dashboard.html';
                } else {
                    this.addClickEffect(button);
                }
            });
        });

        // Signup buttons
        document.querySelectorAll('a[href="signup.html"], a[href*="signup"]').forEach(button => {
            button.addEventListener('click', (e) => {
                if (this.isLoggedIn) {
                    e.preventDefault();
                    window.location.href = 'dashboard.html';
                } else {
                    this.addClickEffect(button);
                }
            });
        });

        // Logout buttons
        document.querySelectorAll('#logout-btn, #logoutBtn, button[onclick*="logout"], button[onclick*="Logout"]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        });

        // User menu buttons
        const userMenuToggle = document.querySelector('.user-menu-toggle, #user-menu button');
        if (userMenuToggle) {
            userMenuToggle.addEventListener('click', this.toggleUserMenu);
        }
    }

    // CTA and action buttons
    bindCTAButtons() {
        // "Try Now", "Get Started", "Start Free Beta" buttons - AI interface is now open to all
        document.querySelectorAll('button[onclick*="Start"], button[onclick*="Try"], a[href*="ai-interface"]').forEach(button => {
            if (!button.dataset.bound) {
                button.dataset.bound = 'true';
                button.addEventListener('click', (e) => {
                    // Allow direct access to AI interface (shows coming soon page)
                    this.addClickEffect(button);
                });
            }
        });

        // Contact form buttons
        document.querySelectorAll('button[type="submit"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const form = button.closest('form');
                if (form && form.id === 'contactForm') {
                    this.handleContactFormSubmit(e, form);
                }
            });
        });
    }

    // Modal and popup buttons
    bindModalButtons() {
        // Close modal buttons
        document.querySelectorAll('button[onclick*="closeModal"], .modal-close').forEach(button => {
            button.addEventListener('click', this.closeModal);
        });

        // Open modal buttons
        document.querySelectorAll('button[onclick*="showModal"], .modal-open').forEach(button => {
            button.addEventListener('click', (e) => {
                const modalType = button.dataset.modal || 'default';
                this.showModal(modalType, button.dataset.title, button.dataset.content);
            });
        });
    }

    // Contact form handling
    bindContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactFormSubmit(e, contactForm));
        }
    }

    // Social media links
    bindSocialLinks() {
        document.querySelectorAll('a[href*="twitter"], a[href*="linkedin"], a[href*="github"]').forEach(link => {
            link.addEventListener('click', (e) => {
                this.addClickEffect(link);
                // Open in new tab
                if (!link.target) {
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                }
            });
        });
    }

    // Mobile menu functionality
    bindMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu') || this.createMobileMenu();
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                document.body.classList.toggle('overflow-hidden');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn?.contains(e.target) && !mobileMenu?.contains(e.target)) {
                mobileMenu?.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        });
    }

    // Create mobile menu if it doesn't exist
    createMobileMenu() {
        const menu = document.createElement('div');
        menu.id = 'mobile-menu';
        menu.className = 'fixed inset-0 bg-black/90 backdrop-blur-md z-40 md:hidden hidden';
        menu.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full space-y-8">
                <a href="index.html" class="text-2xl text-white hover:text-apple-blue transition-colors">Home</a>
                <a href="features.html" class="text-2xl text-white hover:text-apple-blue transition-colors">Features</a>
                <a href="about.html" class="text-2xl text-white hover:text-apple-blue transition-colors">About</a>
                <a href="pricing.html" class="text-2xl text-white hover:text-apple-blue transition-colors">Pricing</a>
                <a href="contact.html" class="text-2xl text-white hover:text-apple-blue transition-colors">Contact</a>
                ${this.isLoggedIn ? 
                    `<a href="dashboard.html" class="text-2xl text-white hover:text-apple-blue transition-colors">Dashboard</a>
                     <button onclick="window.derivityNav.handleLogout()" class="text-2xl text-red-400 hover:text-red-300 transition-colors">Logout</button>` :
                    `<a href="login.html" class="text-2xl text-white hover:text-apple-blue transition-colors">Login</a>
                     <a href="signup.html" class="bg-apple-blue hover:bg-apple-indigo text-white px-8 py-3 rounded-full text-xl transition-colors">Sign Up</a>`
                }
                <button onclick="this.closest('#mobile-menu').classList.add('hidden'); document.body.classList.remove('overflow-hidden')" class="absolute top-6 right-6 text-white text-3xl">&times;</button>
            </div>
        `;
        document.body.appendChild(menu);
        return menu;
    }

    // Update UI based on authentication state
    updateUIBasedOnAuthState() {
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        
        if (this.isLoggedIn && this.userEmail) {
            if (authButtons) authButtons.classList.add('hidden');
            if (userMenu) {
                userMenu.classList.remove('hidden');
                this.updateUserInfo();
            }
        } else {
            if (authButtons) authButtons.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
        }
    }

    // Update user information in UI
    updateUserInfo() {
        const userEmailEl = document.getElementById('user-email');
        const userInitialEl = document.getElementById('user-initial');
        
        if (userEmailEl) userEmailEl.textContent = this.userEmail;
        if (userInitialEl) userInitialEl.textContent = this.userEmail.charAt(0).toUpperCase();
    }

    // Check backend authentication status with enhanced sync
    async checkBackendAuth() {
        if (window.location.hostname.includes('github.io')) return;
        
        try {
            const response = await fetch('/api/auth-status/', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.authenticated !== this.isLoggedIn) {
                if (data.authenticated) {
                    // Backend says user is logged in, update frontend with complete user data
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userData', JSON.stringify(data.user));
                    this.isLoggedIn = true;
                    this.userEmail = data.user.email;
                    
                    console.log('Auth sync: User logged in via backend');
                } else {
                    // Backend says user is not logged in, clear frontend
                    this.clearAuthData();
                    console.log('Auth sync: User logged out via backend');
                }
                this.updateUIBasedOnAuthState();
            } else if (data.authenticated && data.user) {
                // Update user data even if auth state matches
                localStorage.setItem('userData', JSON.stringify(data.user));
                localStorage.setItem('userEmail', data.user.email);
                this.userEmail = data.user.email;
            }
        } catch (error) {
            console.log('Could not verify auth status:', error);
            // If we can't reach the backend but have local auth data, keep it
            // This allows offline functionality while maintaining sync when online
        }
    }

    // Handle logout across all pages with enhanced backend sync
    async handleLogout() {
        try {
            if (!window.location.hostname.includes('github.io')) {
                const response = await fetch('/api/logout/', { 
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                const data = await response.json();
                if (data.status === 'success') {
                    console.log('Backend logout successful');
                } else {
                    console.log('Backend logout failed:', data.message);
                }
            }
        } catch (error) {
            console.log('Backend logout error:', error);
        }
        
        // Always clear frontend data regardless of backend response
        this.clearAuthData();
        
        // Show logout message briefly before redirect
        const logoutMessage = document.createElement('div');
        logoutMessage.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
        logoutMessage.textContent = 'Logged out successfully';
        document.body.appendChild(logoutMessage);
        
        setTimeout(() => {
            document.body.removeChild(logoutMessage);
            window.location.href = 'index.html';
        }, 1500);
    }

    // Clear authentication data completely
    clearAuthData() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken'); // In case we add token-based auth later
        sessionStorage.clear(); // Clear any session-specific data
        this.isLoggedIn = false;
        this.userEmail = null;
        this.updateUIBasedOnAuthState();
    }

    // Show login required modal
    showLoginRequired() {
        const modal = this.createModal(
            'Login Required',
            'Please log in to access this feature.',
            [
                { text: 'Login', action: () => window.location.href = 'login.html', primary: true },
                { text: 'Sign Up', action: () => window.location.href = 'signup.html' },
                { text: 'Cancel', action: this.closeModal }
            ]
        );
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
    }

    // Create modal dynamically
    createModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="apple-glass rounded-2xl p-8 max-w-md w-full mx-4">
                <h3 class="text-2xl font-bold text-white mb-4">${title}</h3>
                <p class="text-dark-200 mb-6">${content}</p>
                <div class="flex space-x-4">
                    ${buttons.map(btn => `
                        <button class="flex-1 ${btn.primary ? 'bg-apple-blue hover:bg-apple-indigo' : 'apple-glass border border-white/20'} text-white py-3 rounded-xl font-medium transition-all duration-300" 
                                onclick="this.closest('.modal').remove(); (${btn.action.toString()})()">
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }

    // Handle contact form submission
    async handleContactFormSubmit(e, form) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };
            
            if (window.location.hostname.includes('github.io')) {
                // GitHub Pages fallback
                setTimeout(() => {
                    this.showModal('success', 'Message Sent!', 'Thank you for reaching out! We\'ll get back to you within 24 hours.');
                    form.reset();
                }, 1000);
            } else {
                // Django backend
                const response = await fetch('/api/contact/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                this.showModal(result.status, result.status === 'success' ? 'Success!' : 'Error', result.message);
                
                if (result.status === 'success') {
                    form.reset();
                }
            }
        } catch (error) {
            this.showModal('error', 'Error', 'There was an error sending your message. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Add visual click effect
    addClickEffect(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }

    // Toggle user menu
    toggleUserMenu() {
        const dropdown = document.querySelector('#user-menu .dropdown, #user-menu .absolute');
        if (dropdown) {
            dropdown.classList.toggle('opacity-0');
            dropdown.classList.toggle('invisible');
        }
    }

    // Close modal
    closeModal() {
        const modals = document.querySelectorAll('.modal, [class*="modal"]');
        modals.forEach(modal => modal.classList.add('hidden'));
    }

    // Show modal
    showModal(type, title, content) {
        const modal = this.createModal(title, content, [
            { text: 'OK', action: this.closeModal, primary: true }
        ]);
        document.body.appendChild(modal);
    }
}

// Initialize navigation system
if (typeof window !== 'undefined') {
    window.derivityNav = new DerivityNavigation();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DerivityNavigation;
}
