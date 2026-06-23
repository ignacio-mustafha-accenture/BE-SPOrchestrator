import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AgentMessage } from '../../domain/entities/AgentSession';
import type { ISessionStore } from '../../domain/ports/ISessionStore';
import { SESSION_STORE } from '../../domain/ports/ISessionStore';

const WELCOME: Record<'es' | 'en', string> = {
  es: '¡Hola! Soy **IQ**, tu asistente de procurement. Puedo ayudarte a gestionar el ciclo completo de sourcing: desde crear una RFP hasta generar el resumen ejecutivo de adjudicación.\n\n¿En qué puedo ayudarte hoy?',
  en: "Hello! I'm **IQ**, your procurement assistant. I can help you manage the complete sourcing lifecycle: from creating an RFP to generating the award executive summary.\n\nHow can I help you today?",
};

@Injectable()
export class CreateSessionUseCase {
  constructor(@Inject(SESSION_STORE) private readonly store: ISessionStore) {}

  execute(lang: 'es' | 'en' = 'es'): { sessionId: string; welcomeMessage: AgentMessage } {
    const session = this.store.create(lang);

    const welcomeMessage: AgentMessage = {
      id: randomUUID(),
      role: 'agent',
      content: WELCOME[lang],
      timestamp: new Date(),
    };

    session.messages.push(welcomeMessage);
    this.store.save(session);

    return { sessionId: session.id, welcomeMessage };
  }
}
