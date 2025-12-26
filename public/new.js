let allProducts = [];

// Функция транслитерации для ID
function createSlug(text) {
    const translit = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'shh','ы':'y','э':'e','ю':'yu','я':'ya',' ':'-'};
    return text.toLowerCase().split('').map(char => translit[char] || char).join('').replace(/[^a-z0-9-]/g, '');
}

// Загрузка списка томатов
async function loadProducts() {
    try {
        const res = await fetch('/api/admin/get-products');
        allProducts = await res.json();
        renderProducts(allProducts);
    } catch (err) {
        console.error("Ошибка загрузки списка");
    }
}

// Отрисовка списка в левой колонке
function renderProducts(list) {
    const container = document.getElementById('productList');
    container.innerHTML = list.map(p => `
        <div class="p-3 border rounded-xl hover:bg-gray-50 flex justify-between items-center transition bg-white shadow-sm">
            <div>
                <div class="font-bold text-sm">${p.title}</div>
                <div class="text-xs text-gray-400">${p.category}</div>
            </div>
            <button onclick="editProduct('${p.id}')" class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border">Редакт.</button>
        </div>
    `).join('');
}

// Поиск
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allProducts.filter(p => p.title.toLowerCase().includes(term));
    renderProducts(filtered);
});

// Заглушка для редактирования (пока просто уведомление)
function editProduct(id) {
    alert('Функция редактирования ID: ' + id + ' будет добавлена на следующем этапе. Сейчас данные можно только добавлять.');
}

// Сохранение формы
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
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

        const props = `Срок=${document.getElementById('prop_term').value};Высота=${document.getElementById('prop_height').value};Вес=${document.getElementById('prop_weight').value}`;

        const res = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password: document.getElementById('adminPassword').value,
                id: createSlug(title),
                title: title,
                category: document.getElementById('category').value,
                price: document.getElementById('price').value,
                description: document.getElementById('description').value,
                tags: document.getElementById('tags').value,
                props: props,
                images: imageUrl
            })
        });

        if (res.ok) { 
            alert('✅ Успешно сохранено!'); 
            loadProducts(); // Обновляем список слева
            e.target.reset(); 
        } else { alert('❌ Ошибка!'); }
    } catch (err) { alert('❌ Ошибка сети'); }
    finally { btn.disabled = false; btn.innerText = '🚀 Сохранить в таблицу'; }
});

// Запускаем загрузку при старте
loadProducts();
