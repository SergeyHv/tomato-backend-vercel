document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.innerText = '⌛ Публикация...';

    const data = {
        password: document.getElementById('adminPassword').value,
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        price: document.getElementById('price').value,
        description: document.getElementById('description').value,
        tags: document.getElementById('tags').value,
        props: document.getElementById('props').value,
    };

    const file = document.getElementById('imageUpload').files[0];

    try {
        let imageUrl = '';
        if (file) {
            const up = await fetch('/api/admin/upload', {
                method: 'POST', body: file, headers: { 'x-filename': encodeURI(file.name) }
            });
            const upRes = await up.json();
            imageUrl = upRes.url;
        }

        const res = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, images: imageUrl, stock: "TRUE" })
        });

        if (res.ok) {
            alert('✅ Опубликовано!');
            e.target.reset();
        } else {
            const err = await res.json();
            alert('❌ Ошибка: ' + (err.details || err.error));
        }
    } catch (err) {
        alert('❌ Ошибка сети');
    } finally {
        btn.disabled = false; btn.innerText = '🚀 Опубликовать';
    }
});