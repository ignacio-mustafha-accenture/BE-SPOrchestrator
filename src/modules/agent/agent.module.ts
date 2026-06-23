import { Module } from '@nestjs/common';
import { CreateSessionUseCase } from './application/use-cases/CreateSessionUseCase';
import { SendAgentMessageUseCase } from './application/use-cases/SendAgentMessageUseCase';
import { SESSION_STORE } from './domain/ports/ISessionStore';
import { InMemorySessionStore } from './infrastructure/adapters/InMemorySessionStore';
import { AgentController } from './presentation/controllers/agent.controller';

@Module({
  controllers: [AgentController],
  providers: [
    { provide: SESSION_STORE, useClass: InMemorySessionStore },
    CreateSessionUseCase,
    SendAgentMessageUseCase,
  ],
})
export class AgentModule {}
