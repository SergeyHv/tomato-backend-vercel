import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) return res.status(401).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const newProduct = JSON.parse(req.body);
    const { blobs } = await list();
    const db = blobs.find(b => b.pathname === 'products.json');
    
    let products = db ? await fetch(db.url).then(r => r.json()) : [];

    const index = products.findIndex(p => p.id === newProduct.id);
    if (index !== -1) products[index] = newProduct;
    else products.push(newProduct);

    await put('products.json', JSON.stringify(products), {
      access: 'public',
      addRandomSuffix: false // Важно для сохранения истории версий в одном файле
    });

    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
