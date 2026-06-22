import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as XLSX from 'xlsx';
import { GateEntity, GateStatus } from '../../domain/entities/gate.entity';
import { ProposalEntity, ProposalStatus } from '../../domain/entities/propuesta.entity';
import { SupplierEntity } from '../../domain/entities/proveedor.entity';
import { RfpEntity, RfpStatus } from '../../domain/entities/rfp.entity';
import { RiskEntity, RiskRating } from '../../domain/entities/riesgo.entity';
import { ScoreEntity } from '../../domain/entities/score.entity';
import { VariableEntity } from '../../domain/entities/variable.entity';
import type { IRfpRepository } from '../../domain/ports/rfp.repository.port';

type SheetRow = Record<string, unknown>;

@Injectable()
export class GoogleSheetsRfpRepository implements IRfpRepository {
  private readonly sheetId: string;
  private readonly TTL_MS = 30_000;
  private readonly cache = new Map<string, { rows: SheetRow[]; ts: number }>();
  private readonly gateOverrides = new Map<string, GateEntity>();

  constructor(private readonly config: ConfigService) {
    this.sheetId = this.config.getOrThrow('GOOGLE_SHEET_ID');
  }

  private async fetchSheet(tab: string): Promise<SheetRow[]> {
    const cached = this.cache.get(tab);
    if (cached && Date.now() - cached.ts < this.TTL_MS) return cached.rows;

    const url = `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch sheet "${tab}": ${res.status}`);

    const csv = await res.text();
    const wb = XLSX.read(csv, { type: 'string' });
    const raw = XLSX.utils.sheet_to_json<SheetRow>(wb.Sheets[wb.SheetNames[0]], { defval: null });
    const rows = raw.map((row) => this.normalizeRow(row));

    this.cache.set(tab, { rows, ts: Date.now() });
    return rows;
  }

  private normalizeRow(row: SheetRow): SheetRow {
    const result: SheetRow = {};
    for (const [key, val] of Object.entries(row)) {
      // Sheet headers combine a long description with the column name as the last word.
      // e.g. "BidIQ — Sheet 1: RFPs ... rfp_id" → "rfp_id"
      const cleanKey = key.includes(' ') ? key.split(' ').at(-1)! : key;
      result[cleanKey] = val;
    }
    return result;
  }

  private str(val: unknown): string {
    return val !== null && val !== undefined ? String(val) : '';
  }

  private num(val: unknown): number {
    return Number(val);
  }

  // ── RFPs ──────────────────────────────────────────────────────────────────

  async findAllRfps(): Promise<RfpEntity[]> {
    const rows = await this.fetchSheet('1_RFPs');
    return rows
      .filter((r) => this.str(r['rfp_id']).startsWith('RFP-'))
      .map((r) => this.rowToRfp(r));
  }

  async findRfpById(rfpId: string): Promise<RfpEntity | null> {
    const all = await this.findAllRfps();
    return all.find((r) => r.rfpId === rfpId) ?? null;
  }

  private rowToRfp(r: SheetRow): RfpEntity {
    const e = new RfpEntity();
    e.rfpId = this.str(r['rfp_id']);
    e.name = this.str(r['nombre']);
    e.categoryId = this.str(r['categoria_id']);
    e.categoryName = this.str(r['categoria_nombre']);
    e.estimatedValueUsd = this.num(r['valor_estimado_usd']);
    e.deadline = this.str(r['deadline']);
    e.status = this.str(r['status']) as RfpStatus;
    e.progressPct = this.num(r['progreso_%']);
    e.invitedSuppliers = this.num(r['proveedores_invitados']);
    e.stage = this.str(r['stage']) || null;
    e.activeAgent = this.str(r['active_agent']) || null;
    e.stageStatus = this.str(r['stage_status']) || null;
    e.globalConfidence = r['global_confidence'] != null ? this.num(r['global_confidence']) : null;
    e.architecture = this.str(r['architecture']) || null;
    return e;
  }

  // ── Suppliers ─────────────────────────────────────────────────────────────

  async findProveedoresByRfpId(rfpId: string): Promise<SupplierEntity[]> {
    const rows = await this.fetchSheet('2_Proveedores');
    return rows
      .filter((r) => this.str(r['proveedor_id']).startsWith('S-') && this.str(r['rfp_id']) === rfpId)
      .map((r) => {
        const e = new SupplierEntity();
        e.supplierId = this.str(r['proveedor_id']);
        e.rfpId = this.str(r['rfp_id']);
        e.name = this.str(r['nombre']);
        e.email = this.str(r['email']);
        e.country = this.str(r['pais']);
        e.compositeScore = this.num(r['score_compuesto']);
        return e;
      });
  }

  // ── Proposals ─────────────────────────────────────────────────────────────

  async findPropuestasByRfpId(rfpId: string): Promise<ProposalEntity[]> {
    const rows = await this.fetchSheet('3_Propuestas');
    return rows
      .filter((r) => this.str(r['propuesta_id']).startsWith('P-') && this.str(r['rfp_id']) === rfpId)
      .map((r) => {
        const e = new ProposalEntity();
        e.proposalId = this.str(r['propuesta_id']);
        e.rfpId = this.str(r['rfp_id']);
        e.supplierId = this.str(r['proveedor_id']);
        e.supplierName = this.str(r['proveedor_nombre']);
        e.submissionDate = this.str(r['fecha_envio']);
        e.status = this.str(r['status']) as ProposalStatus;
        e.globalConfidence = this.num(r['confianza_global_%']);
        return e;
      });
  }

  // ── Variables ─────────────────────────────────────────────────────────────

  async findVariablesByRfpId(rfpId: string, supplierId?: string): Promise<VariableEntity[]> {
    const rows = await this.fetchSheet('4_Variables');
    return rows
      .filter(
        (r) =>
          r['variable_id'] &&
          this.str(r['rfp_id']) === rfpId &&
          (!supplierId || this.str(r['proveedor_id']) === supplierId),
      )
      .map((r) => {
        const e = new VariableEntity();
        e.id = `${this.str(r['variable_id'])}-${this.str(r['proveedor_id'])}`;
        e.variableId = this.str(r['variable_id']);
        e.dimension = this.str(r['dimension']);
        e.rfpId = this.str(r['rfp_id']);
        e.supplierId = this.str(r['proveedor_id']);
        e.supplierName = this.str(r['proveedor_nombre']);
        e.value = this.str(r['valor']);
        e.confidence = this.num(r['confianza']);
        e.flagged = this.str(r['flagged']).toUpperCase() === 'SI';
        return e;
      });
  }

  // ── Scores ────────────────────────────────────────────────────────────────

  async findScoresByRfpId(rfpId: string): Promise<ScoreEntity[]> {
    const rows = await this.fetchSheet('5_Scores');
    return rows
      .filter((r) => this.str(r['rfp_id']) === rfpId && r['proveedor_id'])
      .map((r) => {
        const e = new ScoreEntity();
        e.id = `${this.str(r['dimension_id'])}-${this.str(r['proveedor_id'])}`;
        e.rfpId = this.str(r['rfp_id']);
        e.supplierId = this.str(r['proveedor_id']);
        e.supplierName = this.str(r['proveedor_nombre']);
        e.dimensionId = this.str(r['dimension_id']);
        e.dimensionName = this.str(r['dimension_nombre']);
        e.score = this.num(r['score']);
        const weightRaw = r['peso_%'];
        e.weight = weightRaw !== null && weightRaw !== '—' ? this.num(weightRaw) : null;
        return e;
      });
  }

  // ── Risks ─────────────────────────────────────────────────────────────────

  async findRiesgosByRfpId(rfpId: string): Promise<RiskEntity[]> {
    const rows = await this.fetchSheet('6_Riesgo');
    return rows
      .filter(
        (r) =>
          this.str(r['rfp_id']) === rfpId &&
          this.str(r['proveedor_id']).startsWith('S-'),
      )
      .map((r) => {
        const e = new RiskEntity();
        e.id = `${this.str(r['proveedor_id'])}-${this.str(r['factor_riesgo'])}`;
        e.rfpId = this.str(r['rfp_id']);
        e.supplierId = this.str(r['proveedor_id']);
        e.supplierName = this.str(r['proveedor_nombre']);
        e.riskFactor = this.str(r['factor_riesgo']);
        e.rating = this.str(r['rating']) as RiskRating;
        e.observation = r['observacion'] ? this.str(r['observacion']) : null;
        return e;
      });
  }

  // ── Gates ─────────────────────────────────────────────────────────────────

  async findGatesByRfpId(rfpId: string): Promise<GateEntity[]> {
    const rows = await this.fetchSheet('7_Gates_HITL');
    return rows
      .filter((r) => this.str(r['gate_id']).startsWith('G-') && this.str(r['rfp_id']) === rfpId)
      .map((r) => this.rowToGate(r))
      .map((gate) => this.applyOverride(gate));
  }

  async findGateById(gateId: string): Promise<GateEntity | null> {
    const rows = await this.fetchSheet('7_Gates_HITL');
    const row = rows.find((r) => this.str(r['gate_id']) === gateId);
    if (!row) return null;
    return this.applyOverride(this.rowToGate(row));
  }

  async updateGate(gateId: string, patch: Partial<GateEntity>): Promise<GateEntity> {
    const gate = await this.findGateById(gateId);
    if (!gate) throw new NotFoundException(`Gate ${gateId} not found`);
    const merged = Object.assign(new GateEntity(), gate, patch);
    this.gateOverrides.set(gateId, merged);
    return merged;
  }

  private rowToGate(r: SheetRow): GateEntity {
    const e = new GateEntity();
    e.gateId = this.str(r['gate_id']);
    e.rfpId = this.str(r['rfp_id']);
    e.gateNumber = this.num(r['gate_numero']);
    e.label = this.str(r['etiqueta']);
    e.status = this.str(r['status']) as GateStatus;
    const db = this.str(r['decidido_por']);
    e.decidedBy = db && db !== '—' ? db : null;
    const rat = this.str(r['rationale']);
    e.rationale = rat && rat !== '—' ? rat : null;
    const fd = this.str(r['fecha_decision']);
    e.decisionDate = fd && fd !== '—' ? fd : null;
    return e;
  }

  private applyOverride(gate: GateEntity): GateEntity {
    const override = this.gateOverrides.get(gate.gateId);
    return override ? Object.assign(new GateEntity(), gate, override) : gate;
  }
}
