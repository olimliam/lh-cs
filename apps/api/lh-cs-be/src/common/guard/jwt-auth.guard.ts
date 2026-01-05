import { UserService } from '@/application/service/user.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { AuthErrorCode } from '../exception/error/auth-error-code.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService, // UserService 주입
    private configService: ConfigService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Authorization 헤더에서 토큰 추출
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const payload = authorization.replace('Bearer ', '');
    if (!payload) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      // JWT 토큰 검증
      const accessToken = this.jwtService.verify(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      // DB에서 최신 사용자 정보 조회 (옵션)
      const user = await this.userService.findById(accessToken.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // request 객체에 사용자 정보 저장
      request.user = user;

      return true;
    } catch (error) {
      console.log('====?', error);
      throw new UnauthorizedException(AuthErrorCode.INVALID_TOKEN);
    }
  }
}
