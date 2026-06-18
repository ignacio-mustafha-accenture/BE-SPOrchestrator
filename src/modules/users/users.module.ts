import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { TypeOrmUserRepository } from './infrastructure/adapters/typeorm-user.repository';
import { UsersController } from './presentation/controllers/users.controller';
import { USER_REPOSITORY } from './domain/ports/user.repository.port';
import { AUTH_PROVIDER } from '../auth/domain/ports/auth.provider.port';
import { SupabaseAuthAdapter } from '../auth/infrastructure/adapters/supabase-auth.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    { provide: AUTH_PROVIDER, useClass: SupabaseAuthAdapter },
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
