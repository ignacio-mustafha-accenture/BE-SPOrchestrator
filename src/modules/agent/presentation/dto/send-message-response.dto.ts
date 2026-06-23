import { ChatMessageDto } from './chat-message.dto';
import { LogEntryDto } from './log-entry.dto';

export class SendMessageResponseDto {
  message: ChatMessageDto;
  logEntries?: LogEntryDto[];
}
