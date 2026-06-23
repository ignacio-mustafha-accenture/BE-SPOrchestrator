import type { AgentSession } from '../entities/AgentSession';

export interface SessionListItem {
  id: string;
  title: string;
  category: string;
  status: 'open' | 'closed' | 'draft';
  date: string;
}

export const SESSION_STORE = 'SESSION_STORE';

export interface ISessionStore {
  create(lang: 'es' | 'en'): AgentSession;
  findById(sessionId: string): AgentSession | null;
  save(session: AgentSession): void;
  listSessions(): SessionListItem[];
}
