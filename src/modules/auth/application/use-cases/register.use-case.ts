import { Inject, Injectable, ConflictException } from '@nestjs/common';
import type { IAuthProvider } from '../../domain/ports/auth.provider.port';
import { AUTH_PROVIDER } from '../../domain/ports/auth.provider.port';
import type { IUserRepository } from '../../../users/domain/ports/user.repository.port';
import { USER_REPOSITORY } from '../../../users/domain/ports/user.repository.port';
import { AuthResponseDto } from '../../presentation/dto/auth-response.dto';
import { UserResponseDto } from '../../../users/presentation/dto/user-response.dto';
import { UserRole } from '../../../users/domain/entities/user.entity';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_PROVIDER) private readonly authProvider: IAuthProvider,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    email: string,
    password: string,
    fullName: string,
    role: UserRole = UserRole.VIEWER,
  ): Promise<AuthResponseDto> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new ConflictException('Email already in use');

    const tokens = await this.authProvider.signUp(email, password);

    const user = await this.userRepository.create({
      email,
      fullName,
      role,
      supabaseId: tokens.supabaseId,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: UserResponseDto.fromEntity(user),
    };
  }
}
