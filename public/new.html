<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Админка: Томаты</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 font-sans">
<div id="app" class="flex h-screen overflow-hidden">

  <aside class="w-1/3 bg-white border-r flex flex-col shadow-inner">
    <div class="p-4 border-b bg-gray-50">
      <input v-model="search" placeholder="🔍 Поиск..." class="w-full p-2 border rounded-lg">
    </div>
    <div class="flex-1 overflow-y-auto p-2">
      <div v-for="p in filtered" :key="p.id" 
           class="p-3 mb-2 border rounded-xl flex items-center justify-between hover:bg-red-50 transition-colors">
        <span class="font-bold truncate text-sm">{{ p.title }}</span>
        <div class="flex gap-2">
          <button @click="edit(p)" class="text-blue-500 text-xs uppercase font-bold">Edit</button>
          <button @click="remove(p.id)" class="text-red-500 text-xs uppercase font-bold">Del</button>
        </div>
      </div>
    </div>
  </aside>

  <main class="flex-1 p-10 overflow-y-auto">
    <div class="max-w-md mx-auto bg-white p-8 rounded-[2.5rem] shadow-2xl">
      <h2 class="text-2xl font-black mb-6 text-gray-700">{{ editId ? '✏️ Изменить' : '➕ Добавить сорт' }}</h2>
      
      <div class="space-y-4">
        <input v-model="form.title" placeholder="Название сорта" class="w-full p-4 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-400">
        
        <select v-model="form.category" class="w-full p-4 bg-gray-100 rounded-2xl outline-none">
          <option value="Dwarf">Гном (Dwarf)</option>
          <option value="Det">Низкий (Det)</option>
          <option value="Indet">Высокий (Indet)</option>
        </select>

        <div class="border-2 border-dashed rounded-2xl p-4 text-center bg-gray-50 relative h-40 overflow-hidden">
          <input type="file" @change="pickImage" class="absolute inset-0 opacity-0 cursor-pointer">
          <img v-if="preview" :src="preview" class="absolute inset-0 w-full h-full object-cover">
          <div v-else class="text-gray-400 text-sm mt-12">Нажмите для выбора фото</div>
        </div>

        <button @click="save" 
                class="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg active:scale-95 transition-all">
          {{ editId ? 'ОБНОВИТЬ' : 'СОХРАНИТЬ' }}
        </button>
        <button v-if="editId" @click="cancel" class="w-full text-gray-400 font-bold text-xs uppercase py-2">Отмена</button>
      </div>
    </div>
  </aside>
</div>

<script>
const { createApp } = Vue;
const PASS = 'khvalla74';

createApp({
  data() {
    return {
      products: [], search: '', editId: null,
      preview: '', imageBase64: '',
      form: { title: '', category: 'Dwarf' }
    };
  },
  computed: {
    filtered() {
      return this.products.filter(p => p.title.toLowerCase().includes(this.search.toLowerCase()));
    }
  },
  methods: {
    async load() {
      const r = await fetch('/api/admin/get-products');
      this.products = await r.json();
    },
    edit(p) {
      this.editId = p.id;
      this.form = { ...p };
      this.preview = p.images;
    },
    cancel() {
      this.editId = null;
      this.form = { title: '', category: 'Dwarf' };
      this.preview = ''; this.imageBase64 = '';
    },
    pickImage(e) {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = ev => { this.preview = ev.target.result; this.imageBase64 = ev.target.result; };
      r.readAsDataURL(f);
    },
    // Ключевой метод: Мгновенный UI без ожидания
    async save() {
      if (!this.form.title) return;

      const currentId = this.editId || 't' + Date.now();
      const currentData = { id: currentId, title: this.form.title, category: this.form.category, images: this.preview };

      // 1. МГНОВЕННОЕ ОБНОВЛЕНИЕ ЭКРАНА
      if (this.editId) {
        const i = this.products.findIndex(p => p.id === currentId);
        this.products[i] = currentData;
      } else {
        this.products.unshift(currentData);
      }

      // 2. Очистка формы (жена может вводить следующий)
      const dataToShip = { ...currentData, imageBase64: this.imageBase64, password: PASS };
      this.cancel();

      // 3. ФОНОВАЯ ОТПРАВКА (ничего не ждем!)
      this.shipToServer(dataToShip);
    },

    async shipToServer(data) {
      try {
        let finalImg = data.images;
        if (data.imageBase64) {
          const up = await fetch('/api/admin/upload', {
            method: 'POST',
            body: JSON.stringify({ filename: `img_${Date.now()}.jpg`, base64: data.imageBase64 })
          });
          finalImg = (await up.json()).url;
        }

        await fetch('/api/admin/add-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, images: finalImg })
        });
        console.log("Synced with Google Sheets");
      } catch (e) {
        console.error("Sync Error:", e);
      }
    },

    async remove(id) {
      if (!confirm('Удалить?')) return;
      this.products = this.products.filter(p => p.id !== id);
      fetch('/api/admin/delete-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: PASS })
      });
    }
  },
  mounted() { this.load(); }
}).mount('#app');
</script>
</body>
</html>
