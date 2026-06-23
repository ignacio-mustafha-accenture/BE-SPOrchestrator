import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { AgentSession } from '../../domain/entities/AgentSession';
import type { ISessionStore, SessionListItem } from '../../domain/ports/ISessionStore';

const MOCK_SESSIONS: SessionListItem[] = [
  { id: 'rfp-2026-048', title: 'RFP-2026-048 · Logistics', category: 'Logistics', status: 'closed', date: 'Jun 10' },
  { id: 'rfp-2026-031', title: 'RFP-2026-031 · Cleaning', category: 'Facilities', status: 'open', date: 'Jun 5' },
  { id: 'rfp-2026-017', title: 'RFP-2026-017 · IT Services', category: 'Technology', status: 'closed', date: 'May 28' },
];

@Injectable()
export class InMemorySessionStore implements ISessionStore {
  private readonly store = new Map<string, AgentSession>();

  create(lang: 'es' | 'en'): AgentSession {
    const session: AgentSession = {
      id: randomUUID(),
      phase: 'detect',
      lang,
      rfpData: {},
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.store.set(session.id, session);
    return session;
  }

  findById(sessionId: string): AgentSession | null {
    return this.store.get(sessionId) ?? null;
  }

  save(session: AgentSession): void {
    session.updatedAt = new Date();
    this.store.set(session.id, session);
  }

  listSessions(): SessionListItem[] {
    return MOCK_SESSIONS;
  }
}
