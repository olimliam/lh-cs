import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TourFacilityRepository } from '../../infrastructure/repository/tour-facility.repository';
import { TourRepository } from '../../infrastructure/repository/tour.repository';
import { FacilityRepository } from '../../infrastructure/repository/facility.repository';
import { AddFacilityToTourCommand } from '../dto/command/add-facility-to-tour.command';
import { UpdateTourFacilityCommand } from '../dto/command/update-tour-facility.command';
import { ReorderTourFacilitiesCommand } from '../dto/command/reorder-tour-facilities.command';
import { TourFacilityResponse } from '../../presentation/dto/response/tour-facility.response';
import { DataSource } from 'typeorm';

@Injectable()
export class TourFacilityService {
  constructor(
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
    private readonly tourFacilityRepository: TourFacilityRepository,
    private readonly tourRepository: TourRepository,
    private readonly facilityRepository: FacilityRepository
  ) {}

  /**
   * 투어에 시설 추가
   */
  async addFacilityToTour(
    addDto: AddFacilityToTourCommand
  ): Promise<TourFacilityResponse> {
    this.logger.log('addFacilityToTour called', addDto);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const tour = await this.tourRepository.findById(addDto.tourId, manager);
        if (!tour) {
          throw new NotFoundException('투어를 찾을 수 없습니다.');
        }

        const facility = await this.facilityRepository.findById(
          addDto.facilityId,
          manager
        );
        if (!facility) {
          throw new NotFoundException('시설을 찾을 수 없습니다.');
        }

        const exists =
          await this.tourFacilityRepository.existsByTourFacilityScene(
            addDto.tourId,
            addDto.facilityId,
            addDto.sceneId,
            undefined,
            manager
          );
        if (exists) {
          throw new ConflictException(
            '해당 투어의 Scene ID에 이미 동일한 시설이 배치되어 있습니다.'
          );
        }

        if (addDto.isDefaultStart) {
          await this.tourFacilityRepository.clearDefaultStart(
            addDto.tourId,
            manager
          );
        }

        let displayOrder = addDto.displayOrder;
        if (displayOrder === undefined) {
          const facilityCount =
            await this.tourFacilityRepository.countActiveFacilitiesByTour(
              addDto.tourId,
              manager
            );
          displayOrder = facilityCount + 1;
        }

        const tourFacility = await this.tourFacilityRepository.create(
          {
            tourId: addDto.tourId,
            facilityId: addDto.facilityId,
            sceneId: addDto.sceneId,
            cameraPosX: addDto.cameraPosX,
            cameraPosY: addDto.cameraPosY,
            cameraPosZ: addDto.cameraPosZ,
            isDefaultStart: addDto.isDefaultStart || false,
            displayOrder,
            isActive: true,
          },
          manager
        );

        return this.mapToResponseDto(tourFacility, facility);
      });
    } catch (error) {
      this.logger.error('Failed to add facility to tour:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('투어에 시설 추가에 실패했습니다.');
    }
  }

  /**
   * 투어 시설 정보 수정
   */
  async updateTourFacility(
    tourId: string,
    tourFacilityId: string,
    updateDto: UpdateTourFacilityCommand
  ): Promise<TourFacilityResponse> {
    this.logger.log('updateTourFacility called', {
      tourId,
      tourFacilityId,
      updateDto,
    });

    try {
      return await this.dataSource.transaction(async (manager) => {
        const tourFacility = await this.tourFacilityRepository.findById(
          tourFacilityId,
          manager
        );
        if (!tourFacility) {
          throw new NotFoundException('투어 시설을 찾을 수 없습니다.');
        }

        if (tourFacility.tourId !== tourId) {
          throw new BadRequestException('해당 투어에 속하지 않는 시설입니다.');
        }

        if (updateDto.sceneId && updateDto.sceneId !== tourFacility.sceneId) {
          const exists =
            await this.tourFacilityRepository.existsByTourFacilityScene(
              tourFacility.tourId,
              tourFacility.facilityId,
              updateDto.sceneId,
              tourFacilityId,
              manager
            );
          if (exists) {
            throw new ConflictException(
              '해당 투어의 Scene ID에 이미 동일한 시설이 배치되어 있습니다.'
            );
          }
        }

        if (updateDto.isDefaultStart) {
          await this.tourFacilityRepository.clearDefaultStart(
            tourFacility.tourId,
            manager
          );
        }

        const updatedTourFacility = await this.tourFacilityRepository.update(
          tourFacilityId,
          updateDto,
          manager
        );

        if (!updatedTourFacility) {
          throw new NotFoundException('투어 시설 업데이트에 실패했습니다.');
        }

        return this.mapToResponseDto(
          updatedTourFacility,
          updatedTourFacility.facility
        );
      });
    } catch (error) {
      this.logger.error('Failed to update tour facility:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('투어 시설 수정에 실패했습니다.');
    }
  }

  /**
   * 투어에서 시설 제거
   */
  async removeFacilityFromTour(
    tourId: string,
    tourFacilityId: string
  ): Promise<void> {
    this.logger.log('removeFacilityFromTour called', {
      tourId,
      tourFacilityId,
    });

    try {
      await this.dataSource.transaction(async (manager) => {
        const tourFacility = await this.tourFacilityRepository.findById(
          tourFacilityId,
          manager
        );
        if (!tourFacility) {
          throw new NotFoundException('투어 시설을 찾을 수 없습니다.');
        }

        if (tourFacility.tourId !== tourId) {
          throw new BadRequestException('해당 투어에 속하지 않는 시설입니다.');
        }

        const facilityCount =
          await this.tourFacilityRepository.countActiveFacilitiesByTour(
            tourFacility.tourId,
            manager
          );
        if (facilityCount <= 1) {
          throw new BadRequestException(
            '투어에는 최소 1개 이상의 시설이 있어야 합니다.'
          );
        }

        if (tourFacility.isDefaultStart) {
          const otherFacilities =
            await this.tourFacilityRepository.findByTourId(
              tourFacility.tourId,
              manager
            );
          const firstOtherFacility = otherFacilities.find(
            (f) => f.id !== tourFacilityId
          );
          if (firstOtherFacility) {
            await this.tourFacilityRepository.update(
              firstOtherFacility.id,
              {
                isDefaultStart: true,
              },
              manager
            );
          }
        }

        await this.tourFacilityRepository.softDelete(tourFacilityId, manager);
      });

      this.logger.log('Tour facility removed successfully', { tourFacilityId });
    } catch (error) {
      this.logger.error('Failed to remove facility from tour:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('투어에서 시설 제거에 실패했습니다.');
    }
  }

  /**
   * 투어의 시설 목록 조회
   */
  async getTourFacilities(tourId: string): Promise<TourFacilityResponse[]> {
    this.logger.log('getTourFacilities called', { tourId });

    try {
      // 투어 존재 확인
      const tour = await this.tourRepository.findById(tourId);
      if (!tour) {
        throw new NotFoundException('투어를 찾을 수 없습니다.');
      }

      const tourFacilities =
        await this.tourFacilityRepository.findByTourId(tourId);

      return tourFacilities.map((tf) => this.mapToResponseDto(tf, tf.facility));
    } catch (error) {
      this.logger.error('Failed to get tour facilities:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('투어 시설 목록 조회에 실패했습니다.');
    }
  }

  /**
   * tourCdnId로 투어의 시설 목록 조회
   */
  async getTourFacilitiesByCdnId(tourCdnId: string): Promise<TourFacilityResponse[]> {
    this.logger.log('getTourFacilitiesByCdnId called', { tourCdnId });

    try {
      // tourCdnId로 투어 조회
      const tour = await this.tourRepository.findByTourId(tourCdnId);
      if (!tour) {
        throw new NotFoundException('투어를 찾을 수 없습니다.');
      }

      const tourFacilities =
        await this.tourFacilityRepository.findByTourId(tour.id);

      return tourFacilities.map((tf) => this.mapToResponseDto(tf, tf.facility));
    } catch (error) {
      this.logger.error('Failed to get tour facilities by CDN ID:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('투어 시설 목록 조회에 실패했습니다.');
    }
  }

  /**
   * 투어 시설 개별 조회
   */
  async getTourFacilityById(
    tourId: string,
    id: string
  ): Promise<TourFacilityResponse> {
    this.logger.log('getTourFacilityById called', { tourId, id });

    try {
      const tourFacility = await this.tourFacilityRepository.findById(id);
      if (!tourFacility) {
        throw new NotFoundException('투어 시설을 찾을 수 없습니다.');
      }

      // tourId 일치 확인
      if (tourFacility.tourId !== tourId) {
        throw new BadRequestException('해당 투어에 속하지 않는 시설입니다.');
      }

      return this.mapToResponseDto(tourFacility, tourFacility.facility);
    } catch (error) {
      this.logger.error('Failed to get tour facility by id:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('투어 시설 조회에 실패했습니다.');
    }
  }

  /**
   * 투어 시설 순서 변경
   */
  async reorderTourFacilities(
    reorderDto: ReorderTourFacilitiesCommand
  ): Promise<void> {
    this.logger.log('reorderTourFacilities called', reorderDto);

    try {
      await this.dataSource.transaction(async (manager) => {
        const tour = await this.tourRepository.findById(
          reorderDto.tourId,
          manager
        );
        if (!tour) {
          throw new NotFoundException('투어를 찾을 수 없습니다.');
        }

        await this.tourFacilityRepository.updateDisplayOrders(
          reorderDto.facilities,
          manager
        );
      });

      this.logger.log('Tour facilities reordered successfully', reorderDto);
    } catch (error) {
      this.logger.error('Failed to reorder tour facilities:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('투어 시설 순서 변경에 실패했습니다.');
    }
  }

  /**
   * 기본 시작 위치 설정
   */
  async setDefaultStart(tourId: string, tourFacilityId: string): Promise<void> {
    this.logger.log('setDefaultStart called', { tourId, tourFacilityId });

    try {
      await this.dataSource.transaction(async (manager) => {
        const tourFacility = await this.tourFacilityRepository.findById(
          tourFacilityId,
          manager
        );
        if (!tourFacility) {
          throw new NotFoundException('투어 시설을 찾을 수 없습니다.');
        }

        if (tourFacility.tourId !== tourId) {
          throw new BadRequestException('해당 투어에 속하지 않는 시설입니다.');
        }

        await this.tourFacilityRepository.clearDefaultStart(
          tourFacility.tourId,
          manager
        );

        await this.tourFacilityRepository.update(
          tourFacilityId,
          {
            isDefaultStart: true,
          },
          manager
        );
      });

      this.logger.log('Default start set successfully', { tourFacilityId });
    } catch (error) {
      this.logger.error('Failed to set default start:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('기본 시작 위치 설정에 실패했습니다.');
    }
  }

  /**
   * Entity를 Response DTO로 매핑
   */
  private mapToResponseDto(
    tourFacility: any,
    facility?: any
  ): TourFacilityResponse {
    return {
      id: tourFacility.id,
      tourId: tourFacility.tourId,
      facilityId: tourFacility.facilityId,
      facilityTitle: facility?.title || tourFacility.facility?.title || '',
      facilityDescription:
        facility?.description || tourFacility.facility?.description,
      sceneId: tourFacility.sceneId,
      cameraPosX: tourFacility.cameraPosX,
      cameraPosY: tourFacility.cameraPosY,
      cameraPosZ: tourFacility.cameraPosZ,
      isDefaultStart: tourFacility.isDefaultStart,
      displayOrder: tourFacility.displayOrder,
      isActive: tourFacility.isActive,
      type: facility?.type || tourFacility.facility?.type,
      createdAt: tourFacility.createdAt,
      updatedAt: tourFacility.updatedAt,
    };
  }
}
