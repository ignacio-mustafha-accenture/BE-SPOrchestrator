import { Inject, Injectable } from '@nestjs/common';
import type { IAuthProvider } from '../../domain/ports/auth.provider.port';
import { AUTH_PROVIDER } from '../../domain/ports/auth.provider.port';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(AUTH_PROVIDER) private readonly authProvider: IAuthProvider,
  ) {}

  async execute(email: string): Promise<void> {
    await this.authProvider.sendPasswordResetEmail(email);
  }
}
