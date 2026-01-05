import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FacilityEntity } from './entity/facility.entity';
import { CreateFacilityCommand } from '@/application/dto/command/create-facility.command';
import { UpdateFacilityCommand } from '@/application/dto/command/update-facility.command';

@Injectable()
export class FacilityRepository {
  constructor(
    @InjectRepository(FacilityEntity)
    private readonly facilityRepo: Repository<FacilityEntity>
  ) {}

  private getRepository(manager?: EntityManager): Repository<FacilityEntity> {
    return manager ? manager.getRepository(FacilityEntity) : this.facilityRepo;
  }

  /**
   * 설비 생성
   */
  async create(
    createDto: CreateFacilityCommand,
    manager?: EntityManager
  ): Promise<FacilityEntity> {
    const repo = this.getRepository(manager);
    const facility = repo.create({
      title: createDto.title,
      description: createDto.description,
      isActive: createDto.isActive ?? true,
    });
    return await repo.save(facility);
  }

  /**
   * 모든 활성 시설 조회
   */
  async findAllActive(manager?: EntityManager): Promise<FacilityEntity[]> {
    const repo = this.getRepository(manager);
    return await repo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 모든 설비 조회 (활성/비활성 필터링 가능)
   */
  async findAll(
    isActive?: boolean,
    manager?: EntityManager
  ): Promise<FacilityEntity[]> {
    const repo = this.getRepository(manager);
    const queryBuilder = repo.createQueryBuilder('facility');

    if (isActive !== undefined) {
      queryBuilder.where('facility.isActive = :isActive', { isActive });
    }

    return await queryBuilder.orderBy('facility.createdAt', 'DESC').getMany();
  }

  /**
   * ID로 설비 조회
   */
  async findById(
    id: string,
    manager?: EntityManager
  ): Promise<FacilityEntity | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { id },
    });
  }

  /**
   * 설비 업데이트
   */
  async update(
    id: string,
    updateDto: UpdateFacilityCommand,
    manager?: EntityManager
  ): Promise<FacilityEntity | null> {
    const updateData: any = {};

    if (updateDto.title !== undefined) updateData.title = updateDto.title;
    if (updateDto.description !== undefined)
      updateData.description = updateDto.description;
    if (updateDto.isActive !== undefined)
      updateData.isActive = updateDto.isActive;

    const repo = this.getRepository(manager);
    await repo
      .createQueryBuilder()
      .update(FacilityEntity)
      .set(updateData)
      .where('id = :id', { id })
      .execute();

    return await this.findById(id, manager);
  }

  /**
   * 설비 삭제 (소프트 삭제)
   */
  async delete(id: string, manager?: EntityManager): Promise<void> {
    const repo = this.getRepository(manager);
    await repo
      .createQueryBuilder()
      .update(FacilityEntity)
      .set({ isActive: false })
      .where('id = :id', { id })
      .execute();
  }

  /**
   * 설비 완전 삭제
   */
  async hardDelete(id: string, manager?: EntityManager): Promise<void> {
    const repo = this.getRepository(manager);
    await repo.delete({ id });
  }
}
