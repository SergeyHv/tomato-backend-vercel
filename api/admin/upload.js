import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Отключаем стандартный парсер, чтобы передать файл как поток
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
    const filename = searchParams.get('filename') || 'image.jpg';

    // Прямая загрузка из тела запроса (req) в хранилище
    const blob = await put(filename, req, {
      access: 'public',
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Blob upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
