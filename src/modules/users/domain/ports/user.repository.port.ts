import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findBySupabaseId(supabaseId: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
