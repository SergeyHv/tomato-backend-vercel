const form = document.getElementById('productForm');
const imageUpload = document.getElementById('imageUpload');
const preview = document.getElementById('preview');

// 1. Живое превью картинки
imageUpload.addEventListener('change', () => {
    const file = imageUpload.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.innerHTML = `<img src="${e.target.result}" class="max-h-64 rounded-lg shadow-md border-4 border-white" alt="preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// 2. Обработка отправки формы
form.addEventListener('submit', async e => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button');
    const originalBtnText = submitBtn.innerText;
    
    // Защита от двойного клика
    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Сохраняю сорт...';

    try {
        const password = document.getElementById('adminPassword').value;
        const file = imageUpload.files[0];
        let imageUrl = '';

        // А. Загрузка фото в Vercel Blob (если выбрано)
        if (file) {
            // Очищаем имя файла от кириллицы для надежности
            const safeName = Date.now() + '-' + file.name.replace(/[^a-z0-9.]/gi, '_');
            const uploadRes = await fetch(`/api/admin/upload?filename=${safeName}`, {
                method: 'POST',
                body: file,
            });
            
            if (!uploadRes.ok) throw new Error('Ошибка при загрузке фото');
            const blob = await uploadRes.json();
            imageUrl = blob.url;
        }

        // Б. Собираем данные товара
        const product = {
            id: 'id-' + Date.now(), // Автоматический ID
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            price: document.getElementById('price').value,
            description: document.getElementById('description').value,
            tags: document.getElementById('tags').value,
            props: document.getElementById('props').value,
            images: imageUrl,
            stock: "TRUE"
        };

        // В. Отправка в Google Sheets
        const res = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, product })
        });

        const result = await res.json();

        if (res.ok) {
            alert('✅ Успешно! Сорт "' + product.title + '" добавлен в таблицу и скоро появится на сайте.');
            form.reset();
            preview.innerHTML = '';
            // Сохраняем пароль в браузере, чтобы жене не вводить его каждый раз
            localStorage.setItem('admin_last_pass', password);
        } else {
            alert('❌ Ошибка: ' + (result.error || 'Не удалось сохранить'));
        }

    } catch (error) {
        console.error(error);
        alert('Что-то пошло не так. Проверьте интернет или настройки сервера.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
    }
});

// При загрузке страницы подставляем пароль, если он был сохранен
window.onload = () => {
    const savedPass = localStorage.getItem('admin_last_pass');
    if (savedPass) document.getElementById('adminPassword').value = savedPass;
};
