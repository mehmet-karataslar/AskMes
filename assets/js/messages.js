// Mesajlar Sayfası JavaScript

// Mesaj State
const MessageState = {
    currentUser: null,
    messages: [],
    selectedMessage: null,
    editingMessage: null,
    deletingMessage: null,
    isLoading: false
};

// DOM Elements
let messageItems, messageDetail, detailContent, userName;

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log('Messages page DOM loaded');
    
    initializeMessagesPage();
    checkUserSession();
    
    // Veritabanı yüklenmesini bekle
    const waitForDB = () => {
        if (window.db) {
            console.log('Database is ready, loading messages...');
            loadMessages();
            setupEventListeners();
        } else {
            console.log('Database not ready, waiting...');
            setTimeout(waitForDB, 100);
        }
    };
    
    waitForDB();
    
    console.log('Messages page initialization complete');
});

// Event Listener'ları Ayarla
function setupEventListeners() {
    // Yeni mesaj form'u
    const newMessageForm = document.getElementById('newMessageForm');
    if (newMessageForm) {
        newMessageForm.addEventListener('submit', handleNewMessage);
        console.log('New message form listener added');
    }
    
    // Düzenleme form'u
    const editMessageForm = document.getElementById('editMessageForm');
    if (editMessageForm) {
        editMessageForm.addEventListener('submit', handleEditMessage);
        console.log('Edit message form listener added');
    }
    
    // Dosya yüklemelerini ayarla
    setupFileUpload('messageImage', 'uploadPreview');
    setupFileUpload('editMessageImage', 'editUploadPreview');
    
    // ESC tuşuyla modal'ları kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => {
                modal.style.display = 'none';
                modal.classList.remove('active');
            });
        }
    });
    
    console.log('Event listeners kuruldu');
}

// Mesajlar Sayfasını Başlat
function initializeMessagesPage() {
    messageItems = document.getElementById('messageItems');
    messageDetail = document.getElementById('messageDetail');
    detailContent = document.getElementById('detailContent');
    userName = document.getElementById('userName');
    
    console.log('Mesajlar sayfası başlatıldı');
}

// Kullanıcı Oturumunu Kontrol Et
function checkUserSession() {
    const sessionData = sessionStorage.getItem('user_session');
    
    if (!sessionData) {
        // Login yönlendirmesi geçici olarak kaldırıldı
        // window.location.href = '../login.html';
        // Geçici olarak varsayılan kullanıcı set et
        MessageState.currentUser = 'mehmet';
        return;
    }
    
    try {
        const session = JSON.parse(sessionData);
        MessageState.currentUser = session.userId;
        
        // Kullanıcı adını güncelle
        if (userName) {
            const userNames = {
                mehmet: 'Mehmet',
                sevgilim: 'Sevgilim'
            };
            userName.textContent = userNames[session.userId] || 'Kullanıcı';
        }
        
        console.log('Kullanıcı oturumu:', session);
    } catch (error) {
        console.error('Oturum verisi okunamadı:', error);        // Login yönlendirmesi geçici olarak kaldırıldı
        // window.location.href = '../login.html';
        // Geçici olarak varsayılan kullanıcı set et
        MessageState.currentUser = 'mehmet';
    }
}

// Mesajları Yükle
async function loadMessages() {
    setLoadingState(true);
    
    try {
        // Veri tabanının hazır olmasını bekle
        if (!window.db) {
            console.log('Veritabanı henüz yüklenmemiş, bekleniyor...');
            setTimeout(() => loadMessages(), 500);
            return;
        }
        
        // Server'dan mesajları al (async)
        const messagesData = await window.db.getMessages();
        console.log('Server\'dan yüklenen mesajlar:', messagesData);
        
        if (messagesData && messagesData.length > 0) {
            MessageState.messages = messagesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            MessageState.messages = [];
            console.log('Hiç mesaj bulunamadı');
        }
        
        // Mesajları görüntüle
        displayMessages();
        
    } catch (error) {
        console.error('Mesajlar yüklenirken hata:', error);
        MessageState.messages = [];
        displayMessages();
    } finally {
        setLoadingState(false);
    }
}

// Mesajları Görüntüle
function displayMessages() {
    if (!messageItems) {
        console.error('messageItems element not found');
        return;
    }
    
    if (MessageState.messages.length === 0) {
        messageItems.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope-open"></i>
                <h3>Henüz mesaj yok</h3>
                <p>İlk aşk mesajınızı gönderin ve özel anılarınızı paylaşmaya başlayın!</p>
                <button onclick="openNewMessageModal()">
                    <i class="fas fa-plus"></i>
                    İlk Mesajı Gönder
                </button>
            </div>
        `;
        return;
    }
    
    const messagesHtml = MessageState.messages.map(message => {
        // Mesaj göndericisini belirle (hem author hem sender field'ını kontrol et)
        const messageAuthor = message.author || message.sender;
        const isFromMe = messageAuthor === MessageState.currentUser;
        
        return `
            <div class="message-item ${isFromMe ? 'from-me' : 'from-partner'}" 
                 data-id="${message.id}" onclick="selectMessage('${message.id}')">
                <div class="message-header">
                    <h3 class="message-title">${message.title}</h3>
                    <div class="message-meta">
                        <span class="message-author ${isFromMe ? 'from-me' : 'from-partner'}">
                            <i class="fas ${isFromMe ? 'fa-user' : 'fa-heart'}"></i>
                            ${isFromMe ? 'Ben' : 'Sevgilim'}
                        </span>
                        <span class="message-date">${formatDate(message.createdAt || message.date)}</span>
                    </div>
                </div>
                <div class="message-preview">${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}</div>
                ${isFromMe ? `
                    <div class="message-actions">
                        <button class="action-btn edit" onclick="event.stopPropagation(); editMessage('${message.id}')">
                            <i class="fas fa-edit"></i> Düzenle
                        </button>
                        <button class="action-btn delete" onclick="event.stopPropagation(); deleteMessage('${message.id}')">
                            <i class="fas fa-trash"></i> Sil
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    messageItems.innerHTML = messagesHtml;
    console.log('Mesajlar görüntülendi:', MessageState.messages.length);
}

// Mesaj Seç
function selectMessage(messageId) {
    const message = MessageState.messages.find(m => m.id === messageId);
    if (!message) return;
    
    MessageState.selectedMessage = message;
    
    // Görsel güncelleme
    document.querySelectorAll('.message-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    const selectedItem = document.querySelector(`[data-id="${messageId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }
    
    // Detay panelini güncelle
    displayMessageDetail(message);
}

// Mesaj Detayını Görüntüle
function displayMessageDetail(message) {
    if (!detailContent) return;
    
    const messageTitle = document.getElementById('messageTitle');
    if (messageTitle) {
        messageTitle.textContent = message.title;
    }
    
    const imageHtml = message.image ? `
        <img src="${message.image}" alt="Mesaj resmi" class="detail-image">
    ` : '';
    
    detailContent.innerHTML = `
        <div class="detail-message">
            ${message.content.replace(/\n/g, '<br>')}
        </div>
        ${imageHtml}
        <div class="detail-info">
            <div class="detail-info-item">
                <span class="detail-info-label">Gönderen:</span>
                <span class="detail-info-value">${message.author === MessageState.currentUser ? 'Ben' : 'Sevgilim'}</span>
            </div>
            <div class="detail-info-item">
                <span class="detail-info-label">Tarih:</span>
                <span class="detail-info-value">${formatDate(message.date)}</span>
            </div>
            <div class="detail-info-item">
                <span class="detail-info-label">Oluşturulma:</span>
                <span class="detail-info-value">${formatDateTime(message.createdAt)}</span>
            </div>
        </div>
    `;
}

// Mesaj Detayını Kapat
function closeMessageDetail() {
    MessageState.selectedMessage = null;
    
    // Seçimi kaldır
    document.querySelectorAll('.message-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Detay panelini sıfırla
    if (detailContent) {
        detailContent.innerHTML = '<p>Bir mesaj seçin veya yeni mesaj oluşturun</p>';
    }
    
    const messageTitle = document.getElementById('messageTitle');
    if (messageTitle) {
        messageTitle.textContent = 'Mesaj Detayı';
    }
}

// Yeni Mesaj Modal'ını Aç
function openNewMessageModal() {
    const modal = document.getElementById('newMessageModal');
    if (modal) {
        modal.classList.add('active');
        
        // Formu sıfırla
        const form = document.getElementById('messageForm');
        if (form) {
            form.reset();
            
            // Bugünün tarihini ayarla
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('messageDate');
            if (dateInput) {
                dateInput.value = today;
            }
        }
        
        // Upload preview'ı sıfırla
        resetUploadPreview('uploadPreview');
    }
}

// Yeni Mesaj Modal'ını Kapat
function closeNewMessageModal() {
    const modal = document.getElementById('newMessageModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Mesaj Düzenleme Modal'ını Aç
function editMessage(messageId) {
    const message = MessageState.messages.find(m => m.id === messageId);
    if (!message) return;
    
    MessageState.editingMessage = message;
    
    const modal = document.getElementById('editMessageModal');
    if (modal) {
        modal.classList.add('active');
        
        // Form verilerini doldur
        document.getElementById('editMessageTitle').value = message.title;
        document.getElementById('editMessageContent').value = message.content;
        
        // Mevcut resmi göster
        if (message.image) {
            showImagePreview('editUploadPreview', message.image);
        } else {
            resetUploadPreview('editUploadPreview');
        }
    }
}

// Mesaj Düzenleme Modal'ını Kapat
function closeEditMessageModal() {
    const modal = document.getElementById('editMessageModal');
    if (modal) {
        modal.classList.remove('active');
    }
    MessageState.editingMessage = null;
}

// Mesaj Silme
function deleteMessage(messageId) {
    const message = MessageState.messages.find(m => m.id === messageId);
    if (!message) return;
    
    MessageState.deletingMessage = message;
    
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Silme Onayı Modal'ını Kapat
function closeDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.classList.remove('active');
    }
    MessageState.deletingMessage = null;
}

// Mesaj Silmeyi Onayla
async function confirmDeleteMessage() {
    if (!MessageState.deletingMessage) return;
    
    try {
        // Server'dan sil
        await window.db.deleteMessage(MessageState.deletingMessage.id);
        
        // Local state'i güncelle
        MessageState.messages = MessageState.messages.filter(m => m.id !== MessageState.deletingMessage.id);
        
        // Görüntüyü güncelle
        displayMessages();
        
        // Seçili mesaj silinmişse detayı kapat
        if (MessageState.selectedMessage && MessageState.selectedMessage.id === MessageState.deletingMessage.id) {
            closeMessageDetail();
        }
        
        // Modal'ı kapat
        closeDeleteConfirmModal();
        
        showSuccess('Mesaj başarıyla silindi! 🗑️');
        
    } catch (error) {
        console.error('Mesaj silinirken hata:', error);
        showError('Mesaj silinirken bir hata oluştu');
    }
}

// Event Listener'ları Ayarla
function setupEventListeners() {
    // Yeni mesaj formu
    const newMessageForm = document.getElementById('newMessageForm');
    if (newMessageForm) {
        newMessageForm.addEventListener('submit', handleNewMessage);
        console.log('New message form listener added');
    }
    
    // Mesaj düzenleme formu
    const editMessageForm = document.getElementById('editMessageForm');
    if (editMessageForm) {
        editMessageForm.addEventListener('submit', handleEditMessage);
        console.log('Edit message form listener added');
    }
    
    // Dosya yükleme
    setupFileUpload('messageImage', 'uploadPreview');
    setupFileUpload('editMessageImage', 'editUploadPreview');
    
    // Modal dışına tıklama
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                this.style.display = 'none';
            }
        });
    });
    
    console.log('Event listeners setup complete');
}

// Yeni Mesaj Gönder
async function handleNewMessage(e) {
    e.preventDefault();
    
    if (MessageState.isLoading) return;
    
    const title = document.getElementById('messageTitle').value.trim();
    const content = document.getElementById('messageContent').value.trim();
    const imageFile = document.getElementById('messageImage').files[0];
    
    if (!title || !content) {
        showError('Lütfen tüm alanları doldurun');
        return;
    }
    
    setLoadingState(true);
    
    try {
        // Resmi işle
        let imageData = null;
        if (imageFile) {
            imageData = await processImageFile(imageFile);
        }
        
        // Yeni mesaj oluştur
        const newMessage = {
            id: generateId(),
            title,
            content,
            date: new Date().toISOString(),
            image: imageData,
            sender: MessageState.currentUser,
            recipient: MessageState.currentUser === 'mehmet' ? 'sevgilim' : 'mehmet',
            author: MessageState.currentUser,
            createdAt: new Date().toISOString()
        };
        
        // Server'a kaydet
        const savedMessage = await window.db.saveMessage(newMessage);
        
        // Local state'i güncelle
        MessageState.messages.unshift(savedMessage);
        
        // Görüntüyü güncelle
        displayMessages();
        
        // Modal'ı kapat
        closeNewMessageModal();
        
        // Yeni mesajı seç
        selectMessage(savedMessage.id);
        
        showSuccess('Mesaj başarıyla gönderildi! ❤️');
        
    } catch (error) {
        console.error('Mesaj gönderilirken hata:', error);
        showError('Mesaj gönderilirken bir hata oluştu');
    } finally {
        setLoadingState(false);
    }
}

// Mesaj Düzenle
async function handleEditMessage(e) {
    e.preventDefault();
    
    if (MessageState.isLoading || !MessageState.editingMessage) return;
    
    const title = document.getElementById('editMessageTitle').value.trim();
    const content = document.getElementById('editMessageContent').value.trim();
    const imageFile = document.getElementById('editMessageImage').files[0];
    
    if (!title || !content) {
        showError('Lütfen tüm alanları doldurun');
        return;
    }
    
    setLoadingState(true);
    
    try {
        // Resmi işle
        let imageData = MessageState.editingMessage.image;
        if (imageFile) {
            imageData = await processImageFile(imageFile);
        }
        
        // Mesajı güncelle
        const updatedMessage = {
            ...MessageState.editingMessage,
            title,
            content,
            image: imageData,
            updatedAt: new Date().toISOString()
        };
        
        // Server'da güncelle
        const serverResponse = await window.db.updateMessage(updatedMessage);
        
        // Local state'i güncelle
        const index = MessageState.messages.findIndex(m => m.id === updatedMessage.id);
        if (index !== -1) {
            MessageState.messages[index] = updatedMessage;
        }
        
        // Görüntüyü güncelle
        displayMessages();
        
        // Seçili mesajı güncelle
        if (MessageState.selectedMessage && MessageState.selectedMessage.id === updatedMessage.id) {
            displayMessageDetail(updatedMessage);
            MessageState.selectedMessage = updatedMessage;
        }
        
        // Modal'ı kapat
        closeEditMessageModal();
        
        showSuccess('Mesaj başarıyla güncellendi! ✨');
        
    } catch (error) {
        console.error('Mesaj güncellenirken hata:', error);
        showError('Mesaj güncellenirken bir hata oluştu');
    } finally {
        setLoadingState(false);
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
        <img src="${imageSrc}" alt="Önizleme" class="preview-image">
    `;
}

// Upload Önizlemesini Sıfırla
function resetUploadPreview(previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    
    preview.classList.remove('has-image');
    preview.innerHTML = `
        <i class="fas fa-image"></i>
        <p>Fotoğraf seçin veya sürükleyin</p>
    `;
}

// Resim Dosyasını İşle
function processImageFile(file) {
    return new Promise((resolve, reject) => {
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
    MessageState.isLoading = isLoading;
    
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

// Çıkış Yap
function logout() {
    // Oturum verilerini temizle
    sessionStorage.removeItem('user_session');
    localStorage.removeItem('remembered_user');
    
    // Login yönlendirmesi geçici olarak kaldırıldı
    // window.location.href = '../login.html';
    window.location.reload();
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

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showError(message) {
    // Basit hata gösterimi - daha sonra toast notification eklenebilir
    alert('Hata: ' + message);
}

function showSuccess(message) {
    // Basit başarı gösterimi - daha sonra toast notification eklenebilir
    alert('Başarılı: ' + message);
}

// Sayfa Kapatılırken Temizlik
window.addEventListener('beforeunload', function() {
    // Gerekirse temizlik işlemleri
});

// Modal Fonksiyonları
function openNewMessageModal() {
    const modal = document.getElementById('newMessageModal');
    if (!modal) {
        console.error('New message modal not found');
        return;
    }
    
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    // Form'u sıfırla
    const form = document.getElementById('newMessageForm');
    if (form) {
        form.reset();
        resetUploadPreview('uploadPreview');
    }
    
    // İlk input'a focus
    const titleInput = document.getElementById('messageTitle');
    if (titleInput) {
        setTimeout(() => titleInput.focus(), 100);
    }
}

function closeNewMessageModal() {
    const modal = document.getElementById('newMessageModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

function openEditMessageModal() {
    const modal = document.getElementById('editMessageModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeEditMessageModal() {
    const modal = document.getElementById('editMessageModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

function openDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// Modal dışına tıklandığında kapat
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        e.target.classList.remove('active');
    }
});

console.log('Mesajlar sayfası yüklendi! 💌'); 