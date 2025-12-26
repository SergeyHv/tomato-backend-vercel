(function () {
  const SECRET = 'khvalla74';
  let allProducts = [];

  const createSlug = t =>
    t.toLowerCase()
     .replace(/[^a-zа-я0-9]+/g, '-')
     .replace(/(^-|-$)/g, '');

  async function loadProducts() {
    const res = await fetch('/api/admin/get-products');
    allProducts = await res.json();
    render(allProducts);
    countInfo.innerText = `Всего сортов: ${allProducts.length}`;
  }

  function render(list) {
    productList.innerHTML = list.map(p => `
      <div class="p-3 bg-white border rounded-xl flex justify-between items-center">
        <div>
          <b>${p.title}</b>
          <div class="text-sm text-gray-500">${p.category}</div>
        </div>
        <button onclick="edit('${p.id}')" title="Редактировать">✏️</button>
      </div>
    `).join('');
  }

  window.edit = id => {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    title.value = p.title;
    category.value = p.category;
    price.value = p.price;
    tags.value = p.tags;
    description.value = p.description;
    stock.checked = p.stock === 'TRUE';

    const map = {};
    (p.props || '').split(';').forEach(x => {
      const [k, v] = x.split('=');
      if (k) map[k] = v;
    });

    prop_term.value = map['Срок'] || '';
    prop_height.value = map['Высота'] || '';
    prop_weight.value = map['Вес'] || '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  productForm.onsubmit = async e => {
    e.preventDefault();

    const props =
      `Срок=${prop_term.value};` +
      `Высота=${prop_height.value};` +
      `Вес=${prop_weight.value}`;

    const res = await fetch('/api/admin/add-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: SECRET,
        id: createSlug(title.value),
        title: title.value,
        category: category.value,
        price: price.value,
        tags: tags.value,
        description: description.value,
        images: '',
        stock: stock.checked ? 'TRUE' : 'FALSE',
        props
      })
    });

    if (res.ok) {
      alert('Сорт сохранён 🌱');
      productForm.reset();
      loadProducts();
    } else {
      alert('Ошибка сохранения');
    }
  };

  searchInput.oninput = e =>
    render(allProducts.filter(p =>
      p.title.toLowerCase().includes(e.target.value.toLowerCase())
    ));

  filterCategory.onchange = e =>
    render(allProducts.filter(p =>
      !e.target.value || p.category === e.target.value
    ));

  loadProducts();
})();
