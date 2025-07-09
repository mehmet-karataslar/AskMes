// API Base URL - production'da otomatik olarak domain'i alacak
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

// API Client class
class APIClient {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    // Token'ı güncelle
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // HTTP request helper
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}/api${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Token varsa header'a ekle
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API hatası');
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // AUTH API
    async login(username, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (response.success) {
            this.setToken(response.token);
        }

        return response;
    }

    async logout() {
        try {
            await this.request('/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.setToken(null);
        }
    }

    // MESSAGES API
    async getMessages() {
        return await this.request('/messages');
    }

    async sendMessage(content, image = null) {
        return await this.request('/messages', {
            method: 'POST',
            body: JSON.stringify({ content, image })
        });
    }

    async markMessageAsRead(messageId) {
        return await this.request('/messages', {
            method: 'PUT',
            body: JSON.stringify({ messageId })
        });
    }

    async deleteMessage(messageId) {
        return await this.request(`/messages?id=${messageId}`, {
            method: 'DELETE'
        });
    }

    // MEMORIES API
    async getMemories() {
        return await this.request('/memories');
    }

    async addMemory(title, description, image = null, date = null) {
        return await this.request('/memories', {
            method: 'POST',
            body: JSON.stringify({ title, description, image, date })
        });
    }

    async updateMemory(id, updates) {
        return await this.request('/memories', {
            method: 'PUT',
            body: JSON.stringify({ id, ...updates })
        });
    }

    async deleteMemory(memoryId) {
        return await this.request(`/memories?id=${memoryId}`, {
            method: 'DELETE'
        });
    }

    // GIFTS API
    async getGifts() {
        return await this.request('/gifts');
    }

    async addGift(title, description, image = null, price = '', category = 'Diğer', recipient = null) {
        return await this.request('/gifts', {
            method: 'POST',
            body: JSON.stringify({ title, description, image, price, category, recipient })
        });
    }

    async updateGift(id, updates) {
        return await this.request('/gifts', {
            method: 'PUT',
            body: JSON.stringify({ id, ...updates })
        });
    }

    async deleteGift(giftId) {
        return await this.request(`/gifts?id=${giftId}`, {
            method: 'DELETE'
        });
    }
}

// Global API instance
const api = new APIClient();

// Export for use in other files
window.api = api; 