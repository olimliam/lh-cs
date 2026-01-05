import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from '../../application/service/auth.service';
import { PhoneVerificationService } from '@/application/service/phone-verification.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { LoginRequest } from '../dto/request/login.request';
import { RegisterRequest } from '../dto/request/register.request';
import { SendPhoneCodeRequest } from '../dto/request/send-phone-code.request';
import { VerifyPhoneCodeRequest } from '../dto/request/verify-phone-code.request';
import { LoginVerifyPhoneCodeRequest } from '../dto/request/login-verify-phone-code.request';
import { AuthResponse } from '../dto/response/auth.response';
import { CommonResponse } from '../../common/dto/common-response.dto';
import { resolveClientIp } from '@/common/utils/ip-utils';
import { CsrfGuard } from '@/common/guard/csrf.guard';
import {
  SendPhoneCodeDataResponse,
  VerifyPhoneCodeDataResponse,
} from '../dto/response/phone-verification.response';
import { RegisterResponse } from '../dto/response/register.response';
import { RegisterCodeRemainingResponse } from '../dto/response/register-code-remaining.response';
import { AuthSessionService } from '@/application/service/auth-session.service';

@ApiTags('Auth')
@ApiExtraModels(
  CommonResponse,
  AuthResponse,
  SendPhoneCodeDataResponse,
  VerifyPhoneCodeDataResponse,
  RegisterResponse,
  RegisterCodeRemainingResponse
)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authSessionService: AuthSessionService,
    private readonly phoneVerificationService: PhoneVerificationService
  ) {}

  @Post('register/send-code')
  @ApiOperation({ summary: '회원가입 전화번호 인증번호 발송' })
  @ApiOkResponse({
    description: '인증번호 발송 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(SendPhoneCodeDataResponse) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 전화번호 형식' })
  async sendVerificationCode(
    @Body() sendCodeRequest: SendPhoneCodeRequest
  ): Promise<CommonResponse<SendPhoneCodeDataResponse>> {
    const { expiresAt } =
      await this.phoneVerificationService.generateVerificationCode(
        sendCodeRequest.phoneNumber
      );

    return CommonResponse.success(
      { expiresAt },
      undefined,
      '인증번호를 발송했습니다.'
    );
  }

  @Post('login/send-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '로그인 2차 인증번호 발송' })
  @ApiOkResponse({
    description: '로그인용 인증번호 발송 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(SendPhoneCodeDataResponse) },
          },
        },
      ],
    },
  })
  async sendLoginVerificationCode(
    @CurrentUser() user: any
  ): Promise<CommonResponse<SendPhoneCodeDataResponse>> {
    const { expiresAt } =
      await this.phoneVerificationService.generateVerificationCodeForExistingUser(
        user.id
      );

    return CommonResponse.success(
      { expiresAt },
      undefined,
      '인증번호를 발송했습니다.'
    );
  }

  @Post('login/verify-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '로그인 2차 인증번호 검증' })
  @ApiOkResponse({
    description: '로그인용 인증 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(VerifyPhoneCodeDataResponse) },
          },
        },
      ],
    },
  })
  async verifyLoginCode(
    @CurrentUser() user: any,
    @Body() verifyRequest: LoginVerifyPhoneCodeRequest
  ): Promise<CommonResponse<VerifyPhoneCodeDataResponse>> {
    const verified =
      await this.phoneVerificationService.verifyCodeForExistingUser(
        user.id,
        verifyRequest.verificationCode
      );

    return CommonResponse.success(
      { verified },
      undefined,
      verified
        ? '전화번호 인증이 완료되었습니다.'
        : '전화번호 인증에 실패했습니다.'
    );
  }

  @Get('register/send-code/remaining-time')
  @ApiOperation({ summary: '회원가입 전화번호 인증 남은 시간 조회' })
  @ApiOkResponse({
    description: '남은 시간 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(RegisterCodeRemainingResponse) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 전화번호 형식' })
  @ApiResponse({ status: 404, description: '인증번호가 존재하지 않음' })
  async getRegisterCodeRemainingTime(
    @Query('phoneNumber') phoneNumber?: string
  ): Promise<CommonResponse<RegisterCodeRemainingResponse>> {
    if (!phoneNumber) {
      throw new BadRequestException('phoneNumber 쿼리 파라미터는 필수입니다.');
    }

    const remaining =
      await this.phoneVerificationService.getRemainingTime(phoneNumber);

    return CommonResponse.success(
      RegisterCodeRemainingResponse.from(remaining)
    );
  }

  @Post('register/verify-code')
  @ApiOperation({ summary: '회원가입 전화번호 인증번호 검증' })
  @ApiOkResponse({
    description: '인증 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(VerifyPhoneCodeDataResponse) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: '유효하지 않은 인증번호' })
  async verifyPhoneCode(
    @Body() verifyRequest: VerifyPhoneCodeRequest
  ): Promise<CommonResponse<VerifyPhoneCodeDataResponse>> {
    const verified = await this.phoneVerificationService.verifyCode(
      verifyRequest.phoneNumber,
      verifyRequest.verificationCode
    );

    return CommonResponse.success(
      { verified },
      undefined,
      verified
        ? '전화번호 인증이 완료되었습니다.'
        : '전화번호 인증에 실패했습니다.'
    );
  }

  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiCreatedResponse({
    description: '회원가입 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(RegisterResponse) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async register(
    @Body() registerDto: RegisterRequest
  ): Promise<CommonResponse<RegisterResponse>> {
    const result = await this.authService.register(registerDto);
    return CommonResponse.success(
      result,
      undefined,
      '회원가입 신청이 완료되었습니다. 승인 후 이용이 가능합니다.'
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({
    description: '로그인 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Login successful' },
        data: { $ref: getSchemaPath(AuthResponse) },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() loginDto: LoginRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const ipAddress = resolveClientIp(req);
    const userAgent = req.get('User-Agent');

    const result = await this.authService.login(loginDto, ipAddress, userAgent);
    await this.authSessionService.establishSession(req, res, {
      userId: result.user.id,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: result.accessToken,
        passwordChangeRequired: result.passwordChangeRequired,
        user: result.user,
      },
    };
  }

  @Post('refresh')
  @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 재발급 (쿠키 기반)' })
  @ApiOkResponse({
    description: '토큰 재발급 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(AuthResponse) },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Refresh token not found in cookies',
  })
  @ApiResponse({ status: 401, description: '유효하지 않은 refresh token' })
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    // HttpOnly 쿠키에서 refreshToken 가져오기
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found in cookies');
    }

    const result = await this.authService.refreshTokens(refreshToken);
    await this.authSessionService.establishSession(req, res, {
      userId: result.user.id,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    return {
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        accessToken: result.accessToken,
        passwordChangeRequired: result.passwordChangeRequired,
        user: result.user,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그아웃 (쿠키 기반)' })
  @ApiOkResponse({
    description: '로그아웃 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Logout successful' },
      },
    },
  })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    await this.authSessionService.clearSession(req, res);

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '전체 세션 로그아웃' })
  @ApiOkResponse({
    description: '전체 세션 로그아웃 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'All sessions logged out successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async logoutAll(
    @CurrentUser() user: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.logoutAll(user.id);

    await this.authSessionService.clearSession(req, res);

    return {
      success: true,
      message: 'All sessions logged out successfully',
    };
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '토큰 유효성 검증' })
  @ApiResponse({
    status: 200,
    description: '토큰 유효함',
    schema: {
      example: {
        success: true,
        message: 'Token is valid',
        data: {
          isValid: true,
          userId: '12345',
          username: 'user123',
          expiresAt: '2024-01-01T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '토큰 유효하지 않음' })
  @HttpCode(HttpStatus.OK)
  async verifyToken(@CurrentUser() user: any, @Req() req: Request) {
    try {
      // JwtAuthGuard가 통과했다면 토큰이 유효함
      const accessToken = req.headers.authorization?.replace('Bearer ', '');
      const data = this.authSessionService.buildTokenVerificationPayload(
        accessToken,
        req,
        user
      );

      return {
        success: true,
        message: 'Token is valid',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Token verification failed',
        data: {
          isValid: false,
          error: error.message,
        },
      };
    }
  }
}
