import type { AgentLogEntry } from '../../domain/entities/AgentSession';

export class LogEntryDto {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  label: string;
  detail?: string;
  timestamp: Date;

  static fromEntity(e: AgentLogEntry): LogEntryDto {
    const dto = new LogEntryDto();
    dto.id = e.id;
    dto.type = e.type;
    dto.label = e.label;
    dto.detail = e.detail;
    dto.timestamp = e.timestamp;
    return dto;
  }
}
