bot-name = To Notion Bot

start = Привет!
    <b>Я бот для моментальной отправки любого контента из Telegram в <a href="https://notion.so">Notion</a>.</b>
    
    Для начала, давай выберем чат из которого я буду отправлять контент в Notion.

select-chat = *Это твои подключенные чаты*
    
    Добавь меня в группу или канал в качестве админа, чтобы чат появился в списке
    .private-chat = Текущий чат
    .add-group = Добавить чат

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
    .activate = Активировать
    .deactivate = Деактивировать
    .delete = Удалить
    .deleted = Чат "{$title}" удален
    .language = Язык: {$language -> 
        [ru] Русский
        *[other] English
    }
    .notion = {$database ->
        [null] Подключить базу данных Notion
        *[other] Изменить базу данных Notion
    }
    .back = Назад
    .watch-mode = Переключить режим отправки сообщений
    .silent-mode = Тихий режим: {$silentMode -> 
        [true] Включен
        *[other] Отключен
    }

chat-notion-settings = Выбери *Workspace* Notion для интеграции с {$type -> 
        [private] текущим чатом
        *[other] чатом "*{$title}*"
    }
    .back = Назад
    .pages = *Выбери базу данных Notion в которую я буду отправлять контент*

        Если ты не видишь в этом списке необходимую базу данных, то нажми на "<b>Добавить БД по ссылке</b>".
    .link-to-database = Добавить БД по ссылке
    .link = Отправь мне ссылку на базу данных Notion, которую хочешь прикрепить к чату. 
        Для получения ссылки используй кнопку со скриншота.
    .add-page = Добавить базу данных
    .linked-database = Добавить базу данных <b>{$database}</b> к чату?
    .link-invalid = Это не похоже на ссылку базы данных. 
        Если хочешь отменить текущее действие, используй команду /cancel.

max-chats-reached = *Ты достиг лимита по количеству подключенных чатов*
    Удали один из подключенных чатов, чтобы добавить новый

chat-blocked = *Чат "{$title}" более недоступен*
    Добавь меня в чат в качестве админа, чтобы он снова стал доступен

chat-unblocked = *Добавлен чат "{$title}"*
    Используй команду /chats, чтобы настроить его

unknown-callback-query = Устаревшая кнопка

workspaces = *Это твои Workspaces в Notion*

    Ты можешь добавить интеграцию с новым *Workspace* или обновить доступные базы данных в уже активных интеграциях
    .add = Добавить или обновить интеграцию

workspace-settings = Интеграция с <b>Workspace</b> в Notion

    <b>Название</b>: {$name}

    <b>Подключено чатов</b>: {$chats}

    <b>Статус</b>: {$status ->
        [active] 🟢 активна
       *[other] 🔴 проблема с подключением
    }
    .delete = Удалить
    .deleted = Интеграция с Workspace "{$name}" удалена
    .back = Назад

new-message = {$isUpdate -> 
        [false] <b>Создана <a href="{$url}">новая страница</a> в базе данных Notion</b>
       *[other] <b>Обновлена <a href="{$url}">страница</a> в базе данных Notion</b>
    }

help = <b>Как использовать бота</b>

    <b>1.</b> Добавь бота в группу или канал в качестве админа
    <b>2.</b> Используй команду /chats и выбери нужный чат, чтобы открыть его настройки
    <b>3.</b> Подключи базу данных Notion в настройках чата
    <b>4.</b> Нажми "{chat-settings.activate}" в настройках чата
    <b>5.</b> Отправь сообщение в настроенный чат, чтобы отправить содержимое сообщения в Notion

    <b>Наш чат по боту:</b> @to_notion_chat
    <b>Автор бота:</b> @vmozharov

    Если у тебя возникли вопросы или проблемы, то напиши их в наш чат или напрямую автору бота.

error-not-found = ⚠️ Не удалось найти необходимую базу данных или страницу Notion

    Попробуйте обновить интеграцию с Notion в настройках чата или через команду /workspaces

error-too-big-file = ⚠️ Размер файла превышает максимально допустимый размер

    Попробуй отправить файл меньшего размера

new-file = Какой-то файл

new-user = 🎁 Лови <b>{$months -> 
    [1] 1 месяц
    *[2] {$months} месяца
    } премиум подписки бесплатно</b>, чтобы ты мог полноценно опробовать мои возможности
    .status = Посмотреть статус подписки

subscription = <b>Статус твоей подписки:</b> {$status -> 
        [true] 🟢 Активна
       *[other] 🔴 Не активна
    }

    <b>Твои возможности:</b> 
    {$status -> 
        [true] 
            • неограниченное количество любых подключенных чатов
            • неограниченное количество отправок сообщений в Notion

            <b>Дата окончания подписки:</b> {DATETIME($endsAt)} <i>(осталось {$daysLeft} дней)</i>

            <i>После даты окончания подписки вернется ограничение на 30 отправленных сообщений в месяц</i>
        *[other] 
            • {$messagesLimit} отправленных сообщений в месяц

            ⚠️ Оформи подписку, чтобы снять лимиты на количество отправленных сообщений.
    }
    .renew = Продлить подписку
    .subscribe = Оформить подписку

plan = <b>Выбери тариф для оформления подписки</b>
    .months = {$months -> 
        [12] ${$price} / год
        [1] ${$price} / месяц
        *[other] ${$price} / {$months} мес.
    }
    .pay-wallet = 👛 Оплатить через Wallet
    .pay-card = 🇷🇺 Оплатить картой РФ
    .pay-crypto = 💱 Оплатить через Crypto Bot
    .description = {$months -> 
        [12] Полный доступ к {bot-name} на 12 месяцев
        [1] Полный доступ к {bot-name} на 1 месяц
        *[other] Полный доступ к {bot-name} на {$months} мес.
    }
    .pay = <b>Выбери способ оплаты</b>
    
chat-is-not-active = ⚠️ <b>Чат не активирован</b>
    
    Активируй текущий чат с помощью команды /chats, чтобы отправлять сообщения в Notion

notion-is-not-active = ⚠️ <b>База данных Notion не подключена</b>
    
    {$type ->
        [private] Подключи базу данных Notion к чату с помощью команды /chats
        *[other] Подключи базу данных Notion к чату с помощью команды /chats в <a href="https://t.me/{$botUsername}">личном чате с ботом</a>
    }

broadcast = <b>Создание новой рассылки</b>

    Выбери пользователям с каким языком отправить сообщение
    .wait-message = <b>{$languageCode ->
        [ru] Ожидание сообщения на русском
        *[other] Ожидание сообщения на английском
        }</b>

        Отправь сообщение которое будет отправлено всем пользователям с выбранным языком
    .check = <b>Проверь сообщение рассылки выше и подтверди отправку</b>
    .send = Отправить
    .cancel = Отменить
    .all-languages = Все языки
    .cancelled = <b>Рассылка отменена</b>
    .sending = <b>Рассылка начата</b>
        Отслеживать статус рассылки можно через команду /broadcast_status
        
        ⚠️ Не удаляй сообщение выше до окончания рассылки, иначе рассылка не будет выполнена
    .status = <b>Статус рассылки</b>
        Сообщений в очереди: {$count}

set-price = <b>Установка цены подписки на {$period ->
        [month] 1 месяц
        *[year] 1 год
    }</b>

    Отправь новую цену в <b>{$currency -> 
        [RUB] копейках
        *[other] центах
    }</b>
    .cancel = Отменить установку цены
    .int-invalid = ⚠️ Неверное значение
    .success = Цены установлены
    .cancelled = Установка цены отменена

referral = <b>Реферальная система</b>

    • Каждый новый пользователь запустивший бота по твоей ссылке получит 2 месяца подписки бесплатно.
    • Ты получаешь столько же месяцев бесплатной подписки, сколько оформят твои рефералы за все время.
    • Пользователь становится твоим рефералом когда впервые запускает бота по твоей реферальной ссылке.
    • Рефералом могут стать только те пользователи, которые впервые запустили бота (не зарегистрированы в системе).

    <b>Запусков бота по ссылке:</b> {$launchesCount}
    <b>Приведено рефералов:</b> {$newUsers}
    <b>Оформлено месяцев:</b> {$months}
    <b>Твоя реферальная ссылка:</b> https://t.me/{$bot}?start={$code}
    
promocode = <b>Промокод активирован</b>

    Твоя подписка продлена на {$days} дней
    .status = Посмотреть статус подписки
    .new = Пришли текст промокода не более 100 символов, без пробелов. Любой текст будет приведён к верхнему регистру.
    .generate = Сгенерировать случайный код
    .invalid = ⚠️ Слишком длинный код
    .invalid-days = ⚠️ Неверное количество дней
    .days = Введи количество дней, которые даст промокод
    .max-uses = Введи максимальное количество использований.
        0 = Без ограничений
    .ivalid-max-uses = ⚠️ Неверное количество использований
    .exists = Такой код уже существует
    .created = <b>Промокод создан</b>

        <b>Код:</b> <code>{$code}</code>
        <b>Максимальное количество использований:</b> {$maxUses}
        <b>Бесплатный дней:</b> {$freeDays}
    .cancel = Отменить создание промокода
    .canceled = Создание промокода отменено
    .generating = Генерация кода...
    .list = <b>Список промокодов</b>
    .deleted = Промокод <code>{$code}</code> удален

link-to-author = Автор

link-to-sender = Отправитель

pay-success = 🎉 <b>Платеж прошел успешно!</b>
    {$hasReceipt -> 
        [true] <b>Вот твой чек:</b> <a href="{$receiptURL}">ссылка</a>
        *[false] ⠀
    }
    Посмотреть статус подписки можно через команду /subscription

pay-failed = ⚠️ <b>Платеж не прошел!</b>

    Попробуйте повторить попытку оплаты через команду /subscription

subscription-expires = <b>Твоя подписка истекает завтра!</b>

    Продли подписку, чтобы не потерять доступ к функционалу
    .renew = Продлить подписку

limit-exceeded = <b>Количество отправленных сообщений превысило ежемесячный лимит</b>

    Необходимо продлить подписку, чтобы убрать лимиты и снова отправлять контент в Notion {$fromChat ->
        [true] ⠀
            
            ⚠️ <i>Это сообщение пришло потому что в одном из твоих чатов была попытка отправить контент сверх лимита</i>
        *[false] ⠀
    }
    .renew = Продлить подписку

about-author = Кстати, меня создал <a href="https://t.me/mozharov_channel">Владислав Можаров</a>, рекомендую подписаться на его <a href="https://t.me/mozharov_channel">Telegram канал</a>

notion-was-set = <b>Notion Workspace установлен</b>

    Теперь ты можешь подключить этот Workspace к любому из твоих чатов через команду /chats
    
    Используй команду /workspaces, чтобы просмотреть список созданных интеграций с Notion

canceled = <b>Действие отменено</b>