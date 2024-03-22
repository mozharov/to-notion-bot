import {ChatsService} from './chats.service'
import {Chat} from './entities/chat.entity'

export interface ChatsFlavor {
  chatEntity?: Chat | null
  chatsService: ChatsService
}
