import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('scores')
export class ScoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rfp_id' })
  rfpId: string;

  @Column({ name: 'proveedor_id' })
  supplierId: string;

  @Column({ name: 'proveedor_nombre' })
  supplierName: string;

  @Column({ name: 'dimension_id' })
  dimensionId: string;

  @Column({ name: 'dimension_nombre' })
  dimensionName: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true, name: 'peso' })
  weight: number | null;
}
