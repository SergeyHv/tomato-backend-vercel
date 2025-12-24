document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Публикация...';

    // 1. Собираем данные из полей
    const password = document.getElementById('adminPassword').value;
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;
    const tags = document.getElementById('tags').value;
    const props = document.getElementById('props').value; // НОВОЕ: дополнительные характеристики
    const imageFile = document.getElementById('imageUpload').files[0];

    try {
        let imageUrl = '';

        // 2. Загрузка фото (если выбрано)
        if (imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);
            
            const uploadRes = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();
            if (uploadData.url) imageUrl = uploadData.url;
        }

        // 3. Отправка всех данных в таблицу
        const response = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password,
                title,
                category,
                price,
                description,
                tags,
                props, // НОВОЕ
                images: imageUrl,
                stock: "TRUE"
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert('✅ Ура! Сорт успешно добавлен в таблицу и на сайт.');
            e.target.reset();
            document.getElementById('preview').innerHTML = '';
        } else {
            alert('❌ Ошибка: ' + (result.details || result.error));
        }

    } catch (err) {
        console.error(err);
        alert('❌ Критическая ошибка: ' + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = '🚀 Опубликовать на сайт';
    }
});

// Превью картинки
document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('preview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            preview.innerHTML = `<img src="${event.target.result}" class="mt-4 max-h-48 rounded-lg shadow-md">`;
        };
        reader.readAsDataURL(file);
    }
});
