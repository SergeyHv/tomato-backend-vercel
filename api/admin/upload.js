import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Обязательно false для передачи файлов
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
    const filename = searchParams.get('filename') || 'image.jpg';

    // Самая простая загрузка
    const blob = await put(filename, req, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN // Явно указываем токен
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Blob upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
