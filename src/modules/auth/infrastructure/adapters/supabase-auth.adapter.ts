import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IAuthProvider, AuthTokens } from '../../domain/ports/auth.provider.port';

@Injectable()
export class SupabaseAuthAdapter implements IAuthProvider {
  private readonly client: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    this.client = createClient(
      config.getOrThrow('SUPABASE_URL'),
      config.getOrThrow('SUPABASE_ANON_KEY'),
    );
  }

  async signUp(email: string, password: string): Promise<AuthTokens> {
    const { data, error } = await this.client.auth.signUp({ email, password });

    if (error) throw new BadRequestException(error.message);
    if (!data.session) throw new BadRequestException('Registration failed');

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      supabaseId: data.user!.id,
    };
  }

  async signIn(email: string, password: string): Promise<AuthTokens> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });

    if (error) throw new UnauthorizedException('Invalid credentials');
    if (!data.session) throw new UnauthorizedException('Authentication failed');

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      supabaseId: data.user.id,
    };
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) throw new BadRequestException(error.message);
  }

  async resetPassword(accessToken: string, newPassword: string): Promise<void> {
    const userClient = createClient(
      this.config.getOrThrow('SUPABASE_URL'),
      this.config.getOrThrow('SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } },
    );

    const { error } = await userClient.auth.updateUser({ password: newPassword });

    if (error) throw new BadRequestException(error.message);
  }

  async verifyToken(accessToken: string): Promise<{ supabaseId: string; email: string }> {
    const { data, error } = await this.client.auth.getUser(accessToken);

    if (error || !data.user) throw new UnauthorizedException('Invalid or expired token');

    return {
      supabaseId: data.user.id,
      email: data.user.email!,
    };
  }
}
