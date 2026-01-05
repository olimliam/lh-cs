import { ChangePasswordCommand } from '@/application/dto/command/change-password.command';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserTermsService } from '../../application/service/user-terms.service';
import { UserService } from '../../application/service/user.service';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import {
  ChangePasswordRequest,
  UpdateProfileFormRequest,
  UpdateProfileRequest,
  UpdateUserTermsRequest,
} from '../dto/request';
import {
  ProfileResponse,
  UpdateProfileResponse,
  UserTermsListResponse,
} from '../dto/response';
import { CustomException } from '../../common/exception/custom.exception';
import { UserErrorCode } from '../../common/exception/error';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userTermsService: UserTermsService
  ) {}

  @Get('profile')
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiOkResponse({ description: '프로필 조회 성공', type: ProfileResponse })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.userService.getProfileWithPhone(user.id);

    return ProfileResponse.success(profile.user, profile.phoneNumber);
  }

  @Put('profile')
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiOperation({ summary: '내 프로필 수정' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '프로필 수정 요청',
    type: UpdateProfileFormRequest,
  })
  @ApiOkResponse({
    description: '프로필 수정 성공',
    type: UpdateProfileResponse,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileRequest,
    @UploadedFile() profileImage?: Express.Multer.File
  ) {
    const updatedUser = await this.userService.updateProfile(
      user.id,
      updateProfileDto,
      profileImage
    );

    const profile = this.userService.enrichWithPhone(updatedUser);
    const updatedAt =
      profile.user.updatedAt instanceof Date
        ? profile.user.updatedAt.toISOString()
        : profile.user.updatedAt;
    return {
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
      data: {
        id: profile.user.id,
        username: profile.user.username,
        name: profile.user.name,
        phoneNumber: profile.phoneNumber,
        profileImageUrl: profile.user.profileImageUrl,
        department: profile.user.department ?? null,
        updatedAt,
      },
    };
  }

  @Post('change-password')
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({ status: 200, description: '비밀번호 변경 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordRequest
  ) {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new CustomException(
        UserErrorCode.USER_PASSWORD_CONFIRMATION_MISMATCH,
        HttpStatus.BAD_REQUEST
      );
    }

    await this.userService.changePassword(
      new ChangePasswordCommand(
        user.id,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword
      )
    );

    return {
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };
  }

  @Get('sessions')
  @ApiOperation({ summary: '내 세션 목록 조회' })
  @ApiResponse({ status: 200, description: '세션 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getSessions(@CurrentUser() user: any) {
    const sessions = await this.userService.getUserSessions(user.id);
    return {
      success: true,
      data: sessions,
    };
  }

  @Get('terms')
  @ApiOperation({ summary: '내 약관 동의 현황 조회' })
  @ApiResponse({
    status: 200,
    description: '약관 동의 현황 조회 성공',
    type: UserTermsListResponse,
  })
  async getUserTerms(@CurrentUser() user: any) {
    const status = await this.userTermsService.getUserTermsStatus(user.id);
    return UserTermsListResponse.from(status);
  }

  @Put('terms')
  @ApiOperation({ summary: '약관 동의 상태 업데이트' })
  @ApiResponse({
    status: 200,
    description: '약관 동의 상태 업데이트 성공',
    type: UserTermsListResponse,
  })
  async updateUserTerms(
    @CurrentUser() user: any,
    @Body() request: UpdateUserTermsRequest
  ) {
    const status = await this.userTermsService.updateUserTerms(
      request.toCommand(user.id)
    );

    return UserTermsListResponse.from(status);
  }
}
