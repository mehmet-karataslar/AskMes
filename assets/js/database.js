// Server API Veritabanı Yöneticisi
class ServerDatabaseManager {
    constructor() {
        // API config'in yüklenmesini bekle
        if (!window.API_CONFIG) {
            console.log('API config yüklenmemiş, bekleniyor...');
            setTimeout(() => this.constructor(), 100);
            return;
        }
        
        // API config'i kullan
        this.apiConfig = window.API_CONFIG;
        this.apiHelper = window.ApiHelper;
    }
    
    // API çağrısı yapma yardımcı fonksiyonu
    async apiCall(endpoint, options = {}) {
        const url = this.apiHelper.buildUrl(endpoint);
        const requestOptions = this.apiHelper.buildRequestOptions(
            options.method || 'GET',
            options.body,
            options.headers
        );
        
        try {
            return await this.apiHelper.fetchWithRetry(url, requestOptions);
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }
    
    // Mesaj işlemleri
    async getMessages(userId = null) {
        try {
            const endpoint = userId ? `/messages?userId=${userId}` : this.apiConfig.endpoints.messages.list;
            const response = await this.apiCall(endpoint);
            return response.data || response;
        } catch (error) {
            console.error('Mesajlar getirilemedi:', error);
            // Fallback için LocalStorage'dan dene
            return this.getLocalMessages();
        }
    }
    
    async saveMessage(messageData) {
        try {
            const response = await this.apiCall(this.apiConfig.endpoints.messages.create, {
                method: 'POST',
                body: messageData
            });
            return response.data || response;
        } catch (error) {
            console.error('Mesaj kaydedilemedi:', error);
            // Fallback için LocalStorage'a kaydet
            return this.saveLocalMessage(messageData);
        }
    }
    
    async updateMessage(messageData) {
        try {
            const endpoint = this.apiConfig.endpoints.messages.update.replace('{id}', messageData.id);
            const response = await this.apiCall(endpoint, {
                method: 'PUT',
                body: messageData
            });
            return response.data || response;
        } catch (error) {
            console.error('Mesaj güncellenemedi:', error);
            throw error;
        }
    }
    
    async deleteMessage(messageId) {
        try {
            const endpoint = this.apiConfig.endpoints.messages.delete.replace('{id}', messageId);
            const response = await this.apiCall(endpoint, {
                method: 'DELETE'
            });
            return response.data || response;
        } catch (error) {
            console.error('Mesaj silinemedi:', error);
            throw error;
        }
    }
    
    // Hediye işlemleri
    async getGifts(userId = null) {
        try {
            const endpoint = userId ? `/gifts?userId=${userId}` : this.apiConfig.endpoints.gifts.list;
            const response = await this.apiCall(endpoint);
            return response.data || response;
        } catch (error) {
            console.error('Hediyeler getirilemedi:', error);
            return this.getLocalGifts();
        }
    }
    
    async saveGift(giftData) {
        try {
            const response = await this.apiCall(this.apiConfig.endpoints.gifts.create, {
                method: 'POST',
                body: giftData
            });
            return response.data || response;
        } catch (error) {
            console.error('Hediye kaydedilemedi:', error);
            return this.saveLocalGift(giftData);
        }
    }
    
    // Anı işlemleri
    async getMemories() {
        try {
            const response = await this.apiCall(this.apiConfig.endpoints.memories.list);
            return response.data || response;
        } catch (error) {
            console.error('Anılar getirilemedi:', error);
            return this.getLocalMemories();
        }
    }
    
    async addMemory(memoryData) {
        try {
            const response = await this.apiCall(this.apiConfig.endpoints.memories.create, {
                method: 'POST',
                body: memoryData
            });
            return response.data || response;
        } catch (error) {
            console.error('Anı kaydedilemedi:', error);
            return this.saveLocalMemory(memoryData);
        }
    }
    
    // Oyun işlemleri
    async getGames() {
        try {
            const response = await this.apiCall(this.apiConfig.endpoints.games.list);
            return response.data || response;
        } catch (error) {
            console.error('Oyunlar getirilemedi:', error);
            return this.getLocalGames();
        }
    }
    
    async saveGameScore(gameId, userId, score, level = 1, duration = null) {
        try {
            const scoreData = {
                gameId,
                userId,
                score,
                level,
                duration,
                createdAt: new Date().toISOString()
            };
            
            const response = await this.apiCall(this.apiConfig.endpoints.games.scores, {
                method: 'POST',
                body: scoreData
            });
            return response.data || response;
        } catch (error) {
            console.error('Oyun skoru kaydedilemedi:', error);
            return this.saveLocalGameScore(gameId, userId, score, level, duration);
        }
    }
    
    // Fallback LocalStorage fonksiyonları
    getLocalMessages() {
        const messages = localStorage.getItem('suprizler_messages');
        return messages ? JSON.parse(messages) : [
            {
                id: 1,
                sender: 'mehmet',
                recipient: 'sevgilim',
                title: 'Günaydın Canım Aşkım',
                content: `Günaydın canım aşkım ❤️

Bugün de gözlerimi açtığımda aklıma ilk gelen sen oldun. Umarım güzel rüyalar görmüşsündür ve bugün senin için harika bir gün olur.

Seni çok seviyorum ve her geçen gün daha da çok seviyorum. Sen benim hayatımın en güzel hediyesisin.

Öpücüklerle,
Mehmet 💕`,
                type: 'Aşk Mektubu',
                featured: true,
                author: 'mehmet',
                createdAt: new Date().toISOString(),
                date: new Date().toISOString()
            }
        ];
    }
    
    saveLocalMessage(messageData) {
        const messages = this.getLocalMessages();
        const newMessage = {
            id: Date.now(),
            ...messageData,
            createdAt: new Date().toISOString(),
            date: new Date().toISOString()
        };
        
        messages.unshift(newMessage);
        localStorage.setItem('suprizler_messages', JSON.stringify(messages));
        return newMessage;
    }
    
    getLocalGifts() {
        const gifts = localStorage.getItem('suprizler_gifts');
        return gifts ? JSON.parse(gifts) : [];
    }
    
    saveLocalGift(giftData) {
        const gifts = this.getLocalGifts();
        const newGift = {
            id: Date.now(),
            ...giftData,
            createdAt: new Date().toISOString()
        };
        
        gifts.unshift(newGift);
        localStorage.setItem('suprizler_gifts', JSON.stringify(gifts));
        return newGift;
    }
    
    getLocalMemories() {
        const memories = localStorage.getItem('suprizler_memories');
        return memories ? JSON.parse(memories) : [];
    }
    
    saveLocalMemory(memoryData) {
        const memories = this.getLocalMemories();
        const newMemory = {
            id: Date.now(),
            ...memoryData,
            createdAt: new Date().toISOString()
        };
        
        memories.unshift(newMemory);
        localStorage.setItem('suprizler_memories', JSON.stringify(memories));
        return newMemory;
    }
    
    getLocalGames() {
        return [
            {
                id: 1,
                name: 'Kalp Yakalama',
                description: 'Düşen kalpleri yakala ve puan kazan!',
                icon: '💖',
                difficulty: 'easy',
                category: 'arcade',
                isActive: true
            },
            {
                id: 2,
                name: 'Hafıza Oyunu',
                description: 'Kartları eşleştir ve hafızanı güçlendir!',
                icon: '🧠',
                difficulty: 'medium',
                category: 'puzzle',
                isActive: true
            }
        ];
    }
    
    saveLocalGameScore(gameId, userId, score, level, duration) {
        const scores = JSON.parse(localStorage.getItem('suprizler_game_scores') || '[]');
        const newScore = {
            id: Date.now(),
            gameId,
            userId,
            score,
            level,
            duration,
            createdAt: new Date().toISOString()
        };
        
        scores.unshift(newScore);
        localStorage.setItem('suprizler_game_scores', JSON.stringify(scores));
        return newScore;
    }
    
    // İstatistikler
    async getStats(userId) {
        try {
            const response = await this.apiCall(`${this.apiConfig.endpoints.users.stats}?userId=${userId}`);
            return response.data || response;
        } catch (error) {
            console.error('İstatistikler getirilemedi:', error);
            return {
                totalMessages: 0,
                unreadMessages: 0,
                totalGifts: 0,
                unopenedGifts: 0,
                totalMemories: 0,
                gamesPlayed: 0
            };
        }
    }
}

// Global instance
window.DatabaseManager = ServerDatabaseManager;
window.db = new ServerDatabaseManager();

console.log('Server veritabanı sistemi yüklendi! 🌐'); 