export type AgentPhase =
  | 'detect'
  | 'collect_name'
  | 'collect_suppliers'
  | 'collect_deadline'
  | 'collect_budget'
  | 'confirm'
  | 'gate'
  | 'live'
  | 'done';

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export interface AgentLogEntry {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  label: string;
  detail?: string;
  timestamp: Date;
}

export interface RfpData {
  name?: string;
  suppliers?: string;
  deadline?: string;
  budget?: string;
}

export class AgentSession {
  id: string;
  phase: AgentPhase;
  lang: 'es' | 'en';
  rfpData: RfpData;
  messages: AgentMessage[];
  createdAt: Date;
  updatedAt: Date;
}
