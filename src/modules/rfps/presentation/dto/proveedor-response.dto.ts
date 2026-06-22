import { SupplierEntity } from '../../domain/entities/proveedor.entity';

export class SupplierResponseDto {
  supplierId: string;
  rfpId: string;
  name: string;
  email: string;
  country: string;
  compositeScore: number;

  static fromEntity(e: SupplierEntity): SupplierResponseDto {
    const dto = new SupplierResponseDto();
    dto.supplierId = e.supplierId;
    dto.rfpId = e.rfpId;
    dto.name = e.name;
    dto.email = e.email;
    dto.country = e.country;
    dto.compositeScore = Number(e.compositeScore);
    return dto;
  }
}

/** @deprecated use SupplierResponseDto */
export { SupplierResponseDto as ProveedorResponseDto };
