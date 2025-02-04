outdated-button = Outdated button
back = Back
delete = Delete
activate = Activate
deactivate = Deactivate
action-canceled = <b>Action canceled</b>
cancel = Cancel

start = Hello!
    <b>I'm a bot for instant content transfer from Telegram to <a href="https://www.notion.so">Notion</a>.</b>
    Let's select a chat where I will send messages to Notion.

chats = <b>These are your connected chats.</b>
    Add me to a group or channel so the chat will appear in the list.
    .private = Current chat
    .add = Add chat

chat-settings = {$type ->
        [private] <b>Current chat settings</b>
        *[other] <b>Chat settings</b>
            
            <b>Name</b>: {$title}

            <b>Type</b>: {$type -> 
                [private] Private
                [channel] Channel
                *[other] Group

                <b>Message sending mode</b>: {$onlyMentionMode ->
                    [true] Only messages with a mention to the bot (@{$botUsername})
                    *[other] All messages
                }
            }
    }

    <b>Silent mode:</b> {$silentMode -> 
        [true] Set reaction ⚡️ to messages
        *[other] Answer with a link to the saved content
    }
    
    <b>Status</b>: {$status ->
        [blocked] 🚫 Unavailable
            
            ⚠️  Add me to a chat as an admin so it becomes available again
        [active] 🟢 Activated
       *[other] 🔴 Deactivated
    }
    
    <b>Notion Database</b>: {$database -> 
        [null] 🔴 Not connected
        [inactive] 🔴 Connection problem
            
            ⚠️  Try to update the Notion integration with the command /workspaces
        *[other] 🟢 {$database}
    }
    .deleted = Chat "{$title}" deleted
    .language = Language: {$language -> 
        [ru] Russian
        *[other] English
    }
    .notion = {$database ->
        [null] Connect Notion database
        *[other] Change Notion database
    }
    .mention-mode = Toggle message sending mode
    .silent-mode = Silent mode: {$silentMode -> 
        [true] Enabled
        *[other] Disabled
    }

chat-blocked = <b>The chat "{$title}" is no longer available.</b>
    Add me to a chat so it becomes available again.

chat-unblocked = <b>The chat "{$title}" has been added.</b>
    Use the command /chats to configure it.

max-chats-reached = <b>You have reached the limit of connected chats.</b>
    Delete one of the connected chats to add a new one.

chat-notion-settings = Select a <b>Workspace</b> in Notion for integration with {$type -> 
        [private] current chat.
        *[other] chat "<b>{$title}</b>".
    }
    .link-to-database = Add Database by Link
    .pages = <b>Select a Notion database where I will send the content.</b>

        If you don’t see the required database in this list, click on <b>{chat-notion-settings.link-to-database}</b>.
    .link = Send me the link to the Notion database that you want to attach to the chat.
        To get the link, use the button from the screenshot.
    .add-page = Add the database
    .linked-database = Add the database <b>{$database}</b> to the chat?
    .link-invalid = This doesn’t look like a database link. 

workspaces = <b>These are your Workspaces in Notion.</b>
    You can add a new integration with a <b>Workspace</b> or update the available databases in already active integrations.
    .add = Add or update integration

error = 
    .unknown = <b>⚠️ An unknown error occurred.</b>
    .not-found-database = <b>⚠️ Failed to find the necessary Notion database or page.</b>
        Try to update the Notion integration using /workspaces.
    .too-big-file = <b>⚠️ The file size exceeds the maximum allowed size of 20 MB.</b>
        Try to send a smaller file.

workspace-settings = Integration with a <b>Workspace</b> in Notion.

    <b>Name</b>: {$name}

    <b>Connected chats</b>: {$chats}

    <b>Status</b>: {$status ->
        [active] 🟢 Active
       *[other] 🔴 Connection problem
    }
    .deleted = Workspace integration "{$name}" deleted

chat-is-not-active = ⚠️ <b>Chat is not activated.</b>
    Activate the current chat using the /chats command to send messages to Notion.

notion-is-not-active = ⚠️ <b>Notion database is not connected.</b>
    {$type ->
        [private] Connect a Notion database to this chat using the /chats command.
        *[other] Connect a Notion database to this chat using the /chats command in the <a href="https://t.me/{$botUsername}">private chat with the bot</a>.
    }

new-file = Some file

new-message = {$isUpdate -> 
        [false] <b>A new page <a href="{$url}">has been created</a> in Notion database.</b>
       *[other] <b>The page <a href="{$url}">has been updated</a> in Notion database.</b>
    }

notion-was-set = <b>Notion Workspace is installed.</b>
    Now you can connect this Workspace to any of your chats using the /chats command.
    Use the /workspaces command to view the list of created Notion integrations.

link-to-author = Author

help = <b>How to use the bot:</b>
    <b>1.</b> Add the bot to a group or channel.
    <b>2.</b> Use the /chats command and select a chat to open its settings.
    <b>3.</b> Connect the Notion database in the chat settings.
    <b>4.</b> Press "{activate}" in the chat settings.
    <b>5.</b> Send a message to the selected chat to send its content to Notion.

    <b>Our chat:</b> @to_notion_chat
    <b>Author:</b> @vmozharov

    To Notion Bot is <a href="https://github.com/mozharov/to-notion-bot">Open Source</a>.

    If you have any questions or problems, you can write them in our chat or directly to the bot author.

left-messages-limit-reached = ⚠️ <b>You have reached the limit of messages.</b>
    Buy lifetime access to continue using the bot without any limits.

subscription = 🚀 <b>Lifetime Access</b>
    The free version of the bot allows you to send up to 30 messages to Notion to evaluate its capabilities.

    <b>For unlimited use of the bot, lifetime access is available — you pay only once and use it forever.</b>

    <b>💯 Money back guarantee within 30 days.</b>
    If the bot does not meet your expectations, we will return the entire amount without any questions.

    <b>Choose a convenient payment method:</b>
    <b>🔸 Bitcoin</b>
    ₿ {$btcPrice} (≈${$btcUsd})

    <b>🔸 Telegram Stars</b>
    ⭐️ {$telegramStarsPrice} (≈${$telegramStarsUsd})

    <b>Note that by choosing Bitcoin payment, you pay in 2 times less!</b>
    .button = 🎁 Get lifetime access
    .bitcoin = ₿ Bitcoin
    .telegram-stars = ⭐️ Telegram Stars
    .title = Lifetime Access
    .description = Unlimited access to the bot without restrictions.
    .already-has = You already have lifetime access to the bot.
    .invoice-settled = <b>🎉 Payment successful.</b>
        Now you can use the bot without any restrictions.
    .invoice-processing = <b>⏳ Payment is being processed.</b>
        It takes some time to confirm the payment.

        <b>To avoid making you wait, I'm giving you temporary access to the bot right now.</b>
        After successful payment confirmation, you will receive lifetime access.
    .expired = <b>🔴 Access to the bot has expired.</b>
        Buy lifetime access to continue using the bot without restrictions.
