import type { SessionListItem } from '../../domain/ports/ISessionStore';

export class ChatSessionDto {
  id: string;
  title: string;
  category: string;
  status: 'open' | 'closed' | 'draft';
  date: string;

  static fromEntity(s: SessionListItem): ChatSessionDto {
    const dto = new ChatSessionDto();
    dto.id = s.id;
    dto.title = s.title;
    dto.category = s.category;
    dto.status = s.status;
    dto.date = s.date;
    return dto;
  }
}
