import { ChatMessageDto } from './chat-message.dto';

export class CreateSessionResponseDto {
  sessionId: string;
  welcomeMessage: ChatMessageDto;
}
