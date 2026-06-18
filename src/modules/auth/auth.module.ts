import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/domain/entities/user.entity';
import { TypeOrmUserRepository } from '../users/infrastructure/adapters/typeorm-user.repository';
import { SupabaseAuthAdapter } from './infrastructure/adapters/supabase-auth.adapter';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { AUTH_PROVIDER } from './domain/ports/auth.provider.port';
import { USER_REPOSITORY } from '../users/domain/ports/user.repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [
    { provide: AUTH_PROVIDER, useClass: SupabaseAuthAdapter },
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    LoginUseCase,
    RegisterUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
  ],
  exports: [AUTH_PROVIDER],
})
export class AuthModule {}
