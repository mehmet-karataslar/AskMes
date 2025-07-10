// Hediyeler Sayfası - Modern ve Etkileşimli JavaScript

// Hediye State
const GiftState = {
    currentUser: 'mehmet',
    gifts: [],
    filteredGifts: [],
    wishlist: [],
    selectedGift: null,
    editingGift: null,
    currentCategory: 'all',
    searchQuery: '',
    isLoading: false,
    fabMenuOpen: false,
    stats: {
        totalGifts: 0,
        givenGifts: 0,
        receivedGifts: 0,
        wishlistItems: 0
    }
};

// DOM Elements
let giftItems, giftContainer, searchInput, categoryTabs, mainFab, fabMenu;

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    initializeGiftsPage();
    loadGifts();
    setupEventListeners();
    setupMusicControl();
    setupScrollAnimations();
    animatePageLoad();
});

// Hediyeler Sayfasını Başlat
function initializeGiftsPage() {
    giftItems = document.getElementById('giftItems');
    giftContainer = document.getElementById('giftContainer');
    searchInput = document.getElementById('searchInput');
    categoryTabs = document.querySelectorAll('.category-tab');
    mainFab = document.getElementById('mainFab');
    fabMenu = document.getElementById('fabMenu');
    
    // Kullanıcı bilgilerini güncelle
    GiftState.currentUser = getCurrentUser() || 'mehmet';
    updateUserDisplay();
    
    console.log('🎁 Hediyeler sayfası başlatıldı - Modern tasarım aktif!');
}

// Kullanıcı Bilgilerini Güncelle
function updateUserDisplay() {
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = GiftState.currentUser === 'mehmet' ? 'Mehmet' : 'Sevgilim';
    }
}

// Sayfa Yükleme Animasyonu
function animatePageLoad() {
    const elements = [
        { el: '.page-title', delay: 200 },
        { el: '.page-header', delay: 300 },
        { el: '.gifts-categories', delay: 500 },
        { el: '.fab-group', delay: 700 }
    ];
    
    elements.forEach(({el, delay}) => {
        const element = document.querySelector(el);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, delay);
        }
    });
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
    
    // Stiller ekle
    if (!document.getElementById('giftAnimationStyles')) {
        const style = document.createElement('style');
        style.id = 'giftAnimationStyles';
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
            
            @keyframes floatIn {
                from {
                    opacity: 0;
                    transform: translateY(50px) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .gift-item {
                opacity: 0;
            }
            
            .gift-item.visible {
                opacity: 1;
            }
            
            .gift-item:hover {
                animation: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Gift item'ları gözlemle
    setTimeout(() => {
        document.querySelectorAll('.gift-item').forEach(item => {
            observer.observe(item);
        });
    }, 100);
}

// Hediyeleri Yükle
async function loadGifts() {
    setLoadingState(true);
    
    try {
        const giftData = await loadSampleGifts();
        GiftState.gifts = giftData.gifts;
        GiftState.wishlist = giftData.wishlist;
        
        // İstatistikleri güncelle
        updateStats();
        
        // Filtrelenmiş hediyeleri güncelle
        applyFilters();
        
        // Hediyeleri görüntüle
        await displayGifts();
        
    } catch (error) {
        console.error('❌ Hediyeler yüklenirken hata:', error);
        showNotification('Hediyeler yüklenirken bir hata oluştu', 'error');
    } finally {
        setLoadingState(false);
    }
}

// Örnek Hediye Verileri
async function loadSampleGifts() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                gifts: [
                    {
                        id: '1',
                        name: 'Romantik Akşam Yemeği',
                        description: 'Şehrin en güzel manzaralı restoranında unutulmaz bir akşam yemeği',
                        price: 500,
                        category: 'experience',
                        occasion: 'Sevgililer Günü',
                        status: 'given',
                        giver: 'mehmet',
                        receiver: 'sevgilim',
                        date: '2024-02-14',
                        location: 'Sunset Restaurant',
                        image: null,
                        tags: ['romantik', 'yemek', 'özel'],
                        rating: 5,
                        createdAt: '2024-02-14T18:00:00Z'
                    },
                    {
                        id: '2',
                        name: 'Altın Kalp Kolye',
                        description: 'Özel gravürlü altın kalp kolye - "Sonsuz Aşk" yazısı ile',
                        price: 1200,
                        category: 'jewelry',
                        occasion: 'Yıl Dönümü',
                        status: 'received',
                        giver: 'sevgilim',
                        receiver: 'mehmet',
                        date: '2024-01-15',
                        location: 'Mücevherat Dünyası',
                        image: null,
                        tags: ['altın', 'kolye', 'özel'],
                        rating: 5,
                        createdAt: '2024-01-15T14:30:00Z'
                    }
                ],
                wishlist: [
                    {
                        id: 'w1',
                        name: 'Çiftler İçin Spa Günü',
                        description: 'Lüks spa merkezi çiftler paketi - masaj, sauna ve özel dinlenme',
                        estimatedPrice: 800,
                        category: 'experience',
                        priority: 'high',
                        link: 'https://example.com/spa',
                        notes: 'Özellikle hafta sonu rezervasyonu yapmak istiyoruz',
                        tags: ['spa', 'relax', 'çiftler'],
                        addedBy: 'mehmet',
                        createdAt: '2024-03-01T10:00:00Z'
                    },
                    {
                        id: 'w2',
                        name: 'Vintage Fotoğraf Makinesi',
                        description: 'Polaroid instant kamera - anıları anında yazdırmak için',
                        estimatedPrice: 300,
                        category: 'electronics',
                        priority: 'medium',
                        link: 'https://example.com/camera',
                        notes: 'Renkli film paketleri ile birlikte',
                        tags: ['fotoğraf', 'anı', 'vintage'],
                        addedBy: 'sevgilim',
                        createdAt: '2024-02-20T16:00:00Z'
                    }
                ]
            });
        }, 1000);
    });
}

// İstatistikleri Güncelle
function updateStats() {
    GiftState.stats.totalGifts = GiftState.gifts.length;
    GiftState.stats.givenGifts = GiftState.gifts.filter(g => g.status === 'given').length;
    GiftState.stats.receivedGifts = GiftState.gifts.filter(g => g.status === 'received').length;
    GiftState.stats.wishlistItems = GiftState.wishlist.length;
    
    // DOM'u güncelle
    const statElements = {
        totalGifts: document.getElementById('totalGifts'),
        givenGifts: document.getElementById('givenGifts'),
        receivedGifts: document.getElementById('receivedGifts'),
        wishlistItems: document.getElementById('wishlistItems')
    };
    
    Object.keys(statElements).forEach(key => {
        const element = statElements[key];
        if (element) {
            // Animasyonlu sayı güncelleme
            animateNumberUpdate(element, GiftState.stats[key]);
        }
    });
}

// Animasyonlu Sayı Güncelleme
function animateNumberUpdate(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const increment = targetValue > currentValue ? 1 : -1;
    const duration = 1000;
    const steps = Math.abs(targetValue - currentValue);
    const stepTime = duration / steps;
    
    let current = currentValue;
    
    const updateNumber = () => {
        current += increment;
        element.textContent = current;
        
        if (current !== targetValue) {
            setTimeout(updateNumber, stepTime);
        }
    };
    
    if (steps > 0) {
        updateNumber();
    }
}

// Hediyeleri Görüntüle
async function displayGifts() {
    if (!giftItems) return;
    
    const allItems = [
        ...GiftState.filteredGifts.map(gift => ({...gift, itemType: 'gift'})),
        ...(GiftState.currentCategory === 'all' || GiftState.currentCategory === 'wishlist' ? 
            GiftState.wishlist.map(item => ({...item, itemType: 'wishlist'})) : [])
    ];
    
    if (allItems.length === 0) {
        giftItems.innerHTML = `
            <div class="empty-gifts">
                <i class="fas fa-gift"></i>
                <h3>Henüz hediye yok</h3>
                <p>İlk hediyenizi ekleyin ve güzel anılarınızı paylaşmaya başlayın!</p>
                <button onclick="openNewGiftModal()">
                    <i class="fas fa-plus"></i>
                    İlk Hediyeyi Ekle
                </button>
            </div>
        `;
        return;
    }
    
    const itemsHtml = allItems.map((item, index) => {
        if (item.itemType === 'wishlist') {
            return createWishlistItemHtml(item, index);
        } else {
            return createGiftItemHtml(item, index);
        }
    }).join('');
    
    giftItems.innerHTML = itemsHtml;
    
    // Animasyonları yeniden ayarla
    setTimeout(() => {
        setupScrollAnimations();
        setupGiftItemInteractions();
    }, 100);
}

// Hediye Item HTML Oluştur
function createGiftItemHtml(gift, index) {
    const mediaHtml = gift.image ? 
        `<img src="${gift.image}" alt="${gift.name}">` :
        `<i class="fas fa-gift placeholder-icon"></i>`;
    
    const tagsHtml = gift.tags ? gift.tags.map(tag => 
        `<span class="gift-tag">${tag}</span>`
    ).join('') : '';
    
    return `
        <div class="gift-item ${gift.status}" 
             data-id="${gift.id}" 
             data-type="gift"
             style="animation-delay: ${index * 0.1}s"
             onclick="openGiftDetail('${gift.id}')">
            
            <div class="gift-image">
                ${mediaHtml}
                <div class="gift-status ${gift.status}">
                    ${gift.status === 'given' ? 'Verilen' : 'Alınan'}
                </div>
                <div class="gift-category">
                    <i class="fas ${getCategoryIcon(gift.category)}"></i>
                    ${getCategoryName(gift.category)}
                </div>
                
                ${gift.giver === GiftState.currentUser ? `
                    <div class="gift-actions">
                        <button class="gift-action-btn edit" onclick="event.stopPropagation(); editGift('${gift.id}')" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="gift-action-btn delete" onclick="event.stopPropagation(); deleteGift('${gift.id}')" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
            
            <div class="gift-content">
                <div class="gift-header">
                    <h3 class="gift-name">${gift.name}</h3>
                    <span class="gift-date">${formatDate(gift.date)}</span>
                </div>
                
                <div class="gift-description">${gift.description}</div>
                
                <div class="gift-details">
                    <div class="gift-price">₺${gift.price.toLocaleString()}</div>
                    <div class="gift-occasion">
                        <i class="fas fa-calendar-heart"></i>
                        ${gift.occasion}
                    </div>
                </div>
                
                ${tagsHtml ? `
                    <div class="gift-tags">${tagsHtml}</div>
                ` : ''}
                
                <div class="gift-meta">
                    <div class="gift-giver ${gift.giver === GiftState.currentUser ? 'from-me' : 'from-partner'}">
                        <i class="fas ${gift.giver === GiftState.currentUser ? 'fa-user' : 'fa-heart'}"></i>
                        <span>${gift.giver === GiftState.currentUser ? 'Benden' : 'Sevgilimden'}</span>
                    </div>
                    <div class="gift-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${gift.location}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Dilek Listesi Item HTML Oluştur
function createWishlistItemHtml(item, index) {
    const priorityColor = {
        high: 'var(--warning-gradient)',
        medium: 'linear-gradient(135deg, #ff9800, #ffb74d)',
        low: 'var(--success-gradient)'
    };
    
    const tagsHtml = item.tags ? item.tags.map(tag => 
        `<span class="gift-tag">${tag}</span>`
    ).join('') : '';
    
    return `
        <div class="gift-item wishlist" 
             data-id="${item.id}" 
             data-type="wishlist"
             style="animation-delay: ${index * 0.1}s"
             onclick="openWishlistDetail('${item.id}')">
            
            <div class="gift-image">
                <i class="fas fa-star placeholder-icon"></i>
                <div class="gift-status wishlist">Dilek</div>
                <div class="gift-category">
                    <i class="fas ${getCategoryIcon(item.category)}"></i>
                    ${getCategoryName(item.category)}
                </div>
                
                ${item.addedBy === GiftState.currentUser ? `
                    <div class="gift-actions">
                        <button class="gift-action-btn edit" onclick="event.stopPropagation(); editWishlistItem('${item.id}')" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="gift-action-btn delete" onclick="event.stopPropagation(); deleteWishlistItem('${item.id}')" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
            
            <div class="gift-content">
                <div class="gift-header">
                    <h3 class="gift-name">${item.name}</h3>
                    <span class="wish-priority ${item.priority}" style="background: ${priorityColor[item.priority]}">
                        ${item.priority === 'high' ? 'Yüksek' : item.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                </div>
                
                <div class="gift-description">${item.description}</div>
                
                <div class="gift-details">
                    <div class="gift-price">~₺${item.estimatedPrice.toLocaleString()}</div>
                </div>
                
                ${item.notes ? `
                    <div class="gift-notes">
                        <i class="fas fa-sticky-note"></i>
                        ${item.notes}
                    </div>
                ` : ''}
                
                ${tagsHtml ? `
                    <div class="gift-tags">${tagsHtml}</div>
                ` : ''}
                
                <div class="gift-meta">
                    <div class="gift-giver ${item.addedBy === GiftState.currentUser ? 'from-me' : 'from-partner'}">
                        <i class="fas ${item.addedBy === GiftState.currentUser ? 'fa-user' : 'fa-heart'}"></i>
                        <span>${item.addedBy === GiftState.currentUser ? 'Benden' : 'Sevgilimden'}</span>
                    </div>
                    ${item.link ? `
                        <a href="${item.link}" target="_blank" class="wish-link" onclick="event.stopPropagation()">
                            <i class="fas fa-external-link-alt"></i>
                            Linki Görüntüle
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Kategori İkonu Al
function getCategoryIcon(category) {
    const icons = {
        jewelry: 'fa-gem',
        electronics: 'fa-mobile-alt',
        clothing: 'fa-tshirt',
        books: 'fa-book',
        experience: 'fa-map-marker-alt',
        flowers: 'fa-seedling',
        food: 'fa-utensils',
        travel: 'fa-plane',
        other: 'fa-gift'
    };
    return icons[category] || 'fa-gift';
}

// Kategori Adı Al
function getCategoryName(category) {
    const names = {
        jewelry: 'Takı',
        electronics: 'Elektronik',
        clothing: 'Giyim',
        books: 'Kitap',
        experience: 'Deneyim',
        flowers: 'Çiçek',
        food: 'Yiyecek',
        travel: 'Seyahat',
        other: 'Diğer'
    };
    return names[category] || 'Diğer';
}

// Gift Item Etkileşimleri
function setupGiftItemInteractions() {
    const giftItems = document.querySelectorAll('.gift-item');
    
    giftItems.forEach(item => {
        // Hover efektleri
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        });
        
        // Tıklama efekti
        item.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-5px) scale(0.98)';
        });
        
        item.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
    });
}

// Event Listener'ları Ayarla
function setupEventListeners() {
    // Kategori tabları
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            setActiveCategory(this.dataset.category);
        });
    });
    
    // Arama
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch(e);
            }, 300);
        });
        
        // Arama placeholder animasyonu
        animateSearchPlaceholder();
    }
    
    // FAB menu
    if (mainFab) {
        mainFab.addEventListener('click', toggleFabMenu);
    }
    
    // Klavye kısayolları
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeFabMenu();
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                hideModal(activeModal);
            }
        }
        
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            openNewGiftModal();
        }
        
        if (e.ctrlKey && e.key === 'w') {
            e.preventDefault();
            openWishlistModal();
        }
    });
    
    // Scroll event
    window.addEventListener('scroll', handleScroll);
}

// FAB Menu Toggle
function toggleFabMenu() {
    GiftState.fabMenuOpen = !GiftState.fabMenuOpen;
    
    mainFab.classList.toggle('active', GiftState.fabMenuOpen);
    fabMenu.classList.toggle('active', GiftState.fabMenuOpen);
    
    // Animasyon efekti
    if (GiftState.fabMenuOpen) {
        mainFab.style.transform = 'rotate(45deg) scale(1.1)';
        createSparkles(mainFab);
    } else {
        mainFab.style.transform = 'rotate(0deg) scale(1)';
    }
}

// FAB Menu Kapat
function closeFabMenu() {
    GiftState.fabMenuOpen = false;
    mainFab.classList.remove('active');
    fabMenu.classList.remove('active');
    mainFab.style.transform = 'rotate(0deg) scale(1)';
}

// Yıldız Efekti
function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--gold-gradient);
            border-radius: 50%;
            top: ${centerY}px;
            left: ${centerX}px;
            z-index: 10000;
            pointer-events: none;
            animation: sparkleOut 0.6s ease-out forwards;
        `;
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 600);
    }
    
    // Sparkle animasyonu
    if (!document.getElementById('sparkleStyles')) {
        const style = document.createElement('style');
        style.id = 'sparkleStyles';
        style.textContent = `
            @keyframes sparkleOut {
                0% {
                    transform: scale(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: scale(1) rotate(360deg) translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Scroll Handling
function handleScroll() {
    const scrolled = window.pageYOffset;
    const header = document.querySelector('.page-header');
    
    if (header) {
        if (scrolled > 100) {
            header.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
            header.style.backdropFilter = 'blur(15px)';
        } else {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            header.style.backdropFilter = 'blur(10px)';
        }
    }
}

// Arama Placeholder Animasyonu
function animateSearchPlaceholder() {
    if (!searchInput) return;
    
    const placeholders = [
        'Hediyeleri ara...',
        'Hediye adı arayın...',
        'Kategori arayın...',
        'Fiyat aralığı...',
        'Özel günler...'
    ];
    
    let currentIndex = 0;
    
    setInterval(() => {
        currentIndex = (currentIndex + 1) % placeholders.length;
        searchInput.placeholder = placeholders[currentIndex];
    }, 3000);
}

// Müzik Kontrolü
function setupMusicControl() {
    const musicToggle = document.getElementById('musicToggle');
    const musicInfo = document.getElementById('musicInfo');
    
    if (musicToggle) {
        musicToggle.addEventListener('click', function() {
            const isPlaying = this.classList.contains('playing');
            
            if (isPlaying) {
                this.classList.remove('playing');
                this.innerHTML = '<i class="fas fa-music"></i>';
                if (musicInfo) musicInfo.textContent = 'Müzik Çal';
                showNotification('Müzik durduruldu 🎵', 'info');
            } else {
                this.classList.add('playing');
                this.innerHTML = '<i class="fas fa-pause"></i>';
                if (musicInfo) musicInfo.textContent = 'Aşk Şarkıları Çalıyor';
                showNotification('Romantik müzik çalıyor 💕', 'success');
            }
        });
    }
}

// Modal İşlemleri
function openNewGiftModal() {
    const modal = document.getElementById('newGiftModal');
    if (modal) {
        resetGiftForm();
        showModal(modal);
    }
    closeFabMenu();
}

function openWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    if (modal) {
        resetWishlistForm();
        showModal(modal);
    }
    closeFabMenu();
}

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

function hideModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Form Reset İşlemleri
function resetGiftForm() {
    const form = document.getElementById('giftForm');
    if (form) {
        form.reset();
        const dateInput = document.getElementById('giftDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }
}

function resetWishlistForm() {
    const form = document.getElementById('wishlistForm');
    if (form) {
        form.reset();
    }
}

// Filtreleme İşlemleri
function setActiveCategory(category) {
    GiftState.currentCategory = category;
    
    // Görsel güncelleme
    categoryTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        }
    });
    
    applyFilters();
    displayGifts();
}

function handleSearch(e) {
    GiftState.searchQuery = e.target.value.toLowerCase();
    applyFilters();
    displayGifts();
}

function applyFilters() {
    let filtered = [...GiftState.gifts];
    
    // Kategori filtresi
    if (GiftState.currentCategory !== 'all') {
        if (GiftState.currentCategory === 'given') {
            filtered = filtered.filter(g => g.status === 'given');
        } else if (GiftState.currentCategory === 'received') {
            filtered = filtered.filter(g => g.status === 'received');
        } else if (GiftState.currentCategory !== 'wishlist') {
            filtered = filtered.filter(g => g.category === GiftState.currentCategory);
        }
    }
    
    // Arama filtresi
    if (GiftState.searchQuery) {
        filtered = filtered.filter(gift =>
            gift.name.toLowerCase().includes(GiftState.searchQuery) ||
            gift.description.toLowerCase().includes(GiftState.searchQuery) ||
            gift.category.toLowerCase().includes(GiftState.searchQuery) ||
            gift.occasion.toLowerCase().includes(GiftState.searchQuery)
        );
    }
    
    GiftState.filteredGifts = filtered;
}

// Loading State
function setLoadingState(isLoading) {
    GiftState.isLoading = isLoading;
    
    const loadingElement = document.getElementById('loadingGifts');
    if (loadingElement) {
        loadingElement.style.display = isLoading ? 'flex' : 'none';
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
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${type === 'success' ? 'var(--success-gradient)' : type === 'error' ? 'var(--warning-gradient)' : 'var(--accent-gradient)'};
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        transform: translateX(100%);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 4000);
}

// Yardımcı Fonksiyonlar
function getCurrentUser() {
    return localStorage.getItem('currentUser') || 'mehmet';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Placeholder fonksiyonlar (gelecekte implement edilecek)
function openGiftDetail(id) {
    showNotification('Hediye detayı yakında eklenecek! 🎁', 'info');
}

function openWishlistDetail(id) {
    showNotification('Dilek detayı yakında eklenecek! ⭐', 'info');
}

function editGift(id) {
    showNotification('Hediye düzenleme yakında eklenecek! ✏️', 'info');
}

function deleteGift(id) {
    showNotification('Hediye silme yakında eklenecek! 🗑️', 'info');
}

function editWishlistItem(id) {
    showNotification('Dilek düzenleme yakında eklenecek! ✏️', 'info');
}

function deleteWishlistItem(id) {
    showNotification('Dilek silme yakında eklenecek! 🗑️', 'info');
}

function logout() {
    if (confirm('Çıkmak istediğinizden emin misiniz?')) {
        showNotification('Çıkış yapılıyor... 👋', 'info');
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 1500);
    }
}

console.log('🎁 Hediyeler sayfası hazır - Güzel hediyeler paylaşın! 💝'); 