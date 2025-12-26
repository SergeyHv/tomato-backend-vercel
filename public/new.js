(function () {
  const SECRET = 'khvalla74';

  let allProducts = [];
  let editId = null;

  /* ===== БЕЗОПАСНО ПОЛУЧАЕМ ЭЛЕМЕНТЫ ===== */
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

  /* ===== ПРОВЕРКА КРИТИЧЕСКИХ ЭЛЕМЕНТОВ ===== */
  if (!productForm || !productList || !titleInput) {
    console.error('❌ Критические элементы формы не найдены');
    return;
  }

  /* ===== SLUG ===== */
  const slug = t =>
    t.toLowerCase()
     .replace(/ё/g, 'е')
     .replace(/[^a-zа-я0-9]+/g, '-')
     .replace(/^-+|-+$/g, '');

  /* ===== TOAST ===== */
  function showToast(text, ok = true) {
    if (!toast) {
      alert(text);
      return;
    }
    toast.innerText = text;
    toast.className =
      `fixed bottom-5 right-5 px-6 py-4 rounded-xl text-white text-lg shadow-lg ${
        ok ? 'bg-green-600' : 'bg-red-600'
      }`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  /* ===== ЗАГРУЗКА СПИСКА ===== */
  async function loadProducts(highlightId = null) {
    try {
      const res = await fetch('/api/admin/get-products');
      allProducts = await res.json();

      productList.innerHTML = allProducts.map(p => `
        <div class="p-3 border rounded-xl flex justify-between items-center
          ${p.id === highlightId ? 'bg-green-50 border-green-400' : 'bg-white'}">
          <div class="truncate">${p.title}</div>
          <button onclick="window.__editProduct('${p.id}')" title="Редактировать">✏️</button>
        </div>
      `).join('');
    } catch (e) {
      showToast('❌ Ошибка загрузки списка', false);
    }
  }

  /* ===== РЕДАКТИРОВАНИЕ ===== */
  window.__editProduct = function (id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    editId = id;
    if (formTitle) formTitle.innerText = '✏️ Редактирование сорта';

    titleInput.value    = p.title || '';
    categoryInput.value = p.category || '';
    priceInput.value    = p.price || '';
    tagsInput.value     = p.tags || '';
    descInput.value     = p.description || '';

    const map = {};
    (p.props || '').split(';').forEach(i => {
      const [k, v] = i.split('=');
      if (k) map[k] = v;
    });

    propTerm.value   = map['Срок'] || '';
    propHeight.value = map['Высота'] || '';
    propWeight.value = map['Вес'] || '';

    if (p.images && imagePreview) {
      imagePreview.src = p.images;
      imagePreview.classList.remove('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ===== ПРЕВЬЮ ФОТО ===== */
  if (imageUpload && imagePreview) {
    imageUpload.addEventListener('change', () => {
      const f = imageUpload.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = e => {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove('hidden');
      };
      r.readAsDataURL(f);
    });
  }

  /* ===== СОХРАНЕНИЕ ===== */
  productForm.addEventListener('submit', async e => {
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
            'x-filename': encodeURIComponent(imageUpload.files[0].name),
            'x-admin-password': SECRET
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

      await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: SECRET,
          id: editId || slug(titleInput.value),
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

      showToast(editId ? '✅ Сорт обновлён' : '✅ Сорт добавлен');

      const savedId = editId || slug(titleInput.value);

      productForm.reset();
      if (imagePreview) imagePreview.classList.add('hidden');
      editId = null;
      if (formTitle) formTitle.innerText = '➕ Новый сорт';

      await loadProducts(savedId);

    } catch (err) {
      console.error(err);
      showToast('❌ Ошибка сохранения', false);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = '💾 Сохранить сорт';
      }
    }
  });

  /* ===== ПОИСК ===== */
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      const filtered = allProducts.filter(p =>
        p.title.toLowerCase().includes(q)
      );
      productList.innerHTML = filtered.map(p => `
        <div class="p-3 border rounded-xl flex justify-between items-center bg-white">
          <div class="truncate">${p.title}</div>
          <button onclick="window.__editProduct('${p.id}')">✏️</button>
        </div>
      `).join('');
    });
  }

  /* ===== СТАРТ ===== */
  loadProducts();
})();
