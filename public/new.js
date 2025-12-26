(function() {
    console.log("🟢 Скрипт new.js успешно загружен"); // Маячок для консоли

    const SECRET = 'khvalla74';
    const pathParts = window.location.pathname.split('/');
    const currentPass = pathParts[pathParts.length - 1];

    // Если пароль неверный - блокируем экран
    if (currentPass !== SECRET) {
        console.error("🔴 Ошибка доступа: Неверный ключ в URL");
        document.body.innerHTML = '<div style="background:#111;color:white;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:24px">🔒 Доступ ограничен</div>';
        return;
    }

    let allProducts = [];

    // Универсальная транслитерация для ID
    const createSlug = (t) => {
        const tr = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'shh','ы':'y','э':'e','ю':'yu','я':'ya',' ':'-'};
        return t.toLowerCase().split('').map(c => tr[c] || c).join('').replace(/[^a-z0-9-]/g, '');
    };

    // Загрузка данных
    async function loadProducts() {
        try {
            const res = await fetch('/api/admin/get-products');
            if (!res.ok) throw new Error("Ошибка API");
            allProducts = await res.json();
            renderProducts(allProducts);
            console.log("📦 Список сортов загружен:", allProducts.length);
        } catch (err) {
            console.error("🔴 Ошибка загрузки списка:", err);
        }
    }

    function renderProducts(list) {
        const container = document.getElementById('productList');
        if (!container) return;
        container.innerHTML = list.map(p => `
            <div class="p-3 border rounded-xl flex justify-between items-center bg-white shadow-sm mb-2">
                <div class="truncate pr-2 font-bold text-sm text-gray-800">${p.title}</div>
                <button onclick="editProduct('${p.id}')" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition">Редакт.</button>
            </div>`).join('');
    }

    // Функция редактирования
    window.editProduct = (id) => {
        const p = allProducts.find(x => x.id === id);
        if (!p) return;
        document.getElementById('formTitle').innerText = "📝 Редакт: " + p.title;
        document.getElementById('title').value = p.title;
        document.getElementById('title').disabled = true;
        document.getElementById('category').value = p.category || 'Dwarf';
        document.getElementById('price').value = p.price || '';
        document.getElementById('description').value = p.description || '';
        document.getElementById('tags').value = p.tags || '';
        
        const pMap = {};
        (p.props || "").split(';').forEach(pair => { const [k, v] = pair.split('='); if(k) pMap[k] = v; });
        document.getElementById('prop_term').value = pMap['Срок'] || '';
        document.getElementById('prop_height').value = pMap['Высота'] || '';
        document.getElementById('prop_weight').value = pMap['Вес'] || '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Отправка формы
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
                    method: 'POST', 
                    body: file, 
                    headers: { 'x-filename': encodeURI(file.name) } 
                });
                const r = await up.json();
                imageUrl = r.url;
            } else {
                const ex = allProducts.find(p => p.id === createSlug(title));
                if (ex) imageUrl = ex.images;
            }

            const props = `Срок=${document.getElementById('prop_term').value};Высота=${document.getElementById('prop_height').value};Вес=${document.getElementById('prop_weight').value}`;

            const response = await fetch('/api/admin/add-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: SECRET,
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

            if (response.ok) {
                alert('✅ Данные в таблице сохранены!');
                document.getElementById('title').disabled = false;
                e.target.reset();
                loadProducts();
            } else {
                alert('❌ Ошибка сохранения');
            }
        } catch (err) {
            alert('❌ Ошибка сети');
        } finally {
            btn.disabled = false;
            btn.innerText = '🚀 Сохранить в таблицу';
        }
    });

    // Поиск
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const t = e.target.value.toLowerCase();
        renderProducts(allProducts.filter(p => p.title.toLowerCase().includes(t)));
    });

    loadProducts();
})();
