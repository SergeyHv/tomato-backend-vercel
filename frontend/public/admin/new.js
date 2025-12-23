let allProducts = [];
let isEditing = false;
let selectedId = null;

document.addEventListener('DOMContentLoaded', () => {
    const savedPass = localStorage.getItem('tomato_admin_pass');
    if (savedPass) document.getElementById('adminPassword').value = savedPass;
    loadProducts();
});

async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        allProducts = await res.json();
        renderList();
    } catch (error) {
        console.error("Ошибка загрузки:", error);
    }
}

function renderList() {
    const listContainer = document.getElementById('productList');
    const query = document.getElementById('searchInput').value.toLowerCase();
    const fGrowth = document.getElementById('filterGrowth').value;
    const fColor = document.getElementById('filterColor').value;
    const showArchived = document.getElementById('showArchived').checked;

    listContainer.innerHTML = '';

    const filtered = allProducts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(query);
        const matchesGrowth = fGrowth === "" || p.growth_type === fGrowth;
        const matchesColor = fColor === "" || p.color === fColor;
        const statusMatch = showArchived ? p.status === 'archived' : p.status !== 'archived';
        return matchesSearch && matchesGrowth && matchesColor && statusMatch;
    });

    filtered.reverse().forEach(p => {
        const div = document.createElement('div');
        const isActive = p.id === selectedId ? 'border-green-500 bg-green-50' : 'bg-white';
        div.className = `${isActive} border rounded-lg p-2 flex items-center gap-3 cursor-pointer hover:shadow-md transition shadow-sm mb-2`;
        div.onclick = () => startEdit(p);
        
        div.innerHTML = `
            <img src="${p.images || 'https://via.placeholder.com/50?text=No+Pic'}" class="w-12 h-12 object-cover rounded-md">
            <div class="flex-1 overflow-hidden">
                <h4 class="font-bold text-sm truncate">${p.title}</h4>
                <p class="text-xs text-gray-500">${p.price} р.</p>
            </div>
            <div class="flex gap-1">
                ${p.status === 'archived' 
                    ? `<button onclick="deleteForever(event, '${p.id}')" class="p-1 hover:bg-red-100 rounded" title="Удалить навсегда">❌</button>
                       <button onclick="restoreFromArchive(event, '${p.id}')" class="p-1 hover:bg-blue-100 rounded" title="Восстановить">⬆️</button>`
                    : `<button onclick="archiveProduct(event, '${p.id}')" class="p-1 hover:bg-gray-100 rounded" title="В архив">🗑️</button>`
                }
            </div>
        `;
        listContainer.appendChild(div);
    });
}

// Привязываем события
document.getElementById('searchInput').oninput = renderList;
document.getElementById('filterGrowth').onchange = renderList;
document.getElementById('filterColor').onchange = renderList;
document.getElementById('showArchived').onchange = renderList;

function startEdit(product) {
    isEditing = true;
    selectedId = product.id;
    renderList();
    
    document.getElementById('formTitle').innerText = '📝 Редактировать сорт';
    document.getElementById('submitBtn').innerText = '💾 Сохранить изменения';
    document.getElementById('cancelEdit').classList.remove('hidden');

    document.getElementById('editId').value = product.id;
    document.getElementById('title').value = product.title;
    document.getElementById('price').value = product.price;
    document.getElementById('category').value = product.category || 'tomatoes';
    document.getElementById('description').value = product.description || '';
    document.getElementById('growth_type').value = product.growth_type || '';
    document.getElementById('color').value = product.color || '';
    document.getElementById('shape').value = product.shape || '';
    document.getElementById('maturity').value = product.maturity || '';
    if (product.images) {
        document.getElementById('preview').innerHTML = `<img src="${product.images}" class="h-20 w-20 object-cover rounded">`;
    }
}

// ФУНКЦИЯ УДАЛЕНИЯ НАВСЕГДА
async function deleteForever(event, id) {
    event.stopPropagation();
    if (!confirm('Удалить этот сорт из таблицы НАВСЕГДА?')) return;
    const password = document.getElementById('adminPassword').value;
    
    const res = await fetch('/api/admin/delete-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id })
    });

    if (res.ok) {
        allProducts = allProducts.filter(p => p.id !== id);
        renderList();
    } else {
        alert('Ошибка при удалении. Проверьте пароль.');
    }
}

// ФУНКЦИЯ АРХИВАЦИИ
async function archiveProduct(event, id) {
    event.stopPropagation();
    const password = document.getElementById('adminPassword').value;
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    const updated = { ...product, status: 'archived' };
    
    const res = await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, product: updated })
    });

    if (res.ok) {
        product.status = 'archived';
        renderList();
    }
}

// ВОССТАНОВЛЕНИЕ
async function restoreFromArchive(event, id) {
    event.stopPropagation();
    const password = document.getElementById('adminPassword').value;
    const product = allProducts.find(p => p.id === id);
    const updated = { ...product, status: 'active' };

    const res = await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, product: updated })
    });

    if (res.ok) {
        product.status = 'active';
        renderList();
    }
}

// СТАНДАРТНОЕ СОХРАНЕНИЕ
document.getElementById('productForm').onsubmit = async (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    const title = document.getElementById('title').value.trim();

    // Защита от дублей
    if (!isEditing && allProducts.some(p => p.title.toLowerCase() === title.toLowerCase() && p.status !== 'archived')) {
        return alert('Сорт с таким названием уже существует!');
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;

    try {
        let imageUrl = document.querySelector('#preview img')?.src || '';
        const fileInput = document.getElementById('imageUpload');
        if (fileInput.files[0]) {
            const file = fileInput.files[0];
            const safeName = Date.now() + '-' + file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-');
            const uploadRes = await fetch(`/api/admin/upload?filename=${safeName}`, { method: 'POST', body: file });
            const blob = await uploadRes.json();
            imageUrl = blob.url;
        }

        const productData = {
            id: isEditing ? document.getElementById('editId').value : Date.now().toString(),
            title,
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
            alert('Успешно сохранено!');
            location.reload();
        }
    } catch (err) {
        alert('Ошибка!');
    } finally {
        submitBtn.disabled = false;
    }
};
