/**
 * API Utility functions for Derivity AI
 * Handles all frontend-backend communication
 */

class DerivityAPI {
    constructor() {
        this.baseURL = window.location.hostname.includes('github.io') ? null : '';
        this.isGitHubPages = window.location.hostname.includes('github.io');
    }

    // Generic API request handler
    async makeRequest(endpoint, options = {}) {
        if (this.isGitHubPages) {
            throw new Error('API not available on GitHub Pages');
        }

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin', // Include cookies for session management
        };

        const requestOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(endpoint, requestOptions);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(email, password) {
        return this.makeRequest('/api/login/', {
            method: 'POST',
            body: JSON.stringify({
                username: email,
                password: password
            })
        });
    }

    async signup(userData) {
        return this.makeRequest('/api/signup/', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async logout() {
        return this.makeRequest('/api/logout/', {
            method: 'POST'
        });
    }

    async checkAuthStatus() {
        return this.makeRequest('/api/auth-status/');
    }

    // User profile methods
    async getUserProfile() {
        return this.makeRequest('/api/profile/');
    }

    async updateUserProfile(userData) {
        return this.makeRequest('/api/profile/update/', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Contact form
    async submitContactForm(formData) {
        return this.makeRequest('/api/contact/', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }

    // AI Chat (placeholder)
    async sendAIMessage(message) {
        return this.makeRequest('/api/ai-chat/', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
    }

    // CSRF Token
    async getCSRFToken() {
        return this.makeRequest('/api/csrf-token/');
    }

    // Storage management
    static setUserData(userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('isLoggedIn', 'true');
    }

    static getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    static clearUserData() {
        localStorage.removeItem('userData');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isLoggedIn');
    }

    static isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }
}

// Create global instance
window.derivityAPI = new DerivityAPI();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DerivityAPI;
}
