import {SessionFlavor as GrammySessionFlavor} from 'grammy'
import {SessionService} from './session.service'

export interface SessionData {}

export type SessionFlavor = GrammySessionFlavor<SessionData> & {sessionService: SessionService}
