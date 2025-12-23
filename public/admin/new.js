const form = document.getElementById('productForm');
const imageUpload = document.getElementById('imageUpload');
const preview = document.getElementById('preview');

// Превью фото перед загрузкой
imageUpload.addEventListener('change', () => {
    const file = imageUpload.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.innerHTML = `<img src="${e.target.result}" class="max-w-xs rounded shadow" alt="preview">`;
        };
        reader.readAsDataURL(file);
    }
});

form.addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Загружаю...';

    try {
        let imageUrl = '';
        const file = imageUpload.files[0];

        // 1. Загрузка в Vercel Blob
        if (file) {
            // Чтобы не было проблем с русскими именами файлов, транслитерируем или даем ID
            const fileName = Date.now() + '-' + file.name; 
            const uploadRes = await fetch(`/api/admin/upload?filename=${fileName}`, {
                method: 'POST',
                body: file, // Отправляем файл напрямую
            });
            const blob = await uploadRes.json();
            imageUrl = blob.url;
        }

        // 2. Сбор данных
        const product = {
            id: document.getElementById('id')?.value || Date.now().toString(), // если ID нет, создаем
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            props: document.getElementById('props').value, // формат: высота=120; вес=30
            tags: document.getElementById('tags').value,
            images: imageUrl,
            stock: "TRUE"
        };

        // 3. Отправка в Google Sheets
        const res = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password: localStorage.getItem('admin_password'), // берем пароль из памяти браузера
                product: product
            })
        });

        if (res.ok) {
            alert('🍅 Сорт успешно добавлен в таблицу!');
            form.reset();
            preview.innerHTML = '';
        } else {
            const err = await res.json();
            alert('Ошибка: ' + err.error);
        }

    } catch (error) {
        console.error(error);
        alert('Что-то пошло не так при сохранении');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Опубликовать сорт';
    }
});
