import { HttpStatus, Injectable } from '@nestjs/common';
import { FacilityRepository } from '../../infrastructure/repository/facility.repository';
import { CreateFacilityCommand } from '../dto/command/create-facility.command';
import { FacilityResponse } from '../../presentation/dto/response/facility.response';
import { UpdateFacilityCommand } from '../dto/command/update-facility.command';
import { CustomException } from '@/common/exception/custom.exception';
import { FacilityErrorCode } from '@/common/exception/error';
import { DataSource } from 'typeorm';

@Injectable()
export class FacilityService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly facilityRepository: FacilityRepository
  ) {}

  /**
   * 설비 생성
   */
  async createFacility(
    createDto: CreateFacilityCommand
  ): Promise<FacilityResponse> {
    return this.dataSource.transaction(async (manager) => {
      const facility = await this.facilityRepository.create(createDto, manager);
      return FacilityResponse.fromEntity(facility);
    });
  }

  /**
   * 모든 설비 조회
   */
  async getAllFacilities(isActive?: boolean): Promise<FacilityResponse[]> {
    const facilities = await this.facilityRepository.findAll(isActive);
    return FacilityResponse.fromEntities(facilities);
  }

  /**
   * ID로 설비 조회
   */
  async getFacilityById(id: string): Promise<FacilityResponse> {
    const facility = await this.facilityRepository.findById(id);
    if (!facility) {
      throw new CustomException(
        FacilityErrorCode.FACILITY_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return FacilityResponse.fromEntity(facility);
  }

  /**
   * 모든 활성 시설 조회 (Scene 정보는 tour_facilities 테이블에서 관리)
   */
  async getAllActiveFacilities(): Promise<FacilityResponse[]> {
    const facilities = await this.facilityRepository.findAllActive();
    return FacilityResponse.fromEntities(facilities);
  }

  /**
   * 설비 업데이트
   */
  async updateFacility(
    id: string,
    updateDto: UpdateFacilityCommand
  ): Promise<FacilityResponse> {
    return this.dataSource.transaction(async (manager) => {
      const existingFacility = await this.facilityRepository.findById(
        id,
        manager
      );
      if (!existingFacility) {
        throw new CustomException(
          FacilityErrorCode.FACILITY_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      const updatedFacility = await this.facilityRepository.update(
        id,
        updateDto,
        manager
      );
      if (!updatedFacility) {
        throw new CustomException(
          FacilityErrorCode.FACILITY_UPDATE_FAILED,
          HttpStatus.NOT_FOUND
        );
      }

      return FacilityResponse.fromEntity(updatedFacility);
    });
  }

  /**
   * 설비 삭제 (소프트 삭제)
   */
  async deleteFacility(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const facility = await this.facilityRepository.findById(id, manager);
      if (!facility) {
        throw new CustomException(
          FacilityErrorCode.FACILITY_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      await this.facilityRepository.delete(id, manager);
    });
  }

  /**
   * 설비 완전 삭제
   */
  async hardDeleteFacility(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const facility = await this.facilityRepository.findById(id, manager);
      if (!facility) {
        throw new CustomException(
          FacilityErrorCode.FACILITY_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      await this.facilityRepository.hardDelete(id, manager);
    });
  }
}
