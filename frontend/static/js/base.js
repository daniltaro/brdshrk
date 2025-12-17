document.addEventListener("DOMContentLoaded", () => {
    const API = 'http://localhost:8080';

    const addBtn = document.getElementById('addBtn');
    const todoInput = document.getElementById('todo-input');
    const deadlineInput = document.getElementById('deadline-input'); // Новый инпут
    const todoListEl = document.getElementById('todo-list');
    const statusMessage = document.getElementById('status');
    const logoutBtn = document.getElementById('logoutBtn');

    loadTodos();

    if (addBtn) addBtn.addEventListener("click", addTodos);
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    function clearCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }

    async function logout() {
        clearCookie("Authorization");
        window.location.href = "auth.html";
    }

    async function loadTodos() {
        try {
            const res = await fetch(`${API}/tasks`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!res.ok) throw new Error("Не удалось загрузить задачи");

            const todos = await res.json();
            // Сортируем: сначала невыполненные, потом по дате дедлайна
            todos.sort((a, b) => {
                if (a.is_done === b.is_done) {
                    // Если статус одинаковый, сортируем по дате (если есть)
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                }
                return a.is_done - b.is_done;
            });
            
            renderTodos(todos);

        } catch (err) {
            console.error(err);
            if (statusMessage) {
                statusMessage.textContent = err.message;
                statusMessage.style.color = 'red';
            }
        }
    }

    // Хелпер для красивой даты
    function formatDeadline(isoDate) {
        if (!isoDate) return null;
        
        const date = new Date(isoDate);
        const now = new Date();
        
        // Проверка на просрочку
        const isExpired = date < now;

        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const dateStr = date.toLocaleDateString('ru-RU', options);
        
        return { text: dateStr, isExpired };
    }

    function renderTodos(todos) {
        if (!todoListEl) return;
        todoListEl.innerHTML = '';

        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'swipe-item';

            // Подложка свайпа
            const bg = document.createElement('div');
            bg.className = 'swipe-bg';
            bg.innerHTML = `
                <div class="bg-left">Готово</div>
                <div class="bg-right">Удалить</div>
            `;

            const content = document.createElement('div');
            content.className = 'swipe-content';

            // --- Checkbox ---
            const checkboxWrapper = document.createElement('label');
            checkboxWrapper.className = 'checkbox-wrapper';

            const inputCheckbox = document.createElement('input');
            inputCheckbox.type = 'checkbox';
            inputCheckbox.checked = !!todo.is_done;

            const visualCheckbox = document.createElement('span');
            visualCheckbox.className = 'task-checkbox';
            if (todo.is_done) visualCheckbox.classList.add('checked');

            inputCheckbox.addEventListener('change', async () => {
                const newVal = inputCheckbox.checked;
                visualCheckbox.classList.toggle('checked', newVal);
                contentDiv.classList.toggle('completed', newVal); // Меняем класс на контейнере текста
                await updateStatus(todo.id, newVal);
            });

            checkboxWrapper.appendChild(inputCheckbox);
            checkboxWrapper.appendChild(visualCheckbox);

            // --- Text & Deadline Wrapper ---
            const contentDiv = document.createElement('div');
            contentDiv.className = 'task-content';
            if (todo.is_done) contentDiv.classList.add("completed");

            const text = document.createElement('div');
            text.textContent = todo.title;
            text.className = 'task-text';

            contentDiv.appendChild(text);

            // Отображение дедлайна
            if (todo.deadline) {
                const deadlineInfo = formatDeadline(todo.deadline);
                const deadlineSpan = document.createElement('div');
                deadlineSpan.className = 'task-deadline';
                deadlineSpan.textContent = `⏰ ${deadlineInfo.text}`;
                
                // Если просрочено и задача не выполнена — красим в красный
                if (deadlineInfo.isExpired && !todo.is_done) {
                    deadlineSpan.classList.add('expired');
                    deadlineSpan.textContent += " (Истек)";
                }
                contentDiv.appendChild(deadlineSpan);
            }

            // --- Delete Button ---
            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'delete-btn';
            delBtn.innerHTML = `
                <svg class="trash-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                    <path d="M10 11v6"></path>
                    <path d="M14 11v6"></path>
                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                </svg>
            `;

            delBtn.addEventListener('click', async () => {
                li.style.transition = 'opacity 0.2s, transform 0.2s';
                li.style.opacity = '0';
                li.style.transform = 'translateX(-10px)';
                try {
                    await deleteTodo(todo.id);
                    setTimeout(() => li.remove(), 200);
                } catch (err) {
                    li.style.opacity = '1';
                    li.style.transform = 'none';
                    alert("Ошибка удаления");
                }
            });

            // Сборка
            content.appendChild(checkboxWrapper);
            content.appendChild(contentDiv); // Вместо просто text добавляем блок с текстом и датой
            content.appendChild(delBtn);

            li.appendChild(bg);
            li.appendChild(content);
            todoListEl.appendChild(li);

            // --- Swipe Logic (Touch) ---
            let startX = 0;
            let currentX = 0;
            let dragging = false;

            content.addEventListener('touchstart', e => {
                if (e.target.closest('.delete-btn')) return;
                dragging = true;
                startX = e.touches[0].clientX;
                li.classList.add("active");
            });

            content.addEventListener('touchmove', e => {
                if (!dragging) return;
                currentX = e.touches[0].clientX - startX;
                if (currentX > 80) currentX = 80;
                if (currentX < -80) currentX = -80;
                content.style.transform = `translateX(${currentX}px)`;
            });

            content.addEventListener('touchend', async () => {
                dragging = false;
                li.classList.remove("active");

                if (currentX >= 70) {
                    inputCheckbox.checked = !inputCheckbox.checked;
                    inputCheckbox.dispatchEvent(new Event('change'));
                }
                if (currentX <= -70) {
                    delBtn.click();
                }

                content.style.transform = `translateX(0px)`;
                currentX = 0;
            });
        });
    }

    async function addTodos() {
        const textVal = todoInput.value.trim();
        const dateVal = deadlineInput.value; // Получаем значение даты (строка YYYY-MM-DDTHH:MM)

        if (!textVal) return;
        if (!dateVal) return;

        let deadlineISO = null;
        if (dateVal) {
            // Преобразуем в ISO строку для Go (2023-10-10T12:00:00Z)
            deadlineISO = new Date(dateVal).toISOString();
        }

        try {
            const res = await fetch(`${API}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: textVal,
                    description: "",
                    is_done: false,
                    deadline: deadlineISO // Отправляем дату или null
                })
            });

            if (!res.ok) {
                const body = await res.json().catch(()=>({}));
                throw new Error(body.error || 'Ошибка сервера');
            }

            todoInput.value = '';
            deadlineInput.value = ''; // Очищаем дату
            loadTodos();

        } catch (err) {
            console.log(err);
            if (statusMessage) {
                statusMessage.textContent = err.message;
                statusMessage.style.color = 'red';
            }
        }
    }

    async function updateStatus(id, is_done) {
        try {
            await fetch(`${API}/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ is_done })
            });
            // Не перегружаем весь список, чтобы не сбивать анимацию
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteTodo(id) {
        const res = await fetch(`${API}/tasks/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!res.ok && res.status !== 204) {
            throw new Error('Ошибка удаления');
        }
    }
});