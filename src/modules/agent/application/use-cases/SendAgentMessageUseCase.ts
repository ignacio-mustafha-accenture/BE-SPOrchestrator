import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  AgentLogEntry,
  AgentMessage,
  AgentPhase,
  AgentSession,
  RfpData,
} from '../../domain/entities/AgentSession';
import type { ISessionStore } from '../../domain/ports/ISessionStore';
import { SESSION_STORE } from '../../domain/ports/ISessionStore';

// ── Scripted responses ────────────────────────────────────────────────────────

type Scripts = {
  detect: string;
  detect_unknown: string;
  collect_name: string;
  collect_suppliers: (name: string) => string;
  collect_deadline: (suppliers: string) => string;
  collect_budget: (deadline: string) => string;
  confirm: (d: RfpData) => string;
  confirm_again: string;
  gate: string;
  gate_again: string;
  live: (d: RfpData) => string;
  done: string;
};

const SCRIPTS: Record<'es' | 'en', Scripts> = {
  es: {
    detect:
      'Entendido. Puedo ayudarte con:\n\n1. **Crear una nueva RFP** — desde descripción hasta notificar proveedores\n2. **Ejecutar un evento de sourcing** — gestionar Q&A y propuestas\n3. **Procesar propuestas** — extracción y análisis con IA\n4. **Evaluación y análisis** — shortlist, TCO y resumen ejecutivo\n\n¿Qué necesitas hacer?',
    detect_unknown:
      'No estoy seguro de entender tu solicitud. Puedo ayudarte con:\n\n1. **Crear una nueva RFP**\n2. **Ejecutar un evento de sourcing**\n3. **Procesar propuestas**\n4. **Evaluación y análisis**\n\n¿Cuál de estas opciones necesitas?',
    collect_name: 'Perfecto, vamos a crear una nueva RFP. ¿Cuál es el nombre o descripción del proyecto?',
    collect_suppliers: (name) =>
      `Proyecto: **${name}**.\nCategoría detectada: **Facilities Management** (conf. 0.94) ✓\n\n¿A cuántos proveedores deseas invitar?`,
    collect_deadline: (suppliers) =>
      `Anotado: **${suppliers} proveedores**. ¿Cuál es la fecha límite para recibir propuestas?\n*(formato DD/MM/AAAA)*`,
    collect_budget: (deadline) =>
      `Fecha límite: **${deadline}**. ¿Cuál es el presupuesto estimado en USD?`,
    confirm: (d) =>
      `Resumen de la RFP:\n\n- **Proyecto:** ${d.name}\n- **Categoría:** Facilities Management\n- **Proveedores:** ${d.suppliers}\n- **Deadline:** ${d.deadline}\n- **Presupuesto:** USD ${d.budget}\n\n¿Confirmas la creación de esta RFP?`,
    confirm_again: 'Para confirmar, responde "sí" o "confirmar".',
    gate:
      'RFP preliminar creada. Iniciando **Gate 1 — Apertura de Licitación**.\n\n⚠️ Esta acción es **irreversible**: una vez aprobada, los criterios de evaluación quedarán bloqueados y se notificará a los proveedores.\n\n¿Apruebas la apertura de la licitación?',
    gate_again: 'Para aprobar el Gate 1, responde "aprobar" o "sí".',
    live: (d) =>
      `✅ **Gate 1 aprobado.** Ejecutando agentes de procurement...\n\n- SA-01: Extracción de categoría — ✓ completado\n- SA-02: Generación de plantilla — **RFP-2026-049** creada ✓\n- SA-03: Notificación a proveedores — **${d.suppliers} invitaciones** enviadas ✓\n\nLa RFP **RFP-2026-049** está activa y los proveedores han sido notificados.\n\n¿Hay algo más en lo que pueda ayudarte?`,
    done: 'Estoy aquí para ayudarte. Puedes pedirme crear otra RFP, revisar propuestas existentes o cualquier otra tarea de procurement.',
  },
  en: {
    detect:
      'Understood. I can help you with:\n\n1. **Create a new RFP** — from description to supplier notification\n2. **Run a sourcing event** — manage Q&A and submissions\n3. **Process proposals** — AI-powered extraction and analysis\n4. **Evaluation & analysis** — shortlist, TCO, and executive summary\n\nWhat do you need?',
    detect_unknown:
      "I'm not sure I understood your request. I can help with:\n\n1. **Create a new RFP**\n2. **Run a sourcing event**\n3. **Process proposals**\n4. **Evaluation & analysis**\n\nWhich option do you need?",
    collect_name: "Let's create a new RFP. What is the name or description of the project?",
    collect_suppliers: (name) =>
      `Project: **${name}**.\nDetected category: **Facilities Management** (conf. 0.94) ✓\n\nHow many suppliers do you want to invite?`,
    collect_deadline: (suppliers) =>
      `Got it: **${suppliers} suppliers**. What is the deadline for receiving proposals?\n*(format DD/MM/YYYY)*`,
    collect_budget: (deadline) =>
      `Deadline: **${deadline}**. What is the estimated budget in USD?`,
    confirm: (d) =>
      `RFP Summary:\n\n- **Project:** ${d.name}\n- **Category:** Facilities Management\n- **Suppliers:** ${d.suppliers}\n- **Deadline:** ${d.deadline}\n- **Budget:** USD ${d.budget}\n\nDo you confirm the creation of this RFP?`,
    confirm_again: 'To confirm, reply "yes" or "confirm".',
    gate:
      'Preliminary RFP created. Starting **Gate 1 — Tender Opening**.\n\n⚠️ This action is **irreversible**: once approved, evaluation criteria will be locked and suppliers will be notified.\n\nDo you approve opening the tender?',
    gate_again: 'To approve Gate 1, reply "approve" or "yes".',
    live: (d) =>
      `✅ **Gate 1 approved.** Running procurement agents...\n\n- SA-01: Category extraction — ✓ complete\n- SA-02: Template generation — **RFP-2026-049** created ✓\n- SA-03: Supplier notification — **${d.suppliers} invitations** sent ✓\n\nRFP **RFP-2026-049** is now active and suppliers have been notified.\n\nIs there anything else I can help you with?`,
    done: 'I\'m here to help. You can ask me to create another RFP, review existing proposals, or handle any other procurement task.',
  },
};

// ── Keyword matchers ──────────────────────────────────────────────────────────

function matchesRfpIntent(msg: string): boolean {
  const lower = msg.toLowerCase();
  return /rfp|creat|crear|nueva|new|1\b/.test(lower);
}

function matchesAffirmative(msg: string): boolean {
  const lower = msg.toLowerCase();
  return /^(s[íi]|si|yes|confirm|ok|dale|apro|claro|correcto|adelante|proceed)/i.test(lower.trim());
}

// ── Log entry factory ─────────────────────────────────────────────────────────

function buildLiveLogEntries(d: RfpData, lang: 'es' | 'en'): AgentLogEntry[] {
  const now = new Date();
  const isEs = lang === 'es';
  return [
    {
      id: randomUUID(),
      type: 'info',
      label: isEs ? 'SA-01: Extracción de categoría' : 'SA-01: Category extraction',
      detail: isEs ? 'Detectando señales de categoría...' : 'Detecting category signals...',
      timestamp: now,
    },
    {
      id: randomUUID(),
      type: 'success',
      label: isEs ? 'SA-01: Categoría confirmada' : 'SA-01: Category confirmed',
      detail: 'Facilities Management (conf. 0.97)',
      timestamp: now,
    },
    {
      id: randomUUID(),
      type: 'info',
      label: isEs ? 'SA-02: Generación de plantilla' : 'SA-02: Template generation',
      detail: isEs ? 'Creando estructura RFP...' : 'Building RFP structure...',
      timestamp: now,
    },
    {
      id: randomUUID(),
      type: 'success',
      label: isEs ? 'SA-02: RFP creada' : 'SA-02: RFP created',
      detail: isEs ? 'RFP-2026-049 generada exitosamente' : 'RFP-2026-049 generated successfully',
      timestamp: now,
    },
    {
      id: randomUUID(),
      type: 'info',
      label: isEs ? 'SA-03: Notificación' : 'SA-03: Notification',
      detail: isEs
        ? `Enviando invitaciones a ${d.suppliers ?? '?'} proveedores...`
        : `Sending invitations to ${d.suppliers ?? '?'} suppliers...`,
      timestamp: now,
    },
    {
      id: randomUUID(),
      type: 'success',
      label: isEs ? 'SA-03: Proveedores notificados' : 'SA-03: Suppliers notified',
      detail: isEs
        ? `${d.suppliers ?? '?'} invitaciones enviadas exitosamente`
        : `${d.suppliers ?? '?'} invitations sent successfully`,
      timestamp: now,
    },
  ];
}

// ── State machine ─────────────────────────────────────────────────────────────

function advance(
  session: AgentSession,
  userContent: string,
): { agentContent: string; nextPhase: AgentPhase; logEntries: AgentLogEntry[] } {
  const s = SCRIPTS[session.lang];
  const { phase, rfpData } = session;

  switch (phase) {
    case 'detect': {
      if (matchesRfpIntent(userContent)) {
        return { agentContent: s.collect_name, nextPhase: 'collect_name', logEntries: [] };
      }
      return { agentContent: s.detect_unknown, nextPhase: 'detect', logEntries: [] };
    }

    case 'collect_name': {
      rfpData.name = userContent.trim();
      return {
        agentContent: s.collect_suppliers(rfpData.name),
        nextPhase: 'collect_suppliers',
        logEntries: [],
      };
    }

    case 'collect_suppliers': {
      rfpData.suppliers = userContent.trim();
      return {
        agentContent: s.collect_deadline(rfpData.suppliers),
        nextPhase: 'collect_deadline',
        logEntries: [],
      };
    }

    case 'collect_deadline': {
      rfpData.deadline = userContent.trim();
      return {
        agentContent: s.collect_budget(rfpData.deadline),
        nextPhase: 'collect_budget',
        logEntries: [],
      };
    }

    case 'collect_budget': {
      rfpData.budget = userContent.trim();
      return {
        agentContent: s.confirm(rfpData),
        nextPhase: 'confirm',
        logEntries: [],
      };
    }

    case 'confirm': {
      if (matchesAffirmative(userContent)) {
        return { agentContent: s.gate, nextPhase: 'gate', logEntries: [] };
      }
      return { agentContent: s.confirm_again, nextPhase: 'confirm', logEntries: [] };
    }

    case 'gate': {
      if (matchesAffirmative(userContent)) {
        return {
          agentContent: s.live(rfpData),
          nextPhase: 'live',
          logEntries: buildLiveLogEntries(rfpData, session.lang),
        };
      }
      return { agentContent: s.gate_again, nextPhase: 'gate', logEntries: [] };
    }

    case 'live':
    case 'done':
    default:
      return { agentContent: s.done, nextPhase: 'done', logEntries: [] };
  }
}

// ── Use case ──────────────────────────────────────────────────────────────────

export interface SendAgentMessageResult {
  message: AgentMessage;
  logEntries: AgentLogEntry[];
}

@Injectable()
export class SendAgentMessageUseCase {
  constructor(@Inject(SESSION_STORE) private readonly store: ISessionStore) {}

  execute(
    sessionId: string,
    content: string,
    langOverride?: 'es' | 'en',
  ): SendAgentMessageResult {
    const session = this.store.findById(sessionId);
    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

    if (langOverride) session.lang = langOverride;

    const userMessage: AgentMessage = {
      id: randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    session.messages.push(userMessage);

    const { agentContent, nextPhase, logEntries } = advance(session, content);

    const agentMessage: AgentMessage = {
      id: randomUUID(),
      role: 'agent',
      content: agentContent,
      timestamp: new Date(),
    };
    session.messages.push(agentMessage);
    session.phase = nextPhase;
    this.store.save(session);

    return { message: agentMessage, logEntries };
  }

  getMessages(sessionId: string): AgentMessage[] {
    const session = this.store.findById(sessionId);
    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);
    return session.messages;
  }
}
