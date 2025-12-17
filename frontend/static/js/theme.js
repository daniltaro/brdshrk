document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("themeToggle");
    
    // 1. При загрузке проверяем сохраненную тему
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
        document.body.classList.add("dark");
    }

    // 2. Вешаем обработчик, если кнопка есть на странице
    if (toggle) {
        toggle.onclick = () => {
            document.body.classList.toggle("dark");
            
            if (document.body.classList.contains("dark")) {
                localStorage.setItem("theme", "dark");
            } else {
                localStorage.setItem("theme", "light");
            }
        };
    }
});

