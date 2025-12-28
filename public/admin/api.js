export const ADMIN_PASSWORD = 'khvalla74';

async function post(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password: ADMIN_PASSWORD,
      ...data
    })
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Некорректный ответ сервера');
  }

  if (!res.ok) {
    throw new Error(json?.error || 'Ошибка API');
  }

  return json;
}

export async function getProducts() {
  const res = await fetch('/api/admin/get-products');
  if (!res.ok) throw new Error('Ошибка загрузки списка');
  return res.json();
}

export async function saveProduct(payload) {
  return post('/api/admin/add-product', payload);
}

export async function deleteProduct(id) {
  return post('/api/admin/delete-product', { id });
}

export async function uploadImage(filename, base64) {
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, base64 })
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Ошибка загрузки фото');
  }

  if (!res.ok) {
    throw new Error(json?.error || 'Upload error');
  }

  return json; // { url }
}
