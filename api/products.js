import { list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const { blobs } = await list();
    const db = blobs.find(b => b.pathname === 'products.json');
    if (!db) return res.status(200).json([]);
    
    const response = await fetch(db.url);
    const data = await response.json();
    // Возвращаем отсортированным по названию для удобства дачницы
    res.status(200).json(data.sort((a, b) => a.title.localeCompare(b.title)));
  } catch (e) {
    res.status(500).json({ error: "Ошибка загрузки" });
  }
}
