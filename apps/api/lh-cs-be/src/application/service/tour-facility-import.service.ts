import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TourRepository } from '../../infrastructure/repository/tour.repository';
import { FacilityRepository } from '../../infrastructure/repository/facility.repository';
import { TourFacilityRepository } from '../../infrastructure/repository/tour-facility.repository';
import {
  SceneImportDetail,
  SceneImportStatus,
  TourFacilitySceneImportResult,
} from '../dto/response/tour-facility-scene-import.result';
import { TourEntity } from '@/infrastructure/repository/entity/tour.entity';
import { FacilityEntity } from '@/infrastructure/repository/entity/facility.entity';
import { TourFacilityEntity } from '@/infrastructure/repository/entity/tour-facility.entity';

interface TourColumnDefinition {
  columnIndex: number;
  tourName: string;
  tourSquareMeters: number;
}

interface ParsedOperation {
  csvRowIndex: number; // 1-based row number from CSV
  sequence?: string;
  facilityTitle: string;
  tourName: string;
  tourSquareMeters: number;
  url: string;
  sceneId?: string | null;
}

@Injectable()
export class TourFacilityImportService {
  constructor(
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
    private readonly tourRepository: TourRepository,
    private readonly facilityRepository: FacilityRepository,
    private readonly tourFacilityRepository: TourFacilityRepository
  ) {}

  async importSceneIdsFromCsv(
    file: Express.Multer.File
  ): Promise<TourFacilitySceneImportResult> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('CSV 파일이 필요합니다.');
    }

    const rows = this.parseCsv(file.buffer.toString('utf-8'));

    if (rows.length < 4) {
      throw new BadRequestException('CSV 포맷이 올바르지 않습니다.');
    }

    const tourColumns = this.extractTourColumns(rows);
    if (tourColumns.length === 0) {
      throw new BadRequestException(
        'CSV에서 투어 정보를 찾을 수 없습니다. (포인트 주소 열 확인 필요)'
      );
    }

    const operations = this.extractOperations(rows, tourColumns);
    if (operations.length === 0) {
      throw new BadRequestException('처리할 시설 정보가 존재하지 않습니다.');
    }

    const tourLookup = await this.buildTourLookup();
    const facilityLookup = await this.buildFacilityLookup();
    const tourFacilityCache = new Map<string, TourFacilityEntity | null>();

    const summary: TourFacilitySceneImportResult = {
      totalRows: operations.length,
      successCount: 0,
      failureCount: 0,
      pendingCount: 0,
      successes: [],
      failures: [],
      pending: [],
    };

    for (const operation of operations) {
      const rowResult = await this.processOperation(
        operation,
        tourLookup,
        facilityLookup,
        tourFacilityCache
      );

      switch (rowResult.status) {
        case SceneImportStatus.SUCCESS:
          summary.successCount += 1;
          summary.successes.push(rowResult);
          break;
        case SceneImportStatus.PENDING:
          summary.pendingCount += 1;
          summary.pending.push(rowResult);
          break;
        default:
          summary.failureCount += 1;
          summary.failures.push(rowResult);
      }
    }

    return summary;
  }

  private async processOperation(
    operation: ParsedOperation,
    tourLookup: Map<number, TourEntity[]>,
    facilityLookup: Map<string, FacilityEntity>,
    tourFacilityCache: Map<string, TourFacilityEntity | null>
  ): Promise<SceneImportDetail> {
    const normalizedTitle = this.normalizeText(operation.facilityTitle);
    const baseDetail: SceneImportDetail = {
      rowIndex: operation.csvRowIndex,
      sequence: operation.sequence,
      facilityTitle: operation.facilityTitle,
      tourName: operation.tourName,
      tourSquareMeters: operation.tourSquareMeters,
      sceneId: operation.sceneId ?? undefined,
      url: operation.url,
      message: '',
      status: SceneImportStatus.FAILURE,
    };

    if (!operation.sceneId) {
      return {
        ...baseDetail,
        message: 'URL에 startID 파라미터가 없습니다.',
      };
    }

    if (!/^\d+$/.test(operation.sceneId)) {
      return {
        ...baseDetail,
        message: 'startID 값이 숫자가 아닙니다.',
      };
    }

    const tourCandidates = tourLookup.get(operation.tourSquareMeters) ?? [];
    if (tourCandidates.length === 0) {
      return {
        ...baseDetail,
        message: `${operation.tourSquareMeters}㎡에 해당하는 투어를 찾을 수 없습니다.`,
      };
    }

    if (tourCandidates.length > 1) {
      return {
        ...baseDetail,
        status: SceneImportStatus.PENDING,
        message: `${operation.tourSquareMeters}㎡ 투어가 여러 개 존재합니다. 수동 확인이 필요합니다.`,
        metadata: {
          candidateTourIds: tourCandidates.map((tour) => tour.id),
        },
      };
    }

    const tour = tourCandidates[0];

    const facility = facilityLookup.get(normalizedTitle);
    if (!facility) {
      return {
        ...baseDetail,
        message: `시설명 "${operation.facilityTitle}" 을(를) 찾을 수 없습니다.`,
      };
    }

    const cacheKey = `${tour.id}:${facility.id}`;
    let tourFacility = tourFacilityCache.get(cacheKey);
    if (tourFacility === undefined) {
      tourFacility = await this.tourFacilityRepository.findActiveByTourAndFacility(
        tour.id,
        facility.id
      );
      tourFacilityCache.set(cacheKey, tourFacility ?? null);
    }

    if (!tourFacility) {
      return {
        ...baseDetail,
        message: '투어에 해당 시설이 연결되어 있지 않습니다.',
      };
    }

    const previousSceneId = tourFacility.sceneId;

    await this.dataSource.transaction(async (manager) => {
      await this.tourFacilityRepository.update(
        tourFacility!.id,
        { sceneId: operation.sceneId! },
        manager
      );
    });

    tourFacility.sceneId = operation.sceneId!;

    return {
      ...baseDetail,
      status: SceneImportStatus.SUCCESS,
      message: '씬 ID가 업데이트되었습니다.',
      tourId: tour.id,
      facilityId: facility.id,
      tourFacilityId: tourFacility.id,
      previousSceneId,
    };
  }

  private parseCsv(content: string): string[][] {
    const sanitized = content.replace(/^\uFEFF/, '').trimEnd();
    const lines = sanitized
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter((line) => line.length > 0);

    return lines.map((line) => line.split(',').map((cell) => cell.trim()));
  }

  private extractTourColumns(rows: string[][]): TourColumnDefinition[] {
    const headerRow = rows[0];
    const squareMeterRow = rows[1];
    const typeRow = rows[2];

    if (this.normalizeText(headerRow[0]) !== '순번') {
      throw new BadRequestException('첫 번째 열이 "순번"이 아닙니다.');
    }

    if (this.normalizeText(headerRow[1]) !== '시설물') {
      throw new BadRequestException('두 번째 열이 "시설물" 형식이 아닙니다.');
    }

    const tourColumns: TourColumnDefinition[] = [];
    for (let columnIndex = 2; columnIndex < headerRow.length; columnIndex += 1) {
      const columnType = this.normalizeText(typeRow[columnIndex]);
      if (columnType !== '포인트주소') {
        continue;
      }

      const tourName = (headerRow[columnIndex] ?? '').trim();
      const squareMetersRaw = (squareMeterRow[columnIndex] ?? '').trim();
      const squareMeters = Number(squareMetersRaw);

      if (!tourName) {
        throw new BadRequestException(
          `열 ${columnIndex + 1}의 투어명이 비어 있습니다.`
        );
      }

      if (!squareMetersRaw || !Number.isFinite(squareMeters)) {
        throw new BadRequestException(
          `${tourName} 열의 제곱미터 값이 올바르지 않습니다.`
        );
      }

      tourColumns.push({ columnIndex, tourName, tourSquareMeters: squareMeters });
    }

    return tourColumns;
  }

  private extractOperations(
    rows: string[][],
    tourColumns: TourColumnDefinition[]
  ): ParsedOperation[] {
    const operations: ParsedOperation[] = [];

    for (let rowIndex = 3; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      const sequence = row[0]?.trim();
      const facilityTitle = (row[1] ?? '').trim();

      if (!facilityTitle) {
        continue;
      }

      for (const tourColumn of tourColumns) {
        const urlCell = (row[tourColumn.columnIndex] ?? '').trim();

        if (!urlCell || !this.looksLikeUrl(urlCell)) {
          continue;
        }

        operations.push({
          csvRowIndex: rowIndex + 1,
          sequence,
          facilityTitle,
          tourName: tourColumn.tourName,
          tourSquareMeters: tourColumn.tourSquareMeters,
          url: urlCell,
          sceneId: this.extractSceneId(urlCell),
        });
      }
    }

    return operations;
  }

  private async buildTourLookup(): Promise<Map<number, TourEntity[]>> {
    const tours = await this.tourRepository.findAll();
    const map = new Map<number, TourEntity[]>();

    for (const tour of tours) {
      const list = map.get(tour.squareMeters) ?? [];
      list.push(tour);
      map.set(tour.squareMeters, list);
    }

    return map;
  }

  private async buildFacilityLookup(): Promise<Map<string, FacilityEntity>> {
    const facilities = await this.facilityRepository.findAll();
    const map = new Map<string, FacilityEntity>();

    for (const facility of facilities) {
      map.set(this.normalizeText(facility.title), facility);
    }

    return map;
  }

  private extractSceneId(urlValue: string): string | null {
    try {
      const trimmed = urlValue.trim();
      const candidate = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      const parsed = new URL(candidate);
      const sceneId =
        parsed.searchParams.get('startID') ?? parsed.searchParams.get('startId');
      return sceneId ? sceneId.trim() : null;
    } catch (error) {
      this.logger.warn(`URL 파싱 실패: ${urlValue}`);
      return null;
    }
  }

  private normalizeText(value: string | undefined): string {
    return (value ?? '').replace(/\s+/g, '').trim().toLowerCase();
  }

  private looksLikeUrl(value: string): boolean {
    return /^https?:\/\//i.test(value.trim());
  }
}
