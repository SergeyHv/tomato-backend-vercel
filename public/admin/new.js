const form = document.getElementById('productForm');
const imageUpload = document.getElementById('imageUpload');
const preview = document.getElementById('preview');

let imageUrl = '';

// Превью фото
imageUpload.addEventListener('change', () => {
  const file = imageUpload.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.innerHTML = `<img src="${e.target.result}" alt="preview">`;
    };
    reader.readAsDataURL(file);
  }
});

// Отправка формы
form.addEventListener('submit', async e => {
  e.preventDefault();

  // 1. Загружаем фото в Blob Storage через API
  const file = imageUpload.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    imageUrl = data.url; // URL из Blob Storage
  }

  // 2. Формируем JSON товара
  const product = {
    title: document.getElementById('title').value,
    category: document.getElementById('category').value,
    description: document.getElementById('description').value,
    props: document.getElementById('props').value,
    tags: document.getElementById('tags').value,
    images: imageUrl,
    stock: "TRUE"
  };

  // 3. Отправляем товар в Google Sheets через API
  await fetch('/api/admin/add-product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  alert('Сорт успешно добавлен!');
  form.reset();
  preview.innerHTML = '';
});
