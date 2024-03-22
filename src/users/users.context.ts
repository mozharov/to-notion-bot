import {User} from './entities/user.entity'
import {UsersService} from './users.service'

export interface UsersFlavor {
  user?: User | null
  usersService: UsersService
}
