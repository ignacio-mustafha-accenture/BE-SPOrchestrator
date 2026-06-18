import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../../users/domain/entities/user.entity';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  fullName: string;

  @IsEnum(UserRole, { message: 'Invalid role' })
  @IsOptional()
  role?: UserRole;
}
