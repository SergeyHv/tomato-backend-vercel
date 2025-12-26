import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  // ПРОСТАЯ ЗАЩИТА
  const password = req.headers['x-admin-password'];
  if (password !== 'khvalla74') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const filename =
      decodeURIComponent(req.headers['x-filename'] || 'image.jpg')
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, '-');

    const blob = await put(
      `products/${Date.now()}-${filename}`,
      req,
      {
        access: 'public',
      }
    );

    res.status(200).json({ url: blob.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
