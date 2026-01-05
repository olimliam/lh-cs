import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TourFacilityEntity } from './entity/tour-facility.entity';

@Injectable()
export class TourFacilityRepository {
  constructor(
    @InjectRepository(TourFacilityEntity)
    private readonly tourFacilityRepo: Repository<TourFacilityEntity>
  ) {}

  private getRepository(
    manager?: EntityManager
  ): Repository<TourFacilityEntity> {
    return manager
      ? manager.getRepository(TourFacilityEntity)
      : this.tourFacilityRepo;
  }

  /**
   * 투어 시설 생성
   */
  async create(
    data: Partial<TourFacilityEntity>,
    manager?: EntityManager
  ): Promise<TourFacilityEntity> {
    const repo = this.getRepository(manager);
    const tourFacility = repo.create(data);
    return await repo.save(tourFacility);
  }

  /**
   * ID로 투어 시설 조회
   */
  async findById(
    id: string,
    manager?: EntityManager
  ): Promise<TourFacilityEntity | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { id },
      relations: ['tour', 'facility'],
    });
  }

  /**
   * 투어별 시설 목록 조회
   */
  async findByTourId(
    tourId: string,
    manager?: EntityManager
  ): Promise<TourFacilityEntity[]> {
    const repo = this.getRepository(manager);
    return await repo.find({
      where: { tourId, isActive: true },
      relations: ['facility'],
      order: { displayOrder: 'ASC' },
    });
  }

  async findActiveByTourAndFacility(
    tourId: string,
    facilityId: string,
    manager?: EntityManager
  ): Promise<TourFacilityEntity | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { tourId, facilityId, isActive: true },
      relations: ['facility'],
    });
  }

  /**
   * 투어의 기본 시작 시설 조회
   */
  async findDefaultStartByTourId(
    tourId: string,
    manager?: EntityManager
  ): Promise<TourFacilityEntity | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { tourId, isDefaultStart: true, isActive: true },
      relations: ['facility'],
    });
  }

  /**
   * 특정 투어에서 Scene ID로 조회
   */
  async findByTourIdAndSceneId(
    tourId: string,
    sceneId: string,
    manager?: EntityManager
  ): Promise<TourFacilityEntity | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { tourId, sceneId, isActive: true },
      relations: ['facility'],
    });
  }

  /**
   * 투어 시설 업데이트
   */
  async update(
    id: string,
    data: Partial<TourFacilityEntity>,
    manager?: EntityManager
  ): Promise<TourFacilityEntity | null> {
    const repo = this.getRepository(manager);
    await repo.update({ id }, data);
    return await this.findById(id, manager);
  }

  /**
   * 투어에서 시설 제거 (소프트 삭제)
   */
  async softDelete(id: string, manager?: EntityManager): Promise<void> {
    const repo = this.getRepository(manager);
    await repo.update({ id }, { isActive: false });
  }

  /**
   * 투어의 기본 시작점 초기화 (다른 시설을 기본으로 설정하기 전)
   */
  async clearDefaultStart(
    tourId: string,
    manager?: EntityManager
  ): Promise<void> {
    const repo = this.getRepository(manager);
    await repo.update(
      { tourId, isDefaultStart: true },
      { isDefaultStart: false }
    );
  }

  /**
   * 투어 시설 순서 변경
   */
  async updateDisplayOrders(
    updates: Array<{ id: string; displayOrder: number }>,
    manager?: EntityManager
  ): Promise<void> {
    const repo = this.getRepository(manager);
    for (const update of updates) {
      await repo.update(
        { id: update.id },
        {
          displayOrder: update.displayOrder,
        }
      );
    }
  }

  /**
   * 투어-시설-Scene 중복 체크
   */
  async existsByTourFacilityScene(
    tourId: string,
    facilityId: string,
    sceneId: string,
    excludeId?: string,
    manager?: EntityManager
  ): Promise<boolean> {
    const repo = this.getRepository(manager);
    const queryBuilder = repo
      .createQueryBuilder('tf')
      .where('tf.tourId = :tourId', { tourId })
      .andWhere('tf.facilityId = :facilityId', { facilityId })
      .andWhere('tf.sceneId = :sceneId', { sceneId })
      .andWhere('tf.isActive = :isActive', { isActive: true });

    if (excludeId) {
      queryBuilder.andWhere('tf.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * 투어의 활성 시설 개수 조회
   */
  async countActiveFacilitiesByTour(
    tourId: string,
    manager?: EntityManager
  ): Promise<number> {
    const repo = this.getRepository(manager);
    return await repo.count({
      where: { tourId, isActive: true },
    });
  }
}
