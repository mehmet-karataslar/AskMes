// Anılar Sayfası JavaScript

// Anı State
const MemoryState = {
    currentUser: null,
    memories: [],
    filteredMemories: [],
    selectedMemory: null,
    editingMemory: null,
    deletingMemory: null,
    currentFilter: 'all',
    currentView: 'grid',
    searchQuery: '',
    isLoading: false
};

// DOM Elements
let memoryItems, memoriesGallery, searchInput, filterButtons, viewButtons;

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    initializeMemoriesPage();
    loadMemories();
    setupEventListeners();
    setupMusicControl();
});

// Anılar Sayfasını Başlat
function initializeMemoriesPage() {
    memoryItems = document.getElementById('memoryItems');
    memoriesGallery = document.getElementById('memoriesGallery');
    searchInput = document.getElementById('searchInput');
    filterButtons = document.querySelectorAll('.filter-btn');
    viewButtons = document.querySelectorAll('.view-btn');
    
    // Mevcut kullanıcıyı al
    MemoryState.currentUser = getCurrentUser();
    
    console.log('Anılar sayfası başlatıldı');
}

// Anıları Yükle
async function loadMemories() {
    setLoadingState(true);
    
    try {
        // Veri tabanından anıları al
        const memoriesData = await Database.getMemories();
        MemoryState.memories = memoriesData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Filtrelenmiş anıları güncelle
        applyFilters();
        
        // Anıları görüntüle
        displayMemories();
        
    } catch (error) {
        console.error('Anılar yüklenirken hata:', error);
        showError('Anılar yüklenirken bir hata oluştu');
    } finally {
        setLoadingState(false);
    }
}

// Anıları Görüntüle
function displayMemories() {
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
    
    const memoriesHtml = MemoryState.filteredMemories.map(memory => {
        const mediaHtml = getMediaHtml(memory);
        const tagsHtml = memory.tags ? memory.tags.map(tag => 
            `<span class="memory-tag">${tag}</span>`
        ).join('') : '';
        
        return `
            <div class="memory-item ${memory.type === 'note' ? 'note-type' : ''}" 
                 data-id="${memory.id}" onclick="openMemoryDetail('${memory.id}')">
                
                ${memory.author === MemoryState.currentUser ? `
                    <div class="memory-actions">
                        <button class="memory-action-btn edit" onclick="event.stopPropagation(); editMemory('${memory.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="memory-action-btn delete" onclick="event.stopPropagation(); deleteMemory('${memory.id}')">
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
                        <span style="color: white; font-weight: 500;">Detayları Gör</span>
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
}

// Medya HTML'i Oluştur
function getMediaHtml(memory) {
    if (memory.type === 'note') {
        return `<i class="fas fa-sticky-note"></i>`;
    } else if (memory.type === 'video') {
        return `<video src="${memory.media}" controls></video>`;
    } else if (memory.type === 'photo' && memory.media) {
        return `<img src="${memory.media}" alt="${memory.title}">`;
    } else {
        return `<i class="fas fa-image"></i>`;
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
                `<img src="${memory.media}" alt="${memory.title}" class="detail-media">`;
        
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
        
        modal.classList.add('active');
    }
}

// Anı Detayını Kapat
function closeMemoryDetailModal() {
    const modal = document.getElementById('memoryDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
    MemoryState.selectedMemory = null;
}

// Yeni Anı Modal'ını Aç
function openNewMemoryModal() {
    const modal = document.getElementById('newMemoryModal');
    if (modal) {
        modal.classList.add('active');
        
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
    }
}

// Yeni Anı Modal'ını Kapat
function closeNewMemoryModal() {
    const modal = document.getElementById('newMemoryModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Anı Düzenleme Modal'ını Aç
function editMemory(memoryId) {
    const memory = MemoryState.memories.find(m => m.id === memoryId);
    if (!memory) return;
    
    MemoryState.editingMemory = memory;
    
    const modal = document.getElementById('editMemoryModal');
    if (modal) {
        modal.classList.add('active');
        
        // Form verilerini doldur
        document.getElementById('editMemoryTitle').value = memory.title;
        document.getElementById('editMemoryDate').value = memory.date;
        document.getElementById('editMemoryDescription').value = memory.description || '';
        document.getElementById('editMemoryLocation').value = memory.location || '';
        document.getElementById('editMemoryTags').value = memory.tags ? memory.tags.join(', ') : '';
        
        // Mevcut medyayı göster
        if (memory.media && memory.type !== 'note') {
            showMediaPreview('editUploadPreview', memory.media, memory.type);
        } else {
            resetUploadPreview('editUploadPreview');
        }
    }
    
    // Detay modal'ını kapat
    closeMemoryDetailModal();
}

// Anı Düzenleme Modal'ını Kapat
function closeEditMemoryModal() {
    const modal = document.getElementById('editMemoryModal');
    if (modal) {
        modal.classList.remove('active');
    }
    MemoryState.editingMemory = null;
}

// Anı Silme
function deleteMemory(memoryId) {
    const memory = MemoryState.memories.find(m => m.id === memoryId);
    if (!memory) return;
    
    MemoryState.deletingMemory = memory;
    
    const modal = document.getElementById('deleteMemoryModal');
    if (modal) {
        modal.classList.add('active');
    }
    
    // Detay modal'ını kapat
    closeMemoryDetailModal();
}

// Silme Modal'ını Kapat
function closeDeleteMemoryModal() {
    const modal = document.getElementById('deleteMemoryModal');
    if (modal) {
        modal.classList.remove('active');
    }
    MemoryState.deletingMemory = null;
}

// Anı Silmeyi Onayla
async function confirmDeleteMemory() {
    if (!MemoryState.deletingMemory) return;
    
    try {
        // Veri tabanından sil
        await Database.deleteMemory(MemoryState.deletingMemory.id);
        
        // Local state'i güncelle
        MemoryState.memories = MemoryState.memories.filter(m => m.id !== MemoryState.deletingMemory.id);
        
        // Filtreleri uygula ve görüntüyü güncelle
        applyFilters();
        displayMemories();
        
        // Modal'ı kapat
        closeDeleteMemoryModal();
        
        showSuccess('Anı başarıyla silindi');
        
    } catch (error) {
        console.error('Anı silinirken hata:', error);
        showError('Anı silinirken bir hata oluştu');
    }
}

// Event Listener'ları Ayarla
function setupEventListeners() {
    // Yeni anı formu
    const memoryForm = document.getElementById('memoryForm');
    if (memoryForm) {
        memoryForm.addEventListener('submit', handleNewMemory);
    }
    
    // Anı düzenleme formu
    const editMemoryForm = document.getElementById('editMemoryForm');
    if (editMemoryForm) {
        editMemoryForm.addEventListener('submit', handleEditMemory);
    }
    
    // Arama
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
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
    
    // Medya türü değişikliği
    document.querySelectorAll('input[name="mediaType"]').forEach(input => {
        input.addEventListener('change', updateMediaUploadVisibility);
    });
    
    // Dosya yükleme
    setupFileUpload('memoryMedia', 'uploadPreview');
    setupFileUpload('editMemoryMedia', 'editUploadPreview');
    
    // Modal dışına tıklama
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

// Yeni Anı Gönder
async function handleNewMemory(e) {
    e.preventDefault();
    
    if (MemoryState.isLoading) return;
    
    const title = document.getElementById('memoryTitle').value.trim();
    const date = document.getElementById('memoryDate').value;
    const description = document.getElementById('memoryDescription').value.trim();
    const location = document.getElementById('memoryLocation').value.trim();
    const tags = document.getElementById('memoryTags').value.trim();
    const mediaType = document.querySelector('input[name="mediaType"]:checked').value;
    const mediaFile = document.getElementById('memoryMedia').files[0];
    
    if (!title || !date) {
        showError('Lütfen başlık ve tarih alanlarını doldurun');
        return;
    }
    
    if (mediaType !== 'note' && !mediaFile) {
        showError('Lütfen bir medya dosyası seçin');
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
        
        // Veri tabanına kaydet
        await Database.saveMemory(newMemory);
        
        // Local state'i güncelle
        MemoryState.memories.unshift(newMemory);
        
        // Filtreleri uygula ve görüntüyü güncelle
        applyFilters();
        displayMemories();
        
        // Modal'ı kapat
        closeNewMemoryModal();
        
        showSuccess('Anı başarıyla eklendi! ❤️');
        
    } catch (error) {
        console.error('Anı eklenirken hata:', error);
        showError('Anı eklenirken bir hata oluştu');
    } finally {
        setLoadingState(false);
    }
}

// Anı Düzenle
async function handleEditMemory(e) {
    e.preventDefault();
    
    if (MemoryState.isLoading || !MemoryState.editingMemory) return;
    
    const title = document.getElementById('editMemoryTitle').value.trim();
    const date = document.getElementById('editMemoryDate').value;
    const description = document.getElementById('editMemoryDescription').value.trim();
    const location = document.getElementById('editMemoryLocation').value.trim();
    const tags = document.getElementById('editMemoryTags').value.trim();
    const mediaFile = document.getElementById('editMemoryMedia').files[0];
    
    if (!title || !date) {
        showError('Lütfen başlık ve tarih alanlarını doldurun');
        return;
    }
    
    setLoadingState(true);
    
    try {
        // Medyayı işle
        let mediaData = MemoryState.editingMemory.media;
        if (mediaFile) {
            mediaData = await processMediaFile(mediaFile);
        }
        
        // Anıyı güncelle
        const updatedMemory = {
            ...MemoryState.editingMemory,
            title,
            date,
            description,
            location,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            media: mediaData,
            updatedAt: new Date().toISOString()
        };
        
        // Veri tabanını güncelle
        await Database.updateMemory(updatedMemory);
        
        // Local state'i güncelle
        const index = MemoryState.memories.findIndex(m => m.id === updatedMemory.id);
        if (index !== -1) {
            MemoryState.memories[index] = updatedMemory;
        }
        
        // Filtreleri uygula ve görüntüyü güncelle
        applyFilters();
        displayMemories();
        
        // Modal'ı kapat
        closeEditMemoryModal();
        
        showSuccess('Anı başarıyla güncellendi! ✨');
        
    } catch (error) {
        console.error('Anı güncellenirken hata:', error);
        showError('Anı güncellenirken bir hata oluştu');
    } finally {
        setLoadingState(false);
    }
}

// Arama İşlemi
function handleSearch(e) {
    MemoryState.searchQuery = e.target.value.toLowerCase();
    applyFilters();
    displayMemories();
}

// Aktif Filtreyi Ayarla
function setActiveFilter(filter) {
    MemoryState.currentFilter = filter;
    
    // Görsel güncelleme
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
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

// Medya Yükleme Görünürlüğünü Güncelle
function updateMediaUploadVisibility() {
    const mediaType = document.querySelector('input[name="mediaType"]:checked')?.value;
    const uploadGroup = document.getElementById('mediaUploadGroup');
    
    if (uploadGroup) {
        uploadGroup.style.display = mediaType === 'note' ? 'none' : 'block';
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
                const fileType = file.type.startsWith('video/') ? 'video' : 'photo';
                showMediaPreview(previewId, e.target.result, fileType);
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
        if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
            input.files = e.dataTransfer.files;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileType = file.type.startsWith('video/') ? 'video' : 'photo';
                showMediaPreview(previewId, e.target.result, fileType);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Medya Önizlemesi Göster
function showMediaPreview(previewId, mediaSrc, mediaType) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    
    preview.classList.add('has-media');
    
    const mediaElement = mediaType === 'video' ? 
        `<video src="${mediaSrc}" controls class="preview-media"></video>` :
        `<img src="${mediaSrc}" alt="Önizleme" class="preview-media">`;
    
    preview.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <p>Medya seçildi</p>
        ${mediaElement}
    `;
}

// Upload Önizlemesini Sıfırla
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

// Medya Dosyasını İşle
function processMediaFile(file) {
    return new Promise((resolve, reject) => {
        // Dosya boyutu kontrolü (10MB)
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

console.log('Anılar sayfası yüklendi! 📸'); 