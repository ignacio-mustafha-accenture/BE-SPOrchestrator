import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IAuthProvider } from '../../domain/ports/auth.provider.port';
import { AUTH_PROVIDER } from '../../domain/ports/auth.provider.port';
import type { IUserRepository } from '../../../users/domain/ports/user.repository.port';
import { USER_REPOSITORY } from '../../../users/domain/ports/user.repository.port';
import { AuthResponseDto } from '../../presentation/dto/auth-response.dto';
import { UserResponseDto } from '../../../users/presentation/dto/user-response.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_PROVIDER) private readonly authProvider: IAuthProvider,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(email: string, password: string): Promise<AuthResponseDto> {
    const tokens = await this.authProvider.signIn(email, password);

    const user = await this.userRepository.findBySupabaseId(tokens.supabaseId);
    if (!user || !user.isActive) throw new UnauthorizedException('Account not found or inactive');

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: UserResponseDto.fromEntity(user),
    };
  }
}
