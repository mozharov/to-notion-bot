import {config} from '../../../config.js'
import type {User} from '../../../models/users.js'

export function buildNotionAuthorizeURI(userId: User['id']): string {
  const clientId = config.NOTION_CLIENT_ID
  const redirectUri = `http${config.NODE_ENV === 'development' ? '' : 's'}://${config.HOST}/notion`
  return `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${redirectUri}&state=${userId}`
}
