// Hediyeler Sayfası JavaScript

// Hediye State
const GiftState = {
    currentUser: null,
    gifts: [],
    wishlist: [],
    filteredGifts: [],
    selectedGift: null,
    editingGift: null,
    deletingGift: null,
    currentCategory: 'all',
    isLoading: false,
    fabMenuOpen: false
};

// DOM Elements
let giftItems, giftsGallery, categoryTabs, totalGiftsEl, givenGiftsEl, receivedGiftsEl;

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    initializeGiftsPage();
    loadGifts();
    setupEventListeners();
    setupMusicControl();
});

// Hediyeler Sayfasını Başlat
function initializeGiftsPage() {
    giftItems = document.getElementById('giftItems');
    giftsGallery = document.getElementById('giftsGallery');
    categoryTabs = document.querySelectorAll('.category-tab');
    totalGiftsEl = document.getElementById('totalGifts');
    givenGiftsEl = document.getElementById('givenGifts');
    receivedGiftsEl = document.getElementById('receivedGifts');
    
    // Mevcut kullanıcıyı al
    GiftState.currentUser = getCurrentUser();
    
    console.log('Hediyeler sayfası başlatıldı');
}

// Hediyeleri Yükle
async function loadGifts() {
    setLoadingState(true);
    
    try {
        // Veri tabanından hediyeleri al
        const giftsData = await Database.getGifts();
        const wishlistData = await Database.getWishlist();
        
        GiftState.gifts = giftsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        GiftState.wishlist = wishlistData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Filtrelenmiş hediyeleri güncelle
        applyFilters();
        
        // Hediyeleri görüntüle
        displayGifts();
        
        // İstatistikleri güncelle
        updateStats();
        
    } catch (error) {
        console.error('Hediyeler yüklenirken hata:', error);
        showError('Hediyeler yüklenirken bir hata oluştu');
    } finally {
        setLoadingState(false);
    }
}

// Hediyeleri Görüntüle
function displayGifts() {
    if (!giftItems) return;
    
    const allItems = [...GiftState.filteredGifts, ...GiftState.wishlist];
    
    if (allItems.length === 0) {
        giftItems.innerHTML = `
            <div class="empty-gifts">
                <i class="fas fa-gift"></i>
                <h3>Henüz hediye yok</h3>
                <p>İlk hediyenizi ekleyin ve sevdiklerinizle paylaşmaya başlayın!</p>
                <button onclick="openNewGiftModal()">
                    <i class="fas fa-plus"></i>
                    İlk Hediyeyi Ekle
                </button>
            </div>
        `;
        return;
    }
    
    const giftsHtml = allItems.map(item => {
        const isWishlist = item.type === 'wishlist';
        const isGiven = !isWishlist && item.giver === GiftState.currentUser;
        const isReceived = !isWishlist && item.receiver === GiftState.currentUser;
        
        return `
            <div class="gift-item ${isWishlist ? 'wishlist' : isGiven ? 'given' : 'received'}" 
                 data-id="${item.id}" onclick="openGiftDetail('${item.id}')">
                
                <div class="gift-image">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.name}">` : 
                        `<i class="fas ${isWishlist ? 'fa-star' : 'fa-gift'} placeholder-icon"></i>`
                    }
                    
                    <div class="gift-status ${isWishlist ? 'wishlist' : isGiven ? 'given' : 'received'}">
                        ${isWishlist ? 'Dilek' : isGiven ? 'Verilen' : 'Alınan'}
                    </div>
                    
                    ${!isWishlist && item.category ? `
                        <div class="gift-category">
                            <i class="fas ${getCategoryIcon(item.category)}"></i>
                            <span>${getCategoryName(item.category)}</span>
                        </div>
                    ` : ''}
                    
                    ${(isWishlist || isGiven) ? `
                        <div class="gift-actions">
                            <button class="gift-action-btn edit" onclick="event.stopPropagation(); editGift('${item.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="gift-action-btn delete" onclick="event.stopPropagation(); deleteGift('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="gift-content">
                    <div class="gift-header">
                        <h3 class="gift-name">${item.name}</h3>
                        <span class="gift-date">${formatDate(isWishlist ? item.createdAt : item.date)}</span>
                    </div>
                    
                    ${item.description ? `
                        <div class="gift-description">${item.description}</div>
                    ` : ''}
                    
                    ${item.price ? `
                        <div class="gift-details">
                            <span class="gift-price">${item.price}₺</span>
                            ${!isWishlist && item.occasion ? `
                                <span class="gift-occasion">
                                    <i class="fas ${getOccasionIcon(item.occasion)}"></i>
                                    ${getOccasionName(item.occasion)}
                                </span>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    ${isWishlist && item.priority ? `
                        <div class="gift-details">
                            <span class="wish-priority ${item.priority}">
                                ${getPriorityName(item.priority)}
                            </span>
                            ${item.link ? `
                                <a href="${item.link}" target="_blank" class="wish-link" onclick="event.stopPropagation()">
                                    <i class="fas fa-external-link-alt"></i>
                                    Link
                                </a>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    <div class="gift-meta">
                        ${!isWishlist ? `
                            <div class="gift-giver ${isGiven ? 'from-me' : 'from-partner'}">
                                <i class="fas ${isGiven ? 'fa-user' : 'fa-heart'}"></i>
                                <span>${isGiven ? 'Ben verdim' : 'Aldım'}</span>
                            </div>
                        ` : `
                            <div class="gift-giver from-me">
                                <i class="fas fa-star"></i>
                                <span>Dilek listesinde</span>
                            </div>
                        `}
                        
                        ${item.location ? `
                            <div class="gift-location">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${item.location}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    giftItems.innerHTML = giftsHtml;
}

// Hediye Detayını Aç
function openGiftDetail(itemId) {
    const item = [...GiftState.gifts, ...GiftState.wishlist].find(g => g.id === itemId);
    if (!item) return;
    
    GiftState.selectedGift = item;
    
    const modal = document.getElementById('giftDetailModal');
    const content = document.getElementById('giftDetailContent');
    const title = document.getElementById('detailTitle');
    
    if (modal && content && title) {
        const isWishlist = item.type === 'wishlist';
        title.innerHTML = `<i class="fas ${isWishlist ? 'fa-star' : 'fa-gift'}"></i> ${item.name}`;
        
        const imageHtml = item.image ? 
            `<img src="${item.image}" alt="${item.name}" class="detail-image">` : '';
        
        content.innerHTML = `
            ${imageHtml}
            <div class="detail-info">
                <h2 class="detail-name">${item.name}</h2>
                
                <div class="detail-meta">
                    <div class="detail-meta-item">
                        <span class="detail-meta-label">Tarih:</span>
                        <span class="detail-meta-value">${formatDate(isWishlist ? item.createdAt : item.date)}</span>
                    </div>
                    
                    ${!isWishlist ? `
                        <div class="detail-meta-item">
                            <span class="detail-meta-label">Kategori:</span>
                            <span class="detail-meta-value">${getCategoryName(item.category)}</span>
                        </div>
                        
                        <div class="detail-meta-item">
                            <span class="detail-meta-label">Durum:</span>
                            <span class="detail-meta-value">${item.giver === GiftState.currentUser ? 'Verilen' : 'Alınan'}</span>
                        </div>
                        
                        ${item.occasion ? `
                            <div class="detail-meta-item">
                                <span class="detail-meta-label">Özel Gün:</span>
                                <span class="detail-meta-value">${getOccasionName(item.occasion)}</span>
                            </div>
                        ` : ''}
                    ` : `
                        <div class="detail-meta-item">
                            <span class="detail-meta-label">Öncelik:</span>
                            <span class="detail-meta-value">${getPriorityName(item.priority)}</span>
                        </div>
                        
                        ${item.link ? `
                            <div class="detail-meta-item">
                                <span class="detail-meta-label">Link:</span>
                                <a href="${item.link}" target="_blank" class="detail-meta-value">${item.link}</a>
                            </div>
                        ` : ''}
                    `}
                    
                    ${item.price ? `
                        <div class="detail-meta-item">
                            <span class="detail-meta-label">Fiyat:</span>
                            <span class="detail-meta-value">${item.price}₺</span>
                        </div>
                    ` : ''}
                    
                    ${item.location ? `
                        <div class="detail-meta-item">
                            <span class="detail-meta-label">Konum:</span>
                            <span class="detail-meta-value">${item.location}</span>
                        </div>
                    ` : ''}
                </div>
                
                ${item.description ? `
                    <div class="detail-description">${item.description.replace(/\n/g, '<br>')}</div>
                ` : ''}
                
                ${(isWishlist || (!isWishlist && item.giver === GiftState.currentUser)) ? `
                    <div class="detail-actions">
                        <button class="btn-secondary" onclick="editGift('${item.id}')">
                            <i class="fas fa-edit"></i>
                            Düzenle
                        </button>
                        <button class="btn-danger" onclick="deleteGift('${item.id}')">
                            <i class="fas fa-trash"></i>
                            Sil
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        modal.classList.add('active');
    }
}

// Hediye Detayını Kapat
function closeGiftDetailModal() {
    const modal = document.getElementById('giftDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
    GiftState.selectedGift = null;
}

// Yeni Hediye Modal'ını Aç
function openNewGiftModal() {
    const modal = document.getElementById('newGiftModal');
    if (modal) {
        modal.classList.add('active');
        
        // Formu sıfırla
        const form = document.getElementById('giftForm');
        if (form) {
            form.reset();
            
            // Bugünün tarihini ayarla
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('giftDate');
            if (dateInput) {
                dateInput.value = today;
            }
        }
        
        // Upload preview'ı sıfırla
        resetUploadPreview('uploadPreview');
    }
    
    // FAB menüsünü kapat
    closeFabMenu();
}

// Yeni Hediye Modal'ını Kapat
function closeNewGiftModal() {
    const modal = document.getElementById('newGiftModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Dilek Listesi Modal'ını Aç
function openWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    if (modal) {
        modal.classList.add('active');
        
        // Formu sıfırla
        const form = document.getElementById('wishlistForm');
        if (form) {
            form.reset();
        }
    }
    
    // FAB menüsünü kapat
    closeFabMenu();
}

// Dilek Listesi Modal'ını Kapat
function closeWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Hediye Düzenleme Modal'ını Aç
function editGift(itemId) {
    const item = [...GiftState.gifts, ...GiftState.wishlist].find(g => g.id === itemId);
    if (!item) return;
    
    GiftState.editingGift = item;
    
    const isWishlist = item.type === 'wishlist';
    
    if (isWishlist) {
        // Dilek listesi öğesini düzenle
        const modal = document.getElementById('wishlistModal');
        if (modal) {
            modal.classList.add('active');
            
            // Form verilerini doldur
            document.getElementById('wishItemName').value = item.name;
            document.getElementById('wishItemDescription').value = item.description || '';
            document.getElementById('wishItemPriority').value = item.priority || 'medium';
            document.getElementById('wishItemPrice').value = item.price || '';
            document.getElementById('wishItemLink').value = item.link || '';
        }
    } else {
        // Normal hediyeyi düzenle
        const modal = document.getElementById('editGiftModal');
        if (modal) {
            modal.classList.add('active');
            
            // Form verilerini doldur
            document.getElementById('editGiftName').value = item.name;
            document.getElementById('editGiftCategory').value = item.category;
            document.getElementById('editGiftDescription').value = item.description || '';
            document.getElementById('editGiftDate').value = item.date;
            document.getElementById('editGiftOccasion').value = item.occasion || '';
            document.getElementById('editGiftPrice').value = item.price || '';
            document.getElementById('editGiftLocation').value = item.location || '';
            
            // Mevcut resmi göster
            if (item.image) {
                showImagePreview('editUploadPreview', item.image);
            } else {
                resetUploadPreview('editUploadPreview');
            }
        }
    }
    
    // Detay modal'ını kapat
    closeGiftDetailModal();
}

// Hediye Düzenleme Modal'ını Kapat
function closeEditGiftModal() {
    const modal = document.getElementById('editGiftModal');
    if (modal) {
        modal.classList.remove('active');
    }
    GiftState.editingGift = null;
}

// Hediye Silme
function deleteGift(itemId) {
    const item = [...GiftState.gifts, ...GiftState.wishlist].find(g => g.id === itemId);
    if (!item) return;
    
    GiftState.deletingGift = item;
    
    const modal = document.getElementById('deleteGiftModal');
    if (modal) {
        modal.classList.add('active');
    }
    
    // Detay modal'ını kapat
    closeGiftDetailModal();
}

// Silme Modal'ını Kapat
function closeDeleteGiftModal() {
    const modal = document.getElementById('deleteGiftModal');
    if (modal) {
        modal.classList.remove('active');
    }
    GiftState.deletingGift = null;
}

// Hediye Silmeyi Onayla
async function confirmDeleteGift() {
    if (!GiftState.deletingGift) return;
    
    try {
        const isWishlist = GiftState.deletingGift.type === 'wishlist';
        
        if (isWishlist) {
            // Dilek listesinden sil
            await Database.deleteWishlistItem(GiftState.deletingGift.id);
            GiftState.wishlist = GiftState.wishlist.filter(w => w.id !== GiftState.deletingGift.id);
        } else {
            // Hediyeyi sil
            await Database.deleteGift(GiftState.deletingGift.id);
            GiftState.gifts = GiftState.gifts.filter(g => g.id !== GiftState.deletingGift.id);
        }
        
        // Filtreleri uygula ve görüntüyü güncelle
        applyFilters();
        displayGifts();
        updateStats();
        
        // Modal'ı kapat
        closeDeleteGiftModal();
        
        showSuccess(isWishlist ? 'Dilek listesi öğesi silindi' : 'Hediye başarıyla silindi');
        
    } catch (error) {
        console.error('Silme hatası:', error);
        showError('Silme işlemi sırasında bir hata oluştu');
    }
}

// Event Listener'ları Ayarla
function setupEventListeners() {
    // Yeni hediye formu
    const giftForm = document.getElementById('giftForm');
    if (giftForm) {
        giftForm.addEventListener('submit', handleNewGift);
    }
    
    // Dilek listesi formu
    const wishlistForm = document.getElementById('wishlistForm');
    if (wishlistForm) {
        wishlistForm.addEventListener('submit', handleWishlistItem);
    }
    
    // Hediye düzenleme formu
    const editGiftForm = document.getElementById('editGiftForm');
    if (editGiftForm) {
        editGiftForm.addEventListener('submit', handleEditGift);
    }
    
    // Kategori sekmeleri
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            setActiveCategory(this.dataset.category);
        });
    });
    
    // Dosya yükleme
    setupFileUpload('giftImage', 'uploadPreview');
    setupFileUpload('editGiftImage', 'editUploadPreview');
    
    // Modal dışına tıklama
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

// Yeni Hediye Ekle
async function handleNewGift(e) {
    e.preventDefault();
    
    if (GiftState.isLoading) return;
    
    const name = document.getElementById('giftName').value.trim();
    const category = document.getElementById('giftCategory').value;
    const description = document.getElementById('giftDescription').value.trim();
    const date = document.getElementById('giftDate').value;
    const occasion = document.getElementById('giftOccasion').value;
    const price = document.getElementById('giftPrice').value;
    const location = document.getElementById('giftLocation').value.trim();
    const imageFile = document.getElementById('giftImage').files[0];
    
    if (!name || !category || !date) {
        showError('Lütfen gerekli alanları doldurun');
        return;
    }
    
    setLoadingState(true);
    
    try {
        // Resmi işle
        let imageData = null;
        if (imageFile) {
            imageData = await processImageFile(imageFile);
        }
        
        // Yeni hediye oluştur
        const newGift = {
            id: generateId(),
            name,
            category,
            description,
            date,
            occasion,
            price: price ? parseFloat(price) : null,
            location,
            image: imageData,
            giver: GiftState.currentUser,
            receiver: GiftState.currentUser === 'mehmet' ? 'sevgilim' : 'mehmet',
            createdAt: new Date().toISOString()
        };
        
        // Veri tabanına kaydet
        await Database.saveGift(newGift);
        
        // Local state'i güncelle
        GiftState.gifts.unshift(newGift);
        
        // Filtreleri uygula ve görüntüyü güncelle
        applyFilters();
        displayGifts();
        updateStats();
        
        // Modal'ı kapat
        closeNewGiftModal();
        
        showSuccess('Hediye başarıyla eklendi! 🎁');
        
    } catch (error) {
        console.error('Hediye eklenirken hata:', error);
        showError('Hediye eklenirken bir hata oluştu');
    } finally {
        setLoadingState(false);
    }
}

// Dilek Listesi Öğesi Ekle/Düzenle
async function handleWishlistItem(e) {
    e.preventDefault();
    
    if (GiftState.isLoading) return;
    
    const name = document.getElementById('wishItemName').value.trim();
    const description = document.getElementById('wishItemDescription').value.trim();
    const priority = document.getElementById('wishItemPriority').value;
    const price = document.getElementById('wishItemPrice').value;
    const link = document.getElementById('wishItemLink').value.trim();
    
    if (!name) {
        showError('Lütfen istek adını girin');
        return;
    }
    
    setLoadingState(true);
    
    try {
        if (GiftState.editingGift && GiftState.editingGift.type === 'wishlist') {
            // Düzenleme
            const updatedItem = {
                ...GiftState.editingGift,
                name,
                description,
                priority,
                price: price ? parseFloat(price) : null,
                link,
                updatedAt: new Date().toISOString()
            };
            
            await Database.updateWishlistItem(updatedItem);
            
            const index = GiftState.wishlist.findIndex(w => w.id === updatedItem.id);
            if (index !== -1) {
                GiftState.wishlist[index] = updatedItem;
            }
            
            showSuccess('Dilek listesi öğesi güncellendi! ✨');
        } else {
            // Yeni ekleme
            const newItem = {
                id: generateId(),
                name,
                description,
                priority,
                price: price ? parseFloat(price) : null,
                link,
                type: 'wishlist',
                owner: GiftState.currentUser,
                createdAt: new Date().toISOString()
            };
            
            await Database.saveWishlistItem(newItem);
            GiftState.wishlist.unshift(newItem);
            
            showSuccess('Dilek listesine eklendi! ⭐');
        }
        
        // Görüntüyü güncelle
        displayGifts();
        updateStats();
        
        // Modal'ı kapat
        closeWishlistModal();
        
    } catch (error) {
        console.error('Dilek listesi hatası:', error);
        showError('İşlem sırasında bir hata oluştu');
    } finally {
        setLoadingState(false);
    }
}

// Hediye Düzenle
async function handleEditGift(e) {
    e.preventDefault();
    
    if (GiftState.isLoading || !GiftState.editingGift) return;
    
    const name = document.getElementById('editGiftName').value.trim();
    const category = document.getElementById('editGiftCategory').value;
    const description = document.getElementById('editGiftDescription').value.trim();
    const date = document.getElementById('editGiftDate').value;
    const occasion = document.getElementById('editGiftOccasion').value;
    const imageFile = document.getElementById('editGiftImage').files[0];
    
    if (!name || !category || !date) {
        showError('Lütfen gerekli alanları doldurun');
        return;
    }
    
    setLoadingState(true);
    
    try {
        // Resmi işle
        let imageData = GiftState.editingGift.image;
        if (imageFile) {
            imageData = await processImageFile(imageFile);
        }
        
        // Hediyeyi güncelle
        const updatedGift = {
            ...GiftState.editingGift,
            name,
            category,
            description,
            date,
            occasion,
            image: imageData,
            updatedAt: new Date().toISOString()
        };
        
        // Veri tabanını güncelle
        await Database.updateGift(updatedGift);
        
        // Local state'i güncelle
        const index = GiftState.gifts.findIndex(g => g.id === updatedGift.id);
        if (index !== -1) {
            GiftState.gifts[index] = updatedGift;
        }
        
        // Filtreleri uygula ve görüntüyü güncelle
        applyFilters();
        displayGifts();
        updateStats();
        
        // Modal'ı kapat
        closeEditGiftModal();
        
        showSuccess('Hediye başarıyla güncellendi! ✨');
        
    } catch (error) {
        console.error('Hediye güncellenirken hata:', error);
        showError('Hediye güncellenirken bir hata oluştu');
    } finally {
        setLoadingState(false);
    }
}

// Aktif Kategoriyi Ayarla
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

// Filtreleri Uygula
function applyFilters() {
    let filtered = [...GiftState.gifts];
    
    if (GiftState.currentCategory === 'given') {
        filtered = filtered.filter(g => g.giver === GiftState.currentUser);
    } else if (GiftState.currentCategory === 'received') {
        filtered = filtered.filter(g => g.receiver === GiftState.currentUser);
    } else if (GiftState.currentCategory === 'wishlist') {
        filtered = [];
    }
    
    GiftState.filteredGifts = filtered;
    
    // Dilek listesini de filtrele
    if (GiftState.currentCategory === 'all' || GiftState.currentCategory === 'wishlist') {
        // Dilek listesi öğeleri görüntülenecek
    } else {
        // Dilek listesi öğeleri gizlenecek
        GiftState.wishlist = GiftState.currentCategory === 'wishlist' ? GiftState.wishlist : [];
    }
}

// İstatistikleri Güncelle
function updateStats() {
    const totalGifts = GiftState.gifts.length;
    const givenGifts = GiftState.gifts.filter(g => g.giver === GiftState.currentUser).length;
    const receivedGifts = GiftState.gifts.filter(g => g.receiver === GiftState.currentUser).length;
    
    if (totalGiftsEl) totalGiftsEl.textContent = totalGifts;
    if (givenGiftsEl) givenGiftsEl.textContent = givenGifts;
    if (receivedGiftsEl) receivedGiftsEl.textContent = receivedGifts;
}

// FAB Menü Kontrolü
function toggleFabMenu() {
    const fabMenu = document.getElementById('fabMenu');
    const mainFab = document.querySelector('.main-fab');
    
    GiftState.fabMenuOpen = !GiftState.fabMenuOpen;
    
    if (fabMenu && mainFab) {
        fabMenu.classList.toggle('active', GiftState.fabMenuOpen);
        mainFab.classList.toggle('active', GiftState.fabMenuOpen);
    }
}

function closeFabMenu() {
    const fabMenu = document.getElementById('fabMenu');
    const mainFab = document.querySelector('.main-fab');
    
    GiftState.fabMenuOpen = false;
    
    if (fabMenu && mainFab) {
        fabMenu.classList.remove('active');
        mainFab.classList.remove('active');
    }
}

// Dosya Yükleme Ayarla
function setupFileUpload(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (!input || !preview) return;
    
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                showImagePreview(previewId, e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Drag & Drop
    preview.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
    });
    
    preview.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.backgroundColor = '';
    });
    
    preview.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.backgroundColor = '';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            input.files = e.dataTransfer.files;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                showImagePreview(previewId, e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Resim Önizlemesi Göster
function showImagePreview(previewId, imageSrc) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    
    preview.classList.add('has-image');
    preview.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <p>Resim seçildi</p>
        <img src="${imageSrc}" alt="Önizleme" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin-top: 10px;">
    `;
}

// Upload Önizlemesini Sıfırla
function resetUploadPreview(previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    
    preview.classList.remove('has-image');
    preview.innerHTML = `
        <i class="fas fa-camera"></i>
        <p>Hediye fotoğrafı ekleyin</p>
        <span class="upload-hint">Maksimum 5MB</span>
    `;
}

// Resim Dosyasını İşle
function processImageFile(file) {
    return new Promise((resolve, reject) => {
        // Dosya boyutu kontrolü (5MB)
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error('Dosya boyutu 5MB\'dan büyük olamaz'));
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

// Loading State
function setLoadingState(isLoading) {
    GiftState.isLoading = isLoading;
    
    const loadingElement = document.getElementById('loadingGifts');
    if (loadingElement) {
        loadingElement.style.display = isLoading ? 'flex' : 'none';
    }
    
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(btn => {
        btn.disabled = isLoading;
        if (isLoading) {
            btn.classList.add('loading');
        } else {
            btn.classList.remove('loading');
        }
    });
}

// Müzik Kontrolü
function setupMusicControl() {
    const musicToggle = document.getElementById('music-toggle');
    const musicPlayer = document.getElementById('background-music');
    
    if (musicToggle && musicPlayer) {
        musicToggle.addEventListener('click', function() {
            if (musicPlayer.paused) {
                musicPlayer.play().catch(e => {
                    console.log('Müzik çalınamadı:', e);
                });
                this.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                musicPlayer.pause();
                this.innerHTML = '<i class="fas fa-music"></i>';
            }
        });
    }
}

// Yardımcı Fonksiyonlar
function getCategoryIcon(category) {
    const icons = {
        romantic: 'fa-heart',
        surprise: 'fa-surprise',
        'special-day': 'fa-calendar-star',
        handmade: 'fa-hand-holding-heart',
        experience: 'fa-map-marked-alt',
        jewelry: 'fa-gem',
        clothing: 'fa-tshirt',
        technology: 'fa-laptop',
        books: 'fa-book',
        other: 'fa-gift'
    };
    return icons[category] || 'fa-gift';
}

function getCategoryName(category) {
    const names = {
        romantic: 'Romantik',
        surprise: 'Sürpriz',
        'special-day': 'Özel Gün',
        handmade: 'El Yapımı',
        experience: 'Deneyim',
        jewelry: 'Mücevher',
        clothing: 'Giyim',
        technology: 'Teknoloji',
        books: 'Kitap',
        other: 'Diğer'
    };
    return names[category] || 'Diğer';
}

function getOccasionIcon(occasion) {
    const icons = {
        birthday: 'fa-birthday-cake',
        anniversary: 'fa-heart',
        valentines: 'fa-heart',
        'new-year': 'fa-calendar',
        graduation: 'fa-graduation-cap',
        promotion: 'fa-trophy',
        apology: 'fa-hand-holding-heart',
        surprise: 'fa-surprise',
        other: 'fa-gift'
    };
    return icons[occasion] || 'fa-gift';
}

function getOccasionName(occasion) {
    const names = {
        birthday: 'Doğum Günü',
        anniversary: 'Yıldönümü',
        valentines: 'Sevgililer Günü',
        'new-year': 'Yeni Yıl',
        graduation: 'Mezuniyet',
        promotion: 'Terfi',
        apology: 'Özür',
        surprise: 'Sürpriz',
        other: 'Diğer'
    };
    return names[occasion] || 'Diğer';
}

function getPriorityName(priority) {
    const names = {
        high: 'Yüksek',
        medium: 'Orta',
        low: 'Düşük'
    };
    return names[priority] || 'Orta';
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

function showError(message) {
    alert('Hata: ' + message);
}

function showSuccess(message) {
    alert('Başarılı: ' + message);
}

console.log('Hediyeler sayfası yüklendi! 🎁'); 