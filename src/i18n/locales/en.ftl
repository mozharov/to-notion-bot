bot-name = To Notion Bot

start = Hello!
    <b>I'm a bot for instant content transfer from Telegram to Notion.</b>
    
    Let's select a chat where I will send the content to Notion.

select-chat = *These are your connected chats*
    
    Add me to a group or channel as an admin so the chat will appear in the list
    .private-chat = Current chat
    .add-group = Add chat


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
    .activate = Activate
    .deactivate = Deactivate
    .delete = Delete
    .deleted = Chat "{$title}" deleted
    .language = Language: {$language -> 
        [ru] Russian
        *[other] English
    }
    .notion = {$database ->
        [null] Connect Notion database
        *[other] Change Notion database
    }
    .back = Back
    .watch-mode = Toggle message sending mode
    .silent-mode = Silent mode: {$silentMode -> 
        [true] Enabled
        *[other] Disabled
    }

chat-notion-settings = Select a *Workspace* in Notion for integration with {$type -> 
        [private] current chat
        *[other] chat "*{$title}"
    }
    .add = Add new Workspace
    .back = Back
    .pages = *Select a Notion database where I will send the content*

        If you do not see the necessary database in this list, try to update the Notion integration with the command /workspaces

max-chats-reached = *You have reached the limit of connected chats*
    Delete one of the connected chats to add a new one

chat-blocked = *The chat "{$title}" is no longer available*
    Add me to a chat as an admin so it becomes available again

chat-unblocked = *The chat "{$title}" has been added*
    Use the command /chats to configure it

unknown-callback-query = Outdated button

workspaces = *These are your Workspaces in Notion*

    You can add integration with a new *Workspace* or update available databases in already active integrations
    .add = Add or update integration

workspace-settings = Integration with a *Workspace* in Notion

    <b>Name</b>: {$name}

    <b>Connected chats</b>: {$chats}

    <b>Status</b>: {$status ->
        [active] 🟢 Active
       *[other] 🔴 Connection problem
    }
    .delete = Delete
    .deleted = Workspace integration "{$name}" deleted
    .back = Back

new-message = {$isUpdate -> 
        [false] <b>A new page <a href="{$url}">has been created</a> in Notion database</b>
       *[other] <b>The page <a href="{$url}">has been updated</a> in Notion database</b>
    }

help = <b>How to use the bot</b>

    <b>1.</b> Add the bot to a group or channel as an admin
    <b>2.</b> Use the /chats command and select a chat to open its settings
    <b>3.</b> Connect the Notion database in the chat settings
    <b>4.</b> Press "{chat-settings.activate}" in the chat settings
    <b>5.</b> Send a message to the selected chat to send its content to Notion

    <b>Chat bot:</b> @to_notion_chat
    <b>Author:</b> @vmozharov

    If you have any questions or problems, you can write them in our chat or directly to the bot author.

error-not-found = ⚠️ Failed to find the necessary Notion database or page

    Try to update the Notion integration with the command /workspaces

error-too-big-file = ⚠️ The file size exceeds the maximum allowed size

    Try to send a file of a smaller size

new-file = Some file

new-user = 🎁 By the way, I give you <b>{$months -> 
    [1] 1 month
    *[2] {$months} months
    } premium subscription for free</b>, to fully explore my capabilities
    .status = Check your subscription status

subscription = <b>Your subscription status:</b> {$status -> 
        [true] 🟢 Active
       *[other] 🔴 Not active
    }

    <b>Your capabilities:</b> 
    {$status -> 
        [true] 
            • unlimited number of connected chats
            • unlimited number of messages in Notion

            <b>Expiration date:</b> {DATETIME($endsAt)} <i>(remaining {$daysLeft} days)</i>
        *[other] 
            • {$messagesLimit} messages in Notion per month

            ⚠️ To remove message count limits, renew your subscription.
    }
    .renew = Renew subscription
    .subscribe = Subscribe

plan = <b>Choose a subscription plan</b>
    .months = {$months -> 
        [12] ${$price} / year
        [1] ${$price} / month
        *[other] ${$price} / {$months} months.
    }
    .pay-wallet = 👛 Pay with Wallet
    .pay-card = 🇷🇺 Pay with a Russian card
    .pay-crypto = 💱 Pay with Crypto Bot
    .description = {$months -> 
        [12] Full access to {bot-name} for 12 months
        [1] Full access to {bot-name} for 1 month
        *[other] Full access to {bot-name} for {$months} months.
    }
    .pay = <b>Choose a payment method</b>
    
broadcast = <b>Creating a new broadcast</b>

    Select the language for the users to send a message
    .wait-message = <b>Waiting for a message in {$languageCode ->
        [ru] Russian
        *[other] English
        }</b>

        Send the message that will be sent to all users with the selected language
    .check = <b>Check the broadcast message above and confirm sending</b>
    .send = Send
    .cancel = Cancel
    .all-languages = All languages
    .cancelled = <b>Broadcast cancelled</b>
    .sending = <b>Broadcast started</b>
         Track the broadcast status using the /broadcast_status command
        
        ⚠️ Do not delete the message above until the broadcast is finished, otherwise the broadcast will not be executed
    .status = <b>Broadcast status</b>
        Messages in queue: {$count}

referral = <b>Referral system</b>

    • Every new user launching the bot through your referral link will get 2 free months of subscription.
    • You will get as many free months of subscription as many of your referrals sign up in total.
    • A user becomes your referral when they launch the bot (not registered in the system) for the first time.
    • Referrals can only be those users who launch the bot for the first time.

    <b>Launching the bot through a link:</b> {$launchesCount}
    <b>Number of referrals brought:</b> {$newUsers}
    <b>Months granted:</b> {$months}
    <b>Your referral link:</b> https://t.me/{$bot}?start={$code}
    
promocode = <b>Promo code activated</b>

    Your subscription has been renewed for {$days} days
    .status = Check subscription status
    .new = Send promo code (no more than 100 characters, no spaces). Any text will be converted to uppercase.
    .generate = Generate random code
    .invalid = ⚠️ Invalid code length
    .invalid-days = ⚠️ Invalid number of days
    .days = Enter the number of days the promo code will grant
    .max-uses = Enter the maximum number of uses.
        0 = No limits
    .ivalid-max-uses = ⚠️ Invalid maximum number of uses
    .exists = Such a code already exists
    .created = <b>Promo code created</b>

        <b>Code:</b> <code>{$code}</code>
        <b>Maximum number of uses:</b> {$maxUses}
        <b>Free days:</b> {$freeDays}
    .cancel = Cancel promo code creation
    .canceled = Promo code creation canceled
    .generating = Generating code...
    .list = <b>List of promo codes</b>
    .deleted = Promo code <code>{$code}</code> deleted

link-to-original = Forwarded from Telegram

pay-success = 🎉 <b>Payment successful!</b>
    {$hasReceipt -> 
        [true] <b>Here's your receipt:</b> <a href="{$receiptURL}">link</a>
        *[false] ⠀
    }
    Check subscription status through the /subscription command

pay-failed = ⚠️ <b>Payment failed!</b>

    Try paying again using the /subscription command

subscription-expires = <b>Your subscription expires tomorrow!</b>

    Renew your subscription to keep access to functionality
    .renew = Renew subscription

limit-exceeded = <b>The number of sent messages has exceeded the monthly limit</b>

    You need to renew your subscription to remove limits and continue sending content to Notion {$fromChat ->
        [true] ⠀
            
            ⚠️ <i>This message was sent because one of your chats exceeded the limit</i>
        *[false] ⠀
    }
    .renew = Renew subscription

about-author = By the way, I was created by <a href="https://t.me/mozharovv">Vladislav Mozharov</a>, I recommend subscribing to his <a href="https://t.me/mozharovv">Telegram channel</a>

