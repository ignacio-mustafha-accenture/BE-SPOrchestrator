import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import type { IAuthProvider } from '../../modules/auth/domain/ports/auth.provider.port';
import { AUTH_PROVIDER } from '../../modules/auth/domain/ports/auth.provider.port';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_PROVIDER) private readonly authProvider: IAuthProvider,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException('Missing authorization token');

    const payload = await this.authProvider.verifyToken(token);
    request['user'] = payload;

    return true;
  }

  private extractToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
