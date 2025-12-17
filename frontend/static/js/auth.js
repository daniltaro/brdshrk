document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080/";

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Универсальная функция запросов
    async function api(path, opts = {}) {
        const res = await fetch(API_URL + path, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            ...opts
        });

        // Если ответ пустой (например, 204 No Content), не пытаемся парсить JSON
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(data.error || "Ошибка сервера");
        }
        return data;
    }

    // --- ЛОГИКА ВХОДА ---
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const email = formData.get("email");
            const password = formData.get("password");

            try {
                const res = await api("login", {
                    method: "POST",
                    body: JSON.stringify({ login: email, password })
                });

                if (res.token) {
                    document.cookie = `Authorization=Bearer ${res.token}; max-age=3600; path=/`;
                }
                
                window.location.href = "base.html";
            } catch (err) {
                // Ошибки оставляем, чтобы пользователь понимал, что пошло не так
                alert("Ошибка входа: " + err.message);
            }
        });
    }

    // --- ЛОГИКА РЕГИСТРАЦИИ ---
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(registerForm);
            const email = formData.get("email");
            const password = formData.get("password");

            try {
                await api("signup", {
                    method: "POST",
                    body: JSON.stringify({ login: email, password })
                });

                // УБРАНО: alert("Аккаунт успешно создан! Теперь войдите.");
                // Сразу перенаправляем на вход
                window.location.href = "auth.html";

            } catch (err) {
                // Ошибки оставляем
                alert("Ошибка регистрации: " + err.message);
            }
        });
    }
});