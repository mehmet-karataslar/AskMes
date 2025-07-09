// Veritabanı İşlemleri

// LocalStorage tabanlı basit veritabanı
class SimpleDB {
    constructor(dbName = 'SuprizlerDB') {
        this.dbName = dbName;
        this.tables = {};
        this.init();
    }
    
    init() {
        // Mevcut tabloları yükle
        const existingData = localStorage.getItem(this.dbName);
        if (existingData) {
            this.tables = JSON.parse(existingData);
        }
        
        // Varsayılan tabloları oluştur
        this.createDefaultTables();
    }
    
    createDefaultTables() {
        if (!this.tables.users) {
            this.createTable('users', {
                id: { type: 'number', primaryKey: true },
                name: { type: 'string', required: true },
                email: { type: 'string', unique: true },
                avatar: { type: 'string' },
                createdAt: { type: 'date', default: () => new Date() },
                lastLogin: { type: 'date' }
            });
        }
        
        if (!this.tables.messages) {
            this.createTable('messages', {
                id: { type: 'number', primaryKey: true },
                sender: { type: 'string', required: true },
                recipient: { type: 'string', required: true },
                title: { type: 'string', required: true },
                content: { type: 'string', required: true },
                type: { type: 'string', default: 'normal' },
                read: { type: 'boolean', default: false },
                featured: { type: 'boolean', default: false },
                createdAt: { type: 'date', default: () => new Date() },
                updatedAt: { type: 'date', default: () => new Date() }
            });
        }
        
        if (!this.tables.games) {
            this.createTable('games', {
                id: { type: 'number', primaryKey: true },
                name: { type: 'string', required: true },
                description: { type: 'string' },
                icon: { type: 'string' },
                difficulty: { type: 'string', default: 'easy' },
                category: { type: 'string', default: 'general' },
                isActive: { type: 'boolean', default: true },
                createdAt: { type: 'date', default: () => new Date() }
            });
        }
        
        if (!this.tables.gameScores) {
            this.createTable('gameScores', {
                id: { type: 'number', primaryKey: true },
                gameId: { type: 'number', required: true },
                userId: { type: 'string', required: true },
                score: { type: 'number', required: true },
                level: { type: 'number', default: 1 },
                duration: { type: 'number' },
                createdAt: { type: 'date', default: () => new Date() }
            });
        }
        
        if (!this.tables.gifts) {
            this.createTable('gifts', {
                id: { type: 'number', primaryKey: true },
                sender: { type: 'string', required: true },
                recipient: { type: 'string', required: true },
                title: { type: 'string', required: true },
                description: { type: 'string' },
                content: { type: 'string' },
                icon: { type: 'string' },
                type: { type: 'string', default: 'virtual' },
                opened: { type: 'boolean', default: false },
                openedAt: { type: 'date' },
                createdAt: { type: 'date', default: () => new Date() }
            });
        }
        
        if (!this.tables.memories) {
            this.createTable('memories', {
                id: { type: 'number', primaryKey: true },
                title: { type: 'string', required: true },
                description: { type: 'string' },
                content: { type: 'string' },
                image: { type: 'string' },
                date: { type: 'date', required: true },
                category: { type: 'string', default: 'general' },
                isPrivate: { type: 'boolean', default: false },
                tags: { type: 'array', default: [] },
                createdBy: { type: 'string', required: true },
                createdAt: { type: 'date', default: () => new Date() }
            });
        }
        
        this.save();
    }
    
    createTable(name, schema) {
        this.tables[name] = {
            schema: schema,
            data: [],
            indexes: {},
            nextId: 1
        };
        
        // Primary key ve unique field'lar için index oluştur
        Object.keys(schema).forEach(field => {
            if (schema[field].primaryKey || schema[field].unique) {
                this.tables[name].indexes[field] = new Map();
            }
        });
        
        this.save();
        return this;
    }
    
    insert(tableName, data) {
        if (!this.tables[tableName]) {
            throw new Error(`Table ${tableName} does not exist`);
        }
        
        const table = this.tables[tableName];
        const schema = table.schema;
        const record = { ...data };
        
        // Primary key ata
        const primaryKeyField = Object.keys(schema).find(key => schema[key].primaryKey);
        if (primaryKeyField && !record[primaryKeyField]) {
            record[primaryKeyField] = table.nextId++;
        }
        
        // Varsayılan değerleri ata
        Object.keys(schema).forEach(field => {
            if (record[field] === undefined && schema[field].default !== undefined) {
                record[field] = typeof schema[field].default === 'function' 
                    ? schema[field].default() 
                    : schema[field].default;
            }
        });
        
        // Validasyon
        this.validateRecord(tableName, record);
        
        // Index'leri güncelle
        Object.keys(table.indexes).forEach(field => {
            if (record[field] !== undefined) {
                table.indexes[field].set(record[field], record);
            }
        });
        
        // Kaydet
        table.data.push(record);
        this.save();
        
        return record;
    }
    
    find(tableName, conditions = {}) {
        if (!this.tables[tableName]) {
            throw new Error(`Table ${tableName} does not exist`);
        }
        
        const table = this.tables[tableName];
        
        // Koşul yoksa tüm kayıtları döndür
        if (Object.keys(conditions).length === 0) {
            return [...table.data];
        }
        
        // Index kullanarak hızlı arama
        const conditionKeys = Object.keys(conditions);
        const indexedField = conditionKeys.find(key => table.indexes[key]);
        
        if (indexedField) {
            const indexedRecord = table.indexes[indexedField].get(conditions[indexedField]);
            if (indexedRecord) {
                // Diğer koşulları da kontrol et
                const matches = this.matchesConditions(indexedRecord, conditions);
                return matches ? [indexedRecord] : [];
            }
            return [];
        }
        
        // Linear search
        return table.data.filter(record => this.matchesConditions(record, conditions));
    }
    
    findOne(tableName, conditions = {}) {
        const results = this.find(tableName, conditions);
        return results.length > 0 ? results[0] : null;
    }
    
    update(tableName, conditions, updates) {
        if (!this.tables[tableName]) {
            throw new Error(`Table ${tableName} does not exist`);
        }
        
        const records = this.find(tableName, conditions);
        const updatedRecords = [];
        
        records.forEach(record => {
            const updatedRecord = { ...record, ...updates };
            
            // updatedAt alanını güncelle
            if (this.tables[tableName].schema.updatedAt) {
                updatedRecord.updatedAt = new Date();
            }
            
            // Validasyon
            this.validateRecord(tableName, updatedRecord);
            
            // Index'leri güncelle
            const table = this.tables[tableName];
            Object.keys(table.indexes).forEach(field => {
                if (record[field] !== updatedRecord[field]) {
                    table.indexes[field].delete(record[field]);
                    table.indexes[field].set(updatedRecord[field], updatedRecord);
                }
            });
            
            // Kayıttaki veriyi güncelle
            const index = table.data.findIndex(r => r === record);
            if (index !== -1) {
                table.data[index] = updatedRecord;
                updatedRecords.push(updatedRecord);
            }
        });
        
        this.save();
        return updatedRecords;
    }
    
    delete(tableName, conditions) {
        if (!this.tables[tableName]) {
            throw new Error(`Table ${tableName} does not exist`);
        }
        
        const records = this.find(tableName, conditions);
        const table = this.tables[tableName];
        
        records.forEach(record => {
            // Index'lerden kaldır
            Object.keys(table.indexes).forEach(field => {
                if (record[field] !== undefined) {
                    table.indexes[field].delete(record[field]);
                }
            });
            
            // Veri tablosundan kaldır
            const index = table.data.findIndex(r => r === record);
            if (index !== -1) {
                table.data.splice(index, 1);
            }
        });
        
        this.save();
        return records.length;
    }
    
    count(tableName, conditions = {}) {
        return this.find(tableName, conditions).length;
    }
    
    validateRecord(tableName, record) {
        const schema = this.tables[tableName].schema;
        
        Object.keys(schema).forEach(field => {
            const fieldSchema = schema[field];
            const value = record[field];
            
            // Required kontrolü
            if (fieldSchema.required && (value === undefined || value === null || value === '')) {
                throw new Error(`Field ${field} is required`);
            }
            
            // Type kontrolü
            if (value !== undefined && value !== null) {
                if (fieldSchema.type === 'string' && typeof value !== 'string') {
                    throw new Error(`Field ${field} must be a string`);
                }
                if (fieldSchema.type === 'number' && typeof value !== 'number') {
                    throw new Error(`Field ${field} must be a number`);
                }
                if (fieldSchema.type === 'boolean' && typeof value !== 'boolean') {
                    throw new Error(`Field ${field} must be a boolean`);
                }
                if (fieldSchema.type === 'date' && !(value instanceof Date)) {
                    throw new Error(`Field ${field} must be a Date`);
                }
                if (fieldSchema.type === 'array' && !Array.isArray(value)) {
                    throw new Error(`Field ${field} must be an array`);
                }
            }
            
            // Unique kontrolü
            if (fieldSchema.unique && value !== undefined) {
                const existing = this.find(tableName, { [field]: value });
                if (existing.length > 0 && existing[0] !== record) {
                    throw new Error(`Field ${field} must be unique`);
                }
            }
        });
    }
    
    matchesConditions(record, conditions) {
        return Object.keys(conditions).every(key => {
            const condition = conditions[key];
            const value = record[key];
            
            if (typeof condition === 'object' && condition !== null) {
                // Özel operatörler
                if (condition.$gt !== undefined) return value > condition.$gt;
                if (condition.$gte !== undefined) return value >= condition.$gte;
                if (condition.$lt !== undefined) return value < condition.$lt;
                if (condition.$lte !== undefined) return value <= condition.$lte;
                if (condition.$ne !== undefined) return value !== condition.$ne;
                if (condition.$in !== undefined) return condition.$in.includes(value);
                if (condition.$nin !== undefined) return !condition.$nin.includes(value);
                if (condition.$regex !== undefined) {
                    const regex = new RegExp(condition.$regex, condition.$options || '');
                    return regex.test(value);
                }
            }
            
            return value === condition;
        });
    }
    
    save() {
        try {
            localStorage.setItem(this.dbName, JSON.stringify(this.tables));
        } catch (error) {
            console.error('Database save error:', error);
        }
    }
    
    clear() {
        this.tables = {};
        localStorage.removeItem(this.dbName);
        this.createDefaultTables();
    }
    
    export() {
        return JSON.stringify(this.tables, null, 2);
    }
    
    import(jsonData) {
        try {
            this.tables = JSON.parse(jsonData);
            this.save();
            return true;
        } catch (error) {
            console.error('Database import error:', error);
            return false;
        }
    }
}

// Veritabanı Yöneticisi
class DatabaseManager {
    constructor() {
        this.db = new SimpleDB();
        this.initializeDefaultData();
    }
    
    initializeDefaultData() {
        // Varsayılan kullanıcıları ekle
        if (this.db.count('users') === 0) {
            this.db.insert('users', {
                name: 'Mehmet',
                email: 'mehmet@example.com',
                avatar: 'M'
            });
            
            this.db.insert('users', {
                name: 'Sevgilim',
                email: 'sevgilim@example.com',
                avatar: 'S'
            });
        }
        
        // Varsayılan mesajları ekle
        if (this.db.count('messages') === 0) {
            this.db.insert('messages', {
                sender: 'mehmet',
                recipient: 'sevgilim',
                title: 'Günaydın Canım Aşkım',
                content: `Günaydın canım aşkım ❤️

Bugün de gözlerimi açtığımda aklıma ilk gelen sen oldun. Umarım güzel rüyalar görmüşsündür ve bugün senin için harika bir gün olur.

Seni çok seviyorum ve her geçen gün daha da çok seviyorum. Sen benim hayatımın en güzel hediyesisin.

Öpücüklerle,
Mehmet 💕`,
                type: 'Aşk Mektubu',
                featured: true
            });
        }
        
        // Varsayılan oyunları ekle
        if (this.db.count('games') === 0) {
            this.db.insert('games', {
                name: 'Kalp Yakalama',
                description: 'Düşen kalpleri yakala ve puan kazan!',
                icon: '💖',
                difficulty: 'easy',
                category: 'arcade'
            });
            
            this.db.insert('games', {
                name: 'Hafıza Oyunu',
                description: 'Kartları eşleştir ve hafızanı güçlendir!',
                icon: '🧠',
                difficulty: 'medium',
                category: 'puzzle'
            });
        }
        
        // Varsayılan hediyeleri ekle
        if (this.db.count('gifts') === 0) {
            this.db.insert('gifts', {
                sender: 'mehmet',
                recipient: 'sevgilim',
                title: 'Sanal Gül Buketi',
                description: 'Sana olan sevgimin bir göstergesi',
                content: '12 adet kırmızı gül ve sonsuz sevgi 💕',
                icon: '🌹',
                type: 'virtual'
            });
        }
        
        // Varsayılan anıları ekle
        if (this.db.count('memories') === 0) {
            this.db.insert('memories', {
                title: 'İlk Tanışma',
                description: 'O güzel günü hiç unutmayacağım',
                content: 'İlk kez gözlerinin içine baktığım o an...',
                date: new Date('2023-06-15'),
                category: 'milestone',
                createdBy: 'mehmet',
                tags: ['ilk', 'tanışma', 'özel']
            });
        }
    }
    
    // Mesaj işlemleri
    getMessages(userId) {
        if (userId) {
            const allMessages = this.db.find('messages');
            return allMessages.filter(msg => msg.sender === userId || msg.recipient === userId);
        }
        return this.db.find('messages');
    }
    
    saveMessage(messageData) {
        return this.db.insert('messages', messageData);
    }
    
    updateMessage(messageData) {
        return this.db.update('messages', { id: messageData.id }, messageData);
    }
    
    deleteMessage(messageId) {
        return this.db.delete('messages', { id: messageId });
    }
    
    getUnreadMessages(userId) {
        return this.db.find('messages', {
            recipient: userId,
            read: false
        });
    }
    
    markMessageAsRead(messageId) {
        return this.db.update('messages', { id: messageId }, { read: true });
    }
    
    // Oyun işlemleri
    getGames() {
        return this.db.find('games', { isActive: true });
    }
    
    saveGameScore(gameId, userId, score, level = 1, duration = null) {
        return this.db.insert('gameScores', {
            gameId,
            userId,
            score,
            level,
            duration
        });
    }
    
    getHighScore(gameId, userId) {
        const scores = this.db.find('gameScores', { gameId, userId });
        return scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
    }
    
    // Hediye işlemleri
    getGifts(userId) {
        return this.db.find('gifts', { recipient: userId });
    }
    
    openGift(giftId) {
        return this.db.update('gifts', { id: giftId }, {
            opened: true,
            openedAt: new Date()
        });
    }
    
    // Anı işlemleri
    getMemories() {
        return this.db.find('memories').sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    addMemory(memoryData) {
        return this.db.insert('memories', memoryData);
    }
    
    // İstatistikler
    getStats(userId) {
        const allMessages = this.db.find('messages');
        const userMessages = allMessages.filter(msg => msg.sender === userId || msg.recipient === userId);
        
        return {
            totalMessages: userMessages.length,
            unreadMessages: this.db.count('messages', {
                recipient: userId,
                read: false
            }),
            totalGifts: this.db.count('gifts', { recipient: userId }),
            unopenedGifts: this.db.count('gifts', {
                recipient: userId,
                opened: false
            }),
            totalMemories: this.db.count('memories'),
            gamesPlayed: this.db.count('gameScores', { userId })
        };
    }
}

// Global instance
window.DatabaseManager = DatabaseManager;
window.db = new DatabaseManager();

console.log('Veritabanı sistemi yüklendi! 🗄️'); 