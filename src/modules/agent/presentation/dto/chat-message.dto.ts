import type { AgentMessage } from '../../domain/entities/AgentSession';

export class ChatMessageDto {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;

  static fromEntity(m: AgentMessage): ChatMessageDto {
    const dto = new ChatMessageDto();
    dto.id = m.id;
    dto.role = m.role;
    dto.content = m.content;
    dto.timestamp = m.timestamp;
    return dto;
  }
}
