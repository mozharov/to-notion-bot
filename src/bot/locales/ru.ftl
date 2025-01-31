outdated-button = Устаревшая кнопка
back = Назад
delete = Удалить
activate = Активировать
deactivate = Деактивировать
action-canceled = <b>Действие отменено</b>
cancel = Отмена

start = Привет!
    <b>Я бот для моментальной отправки любого контента из Telegram в <a href="https://notion.so">Notion</a>.</b>
    Давай выберем чат из которого я буду отправлять сообщения в Notion.

chats = <b>Это твои подключённые чаты.</b>
    Добавь меня в группу или канал, чтобы чат появился в списке.
    .private = Текущий чат
    .add = Добавить чат

chat-settings = {$type ->
        [private] <b>Настройка текущего чата</b>
        *[other] <b>Настройка чата</b>
            
            <b>Название</b>: {$title}

            <b>Тип</b>: {$type -> 
                [private] Приватный
                [channel] Канал
                *[other] Групповой

                <b>Режим отправки сообщений</b>: {$onlyMentionMode ->
                    [true] Только сообщения с упоминанием бота (@{$botUsername})
                    *[other] Все сообщения
                }
            }
    }

    <b>Тихий режим:</b> {$silentMode -> 
        [true] Ставить реакцию ⚡️ на сообщения
        *[other] Отвечать ссылкой на сохраненный контент
    }
    
    <b>Статус</b>: {$status ->
        [blocked] 🚫 Недоступен
            
            ⚠️  Добавь меня в чат в качестве админа, чтобы он снова стал доступен
        [active] 🟢 Активирован
       *[other] 🔴 Деактивирован
    }

    <b>База данных Notion</b>: {$database -> 
        [null] 🔴 Не подключена
        [inactive] 🔴 Проблема с подключением
            
            ⚠️  Попробуй обновить подключение к базе данных Notion
        *[other] 🟢 {$database}
    }
    .deleted = Чат "{$title}" удален
    .language = Язык: {$language -> 
        [ru] Русский
        *[other] English
    }
    .notion = {$database ->
        [null] Подключить базу данных Notion
        *[other] Изменить базу данных Notion
    }
    .mention-mode = Переключить режим отправки сообщений
    .silent-mode = Тихий режим: {$silentMode -> 
        [true] Включен
        *[other] Отключен
    }

chat-blocked = <b>Чат "{$title}" более недоступен.</b>
    Добавь меня в чат, чтобы он снова стал доступен.

chat-unblocked = <b>Добавлен чат "{$title}".</b>
    Используй команду /chats, чтобы настроить его.

max-chats-reached = <b>Ты достиг лимита по количеству подключенных чатов.</b>
    Удали один из подключенных чатов, чтобы добавить новый.

chat-notion-settings = Выбери <b>Workspace</b> Notion для интеграции с {$type -> 
        [private] текущим чатом.
        *[other] чатом "<b>{$title}</b>".
    }
    .link-to-database = Добавить БД по ссылке
    .pages = <b>Выбери базу данных Notion в которую я буду отправлять контент.</b>

        Если ты не видишь в этом списке необходимую базу данных, то нажми на <b>{chat-notion-settings.link-to-database}</b>.
    .link = Отправь мне ссылку на базу данных Notion, которую хочешь прикрепить к чату. 
        Для получения ссылки используй кнопку со скриншота.
    .add-page = Добавить базу данных
    .linked-database = Добавить базу данных <b>{$database}</b> к чату?
    .link-invalid = Это не похоже на ссылку базы данных. 

workspaces = <b>Это твои Workspaces в Notion.</b>
    Ты можешь добавить интеграцию с новым <b>Workspace</b> или обновить доступные базы данных в уже активных интеграциях.
    .add = Добавить или обновить интеграцию

error = 
    .unknown = <b>⚠️ Произошла неизвестная ошибка.</b>
    .not-found-database = <b>⚠️ Не удалось найти необходимую базу данных или страницу в Notion.</b>
        Попробуй обновить интеграцию с Notion используя команду /workspaces.
    .too-big-file = <b>⚠️ Размер файла превышает максимально допустимый размер в 20 МБ.</b>
        Попробуй отправить файл меньшего размера.

workspace-settings = Интеграция с <b>Workspace</b> в Notion.

    <b>Название</b>: {$name}

    <b>Подключено чатов</b>: {$chats}

    <b>Статус</b>: {$status ->
        [active] 🟢 активна
       *[other] 🔴 проблема с подключением
    }
    .deleted = Интеграция с Workspace "{$name}" удалена

chat-is-not-active = ⚠️ <b>Чат не активирован.</b>
    Активируй текущий чат с помощью команды /chats, чтобы отправлять сообщения в Notion.

notion-is-not-active = ⚠️ <b>База данных Notion не подключена.</b>
    {$type ->
        [private] Подключи базу данных Notion к чату с помощью команды /chats.
        *[other] Подключи базу данных Notion к чату с помощью команды /chats в <a href="https://t.me/{$botUsername}">личном чате с ботом</a>.
    }

new-file = Какой-то файл

new-message = {$isUpdate -> 
        [false] <b>Создана <a href="{$url}">новая страница</a> в базе данных Notion.</b>
       *[other] <b>Обновлена <a href="{$url}">страница</a> в базе данных Notion.</b>
    }

notion-was-set = <b>Notion Workspace установлен.</b>    
    Теперь ты можешь подключить этот Workspace к любому из твоих чатов через команду /chats.
    Используй команду /workspaces, чтобы просмотреть список созданных интеграций с Notion.

link-to-author = Автор

help = <b>Как использовать бота:</b>
    <b>1.</b> Добавь бота в группу или канал.
    <b>2.</b> Используй команду /chats и выбери чат, чтобы открыть его настройки.
    <b>3.</b> Подключи базу данных Notion в настройках чата.
    <b>4.</b> Нажми "{activate}" в настройках чата.
    <b>5.</b> Отправь сообщение в выбранный чат, чтобы отправить его содержимое в Notion.

    <b>Наш чат:</b> @to_notion_chat
    <b>Автор:</b> @vmozharov

    To Notion Bot имеет <a href="https://github.com/mozharov/to-notion-bot">открытый исходный код</a>.

    Если у тебя есть вопросы или проблемы, можешь написать их в наш чат или напрямую автору бота.

left-messages-limit-reached = ⚠️ <b>Ты достиг лимита сообщений.</b>
    Купи подписку, чтобы продолжить использовать бот без ограничений.
    .button = 🎁 Купить пожизненную подписку
