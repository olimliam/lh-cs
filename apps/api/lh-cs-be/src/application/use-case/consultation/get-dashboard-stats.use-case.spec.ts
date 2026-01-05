import { GetDashboardStatsUseCase } from './get-dashboard-stats.use-case';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import { ConsultationStatsQuery } from '@/application/dto/query';
import { CustomException } from '@/common/exception/custom.exception';

describe('GetDashboardStatsUseCase', () => {
  let useCase: GetDashboardStatsUseCase;
  let queryRepository: jest.Mocked<ConsultationQueryRepository>;
  const stats: ConsultationStatsQuery = {
    totalActive: 5,
    waitingRooms: 2,
    consultingRooms: 3,
    withVisitorRooms: 4,
    todayCreated: 1,
    monthlyCompleted: 10,
  };

  beforeEach(() => {
    queryRepository = {
      getConsultationStats: jest.fn(),
    } as unknown as jest.Mocked<ConsultationQueryRepository>;

    useCase = new GetDashboardStatsUseCase(queryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('대시보드 통계를 반환한다', async () => {
    queryRepository.getConsultationStats.mockResolvedValue(stats);

    const result = await useCase.execute('1');

    expect(result.totalActive).toBe(5);
  });

  it('관리자 전체 조회 시 userId 없이 호출할 수 있다', async () => {
    queryRepository.getConsultationStats.mockResolvedValue(stats);

    const result = await useCase.execute();

    expect(result.consultingRooms).toBe(3);
    expect(queryRepository.getConsultationStats).toHaveBeenCalledWith(
      undefined
    );
  });

  it('통계 조회 실패 시 예외를 던진다', async () => {
    queryRepository.getConsultationStats.mockRejectedValue(new Error('db'));

    await expect(useCase.execute('1')).rejects.toBeInstanceOf(
      CustomException
    );
  });
});
