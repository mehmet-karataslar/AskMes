// API Yapılandırması
const API_CONFIG = {
    // Server API Base URL
    baseUrl: 'https://baharmehmet-db.vercel.app/api',
    
    // Authentication
    auth: {
        token: 'bahar-mehmet-2024',
        type: 'Bearer'
    },
    
    // Request Headers
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client': 'suprizler-web'
    },
    
    // API Endpoints
    endpoints: {
        messages: {
            list: '/messages',
            create: '/messages',
            get: '/messages/{id}',
            update: '/messages/{id}',
            delete: '/messages/{id}'
        },
        gifts: {
            list: '/gifts',
            create: '/gifts',
            get: '/gifts/{id}',
            update: '/gifts/{id}',
            delete: '/gifts/{id}'
        },
        memories: {
            list: '/memories',
            create: '/memories',
            get: '/memories/{id}',
            update: '/memories/{id}',
            delete: '/memories/{id}'
        },
        games: {
            list: '/games',
            scores: '/game-scores',
            leaderboard: '/games/{id}/leaderboard'
        },
        users: {
            profile: '/users/profile',
            stats: '/users/stats'
        }
    },
    
    // Request Timeout
    timeout: 10000,
    
    // Retry Configuration
    retry: {
        attempts: 3,
        delay: 1000
    }
};

// API Helper Functions
const ApiHelper = {
    // URL Builder
    buildUrl(endpoint, params = {}) {
        let url = API_CONFIG.baseUrl + endpoint;
        
        // Replace path parameters
        Object.keys(params).forEach(key => {
            url = url.replace(`{${key}}`, params[key]);
        });
        
        return url;
    },
    
    // Headers Builder
    buildHeaders(customHeaders = {}) {
        return {
            ...API_CONFIG.headers,
            'Authorization': `${API_CONFIG.auth.type} ${API_CONFIG.auth.token}`,
            ...customHeaders
        };
    },
    
    // Request Options Builder
    buildRequestOptions(method = 'GET', data = null, customHeaders = {}) {
        const options = {
            method,
            headers: this.buildHeaders(customHeaders),
            timeout: API_CONFIG.timeout
        };
        
        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }
        
        return options;
    },
    
    // Fetch with retry
    async fetchWithRetry(url, options, attempt = 1) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            if (attempt < API_CONFIG.retry.attempts) {
                console.log(`API request failed, retrying (${attempt}/${API_CONFIG.retry.attempts})...`);
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, API_CONFIG.retry.delay * attempt));
                
                return this.fetchWithRetry(url, options, attempt + 1);
            }
            
            throw error;
        }
    }
};

// Export for global use
window.API_CONFIG = API_CONFIG;
window.ApiHelper = ApiHelper;

console.log('API yapılandırması yüklendi! 🌐'); 