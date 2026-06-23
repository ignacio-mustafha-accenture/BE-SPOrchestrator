import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post } from '@nestjs/common';
import { CreateSessionUseCase } from '../../application/use-cases/CreateSessionUseCase';
import { SendAgentMessageUseCase } from '../../application/use-cases/SendAgentMessageUseCase';
import type { ISessionStore } from '../../domain/ports/ISessionStore';
import { SESSION_STORE } from '../../domain/ports/ISessionStore';
import { ChatMessageDto } from '../dto/chat-message.dto';
import { ChatSessionDto } from '../dto/chat-session.dto';
import { CreateSessionResponseDto } from '../dto/create-session-response.dto';
import { LogEntryDto } from '../dto/log-entry.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { SendMessageResponseDto } from '../dto/send-message-response.dto';

@Controller('agent')
export class AgentController {
  constructor(
    private readonly createSession: CreateSessionUseCase,
    private readonly sendMessage: SendAgentMessageUseCase,
    @Inject(SESSION_STORE) private readonly store: ISessionStore,
  ) {}

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  createNewSession(@Body() body?: { lang?: 'es' | 'en' }): CreateSessionResponseDto {
    const result = this.createSession.execute(body?.lang ?? 'es');
    const dto = new CreateSessionResponseDto();
    dto.sessionId = result.sessionId;
    dto.welcomeMessage = ChatMessageDto.fromEntity(result.welcomeMessage);
    return dto;
  }

  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  listSessions(): ChatSessionDto[] {
    return this.store.listSessions().map(ChatSessionDto.fromEntity);
  }

  @Post('sessions/:sessionId/messages')
  @HttpCode(HttpStatus.OK)
  sendUserMessage(
    @Param('sessionId') sessionId: string,
    @Body() dto: SendMessageDto,
  ): SendMessageResponseDto {
    const result = this.sendMessage.execute(sessionId, dto.content, dto.lang);
    const response = new SendMessageResponseDto();
    response.message = ChatMessageDto.fromEntity(result.message);
    if (result.logEntries.length > 0) {
      response.logEntries = result.logEntries.map(LogEntryDto.fromEntity);
    }
    return response;
  }

  @Get('sessions/:sessionId/messages')
  @HttpCode(HttpStatus.OK)
  getMessages(@Param('sessionId') sessionId: string): ChatMessageDto[] {
    return this.sendMessage.getMessages(sessionId).map(ChatMessageDto.fromEntity);
  }
}
