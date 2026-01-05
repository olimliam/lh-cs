import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { VisionAiAuthTokenRepository } from '@/infrastructure/repository/vision-ai-auth-token.repository';
import { VisionAiSessionService } from './vision-ai-session.service';

describe('VisionAiSessionService', () => {
  let service: VisionAiSessionService;
  let repository: VisionAiAuthTokenRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        VisionAiSessionService,
        {
          provide: ConfigService,
          useValue: new ConfigService({
            VISION_AI_PARENT_ORIGIN: 'https://parent.example.com',
            VISION_AI_CHILD_ORIGIN: 'https://child.example.com',
            VISION_AI_APP_ID: 'vision-ai-app',
            VISION_AI_EPT_TTL_SECONDS: '30',
            VISION_AI_ST_TTL_SECONDS: '300',
            JWT_VISION_AI_SECRET: 'test-secret',
          }),
        },
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'test-secret' }),
        },
        {
          provide: VisionAiAuthTokenRepository,
          useValue: {
            createEptRecord: jest.fn(),
            consumeEpt: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(VisionAiSessionService);
    repository = moduleRef.get(VisionAiAuthTokenRepository);
  });

  it('should mint Vision AI EPT with configured defaults', async () => {
    const result = await service.mintEphemeralToken('user-1');

    expect(result.token).toBeDefined();
    expect(result.expiresIn).toBe(30);
    expect(repository.createEptRecord).toHaveBeenCalledTimes(1);
  });

  it('should verify and consume Vision AI EPT', async () => {
    const { token } = await service.mintEphemeralToken('user-2');
    const payload = await service.verifyEphemeralToken(token);
    expect(payload.sub).toBe('user-2');

    await expect(
      service.consumeEphemeralToken(payload.jti)
    ).resolves.toBeUndefined();
    expect(repository.consumeEpt).toHaveBeenCalledWith(
      payload.jti,
      expect.any(Date)
    );
  });

  it('should issue Vision AI session token from payload', async () => {
    const { token: ept } = await service.mintEphemeralToken('user-3');
    const payload = await service.verifyEphemeralToken(ept);
    const { token: st, expiresIn } = await service.issueSessionToken(payload);

    expect(st).toBeDefined();
    expect(expiresIn).toBe(300);
    const verified = await service.verifySessionToken(st);
    expect(verified.sub).toBe('user-3');
  });
});
