import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TourEntity } from './entity/tour.entity';
import { CreateTourCommand } from '../../application/dto/command/create-tour.command';
import { UpdateTourCommand } from '../../application/dto/command/update-tour.command';

@Injectable()
export class TourRepository {
  constructor(
    @InjectRepository(TourEntity)
    private readonly tourRepo: Repository<TourEntity>
  ) {}

  private getRepository(manager?: EntityManager): Repository<TourEntity> {
    return manager ? manager.getRepository(TourEntity) : this.tourRepo;
  }

  /**
   * 투어 생성
   */
  async create(
    createDto: CreateTourCommand,
    manager?: EntityManager
  ): Promise<TourEntity> {
    const repo = this.getRepository(manager);
    const tour = repo.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });
    return await repo.save(tour);
  }

  /**
   * 모든 투어 조회
   */
  async findAll(
    isActive?: boolean,
    manager?: EntityManager
  ): Promise<TourEntity[]> {
    const repo = this.getRepository(manager);
    const queryBuilder = repo.createQueryBuilder('tour');

    if (isActive !== undefined) {
      queryBuilder.where('tour.isActive = :isActive', { isActive });
    }

    return await queryBuilder.orderBy('tour.createdAt', 'DESC').getMany();
  }

  /**
   * ID로 투어 조회
   */
  async findById(
    id: string,
    manager?: EntityManager
  ): Promise<TourEntity | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { id },
    });
  }

  /**
   * tourId로 투어 조회
   */
  async findByTourId(
    tourCdnId: string,
    manager?: EntityManager
  ): Promise<TourEntity | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { tourCdnId },
    });
  }

  /**
   * 투어 업데이트
   */
  async update(
    id: string,
    updateDto: UpdateTourCommand,
    manager?: EntityManager
  ): Promise<TourEntity | null> {
    const repo = this.getRepository(manager);
    await repo
      .createQueryBuilder()
      .update(TourEntity)
      .set(updateDto)
      .where('id = :id', { id })
      .execute();

    return await this.findById(id, manager);
  }

  /**
   * 투어 삭제 (소프트 삭제)
   */
  async delete(id: string, manager?: EntityManager): Promise<void> {
    const repo = this.getRepository(manager);
    await repo
      .createQueryBuilder()
      .update(TourEntity)
      .set({ isActive: false })
      .where('id = :id', { id })
      .execute();
  }

  /**
   * 투어 완전 삭제
   */
  async hardDelete(id: string, manager?: EntityManager): Promise<void> {
    const repo = this.getRepository(manager);
    await repo.delete({ id });
  }

  /**
   * tourId 중복 체크
   */
  async existsByTourId(
    tourId: string,
    excludeId?: string,
    manager?: EntityManager
  ): Promise<boolean> {
    const repo = this.getRepository(manager);
    const queryBuilder = repo
      .createQueryBuilder('tour')
      .where('tour.tourId = :tourId', { tourId });

    if (excludeId) {
      queryBuilder.andWhere('tour.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }
}
