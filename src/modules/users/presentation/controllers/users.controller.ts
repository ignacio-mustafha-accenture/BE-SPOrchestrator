import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import type { IUserRepository } from '../../domain/ports/user.repository.port';
import { USER_REPOSITORY } from '../../domain/ports/user.repository.port';
import { UserResponseDto } from '../dto/user-response.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return UserResponseDto.fromEntity(user);
  }
}
