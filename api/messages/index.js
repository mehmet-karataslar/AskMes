import { kv } from '@vercel/kv';

// Token doğrulama fonksiyonu
async function verifyToken(token) {
  if (!token) return null;
  const username = await kv.get(`token:${token}`);
  return username;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Token kontrolü
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token gerekli' });
    }

    const token = authHeader.substring(7);
    const username = await verifyToken(token);
    
    if (!username) {
      return res.status(401).json({ error: 'Geçersiz token' });
    }

    switch (req.method) {
      case 'GET':
        // Tüm mesajları getir
        const messages = await kv.get('messages') || [];
        res.status(200).json({ success: true, messages });
        break;

      case 'POST':
        // Yeni mesaj ekle
        const { content, image } = req.body;
        
        if (!content && !image) {
          return res.status(400).json({ error: 'Mesaj içeriği gerekli' });
        }

        const newMessage = {
          id: Date.now().toString(),
          sender: username,
          content: content || '',
          image: image || null,
          timestamp: new Date().toISOString(),
          read: false
        };

        const existingMessages = await kv.get('messages') || [];
        existingMessages.push(newMessage);
        await kv.set('messages', existingMessages);

        res.status(201).json({ success: true, message: newMessage });
        break;

      case 'PUT':
        // Mesajı güncelle (okundu olarak işaretle)
        const { messageId } = req.body;
        
        if (!messageId) {
          return res.status(400).json({ error: 'Mesaj ID gerekli' });
        }

        const messages2 = await kv.get('messages') || [];
        const messageIndex = messages2.findIndex(msg => msg.id === messageId);
        
        if (messageIndex === -1) {
          return res.status(404).json({ error: 'Mesaj bulunamadı' });
        }

        messages2[messageIndex].read = true;
        await kv.set('messages', messages2);

        res.status(200).json({ success: true, message: messages2[messageIndex] });
        break;

      case 'DELETE':
        // Mesajı sil
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ error: 'Mesaj ID gerekli' });
        }

        const messages3 = await kv.get('messages') || [];
        const filteredMessages = messages3.filter(msg => msg.id !== id);
        
        if (filteredMessages.length === messages3.length) {
          return res.status(404).json({ error: 'Mesaj bulunamadı' });
        }

        await kv.set('messages', filteredMessages);
        res.status(200).json({ success: true, message: 'Mesaj silindi' });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Messages API error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
} 