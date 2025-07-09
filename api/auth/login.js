import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Basit parola kontrolü (gerçek projede hash kullanın)
    const validPassword = '18032024';
    const validUsers = ['mehmet', 'sevgilim'];

    if (password !== validPassword) {
      return res.status(401).json({ error: 'Geçersiz parola' });
    }

    if (!validUsers.includes(username)) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı' });
    }

    // Son giriş zamanını kaydet
    await kv.set(`last_login:${username}`, new Date().toISOString());
    
    // Basit token oluştur (gerçek projede JWT kullanın)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    
    // Token'ı kaydet (1 gün geçerli)
    await kv.set(`token:${token}`, username, { ex: 86400 });

    res.status(200).json({
      success: true,
      user: username,
      token: token,
      message: 'Giriş başarılı'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
} 