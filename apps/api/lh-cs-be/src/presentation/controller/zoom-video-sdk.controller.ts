import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZoomVideoSdkService } from '@/application/zoom/zoom-video-sdk.service';
import { CreateVideoTokenRequestDto } from '../dto/request/create-video-token.request';
import { CreateVideoTokenResponseDto } from '../dto/response/create-video-token.response';
import { EndZoomSessionDto } from '../dto/request/end-zoom-session.request';
import { EncodeZoomSessionDto } from '../dto/request/encode-zoom-session.request';
import { LogZoomSessionRequestDto } from '../dto/request/log-zoom-session.request';
import { ZoomSessionLogResponseDto } from '../dto/response/zoom-session-log.response';

@ApiTags('Zoom Video SDK')
@Controller('zoom')
export class ZoomVideoSdkController {
  constructor(private readonly zoomVideoSdkService: ZoomVideoSdkService) {}

  @Post('video-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Zoom Video SDK 토큰 발급',
    description:
      'consultationId와 역할 정보를 바탕으로 Zoom Video SDK JWT를 생성합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CreateVideoTokenResponseDto,
  })
  createVideoToken(
    @Body() body: CreateVideoTokenRequestDto
  ): CreateVideoTokenResponseDto {
    return this.zoomVideoSdkService.createVideoToken({
      consultationId: body.consultationId,
      role: body.role,
      userId: body.userId,
      userName: body.userName,
    });
  }

  @Post('session/log')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Zoom 세션 매핑 로그 저장',
    description:
      'consultationId와 zoomSessionId를 매핑해 세션 종료 배치에서 사용할 수 있도록 저장합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ZoomSessionLogResponseDto,
  })
  async logSession(
    @Body() body: LogZoomSessionRequestDto
  ): Promise<ZoomSessionLogResponseDto> {
    const log = await this.zoomVideoSdkService.logSessionMapping({
      consultationId: body.consultationId,
      zoomSessionId: body.zoomSessionId,
    });
    return ZoomSessionLogResponseDto.from(log);
  }

  @Delete('session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Zoom Video SDK 세션 삭제',
    description:
      '프런트에서 회의 종료 시 Zoom Video SDK 세션을 삭제하기 위해 Zoom API를 호출합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '세션 삭제 성공',
  })
  async deleteSession(
    @Body() body: EndZoomSessionDto
  ): Promise<{ encodedSessionId: string }> {
    return this.zoomVideoSdkService.deleteSession(body.sessionId);
  }

  @Post('session/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Zoom Video SDK 세션 종료',
    description:
      '프런트에서 회의 종료 시 Zoom Video SDK 세션 상태를 end로 변경해 세션을 종료합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '세션 종료 성공',
  })
  async endSession(
    @Body() body: EndZoomSessionDto
  ): Promise<{ encodedSessionId: string }> {
    return this.zoomVideoSdkService.endSession(body.sessionId);
  }

  @Post('session/encode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Zoom 세션 ID 인코딩 결과 반환 (테스트용)',
    description:
      '세션 ID를 Zoom API 요구사항에 맞게 필요한 경우 2중 URL 인코딩하여 반환합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '인코딩 결과 반환',
  })
  async encodeSessionId(
    @Body() body: EncodeZoomSessionDto
  ): Promise<{ encodedSessionId: string }> {
    return this.zoomVideoSdkService.encodeSessionIdForTest(body.sessionId);
  }
}
