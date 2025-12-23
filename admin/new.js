console.log("✅ Скрипт админки загружен и готов!");

document.addEventListener('DOMContentLoaded', () => {
    const savedPass = localStorage.getItem('tomato_admin_pass');
    if (savedPass) {
        const passInput = document.getElementById('adminPassword');
        if (passInput) passInput.value = savedPass;
    }
});

const form = document.getElementById('productForm');

if (!form) {
    console.error("❌ Форма 'productForm' не найдена на странице!");
} else {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("🚀 Кнопка нажата, начинаем отправку...");

        const password = document.getElementById('adminPassword').value;
        localStorage.setItem('tomato_admin_pass', password);

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = '⏳ Загрузка...';

        try {
            let imageUrl = '';
            const fileInput = document.getElementById('imageUpload');
            const file = fileInput ? fileInput.files[0] : null;

            // 1. Загрузка фото
            if (file) {
                console.log("📸 Загружаем фото:", file.name);
                const safeName = Date.now() + '-' + file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-');
                const uploadRes = await fetch(`/api/admin/upload?filename=${safeName}`, {
                    method: 'POST',
                    body: file,
                });

                if (!uploadRes.ok) {
                    const errorText = await uploadRes.text();
                    throw new Error(`Ошибка загрузки фото: ${errorText}`);
                }

                const blob = await uploadRes.json();
                imageUrl = blob.url;
                console.log("✅ Фото загружено:", imageUrl);
            }

            // 2. Сбор данных
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

            // 3. Отправка в таблицу
            console.log("📝 Отправляем данные в таблицу...");
            const res = await fetch('/api/admin/add-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, product })
            });

            if (res.ok) {
                alert('🍅 Сорт успешно добавлен!');
                form.reset();
                document.getElementById('adminPassword').value = password;
                const preview = document.getElementById('preview');
                if (preview) preview.innerHTML = '';
            } else {
                const err = await res.json();
                throw new Error(err.error || 'Ошибка при сохранении в таблицу');
            }

        } catch (error) {
            console.error("❌ Ошибка:", error);
            alert('Ошибка: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = '🚀 Опубликовать на сайт';
        }
    });
}
