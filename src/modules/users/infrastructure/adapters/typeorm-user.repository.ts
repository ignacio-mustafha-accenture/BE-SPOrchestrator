import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/ports/user.repository.port';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email });
  }

  findBySupabaseId(supabaseId: string): Promise<User | null> {
    return this.repo.findOneBy({ supabaseId });
  }

  create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, data);
    return this.repo.save(user);
  }
}
