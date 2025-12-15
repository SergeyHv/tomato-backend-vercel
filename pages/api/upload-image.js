import { promises as fs } from 'fs';
import path from 'path';

// Вспомогательная функция для загрузки в GitHub
// Принимает буфер файла, имя файла, токен и данные репо
async function uploadFileToGitHub(fileBuffer, fileName, token, owner, repo, dir) {
  const filePath = `${dir}/${fileName}`;
  const content = fileBuffer.toString('base64');

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Upload ${fileName} via admin panel`,
      content: content,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('GitHub API Error:', result);
    throw new Error(`GitHub upload failed: ${result.message || 'Unknown error'}`);
  }

  if (!result.content || !result.content.download_url) {
    throw new Error('GitHub API returned unexpected response structure');
  }

  // Возвращаем ТОЛЬКО имя файла, не полный URL
  // Полный URL будет формироваться на фронтенде или в других API роутах
  return fileName;
}

export default async function handler(req, res) {
  // CORS для GitHub Pages (твой админка)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://sergeyhv.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Проверяем наличие токена на сервере перед началом обработки
  if (!process.env.GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN не найден в переменных окружения на Vercel');
    return res.status(500).json({ error: 'Server configuration error: GITHUB_TOKEN missing' });
  }

  // Обработка multipart/form-data
  // Next.js не парсит multipart по умолчанию, используем formidable
  const formidable = (await import('formidable')).default;

  const form = formidable({
    multiples: false, // Принимаем только один файл за раз
    keepExtensions: true, // Сохраняем оригинальное расширение
    maxFileSize: 8 * 1024 * 1024, // Максимальный размер файла 8MB
    uploadDir: '/tmp', // Временная директория на Vercel
  });

  // Парсим тело запроса
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(400).json({ error: 'Error parsing file upload' });
    }

    // Получаем файл из parsed объекта
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      console.error('No file found in upload request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Валидация файла на клиенте (тип, размер) - важна, но делаем и на сервере для надёжности
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.error('Invalid file type uploaded:', file.mimetype);
      return res.status(400).json({ error: 'Invalid file type. Only image files (jpeg, png, webp, gif) are allowed.' });
    }

    if (file.size > 8 * 1024 * 1024) { // 8MB в байтах
      console.error('File too large:', file.size);
      return res.status(400).json({ error: 'File size exceeds 8MB limit.' });
    }

    try {
      // Читаем содержимое файла в память (буфер)
      const fileBuffer = await fs.readFile(file.filepath);

      // Генерируем имя файла для GitHub.
      // Вместо оригинального имени (которое может быть плохим) используем:
      // timestamp + случайная строка + оригинальное расширение
      const originalExt = path.extname(file.originalFilename).toLowerCase();
      // Простая генерация уникального имени (в будущем можно связать с ID сорта)
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}${originalExt}`;

      // Вызываем нашу вспомогательную функцию загрузки
      const filenameOnGitHub = await uploadFileToGitHub(
        fileBuffer, // сам файл
        fileName, // новое имя файла
        process.env.GITHUB_TOKEN, // токен из env
        process.env.GITHUB_USERNAME, // юзернейм из env
        process.env.GITHUB_REPO, // репо из env
        process.env.GITHUB_IMAGES_DIR // папка в репо из env
      );

      // Успешно! Возвращаем имя файла
      // Фронтенд получит его и сам построит URL через photoUrl(filename)
      res.status(200).json({ filename: filenameOnGitHub });

    } catch (error) {
      console.error('API /upload-image error:', error);
      // Возвращаем ошибку клиенту
      res.status(500).json({ error: error.message || 'Internal Server Error during upload' });
    }
  });
}

// Отключаем встроенный bodyParser Next.js, так как мы парсим multipart вручную
export const config = {
  api: {
    bodyParser: false,
  },
};
