import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TermsRepository } from '../../infrastructure/repository/terms.repository';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import { UserTermsService } from './user-terms.service';
import { UpdateUserTermsCommand } from '../dto/command/update-user-terms.command';

const createDate = (iso: string) => new Date(iso);

describe('UserTermsService', () => {
  let service: UserTermsService;
  let termsRepository: jest.Mocked<TermsRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  const terms = [
    {
      id: '1',
      title: '필수 약관',
      version: '1.0.0',
      isRequired: 1,
      content: '필수 내용',
      publishedAt: createDate('2024-08-01T00:00:00.000Z'),
    },
    {
      id: '2',
      title: '선택 약관',
      version: '1.0.0',
      isRequired: 0,
      content: '선택 내용',
      publishedAt: createDate('2024-08-01T00:00:00.000Z'),
    },
  ] as any;

  const user = {
    id: 'user-1',
    isConfirmedTerms: true,
    createdAt: createDate('2024-08-01T01:00:00.000Z'),
    updatedAt: createDate('2024-08-11T09:00:00.000Z'),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTermsService,
        {
          provide: TermsRepository,
          useValue: {
            findAllPublished: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserTermsService>(UserTermsService);
    termsRepository = module.get(TermsRepository);
    userRepository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getUserTermsStatus', () => {
    it('should return terms with confirmation status derived from user entity', async () => {
      termsRepository.findAllPublished.mockResolvedValue(terms);
      userRepository.findById.mockResolvedValue(user);

      const result = await service.getUserTermsStatus('user-1');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '1',
        isRequired: true,
        agreedAt: user.updatedAt,
      });
      expect(result[1]).toMatchObject({
        id: '2',
        isRequired: false,
        agreedAt: null,
      });
    });

    it('should throw when user is not found', async () => {
      termsRepository.findAllPublished.mockResolvedValue(terms);
      userRepository.findById.mockResolvedValue(null);

      await expect(service.getUserTermsStatus('missing')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('updateUserTerms', () => {
    beforeEach(() => {
      termsRepository.findAllPublished.mockResolvedValue(terms);
    });

    it('should throw when invalid term IDs are provided', async () => {
      const command = new UpdateUserTermsCommand('user-1', [
        { termsId: '999', agreed: true },
      ]);

      await expect(service.updateUserTerms(command)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw when required terms are not agreed', async () => {
      const command = new UpdateUserTermsCommand('user-1', [
        { termsId: '1', agreed: false },
      ]);

      await expect(service.updateUserTerms(command)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should update user confirmation flag when required terms are agreed', async () => {
      const command = new UpdateUserTermsCommand('user-1', [
        { termsId: '1', agreed: true },
      ]);

      userRepository.update.mockResolvedValue({
        ...user,
        isConfirmedTerms: true,
      });

      const result = await service.updateUserTerms(command);

      expect(userRepository.update).toHaveBeenCalledWith('user-1', {
        isConfirmedTerms: true,
      });
      expect(result[0]).toMatchObject({
        id: '1',
        agreedAt: expect.any(Date),
      });
    });
  });
});
