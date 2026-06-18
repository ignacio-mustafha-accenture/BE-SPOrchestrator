export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  supabaseId: string;
}

export interface IAuthProvider {
  signUp(email: string, password: string): Promise<AuthTokens>;
  signIn(email: string, password: string): Promise<AuthTokens>;
  sendPasswordResetEmail(email: string): Promise<void>;
  resetPassword(accessToken: string, newPassword: string): Promise<void>;
  verifyToken(accessToken: string): Promise<{ supabaseId: string; email: string }>;
}

export const AUTH_PROVIDER = Symbol('IAuthProvider');
