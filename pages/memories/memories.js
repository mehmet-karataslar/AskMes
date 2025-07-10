// Anılar Sayfası - Modern ve Canlı JavaScript

// Anı State
const MemoryState = {
    currentUser: 'mehmet', // Default user
    memories: [],
    filteredMemories: [],
    selectedMemory: null,
    editingMemory: null,
    deletingMemory: null,
    currentFilter: 'all',
    currentView: 'grid',
    searchQuery: '',
    isLoading: false,
    isAnimating: false
};

// DOM Elements
let memoryItems, memoriesGallery, searchInput, filterButtons, viewButtons;

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    initializeMemoriesPage();
    loadMemories();
    setupEventListeners();
    setupMusicControl();
    setupScrollAnimations();
    
    // Sayfa başlığını animasyonlu olarak göster
    animatePageLoad();
});

// Anılar Sayfasını Başlat
function initializeMemoriesPage() {
    memoryItems = document.getElementById('memoryItems');
    memoriesGallery = document.getElementById('memoriesGallery');
    searchInput = document.getElementById('searchInput');
    filterButtons = document.querySelectorAll('.filter-btn');
    viewButtons = document.querySelectorAll('.view-btn');
    
    // Mevcut kullanıcıyı ayarla
    MemoryState.currentUser = getCurrentUser() || 'mehmet';
    updateUserDisplay();
    
    console.log('✨ Anılar sayfası başlatıldı - Modern tasarım aktif!');
}

// Kullanıcı Görüntüsünü Güncelle
function updateUserDisplay() {
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = MemoryState.currentUser === 'mehmet' ? 'Mehmet' : 'Sevgilim';
    }
}

// Sayfa Yükleme Animasyonu
function animatePageLoad() {
    const title = document.querySelector('.page-title');
    const header = document.querySelector('.page-header');
    const filters = document.querySelector('.memories-filters');
    
    if (title) {
        title.style.opacity = '0';
        title.style.transform = 'translateY(-30px)';
        
        setTimeout(() => {
            title.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
        }, 200);
    }
    
    if (header) {
        header.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            header.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            header.style.transform = 'translateY(0)';
        }, 300);
    }
    
    if (filters) {
        filters.style.opacity = '0';
        filters.style.transform = 'translateY(20px)';
        setTimeout(() => {
            filters.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            filters.style.opacity = '1';
            filters.style.transform = 'translateY(0)';
        }, 500);
    }
}

// Scroll Animasyonları
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
                entry.target.style.opacity = '1';
            }
        });
    }, observerOptions);
    
    // CSS için slide animasyonu ekle
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .memory-item {
            opacity: 0;
        }
        
        .memory-item.visible {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    
    // Memory item'ları gözlemle
    setTimeout(() => {
        document.querySelectorAll('.memory-item').forEach(item => {
            observer.observe(item);
        });
    }, 100);
}

// Anıları Yükle
async function loadMemories() {
    setLoadingState(true);
    
    try {
        // Simulated data - gerçek veri tabanı entegrasyonu için değiştir
        const memoriesData = await loadSampleMemories();
        MemoryState.memories = memoriesData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Filtrelenmiş anıları güncelle
        applyFilters();
        
        // Anıları görüntüle
        await displayMemories();
        
    } catch (error) {
        console.error('❌ Anılar yüklenirken hata:', error);
        showNotification('Anılar yüklenirken bir hata oluştu', 'error');
    } finally {
        setLoadingState(false);
    }
}

// Sample Memory Data
async function loadSampleMemories() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: '1',
                    title: 'İlk Buluşmamız',
                    date: '2024-01-15',
                    description: 'Kahve dükkanında geçirdiğimiz muhteşem ilk randevu. Saatlerce konuştuk ve zamanın nasıl geçtiğini anlamadık.',
                    location: 'Starbucks Kadıköy',
                    tags: ['ilk', 'romantik', 'kahve'],
                    type: 'photo',
                    media: null,
                    author: 'mehmet',
                    createdAt: '2024-01-15T18:30:00Z'
                },
                {
                    id: '2',
                    title: 'Sevgililer Günü Sürprizi',
                    date: '2024-02-14',
                    description: 'Benim için hazırladığın o muhteşem sürpriz yemek. Her detayı mükemmeldi, özellikle de o tatlı gülümsemen.',
                    location: 'Evimiz',
                    tags: ['sevgililer', 'sürpriz', 'yemek'],
                    type: 'note',
                    media: null,
                    author: 'mehmet',
                    createdAt: '2024-02-14T20:00:00Z'
                },
                {
                    id: '3',
                    title: 'Sahilde Gün Batımı',
                    date: '2024-03-10',
                    description: 'Sahilde el ele tutarak izlediğimiz en güzel gün batımı. O anı sonsuza kadar aklımda saklayacağım.',
                    location: 'Caddebostan Sahili',
                    tags: ['gün batımı', 'sahil', 'romantik'],
                    type: 'photo',
                    media: null,
                    author: 'sevgilim',
                    createdAt: '2024-03-10T19:45:00Z'
                }
            ]);
        }, 1000);
    });
}

// Anıları Görüntüle
async function displayMemories() {
    if (!memoryItems) return;
    
    if (MemoryState.filteredMemories.length === 0) {
        memoryItems.innerHTML = `
            <div class="empty-memories">
                <i class="fas fa-camera-retro"></i>
                <h3>Henüz anı yok</h3>
                <p>İlk anınızı ekleyin ve güzel anılarınızı paylaşmaya başlayın!</p>
                <button onclick="openNewMemoryModal()">
                    <i class="fas fa-plus"></i>
                    İlk Anıyı Ekle
                </button>
            </div>
        `;
        return;
    }
    
    // Grid/List view class'ı ayarla
    memoryItems.className = `memory-items ${MemoryState.currentView}-view`;
    
    const memoriesHtml = MemoryState.filteredMemories.map((memory, index) => {
        const mediaHtml = getMediaHtml(memory);
        const tagsHtml = memory.tags ? memory.tags.map(tag => 
            `<span class="memory-tag">${tag}</span>`
        ).join('') : '';
        
        return `
            <div class="memory-item ${memory.type === 'note' ? 'note-type' : ''}" 
                 data-id="${memory.id}" 
                 style="animation-delay: ${index * 0.1}s"
                 onclick="openMemoryDetail('${memory.id}')">
                
                ${memory.author === MemoryState.currentUser ? `
                    <div class="memory-actions">
                        <button class="memory-action-btn edit" onclick="event.stopPropagation(); editMemory('${memory.id}')" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="memory-action-btn delete" onclick="event.stopPropagation(); deleteMemory('${memory.id}')" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
                
                <div class="memory-media">
                    ${mediaHtml}
                    <div class="memory-type-icon">
                        <i class="fas ${getTypeIcon(memory.type)}"></i>
                    </div>
                    <div class="media-overlay">
                        <span>💖 Detayları Gör</span>
                    </div>
                </div>
                
                <div class="memory-content">
                    <div class="memory-header">
                        <h3 class="memory-title">${memory.title}</h3>
                        <span class="memory-date">${formatDate(memory.date)}</span>
                    </div>
                    
                    ${memory.description ? `
                        <div class="memory-description">${memory.description}</div>
                    ` : ''}
                    
                    ${memory.location ? `
                        <div class="memory-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${memory.location}</span>
                        </div>
                    ` : ''}
                    
                    ${tagsHtml ? `
                        <div class="memory-tags">${tagsHtml}</div>
                    ` : ''}
                    
                    <div class="memory-meta">
                        <div class="memory-author ${memory.author === MemoryState.currentUser ? 'from-me' : 'from-partner'}">
                            <i class="fas ${memory.author === MemoryState.currentUser ? 'fa-user' : 'fa-heart'}"></i>
                            <span>${memory.author === MemoryState.currentUser ? 'Ben' : 'Sevgilim'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    memoryItems.innerHTML = memoriesHtml;
    
    // Scroll animasyonlarını yeniden ayarla
    setTimeout(() => {
        setupScrollAnimations();
    }, 100);
}

// Medya HTML'i Oluştur
function getMediaHtml(memory) {
    if (memory.type === 'note') {
        return `<i class="fas fa-sticky-note"></i>`;
    } else if (memory.type === 'video') {
        return memory.media ? 
            `<video src="${memory.media}" controls></video>` :
            `<i class="fas fa-video"></i>`;
    } else if (memory.type === 'photo') {
        return memory.media ? 
            `<img src="${memory.media}" alt="${memory.title}">` :
            `<i class="fas fa-image"></i>`;
    } else {
        return `<i class="fas fa-heart"></i>`;
    }
}

// Tür İkonu Al
function getTypeIcon(type) {
    const icons = {
        photo: 'fa-image',
        video: 'fa-video',
        note: 'fa-sticky-note'
    };
    return icons[type] || 'fa-heart';
}

// Anı Detayını Aç
function openMemoryDetail(memoryId) {
    const memory = MemoryState.memories.find(m => m.id === memoryId);
    if (!memory) return;
    
    MemoryState.selectedMemory = memory;
    
    const modal = document.getElementById('memoryDetailModal');
    const content = document.getElementById('memoryDetailContent');
    const title = document.getElementById('detailTitle');
    
    if (modal && content && title) {
        title.innerHTML = `<i class="fas fa-heart"></i> ${memory.title}`;
        
        const mediaHtml = memory.type === 'note' ? '' : 
            memory.type === 'video' ? 
                `<video src="${memory.media}" controls class="detail-media"></video>` :
                memory.media ? 
                    `<img src="${memory.media}" alt="${memory.title}" class="detail-media">` :
                    '';
        
        const tagsHtml = memory.tags ? memory.tags.map(tag => 
            `<span class="detail-tag">${tag}</span>`
        ).join('') : '';
        
        content.innerHTML = `
            ${mediaHtml}
            <div class="detail-info">
                <div class="detail-meta">
                    <div class="detail-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(memory.date)}</span>
                    </div>
                    <div class="detail-meta-item">
                        <i class="fas ${memory.author === MemoryState.currentUser ? 'fa-user' : 'fa-heart'}"></i>
                        <span>${memory.author === MemoryState.currentUser ? 'Ben' : 'Sevgilim'}</span>
                    </div>
                    ${memory.location ? `
                        <div class="detail-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${memory.location}</span>
                        </div>
                    ` : ''}
                </div>
                
                ${memory.description ? `
                    <div class="detail-description">${memory.description.replace(/\n/g, '<br>')}</div>
                ` : ''}
                
                ${tagsHtml ? `
                    <div class="detail-tags">${tagsHtml}</div>
                ` : ''}
                
                ${memory.author === MemoryState.currentUser ? `
                    <div class="detail-actions">
                        <button class="btn-secondary" onclick="editMemory('${memory.id}')">
                            <i class="fas fa-edit"></i>
                            Düzenle
                        </button>
                        <button class="btn-danger" onclick="deleteMemory('${memory.id}')">
                            <i class="fas fa-trash"></i>
                            Sil
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        showModal(modal);
    }
}

// Modal Göster
function showModal(modal) {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Modal backdrop click to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    }
}

// Modal Gizle
function hideModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Anı Detayını Kapat
function closeMemoryDetailModal() {
    const modal = document.getElementById('memoryDetailModal');
    hideModal(modal);
    MemoryState.selectedMemory = null;
}

// Yeni Anı Modal'ını Aç
function openNewMemoryModal() {
    const modal = document.getElementById('newMemoryModal');
    if (modal) {
        // Formu sıfırla
        const form = document.getElementById('memoryForm');
        if (form) {
            form.reset();
            
            // Bugünün tarihini ayarla
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('memoryDate');
            if (dateInput) {
                dateInput.value = today;
            }
        }
        
        // Upload preview'ı sıfırla
        resetUploadPreview('uploadPreview');
        
        // Medya türü değişikliğini dinle
        updateMediaUploadVisibility();
        
        showModal(modal);
    }
}

// Yeni Anı Modal'ını Kapat
function closeNewMemoryModal() {
    const modal = document.getElementById('newMemoryModal');
    hideModal(modal);
}

// Event Listener'ları Ayarla
function setupEventListeners() {
    // Yeni anı formu
    const memoryForm = document.getElementById('memoryForm');
    if (memoryForm) {
        memoryForm.addEventListener('submit', handleNewMemory);
    }
    
    // Arama
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch(e);
            }, 300); // Debounce search
        });
        
        // Arama placeholder animasyonu
        animateSearchPlaceholder();
    }
    
    // Filtreler
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            setActiveFilter(this.dataset.filter);
        });
    });
    
    // Görünüm değiştirme
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            setActiveView(this.dataset.view);
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // ESC to close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                hideModal(activeModal);
            }
        }
        
        // Ctrl+N for new memory
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            openNewMemoryModal();
        }
    });
}

// Arama Placeholder Animasyonu
function animateSearchPlaceholder() {
    if (!searchInput) return;
    
    const placeholders = [
        'Anıları ara...',
        'Bir tarih arayın...',
        'Konum arayın...',
        'Etiket arayın...',
        'Anıları keşfedin...'
    ];
    
    let currentIndex = 0;
    
    setInterval(() => {
        currentIndex = (currentIndex + 1) % placeholders.length;
        searchInput.placeholder = placeholders[currentIndex];
    }, 3000);
}

// Yeni Anı Ekle
async function handleNewMemory(e) {
    e.preventDefault();
    
    if (MemoryState.isLoading) return;
    
    const title = document.getElementById('memoryTitle').value.trim();
    const date = document.getElementById('memoryDate').value;
    const description = document.getElementById('memoryDescription').value.trim();
    const location = document.getElementById('memoryLocation').value.trim();
    const tags = document.getElementById('memoryTags').value.trim();
    const mediaType = document.querySelector('input[name="mediaType"]:checked')?.value || 'note';
    const mediaFile = document.getElementById('memoryMedia').files[0];
    
    if (!title || !date) {
        showNotification('Lütfen başlık ve tarih alanlarını doldurun', 'error');
        return;
    }
    
    if (mediaType !== 'note' && !mediaFile) {
        showNotification('Lütfen bir medya dosyası seçin', 'error');
        return;
    }
    
    setLoadingState(true);
    
    try {
        // Medyayı işle
        let mediaData = null;
        if (mediaFile && mediaType !== 'note') {
            mediaData = await processMediaFile(mediaFile);
        }
        
        // Yeni anı oluştur
        const newMemory = {
            id: generateId(),
            title,
            date,
            description,
            location,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            type: mediaType,
            media: mediaData,
            author: MemoryState.currentUser,
            createdAt: new Date().toISOString()
        };
        
        // Local state'i güncelle
        MemoryState.memories.unshift(newMemory);
        
        // Filtreleri uygula ve görüntüyü güncelle
        applyFilters();
        await displayMemories();
        
        // Modal'ı kapat
        closeNewMemoryModal();
        
        showNotification('Anı başarıyla eklendi! ❤️', 'success');
        
        // Confetti efekti
        createConfetti();
        
    } catch (error) {
        console.error('❌ Anı eklenirken hata:', error);
        showNotification('Anı eklenirken bir hata oluştu', 'error');
    } finally {
        setLoadingState(false);
    }
}

// Arama İşlemi
function handleSearch(e) {
    MemoryState.searchQuery = e.target.value.toLowerCase();
    applyFilters();
    displayMemories();
    
    // Arama sonuçları animasyonu
    if (MemoryState.searchQuery) {
        searchInput.style.transform = 'scale(1.02)';
        setTimeout(() => {
            searchInput.style.transform = 'scale(1)';
        }, 200);
    }
}

// Aktif Filtreyi Ayarla
function setActiveFilter(filter) {
    MemoryState.currentFilter = filter;
    
    // Görsel güncelleme
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
            
            // Aktif buton animasyonu
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        }
    });
    
    applyFilters();
    displayMemories();
}

// Aktif Görünümü Ayarla
function setActiveView(view) {
    MemoryState.currentView = view;
    
    // Görsel güncelleme
    viewButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
    
    displayMemories();
}

// Filtreleri Uygula
function applyFilters() {
    let filtered = [...MemoryState.memories];
    
    // Tür filtresi
    if (MemoryState.currentFilter !== 'all') {
        if (MemoryState.currentFilter === 'photos') {
            filtered = filtered.filter(m => m.type === 'photo');
        } else if (MemoryState.currentFilter === 'videos') {
            filtered = filtered.filter(m => m.type === 'video');
        } else if (MemoryState.currentFilter === 'notes') {
            filtered = filtered.filter(m => m.type === 'note');
        }
    }
    
    // Arama filtresi
    if (MemoryState.searchQuery) {
        filtered = filtered.filter(memory => 
            memory.title.toLowerCase().includes(MemoryState.searchQuery) ||
            (memory.description && memory.description.toLowerCase().includes(MemoryState.searchQuery)) ||
            (memory.location && memory.location.toLowerCase().includes(MemoryState.searchQuery)) ||
            (memory.tags && memory.tags.some(tag => tag.toLowerCase().includes(MemoryState.searchQuery)))
        );
    }
    
    MemoryState.filteredMemories = filtered;
}

// Loading State
function setLoadingState(isLoading) {
    MemoryState.isLoading = isLoading;
    
    const loadingElement = document.getElementById('loadingMemories');
    if (loadingElement) {
        loadingElement.style.display = isLoading ? 'flex' : 'none';
    }
    
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(btn => {
        btn.disabled = isLoading;
        if (isLoading) {
            btn.classList.add('loading');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
        } else {
            btn.classList.remove('loading');
            btn.innerHTML = '<i class="fas fa-save"></i> Anıyı Kaydet';
        }
    });
}

// Müzik Kontrolü
function setupMusicControl() {
    const musicToggle = document.getElementById('musicToggle');
    
    if (musicToggle) {
        musicToggle.addEventListener('click', function() {
            // Müzik çalma simülasyonu
            const isPlaying = this.classList.contains('playing');
            
            if (isPlaying) {
                this.classList.remove('playing');
                this.innerHTML = '<i class="fas fa-music"></i>';
                showNotification('Müzik durduruldu 🎵', 'info');
            } else {
                this.classList.add('playing');
                this.innerHTML = '<i class="fas fa-pause"></i>';
                showNotification('Müzik çalıyor 🎵', 'info');
            }
            
            // Butona animasyon efekti
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    }
}

// Bildirim Göster
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Notification CSS
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${type === 'success' ? 'var(--success-gradient)' : type === 'error' ? 'var(--warning-gradient)' : 'var(--accent-gradient)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animasyon
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Otomatik kaldır
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Confetti Efekti
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#43e97b', '#38f9d7'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -10px;
            left: ${Math.random() * window.innerWidth}px;
            z-index: 10000;
            border-radius: 50%;
            pointer-events: none;
            animation: confettiFall ${Math.random() * 2 + 2}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 4000);
    }
    
    // Confetti animasyonu
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            to {
                transform: translateY(${window.innerHeight + 20}px) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Yardımcı Fonksiyonlar
function getCurrentUser() {
    return localStorage.getItem('currentUser') || 'mehmet';
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function updateMediaUploadVisibility() {
    const mediaType = document.querySelector('input[name="mediaType"]:checked')?.value;
    const uploadGroup = document.getElementById('mediaUploadGroup');
    
    if (uploadGroup) {
        uploadGroup.style.display = mediaType === 'note' ? 'none' : 'block';
    }
}

function resetUploadPreview(previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    
    preview.classList.remove('has-media');
    preview.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Dosya seçin veya sürükleyin</p>
        <span class="upload-hint">Maksimum 10MB</span>
    `;
}

function processMediaFile(file) {
    return new Promise((resolve, reject) => {
        if (file.size > 10 * 1024 * 1024) {
            reject(new Error('Dosya boyutu 10MB\'dan büyük olamaz'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Silme ve düzenleme işlemleri (basitleştirilmiş)
function editMemory(memoryId) {
    showNotification('Düzenleme özelliği yakında eklenecek! ✨', 'info');
}

function deleteMemory(memoryId) {
    showNotification('Silme özelliği yakında eklenecek! ✨', 'info');
}

// Logout işlemi
function logout() {
    if (confirm('Çıkmak istediğinizden emin misiniz?')) {
        showNotification('Çıkış yapılıyor... 👋', 'info');
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 1000);
    }
}

console.log('💕 Anılar sayfası hazır - Güzel anılar biriktirin! 📸'); 