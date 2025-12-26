// Функция для создания ID (slug) из русского названия
function createSlug(text) {
    const translit = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'shh','ы':'y','э':'e','ю':'yu','я':'ya',' ':'-'
    };
    return text.toLowerCase().split('').map(char => translit[char] || char).join('').replace(/[^a-z0-9-]/g, '');
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true; btn.innerText = '⌛ Сохранение...';

    const title = document.getElementById('title').value;
    const file = document.getElementById('imageUpload').files[0];
    let imageUrl = '';

    try {
        if (file) {
            const up = await fetch('/api/admin/upload', {
                method: 'POST', body: file, headers: { 'x-filename': encodeURI(file.name) }
            });
            const res = await up.json();
            imageUrl = res.url;
        }

        // Собираем Props в строку Срок=...;Высота=...;Вес=...
        const props = `Срок=${document.getElementById('prop_term').value};Высота=${document.getElementById('prop_height').value};Вес=${document.getElementById('prop_weight').value}`;

        const res = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password: document.getElementById('adminPassword').value,
                id: createSlug(title), // АВТО-ID
                title: title,
                category: document.getElementById('category').value,
                price: document.getElementById('price').value,
                description: document.getElementById('description').value,
                tags: document.getElementById('tags').value,
                props: props,
                images: imageUrl
            })
        });

        if (res.ok) { alert('✅ Томат добавлен в базу!'); e.target.reset(); }
        else { alert('❌ Ошибка доступа или базы'); }
    } catch (err) { alert('❌ Ошибка связи с сервером'); }
    finally { btn.disabled = false; btn.innerText = '🚀 Опубликовать'; }
});
