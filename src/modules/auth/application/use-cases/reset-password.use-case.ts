import { Inject, Injectable } from '@nestjs/common';
import type { IAuthProvider } from '../../domain/ports/auth.provider.port';
import { AUTH_PROVIDER } from '../../domain/ports/auth.provider.port';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(AUTH_PROVIDER) private readonly authProvider: IAuthProvider,
  ) {}

  async execute(accessToken: string, newPassword: string): Promise<void> {
    await this.authProvider.resetPassword(accessToken, newPassword);
  }
}
