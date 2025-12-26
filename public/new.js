(function () {
  const SECRET = 'khvalla74';
  let allProducts = [];
  let editId = null;

  const toast = document.getElementById('toast');
  const btn = document.getElementById('submitBtn');
  const formTitle = document.getElementById('formTitle');

  const slug = t =>
    t.toLowerCase().replace(/[^a-zа-я0-9]+/g, '-').replace(/^-+|-+$/g, '');

  /* ===== УВЕДОМЛЕНИЯ ===== */
  function showToast(text, ok = true) {
    toast.innerText = text;
    toast.className =
      `fixed bottom-5 right-5 px-6 py-4 rounded-xl text-white text-lg shadow-lg
       ${ok ? 'bg-green-600' : 'bg-red-600'}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  /* ===== ЗАГРУЗКА ===== */
  async function loadProducts(highlightId = null) {
    const res = await fetch('/api/admin/get-products');
    allProducts = await res.json();

    productList.innerHTML = allProducts.map(p => `
      <div
        class="p-3 border rounded-xl flex justify-between items-center
        ${p.id === highlightId ? 'bg-green-50 border-green-400' : 'bg-white'}">
        <div class="truncate">${p.title}</div>
        <button onclick="edit('${p.id}')" title="Редактировать">✏️</button>
      </div>
    `).join('');
  }

  /* ===== РЕДАКТИРОВАНИЕ ===== */
  window.edit = id => {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    editId = id;
    formTitle.innerText = '✏️ Редактирование сорта';

    title.value = p.title;
    category.value = p.category;
    price.value = p.price;
    tags.value = p.tags;
    description.value = p.description;

    const map = {};
    (p.props || '').split(';').forEach(i => {
      const [k, v] = i.split('=');
      if (k) map[k] = v;
    });

    prop_term.value = map['Срок'] || '';
    prop_height.value = map['Высота'] || '';
    prop_weight.value = map['Вес'] || '';

    if (p.images) {
      imagePreview.src = p.images;
      imagePreview.classList.remove('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ===== ПРЕВЬЮ ФОТО ===== */
  imageUpload.onchange = () => {
    const f = imageUpload.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = e => {
      imagePreview.src = e.target.result;
      imagePreview.classList.remove('hidden');
    };
    r.readAsDataURL(f);
  };

  /* ===== СОХРАНЕНИЕ ===== */
  productForm.onsubmit = async e => {
    e.preventDefault();

    btn.disabled = true;
    btn.innerText = '⏳ Сохраняем…';

    try {
      let imageUrl = '';

      if (imageUpload.files[0]) {
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
        `Срок=${prop_term.value};` +
        `Высота=${prop_height.value};` +
        `Вес=${prop_weight.value}`;

      await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: SECRET,
          id: editId || slug(title.value),
          title: title.value,
          price: price.value,
          images: imageUrl,
          category: category.value,
          tags: tags.value,
          description: description.value,
          stock: 'TRUE',
          props
        })
      });

      showToast(editId ? '✅ Сорт обновлён' : '✅ Сорт добавлен');

      const savedId = editId || slug(title.value);

      productForm.reset();
      imagePreview.classList.add('hidden');
      editId = null;
      formTitle.innerText = '➕ Новый сорт';

      await loadProducts(savedId);

    } catch (err) {
      showToast('❌ Ошибка сохранения', false);
    } finally {
      btn.disabled = false;
      btn.innerText = '💾 Сохранить сорт';
    }
  };

  loadProducts();
})();
