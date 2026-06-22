import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { GateEntity } from './modules/rfps/domain/entities/gate.entity';
import { ProposalEntity } from './modules/rfps/domain/entities/propuesta.entity';
import { SupplierEntity } from './modules/rfps/domain/entities/proveedor.entity';
import { RfpEntity } from './modules/rfps/domain/entities/rfp.entity';
import { RiskEntity } from './modules/rfps/domain/entities/riesgo.entity';
import { ScoreEntity } from './modules/rfps/domain/entities/score.entity';
import { VariableEntity } from './modules/rfps/domain/entities/variable.entity';
import { RfpsModule } from './modules/rfps/rfps.module';
import { User } from './modules/users/domain/entities/user.entity';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow('DATABASE_URL'),
        entities: [User, RfpEntity, SupplierEntity, ProposalEntity, VariableEntity, ScoreEntity, RiskEntity, GateEntity],
        synchronize: config.get('NODE_ENV') !== 'production',
        ssl: config.get('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),
    AuthModule,
    UsersModule,
    RfpsModule,
  ],
})
export class AppModule {}
