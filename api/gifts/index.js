import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Token doğrulama fonksiyonu
async function verifyToken(token) {
  if (!token) return null;
  const username = await redis.get(`token:${token}`);
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
        // Tüm hediyeleri getir
        const gifts = await kv.get('gifts') || [];
        res.status(200).json({ success: true, gifts });
        break;

      case 'POST':
        // Yeni hediye ekle
        const { title, description, image, price, category, recipient } = req.body;
        
        if (!title) {
          return res.status(400).json({ error: 'Hediye başlığı gerekli' });
        }

        const newGift = {
          id: Date.now().toString(),
          title,
          description: description || '',
          image: image || null,
          price: price || '',
          category: category || 'Diğer',
          recipient: recipient || (username === 'mehmet' ? 'sevgilim' : 'mehmet'),
          giver: username,
          status: 'planned', // planned, purchased, given
          timestamp: new Date().toISOString()
        };

        const existingGifts = await kv.get('gifts') || [];
        existingGifts.push(newGift);
        await kv.set('gifts', existingGifts);

        res.status(201).json({ success: true, gift: newGift });
        break;

      case 'PUT':
        // Hediyeyi güncelle
        const { id, title: newTitle, description: newDescription, image: newImage, price: newPrice, category: newCategory, status: newStatus } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Hediye ID gerekli' });
        }

        const gifts2 = await kv.get('gifts') || [];
        const giftIndex = gifts2.findIndex(gift => gift.id === id);
        
        if (giftIndex === -1) {
          return res.status(404).json({ error: 'Hediye bulunamadı' });
        }

        // Güncelleme
        if (newTitle) gifts2[giftIndex].title = newTitle;
        if (newDescription !== undefined) gifts2[giftIndex].description = newDescription;
        if (newImage !== undefined) gifts2[giftIndex].image = newImage;
        if (newPrice !== undefined) gifts2[giftIndex].price = newPrice;
        if (newCategory) gifts2[giftIndex].category = newCategory;
        if (newStatus) gifts2[giftIndex].status = newStatus;
        gifts2[giftIndex].lastModified = new Date().toISOString();

        await kv.set('gifts', gifts2);
        res.status(200).json({ success: true, gift: gifts2[giftIndex] });
        break;

      case 'DELETE':
        // Hediyeyi sil
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Hediye ID gerekli' });
        }

        const gifts3 = await kv.get('gifts') || [];
        const filteredGifts = gifts3.filter(gift => gift.id !== deleteId);
        
        if (filteredGifts.length === gifts3.length) {
          return res.status(404).json({ error: 'Hediye bulunamadı' });
        }

        await kv.set('gifts', filteredGifts);
        res.status(200).json({ success: true, message: 'Hediye silindi' });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Gifts API error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
} 