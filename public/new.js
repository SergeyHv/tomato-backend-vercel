(function () {
  const SECRET = 'khvalla74';
  const ACCESS_KEY = 'tomato_admin_access';
  let allProducts = [];

  if (!sessionStorage.getItem(ACCESS_KEY)) {
    const pass = prompt('🔐 Введите пароль');
    if (pass !== SECRET) {
      document.body.innerHTML = '<h1 style="color:white;background:black;height:100vh;display:flex;align-items:center;justify-content:center">Доступ запрещён</h1>';
      return;
    }
    sessionStorage.setItem(ACCESS_KEY, '1');
  }

  const createSlug = (t) =>
    t.toLowerCase()
      .replace(/а/g,'a').replace(/б/g,'b').replace(/в/g,'v')
      .replace(/г/g,'g').replace(/д/g,'d').replace(/е/g,'e')
      .replace(/ё/g,'yo').replace(/ж/g,'zh').replace(/з/g,'z')
      .replace(/и/g,'i').replace(/й/g,'j').replace(/к/g,'k')
      .replace(/л/g,'l').replace(/м/g,'m').replace(/н/g,'n')
      .replace(/о/g,'o').replace(/п/g,'p').replace(/р/g,'r')
      .replace(/с/g,'s').replace(/т/g,'t').replace(/у/g,'u')
      .replace(/ф/g,'f').replace(/х/g,'h').replace(/ц/g,'c')
      .replace(/ч/g,'ch').replace(/ш/g,'sh').replace(/щ/g,'shh')
      .replace(/ы/g,'y').replace(/э/g,'e').replace(/ю/g,'yu')
      .replace(/я/g,'ya').replace(/ /g,'-')
      .replace(/[^a-z0-9-]/g,'');

  async function loadProducts() {
    const res = await fetch('/api/admin/get-products');
    allProducts = await res.json();
    renderProducts(allProducts);
  }

  function renderProducts(list) {
    productList.innerHTML = list.map(p => `
      <div class="p-2 border mb-2 flex justify-between">
        <b>${p.title}</b>
        <button onclick="editProduct('${p.id}')">Редакт</button>
      </div>
    `).join('');
  }

  window.editProduct = (id) => {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    title.value = p.title;
    category.value = p.category;
    price.value = p.price;
    description.value = p.description;
    tags.value = p.tags;
  };

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const props = `Срок=${prop_term.value};Высота=${prop_height.value};Вес=${prop_weight.value}`;

    const res = await fetch('/api/admin/add-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: SECRET,
        id: createSlug(title.value),
        title: title.value,
        category: category.value,
        price: price.value,
        description: description.value,
        tags: tags.value,
        images: '',
        props
      })
    });

    if (res.ok) {
      alert('Сохранено');
      productForm.reset();
      loadProducts();
    } else {
      alert('Ошибка');
    }
  });

  searchInput.addEventListener('input', e => {
    renderProducts(allProducts.filter(p => p.title.toLowerCase().includes(e.target.value.toLowerCase())));
  });

  loadProducts();
})();
