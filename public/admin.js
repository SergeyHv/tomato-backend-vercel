<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Панель управления - Томаты</title>
    <link rel="stylesheet" href="catalog.css">
</head>
<body>
    <div class="admin-container">
        <h1>Список сортов</h1>
        <a href="new.html" class="btn-add">➕ Добавить новый сорт</a>
        <table id="productsTable">
            <thead>
                <tr>
                    <th>Название</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>

    <script>
        async function loadProducts() {
            const res = await fetch('/api/admin/products');
            const products = await res.json();
            const tbody = document.querySelector('#productsTable tbody');
            tbody.innerHTML = products.map(p => `
                <tr>
                    <td>${p.name}</td>
                    <td>
                        <button onclick="deleteItem(${p.id})" class="btn-del">Удалить</button>
                    </td>
                </tr>
            `).join('');
        }

        async function deleteItem(id) {
            if(confirm('Удалить этот сорт?')) {
                await fetch(`/api/admin/delete-product?id=${id}`);
                loadProducts();
            }
        }
        loadProducts();
    </script>
</body>
</html>
