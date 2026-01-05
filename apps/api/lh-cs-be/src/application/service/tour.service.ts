import { HttpStatus, Injectable } from '@nestjs/common';
import { TourRepository } from '../../infrastructure/repository/tour.repository';
import { CreateTourCommand } from '../dto/command/create-tour.command';
import { UpdateTourCommand } from '../dto/command/update-tour.command';
import { TourResponse } from '../../presentation/dto/response/tour.response';
import { CustomException } from '@/common/exception/custom.exception';
import { TourErrorCode } from '@/common/exception/error';
import { DataSource } from 'typeorm';

@Injectable()
export class TourService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly tourRepository: TourRepository
  ) {}

  /**
   * 투어 생성
   */
  async createTour(createDto: CreateTourCommand): Promise<TourResponse> {
    return this.dataSource.transaction(async (manager) => {
      const exists = await this.tourRepository.existsByTourId(
        createDto.tourId,
        undefined,
        manager
      );
      if (exists) {
        throw new CustomException(
          TourErrorCode.TOUR_ALREADY_EXISTS,
          HttpStatus.CONFLICT
        );
      }

      const tour = await this.tourRepository.create(createDto, manager);
      return TourResponse.fromEntity(tour);
    });
  }

  /**
   * 모든 투어 조회
   */
  async getAllTours(isActive?: boolean): Promise<TourResponse[]> {
    const tours = await this.tourRepository.findAll(isActive);
    return TourResponse.fromEntities(tours);
  }

  /**
   * ID로 투어 조회
   */
  async getTourById(id: string): Promise<TourResponse> {
    const tour = await this.tourRepository.findById(id);
    if (!tour) {
      throw new CustomException(TourErrorCode.TOUR_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return TourResponse.fromEntity(tour);
  }

  /**
   * tourId로 투어 조회
   */
  async getTourByTourId(tourId: string): Promise<TourResponse> {
    const tour = await this.tourRepository.findByTourId(tourId);
    if (!tour) {
      throw new CustomException(TourErrorCode.TOUR_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return TourResponse.fromEntity(tour);
  }

  /**
   * 투어 업데이트
   */
  async updateTour(
    id: string,
    updateDto: UpdateTourCommand
  ): Promise<TourResponse> {
    return this.dataSource.transaction(async (manager) => {
      const existingTour = await this.tourRepository.findById(id, manager);
      if (!existingTour) {
        throw new CustomException(
          TourErrorCode.TOUR_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      if (updateDto.tourId) {
        const exists = await this.tourRepository.existsByTourId(
          updateDto.tourId,
          id,
          manager
        );
        if (exists) {
          throw new CustomException(
            TourErrorCode.TOUR_ALREADY_EXISTS,
            HttpStatus.CONFLICT
          );
        }
      }

      const updatedTour = await this.tourRepository.update(
        id,
        updateDto,
        manager
      );
      if (!updatedTour) {
        throw new CustomException(
          TourErrorCode.TOUR_UPDATE_FAILED,
          HttpStatus.NOT_FOUND
        );
      }

      return TourResponse.fromEntity(updatedTour);
    });
  }

  /**
   * 투어 삭제 (소프트 삭제)
   */
  async deleteTour(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const tour = await this.tourRepository.findById(id, manager);
      if (!tour) {
        throw new CustomException(
          TourErrorCode.TOUR_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      await this.tourRepository.delete(id, manager);
    });
  }

  /**
   * 투어 완전 삭제
   */
  async hardDeleteTour(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const tour = await this.tourRepository.findById(id, manager);
      if (!tour) {
        throw new CustomException(
          TourErrorCode.TOUR_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      await this.tourRepository.hardDelete(id, manager);
    });
  }
}
