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
        const titleMatch = p.title.toLowerCase().includes(query);
        const growthMatch = !fGrowth || (p.props && p.props.growth_type === fGrowth);
        const colorMatch = !fColor || (p.props && p.props.color === fColor);
        const statusMatch = showArchived ? p.status === 'archived' : p.status !== 'archived';
        return titleMatch && growthMatch && colorMatch && statusMatch;
    });

    filtered.reverse().forEach(p => {
        const div = document.createElement('div');
        const isActive = p.id === selectedId ? 'border-green-500 bg-green-50' : 'bg-white';
        div.className = `${isActive} border rounded-lg p-2 flex items-center gap-3 cursor-pointer hover:shadow-md transition shadow-sm mb-2`;
        div.onclick = () => startEdit(p);
        
        const imgUrl = Array.isArray(p.images) ? p.images[0] : p.images;
        
        div.innerHTML = `
            <img src="${imgUrl || 'https://via.placeholder.com/50?text=No+Pic'}" class="w-12 h-12 object-cover rounded-md">
            <div class="flex-1 overflow-hidden">
                <h4 class="font-bold text-sm truncate">${p.title}</h4>
                <p class="text-xs text-gray-500">${p.price} р.</p>
            </div>
            <div class="flex gap-1">
                ${p.status === 'archived' 
                    ? `<button onclick="deleteForever(event, '${p.id}')" class="p-1 hover:bg-red-100 rounded">❌</button>
                       <button onclick="restoreFromArchive(event, '${p.id}')" class="p-1 hover:bg-blue-100 rounded">⬆️</button>`
                    : `<button onclick="archiveProduct(event, '${p.id}')" class="p-1 hover:bg-gray-100 rounded">🗑️</button>`
                }
            </div>
        `;
        listContainer.appendChild(div);
    });
}

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
    
    // Свойства из объекта props
    document.getElementById('growth_type').value = product.props?.growth_type || '';
    document.getElementById('color').value = product.props?.color || '';
    document.getElementById('shape').value = product.props?.shape || '';
    document.getElementById('maturity').value = product.props?.maturity || '';
    
    const imgUrl = Array.isArray(product.images) ? product.images[0] : product.images;
    document.getElementById('preview').innerHTML = imgUrl ? `<img src="${imgUrl}" class="h-20 w-20 object-cover rounded">` : '';
}

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
        
        if (fileInput.files[0]) {
            const file = fileInput.files[0];
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
            growth_type: document.getElementById('growth_type').value,
            color: document.getElementById('color').value,
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

        const result = await res.json();
        if (res.ok) {
            alert('✅ Сохранено успешно!');
            location.reload();
        } else {
            alert('❌ Ошибка: ' + result.error);
        }
    } catch (err) {
        alert('❌ Ошибка связи с сервером');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = '🚀 Опубликовать';
    }
};

// Вспомогательные функции (архив/удаление) - аналогично вашим, с проверкой res.ok
async function archiveProduct(event, id) {
    event.stopPropagation();
    if(!confirm('Отправить в архив?')) return;
    const password = document.getElementById('adminPassword').value;
    const product = allProducts.find(p => p.id === id);
    const res = await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, product: { ...product, status: 'archived' } })
    });
    if (res.ok) location.reload();
}
// ... функции deleteForever и restoreFromArchive ...
