import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Обязательно для передачи потока данных файла
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Используйте POST для загрузки' });
  }

  try {
    // Получаем имя файла из заголовков или генерируем случайное
    const filename = req.headers['x-filename'] || `image-${Date.now()}.jpg`;

    // Загружаем файл в Vercel Blob
    const blob = await put(`admin-uploads/${filename}`, req, {
      access: 'public',
    });

    return res.status(200).json(blob); // Возвращает объект с url
  } catch (error) {
    console.error('Ошибка Vercel Blob:', error);
    return res.status(500).json({ error: 'Не удалось сохранить изображение', details: error.message });
  }
}
