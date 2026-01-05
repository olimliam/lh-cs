import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '@/common/guard/jwt-auth.guard';
import { CurrentUser } from '@/common/decorator/current-user.decorator';
import { CommonResponse } from '@/common/dto/common-response.dto';
import { VisionAiSessionService } from '@/application/service/vision-ai-session.service';
import { VisionAiProfileService } from '@/application/service/vision-ai-profile.service';
import { VisionAiEptGuard } from '@/common/guard/vision-ai-ept.guard';
import { VisionAiOriginGuard } from '@/common/guard/vision-ai-origin.guard';
import { VisionAiAudienceGuard } from '@/common/guard/vision-ai-audience.guard';
import { VisionAiScopeGuard } from '@/common/guard/vision-ai-scope.guard';
import { VisionAiOneTimeGuard } from '@/common/guard/vision-ai-one-time.guard';
import { VisionAiSessionGuard } from '@/common/guard/vision-ai-session.guard';
import { RequireVisionAiScope } from '@/presentation/decorator/require-vision-ai-scope.decorator';

@ApiTags('External Vision AI')
@ApiExtraModels(CommonResponse)
@Controller('external/v1/vision-ai')
export class ExternalVisionAiController {
  constructor(
    private readonly visionAiSessionService: VisionAiSessionService,
    private readonly visionAiProfileService: VisionAiProfileService
  ) {}

  @Post('mint-ept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '비전AI 외부 창용 Ephemeral Permission Token 발급',
  })
  @ApiOkResponse({
    description: 'EPT 발급 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                eptToken: {
                  type: 'string',
                  description: '비전AI 전용 EPT',
                },
                expiresIn: {
                  type: 'number',
                  example: 30,
                  description: 'EPT 만료 시간(초)',
                },
                audience: { type: 'string', example: 'vision-ai-app' },
                origin: {
                  type: 'string',
                  example: 'https://vision-ai.example.com',
                },
              },
            },
          },
        },
      ],
    },
  })
  async mintVisionAiEpt(@CurrentUser() user: any) {
    const result = await this.visionAiSessionService.mintEphemeralToken(
      user.id
    );
    return CommonResponse.success(
      {
        eptToken: result.token,
        expiresIn: result.expiresIn,
        audience: this.visionAiSessionService.getAudience(),
        origin: this.visionAiSessionService.getChildOrigin(),
      },
      undefined,
      '비전AI 외부 창 임시 권한 토큰을 발급했습니다.'
    );
  }

  @Post('redeem')
  @UseGuards(
    VisionAiEptGuard,
    VisionAiOriginGuard,
    VisionAiAudienceGuard,
    VisionAiScopeGuard,
    VisionAiOneTimeGuard
  )
  @RequireVisionAiScope('profile:nickname.read')
  @ApiBearerAuth('ept-token')
  @ApiOperation({
    summary: 'EPT를 비전AI 전용 세션 토큰으로 교환',
  })
  @ApiOkResponse({
    description: '세션 토큰 발급 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                redeemToken: {
                  type: 'string',
                  description: '비전AI 세션 토큰(ST)',
                },
                expiresIn: {
                  type: 'number',
                  example: 300,
                  description: '세션 토큰 만료 시간(초)',
                },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Scope / Audience / Origin 검증 실패',
  })
  @ApiResponse({
    status: 409,
    description: 'jti 재사용 또는 이미 만료된 EPT',
  })
  async redeem(
    @Req() request: Request
  ): Promise<CommonResponse<{ redeemToken: string; expiresIn: number }>> {
    const payload = request.visionAiEptPayload!;
    const result = await this.visionAiSessionService.issueSessionToken(payload);

    return CommonResponse.success(
      {
        redeemToken: result.token,
        expiresIn: result.expiresIn,
      },
      undefined,
      '비전AI 외부 창 세션 토큰을 발급했습니다.'
    );
  }

  @Get('profile')
  @UseGuards(VisionAiSessionGuard, VisionAiAudienceGuard, VisionAiScopeGuard)
  @RequireVisionAiScope('profile:nickname.read')
  @ApiBearerAuth('redeem-token')
  @ApiOperation({
    summary: '비전AI 외부 창 전용 세션 토큰으로 닉네임 조회',
  })
  @ApiOkResponse({
    description: '닉네임 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                nickname: {
                  type: 'string',
                  example: '홍길동',
                  description: '사용자 닉네임',
                },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Scope/Audience 검증 실패',
  })
  async getNickname(
    @Req() request: Request
  ): Promise<CommonResponse<{ nickname: string }>> {
    const payload = request.visionAiSessionPayload!;
    const nickname = await this.visionAiProfileService.getNickname(payload.sub);

    return CommonResponse.success(
      { nickname },
      undefined,
      '닉네임 조회에 성공했습니다.'
    );
  }
}
