// 1. Сразу при загрузке страницы пытаемся достать пароль из памяти браузера
document.addEventListener('DOMContentLoaded', () => {
    const savedPass = localStorage.getItem('tomato_admin_pass');
    if (savedPass) {
        const passInput = document.getElementById('adminPassword');
        if (passInput) passInput.value = savedPass;
    }
});

const form = document.getElementById('productForm');
const imageUpload = document.getElementById('imageUpload');
const preview = document.getElementById('preview');

// Превью фото
imageUpload.addEventListener('change', () => {
    const file = imageUpload.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.innerHTML = `<img src="${e.target.result}" class="max-h-48 rounded shadow-lg" alt="preview">`;
        };
        reader.readAsDataURL(file);
    }
});

form.addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Сохранение...';

    // Сохраняем пароль в память, чтобы не вводить снова
    const password = document.getElementById('adminPassword').value;
    localStorage.setItem('tomato_admin_pass', password);

    try {
        let imageUrl = '';
        const file = imageUpload.files[0];

        // Загрузка фото
        if (file) {
            const fileName = Date.now() + '-' + file.name;
            const uploadRes = await fetch(`/api/admin/upload?filename=${fileName}`, {
                method: 'POST',
                body: file,
            });
            const blob = await uploadRes.json();
            imageUrl = blob.url;
        }

        // Данные для таблицы
        const product = {
            id: Date.now().toString(),
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            price: document.getElementById('price').value,
            description: document.getElementById('description').value,
            tags: document.getElementById('tags').value,
            images: imageUrl,
            stock: "TRUE"
        };

        const res = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, product })
        });

        if (res.ok) {
            alert('🍅 Сорт успешно добавлен!');
            form.reset();
            // Снова подставляем пароль после очистки формы
            document.getElementById('adminPassword').value = password;
            preview.innerHTML = '';
        } else {
            const err = await res.json();
            alert('Ошибка: ' + err.error);
        }
    } catch (error) {
        alert('Ошибка связи с сервером');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = '🚀 Опубликовать на сайт';
    }
});
