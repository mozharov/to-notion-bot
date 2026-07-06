outdated-button = Outdated button
back = Back
delete = Delete
activate = Activate
deactivate = Deactivate
action-canceled = <b>Action canceled</b>
cancel = Cancel

start = 🚀 Turn Telegram into your second brain!

    ToNotionBot will help you:
    📝 Save any Telegram content to Notion in 1 click
    ✨ Keep formatting, files, voice messages
    🔄 Reply to messages to update existing Notion pages
    🎯 Work with @to_notion_robot mention or auto-save all
    📂 Connect different Notion DBs to different chats
    👥 Perfect for teams - unlimited group chats
    ⚡ Subscription from $5/month = all features unlocked

    Let's choose a chat from which I will send messages to Notion.

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

        If you don't see the required database in this list, click on <b>{chat-notion-settings.link-to-database}</b>.
    .link = Send me the link to the Notion database that you want to attach to the chat.
        To get the link, use the button from the screenshot.
    .add-page = Add the database
    .linked-database = Add the database <b>{$database}</b> to the chat?
    .link-invalid = This doesn't look like a database link. 

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

new-checklist = New checklist

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

    If you have any questions or suggestions for improving the bot, you can write them in our chat or to the bot author.

    <b>Use the /feedback command to send a message directly to the bot author.</b>

left-messages-limit-reached = ⚠️ <b>You have reached the limit of messages.</b>
    Buy a subscription to continue using the bot without any limits.

subscription = 🚀 <b>Subscription</b>
    The free version of the bot allows you to send up to 30 messages to Notion to evaluate its capabilities.

    <b>For unlimited use of the bot, choose a plan below.</b>

    <b>💯 Money back guarantee within 30 days.</b>
    If the bot does not meet your expectations, we will return the entire amount without any questions.
    Use the /refund command to get a refund.

    <b>🔸 Telegram Stars</b>
    ⭐️ 1 month — {$monthlyStars} (≈${$monthlyUsd})
    ⭐️ 1 year — {$yearlyStars} (≈${$yearlyUsd})
    ⭐️ Lifetime — {$lifetimeStars} (≈${$lifetimeUsd})

    <i>For an alternative payment method, please contact the bot author: @vmozharov.</i>
    .button = 🎁 Get subscription
    .telegram-stars-month = ⭐️ 1 month — {$stars}
    .telegram-stars-year = ⭐️ 1 year — {$stars}
    .telegram-stars-lifetime = ⭐️ Lifetime — {$stars}
    .title = {$plan ->
            [year] Yearly Subscription
            [lifetime] Lifetime Access
           *[other] Monthly Subscription
        }
    .description = {$plan ->
            [year] Unlimited access to the bot for 1 year without restrictions.
            [lifetime] Unlimited access to the bot forever without restrictions.
           *[other] Unlimited access to the bot for 1 month without restrictions.
        }
    .already-has = You already have unlimited access to the bot.
    .invoice-settled = <b>🎉 Payment successful.</b>
        Now you can use the bot without any restrictions.
    .expired = <b>🔴 Access to the bot has expired.</b>
        Buy a subscription to continue using the bot without restrictions.

refund = <b>💸 Cancel subscription and get a refund.</b>
    You will lose access to the bot, but you will get a refund.

    <b>Are you sure you want to cancel your subscription?</b>
    .telegram = <b>Your subscription has been canceled. Telegram Stars have been returned.</b>
    .do-it = Refund
    .not-available = <b>Refund is not available.</b>
        You don't have paid access to the bot or the refund period has expired.

promocode = <b>Promocode created.</b>
    Code: <code>{$code}</code>
    Days: <b>{$days}</b>
    Uses: <b>{$uses}</b>
    .already-exists = <b>Promocode already exists.</b>
    .removed = <b>Promocode removed.</b>
    .applied = <b>Promocode applied.</b>
        {$endsAt ->
            [null] You have lifetime access to the bot now.
                
                Enjoy!
            *[other] Your subscription ends at: <b>{$endsAt}</b>
            
                Enjoy the bot!
        }

feedback = 📨 <b>Send any message.</b>
    I will forward it to the bot author.
    .sent = <b>Message sent.</b>

contact = 
    .name = Name
    .phone = Phone

give = <b>You have given lifetime access to the bot to user {$user}.</b>

user-not-found = <b>User not found.</b>