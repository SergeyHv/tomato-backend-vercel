import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Кэш для ускорения работы (храним данные 5 минут)
let cachedData = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; 

export default async function handler(req, res) {
  // Настройки CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // 1. Проверяем кэш
  const now = Date.now();
  if (cachedData && (now - lastFetch < CACHE_DURATION)) {
    console.log("Serving from cache");
    return res.status(200).json(cachedData);
  }

  try {
    // 2. Настройка авторизации (новый стандарт v4)
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SPREADSHEET_ID, serviceAccountAuth);
    
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // 3. Преобразование данных под ваш "Data Contract"
    const products = rows.map(row => {
      return {
        id: row.get('id'),
        title: row.get('title'),
        // Превращаем цену в число, убирая лишние пробелы и меняя запятую на точку
        price: parseFloat(String(row.get('price')).replace(',', '.').replace(/[^0-9.]/g, '')) || 0,
        // Если в ячейке несколько фото через запятую — делаем массив
        images: row.get('images') ? row.get('images').split(',').map(s => s.trim()) : [],
        category: row.get('category'),
        tags: row.get('tags') ? row.get('tags').split(',').map(s => s.trim()) : [],
        description: row.get('description'),
        stock: String(row.get('stock')).toUpperCase() === 'TRUE',
        props: parseProps(row.get('props')),
      };
    });

    // Сохраняем в кэш
    cachedData = products;
    lastFetch = now;

    res.status(200).json(products);
  } catch (error) {
    console.error("Spreadsheet Error:", error);
    res.status(500).json({ error: "Ошибка сервера при чтении таблицы", details: error.message });
  }
}

// Функция для парсинга свойств (высота=120; вес=30) в объект
function parseProps(str) {
  if (!str) return {};
  const obj = {};
  str.split(';').forEach(pair => {
    const [k, v] = pair.split('=');
    if (k && v) obj[k.trim()] = v.trim();
  });
  return obj;
}
