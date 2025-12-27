(function () {

  let allProducts = [];
  let editId = null;

  const $ = id => document.getElementById(id);

  const productList   = $('productList');
  const productForm   = $('productForm');
  const titleInput    = $('title');
  const categoryInput = $('category');
  const priceInput    = $('price');
  const tagsInput     = $('tags');
  const descInput     = $('description');
  const propTerm      = $('prop_term');
  const propHeight    = $('prop_height');
  const propWeight    = $('prop_weight');
  const imageUpload   = $('imageUpload');
  const imagePreview  = $('imagePreview');
  const submitBtn     = $('submitBtn');
  const formTitle     = $('formTitle');
  const toast         = $('toast');
  const searchInput   = $('searchInput');

  const slug = t =>
    t.toLowerCase()
     .replace(/ё/g,'е')
     .replace(/[^a-zа-я0-9]+/g,'-')
     .replace(/^-+|-+$/g,'');

  function toastMsg(text, ok = true) {
    if (!toast) return alert(text);
    toast.innerText = text;
    toast.className =
      `fixed bottom-5 right-5 px-6 py-4 rounded-xl text-white text-lg shadow-lg ${
        ok ? 'bg-green-600' : 'bg-red-600'
      }`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
  }

  function resetForm() {
    editId = null;
    productForm.reset();
    if (imagePreview) imagePreview.classList.add('hidden');
    if (formTitle) formTitle.innerText = '➕ Новый сорт';
  }

  async function loadProducts(highlightId = null) {
    const res = await fetch('/api/admin/get-products');
    allProducts = await res.json();

    productList.innerHTML = allProducts.map(p => `
      <div class="p-2 border rounded-xl flex items-center gap-3 bg-white
        ${p.id === highlightId ? 'bg-green-50 border-green-400' : ''}">

        <img
          src="${p.images || 'https://via.placeholder.com/48x48?text=🍅'}"
          class="w-12 h-12 rounded-lg object-cover border">

        <div class="flex-1 truncate">
          <div class="font-semibold text-sm">${p.title}</div>
          <div class="text-xs text-gray-500">${p.category || ''}</div>
        </div>

        <button onclick="edit('${p.id}')">✏️</button>
        <button onclick="del('${p.id}')">🗑</button>
      </div>
    `).join('');
  }

  window.edit = id => {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    editId = id;
    if (formTitle) formTitle.innerText = '✏️ Редактирование сорта';

    titleInput.value = p.title || '';
    categoryInput.value = p.category || '';
    priceInput.value = p.price || '';
    tagsInput.value = p.tags || '';
    descInput.value = p.description || '';

    const map = {};
    (p.props || '').split(';').forEach(x => {
      const [k,v] = x.split('=');
      if (k) map[k] = v;
    });

    propTerm.value = map['Срок'] || '';
    propHeight.value = map['Высота'] || '';
    propWeight.value = map['Вес'] || '';

    if (p.images && imagePreview) {
      imagePreview.src = p.images;
      imagePreview.classList.remove('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.del = async id => {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    if (!confirm(`Удалить сорт «${p.title}»?`)) return;

    await fetch('/api/admin/delete-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    toastMsg('🗑 Сорт удалён');
    if (editId === id) resetForm();
    loadProducts();
  };

  productForm.onsubmit = async e => {
    e.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = '⏳ Сохраняем…';
    }

    try {
      let imageUrl = '';

      if (imageUpload && imageUpload.files[0]) {
        const up = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'x-filename': encodeURIComponent(imageUpload.files[0].name)
          },
          body: imageUpload.files[0]
        });
        imageUrl = (await up.json()).url;
      } else if (editId) {
        imageUrl = allProducts.find(p => p.id === editId)?.images || '';
      }

      const props =
        `Срок=${propTerm.value};` +
        `Высота=${propHeight.value};` +
        `Вес=${propWeight.value}`;

      const savedId = editId || slug(titleInput.value);

      await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: savedId,
          title: titleInput.value,
          price: priceInput.value,
          images: imageUrl,
          category: categoryInput.value,
          tags: tagsInput.value,
          description: descInput.value,
          stock: 'TRUE',
          props
        })
      });

      toastMsg(editId ? '✅ Сорт обновлён' : '✅ Сорт добавлен');
      resetForm();
      loadProducts(savedId);

    } catch (err) {
      console.error(err);
      toastMsg('❌ Ошибка сохранения', false);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = '💾 Сохранить сорт';
      }
    }
  };

  loadProducts();
})();
