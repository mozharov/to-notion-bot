import type {State} from '../../declarations/bot.js'
import {deleteSession, getSession, setSessionState} from '../../models/sessions.js'

export async function setState(tgUserId: number, state: State | null) {
  if (state === null) {
    await deleteSession(tgUserId.toString())
  } else {
    await setSessionState(tgUserId.toString(), JSON.stringify(state))
  }
}

export async function getState(tgUserId: number) {
  const session = await getSession(tgUserId.toString())
  return session ? (JSON.parse(session.state) as State) : null
}

export async function clearState(tgUserId: number) {
  await setState(tgUserId, null)
}
