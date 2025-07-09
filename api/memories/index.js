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
        // Tüm anıları getir
        const memories = await kv.get('memories') || [];
        res.status(200).json({ success: true, memories });
        break;

      case 'POST':
        // Yeni anı ekle
        const { title, description, image, date } = req.body;
        
        if (!title) {
          return res.status(400).json({ error: 'Anı başlığı gerekli' });
        }

        const newMemory = {
          id: Date.now().toString(),
          title,
          description: description || '',
          image: image || null,
          date: date || new Date().toISOString().split('T')[0],
          addedBy: username,
          timestamp: new Date().toISOString()
        };

        const existingMemories = await kv.get('memories') || [];
        existingMemories.push(newMemory);
        await kv.set('memories', existingMemories);

        res.status(201).json({ success: true, memory: newMemory });
        break;

      case 'PUT':
        // Anıyı güncelle
        const { id, title: newTitle, description: newDescription, image: newImage, date: newDate } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Anı ID gerekli' });
        }

        const memories2 = await kv.get('memories') || [];
        const memoryIndex = memories2.findIndex(memory => memory.id === id);
        
        if (memoryIndex === -1) {
          return res.status(404).json({ error: 'Anı bulunamadı' });
        }

        // Güncelleme
        if (newTitle) memories2[memoryIndex].title = newTitle;
        if (newDescription !== undefined) memories2[memoryIndex].description = newDescription;
        if (newImage !== undefined) memories2[memoryIndex].image = newImage;
        if (newDate) memories2[memoryIndex].date = newDate;
        memories2[memoryIndex].lastModified = new Date().toISOString();

        await kv.set('memories', memories2);
        res.status(200).json({ success: true, memory: memories2[memoryIndex] });
        break;

      case 'DELETE':
        // Anıyı sil
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Anı ID gerekli' });
        }

        const memories3 = await kv.get('memories') || [];
        const filteredMemories = memories3.filter(memory => memory.id !== deleteId);
        
        if (filteredMemories.length === memories3.length) {
          return res.status(404).json({ error: 'Anı bulunamadı' });
        }

        await kv.set('memories', filteredMemories);
        res.status(200).json({ success: true, message: 'Anı silindi' });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Memories API error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
} 