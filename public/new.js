let allProducts = [];

// Функция транслитерации для ID
function createSlug(text) {
    const translit = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'shh','ы':'y','э':'e','ю':'yu','я':'ya',' ':'-'};
    return text.toLowerCase().split('').map(char => translit[char] || char).join('').replace(/[^a-z0-9-]/g, '');
}

// Загрузка списка
async function loadProducts() {
    try {
        const res = await fetch('/api/admin/get-products');
        allProducts = await res.json();
        renderProducts(allProducts);
    } catch (err) { console.error("Ошибка загрузки списка"); }
}

function renderProducts(list) {
    const container = document.getElementById('productList');
    container.innerHTML = list.map(p => `
        <div class="p-3 border rounded-xl hover:bg-gray-50 flex justify-between items-center bg-white shadow-sm mb-2">
            <div>
                <div class="font-bold text-sm text-gray-800">${p.title}</div>
                <div class="text-xs text-gray-400">${p.category}</div>
            </div>
            <button onclick="editProduct('${p.id}')" class="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 transition">Редакт.</button>
        </div>
    `).join('');
}

// Поиск
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    renderProducts(allProducts.filter(p => p.title.toLowerCase().includes(term)));
});

// Кнопка Редактировать
function editProduct(id) {
    const p = allProducts.find(item => item.id === id);
    if (!p) return;

    document.getElementById('formTitle').innerText = "📝 Редактирование: " + p.title;
    document.getElementById('title').value = p.title;
    document.getElementById('title').disabled = true; // ID не меняем
    document.getElementById('category').value = p.category;
    document.getElementById('price').value = p.price;
    document.getElementById('description').value = p.description;
    document.getElementById('tags').value = p.tags;

    // Парсим характеристики
    const pMap = {};
    (p.props || "").split(';').forEach(pair => {
        const [k, v] = pair.split('=');
        if(k) pMap[k] = v;
    });
    document.getElementById('prop_term').value = pMap['Срок'] || '';
    document.getElementById('prop_height').value = pMap['Высота'] || '';
    document.getElementById('prop_weight').value = pMap['Вес'] || '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Сохранение (Добавление или Обновление)
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true; btn.innerText = '⌛ Сохранение...';

    const title = document.getElementById('title').value;
    const file = document.getElementById('imageUpload').files[0];
    let imageUrl = '';

    try {
        // Загрузка фото, только если выбрано новое
        if (file) {
            const up = await fetch('/api/admin/upload', {
                method: 'POST', body: file, headers: { 'x-filename': encodeURI(file.name) }
            });
            const uploadRes = await up.json();
            imageUrl = uploadRes.url;
        } else {
            // Если редактируем и фото не меняли — берем старое
            const existing = allProducts.find(p => p.id === createSlug(title));
            if (existing) imageUrl = existing.images;
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
            alert('✅ Данные успешно сохранены!');
            document.getElementById('title').disabled = false;
            document.getElementById('formTitle').innerText = "Добавить новый сорт";
            e.target.reset();
            loadProducts();
        } else {
            alert('❌ Ошибка доступа (проверьте пароль)');
        }
    } catch (err) {
        alert('❌ Ошибка сети');
    } finally {
        btn.disabled = false;
        btn.innerText = '🚀 Сохранить в таблицу';
    }
});

// Запуск
loadProducts();
