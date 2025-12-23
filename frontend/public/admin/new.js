let allProducts = [];
let isEditing = false;

// 1. Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const savedPass = localStorage.getItem('tomato_admin_pass');
    if (savedPass) document.getElementById('adminPassword').value = savedPass;
    loadProducts(); // Загружаем список товаров сразу
});

// 2. Загрузка товаров из таблицы
async function loadProducts() {
    const listContainer = document.getElementById('productList');
    try {
        const res = await fetch('/api/products');
        allProducts = await res.json();
        renderList(allProducts);
    } catch (error) {
        listContainer.innerHTML = '<p class="p-4 text-red-500 text-sm">Ошибка загрузки списка</p>';
    }
}

// 3. Отрисовка списка слева
function renderList(products) {
    const listContainer = document.getElementById('productList');
    listContainer.innerHTML = '';

    const query = document.getElementById('searchInput').value.toLowerCase();
    const fGrowth = document.getElementById('filterGrowth').value;
    const fColor = document.getElementById('filterColor').value;

    const filtered = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(query);
        const matchesGrowth = fGrowth === "" || p.growth_type === fGrowth;
        const matchesColor = fColor === "" || p.color === fColor;
        const isNotArchived = p.status !== 'archived';
        return matchesSearch && matchesGrowth && matchesColor && isNotArchived;
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = '<p class="p-4 text-gray-400 italic text-sm text-center">Ничего не найдено</p>';
        return;
    }

    filtered.reverse().forEach(p => {
        const div = document.createElement('div');
        div.className = 'bg-white border rounded-lg p-2 flex items-center gap-3 cursor-pointer hover:shadow-md transition shadow-sm';
        div.onclick = () => startEdit(p);
        
        div.innerHTML = `
            <img src="${p.images || 'https://via.placeholder.com/50?text=No+Pic'}" class="w-12 h-12 object-cover rounded-md flex-shrink-0">
            <div class="flex-1 overflow-hidden">
                <h4 class="font-bold text-sm truncate">${p.title}</h4>
                <p class="text-xs text-gray-500">${p.price} р. | ${p.growth_type || '—'}</p>
            </div>
            <button onclick="archiveProduct(event, '${p.id}')" class="text-gray-400 hover:text-red-500 p-1" title="В архив">
                🗑️
            </button>
        `;
        listContainer.appendChild(div);
    });
}

// 4. Поиск и фильтрация (живая)
document.getElementById('searchInput').addEventListener('input', () => renderList(allProducts));
document.getElementById('filterGrowth').addEventListener('change', () => renderList(allProducts));
document.getElementById('filterColor').addEventListener('change', () => renderList(allProducts));

// 5. Переход в режим редактирования
function startEdit(product) {
    isEditing = true;
    document.getElementById('formTitle').innerText = '📝 Редактировать сорт';
    document.getElementById('submitBtn').innerText = '💾 Сохранить изменения';
    document.getElementById('cancelEdit').classList.remove('hidden');

    // Заполняем поля
    document.getElementById('editId').value = product.id;
    document.getElementById('title').value = product.title;
    document.getElementById('price').value = product.price;
    document.getElementById('category').value = product.category || 'tomatoes';
    document.getElementById('description').value = product.description || '';
    document.getElementById('growth_type').value = product.growth_type || '';
    document.getElementById('color').value = product.color || '';
    document.getElementById('shape').value = product.shape || '';
    document.getElementById('maturity').value = product.maturity || '';
    
    // Превью фото
    if (product.images) {
        document.getElementById('preview').innerHTML = `<img src="${product.images}" class="h-20 w-20 object-cover rounded shadow">`;
    }
}

// 6. Отмена редактирования
document.getElementById('cancelEdit').onclick = () => {
    isEditing = false;
    document.getElementById('productForm').reset();
    document.getElementById('formTitle').innerText = 'Добавить новый сорт';
    document.getElementById('submitBtn').innerText = '🚀 Опубликовать';
    document.getElementById('cancelEdit').classList.add('hidden');
    document.getElementById('preview').innerHTML = '';
};

// 7. Обработка отправки формы
document.getElementById('productForm').onsubmit = async (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    localStorage.setItem('tomato_admin_pass', password);

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Сохранение...';

    try {
        let imageUrl = document.querySelector('#preview img')?.src || '';
        const fileInput = document.getElementById('imageUpload');
        const file = fileInput.files[0];

        // Если выбрали новое фото
        if (file) {
            const safeName = Date.now() + '-' + file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-');
            const uploadRes = await fetch(`/api/admin/upload?filename=${safeName}`, { method: 'POST', body: file });
            const blob = await uploadRes.json();
            imageUrl = blob.url;
        }

        const productData = {
            id: isEditing ? document.getElementById('editId').value : Date.now().toString(),
            title: document.getElementById('title').value,
            price: document.getElementById('price').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            color: document.getElementById('color').value,
            growth_type: document.getElementById('growth_type').value,
            shape: document.getElementById('shape').value,
            maturity: document.getElementById('maturity').value,
            images: imageUrl,
            status: 'active'
        };

        const res = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, product: productData })
        });

        if (res.ok) {
            alert(isEditing ? '✅ Изменено!' : '🍅 Добавлено!');
            location.reload(); // Перезагружаем для обновления списка
        } else {
            const err = await res.json();
            alert('Ошибка: ' + err.error);
        }
    } catch (error) {
        alert('Ошибка: ' + error.message);
    } finally {
        submitBtn.disabled = false;
    }
};

// 8. Отправка в архив (удаление)
async function archiveProduct(event, id) {
    event.stopPropagation(); // Чтобы не сработало нажатие на саму карточку
    if (!confirm('Отправить сорт в архив? Он перестанет отображаться в каталоге.')) return;

    const password = document.getElementById('adminPassword').value;
    const product = allProducts.find(p => p.id === id);
    product.status = 'archived';

    try {
        const res = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, product })
        });
        if (res.ok) {
            loadProducts();
        } else {
            alert('Не удалось заархивировать');
        }
    } catch (e) {
        alert('Ошибка связи');
    }
}

// Превью фото при выборе
document.getElementById('imageUpload').onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('preview').innerHTML = `<img src="${event.target.result}" class="h-20 w-20 object-cover rounded shadow">`;
        };
        reader.readAsDataURL(file);
    }
};
