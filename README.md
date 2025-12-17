# Cамый красивый ToDo manager в КИТе

## HOW to RUN 
back
``` bash
## Run
make up ## 	docker compose up --build

# API Endpoint : http://127.0.0.1:8080

## if you want to run tests
make tests ## 	go test ./internal/middleware -v 
           ##   go test ./internal/handler -v

## if you want to remove the containers: 
make down ## docker compose down -v
```

front
```bash
python3 -m http.server 8000
```

тыкаем по этой ссылке  
|   |   |   |     
v   v   v      

http://localhost:8000/frontend/templates/register.html

## Backend 
Эту директорию я [написал](https://github.com/daniltaro/ToDo-API) еще давно на Golang. 
>Можно было добавить ее в репозиторий как submodule, но тогда при клонировании придется в ручную добавлять .env, что мне лень

Там у нас находится вся бизнес логика, интеграция с БД (PostgreSQL) и  документация (API контракт) конкретно серверной части. 

## Изначально Frontend
  Директория была написана полностью [HELLARTом](https://github.com/hellart1) 
  НО чтобы поступить честно и благородно я попросил НЕЙРОСЕТЬ (тоже заглавными буквами), чтобы она  написала по большей части (по большей = 99%) этой директории. 
>PS (ушло примерно 2 дня)

## Вся коммуникация 
front и back частей происходит через REST метод 
Визуальная часть ориентировалась на IOS 18 и IOS 26

## Features 

- Добавление задачи | POST запрос
- Создание пользователя | POST запрос
- Вход | POST запрос 
- Удаление задачи | DELETE запрос
- Изменение статуса задачи | PATCH запрос 
- Просмотр задач | GET запрос 
- JWT авторизация | пароли хранятся в хэше в отдельной БД 
- Проверка авторизации в мидлваре 

>PS были прописаны тесты серверной части (а точнее основного функционала). [ПОЛНАЯ ДОКУМЕНТАЦИЯ](https://github.com/daniltaro/ToDo-API)



