import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ZoomVideoSdkService } from './zoom-video-sdk.service';
import { ZoomSessionLogRepository } from '@/infrastructure/repository/zoom-session-log.repository';

describe('ZoomVideoSdkService.encodeSessionId', () => {
  let service: ZoomVideoSdkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZoomVideoSdkService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('dummy'),
          },
        },
        {
          provide: HttpService,
          useValue: {},
        },
        {
          provide: ZoomSessionLogRepository,
          useValue: {
            upsertLog: jest.fn(),
            findOpenByConsultationId: jest.fn(),
            markClosed: jest.fn(),
            markError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ZoomVideoSdkService>(ZoomVideoSdkService);
  });

  const encode = (id: string) =>
    // @ts-expect-error private method access for test
    service.encodeSessionId(id);

  it('returns original when no special characters', () => {
    expect(encode('1z7u2KlDQhegqZrGMkw1Sg==')).toBe('1z7u2KlDQhegqZrGMkw1Sg==');
  });

  it('double-encodes when id contains plus', () => {
    expect(encode('cc2i1PmPS3atMXA+RB8rQw==')).toBe(
      'cc2i1PmPS3atMXA%252BRB8rQw%253D%253D'
    );
  });

  it('double-encodes when id contains slash anywhere', () => {
    expect(encode('4//M4niJTOCN0Sx/yjwA6w==')).toBe(
      '4%252F%252FM4niJTOCN0Sx%252FyjwA6w%253D%253D'
    );
  });

  it('double-encodes when id starts with slash', () => {
    expect(encode('/abc==')).toBe('%252Fabc%253D%253D');
  });
});
