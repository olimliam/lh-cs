import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { CustomException } from '@/common/exception/custom.exception';
import { ErrorCode } from '@packages/shared';

@Injectable()
export class HttpRelayClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: Logger
  ) {}

  /**
   * 순환 참조가 있는 객체를 안전하게 로깅하기 위한 메서드
   * @param obj 로깅할 객체
   * @returns 안전하게 처리된 문자열
   */
  private getSafeLogObject(obj: any): string {
    try {
      // 중요한 프로퍼티만 선택적으로 로깅
      const safeObj =
        typeof obj === 'object'
          ? Object.keys(obj)
              .filter(
                (key) =>
                  typeof obj[key] !== 'object' ||
                  obj[key] === null ||
                  Array.isArray(obj[key])
              )
              .reduce(
                (result, key) => {
                  result[key] = obj[key];
                  return result;
                },
                {} as Record<string, any>
              )
          : obj;

      return JSON.stringify(safeObj);
    } catch (error) {
      return '[Circular object - unable to stringify]';
    }
  }

  /**
   * 요청을 안전하게 처리하고 로깅하는 메서드
   * @param requestFn 요청을 수행하는 함수
   * @param method HTTP 메서드
   * @param url 요청 URL
   * @returns 응답 데이터
   */
  private async handleRequest<T>(
    requestFn: () => Promise<any>,
    method: string,
    url: string
  ): Promise<T> {
    try {
      const response = await requestFn();

      // 응답 데이터를 안전하게 로깅
      const safeResponseData = this.getSafeLogObject(response?.data || {});
      this.logger.log(
        `${method} request to ${url} completed successfully with response: ${safeResponseData}`,
        'HttpRelayClient'
      );

      return response;
    } catch (error) {
      // 에러 정보를 안전하게 로깅
      const errorMessage = error?.message || 'Unknown error';
      const statusCode = error?.response?.status || 'Unknown status';

      this.logger.error(
        `${method} request to ${url} failed with status ${statusCode}: ${errorMessage}`,
        error?.stack,
        'HttpRelayClient'
      );

      throw error;
    }
  }

  async forwardRequest<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const config: AxiosRequestConfig = { headers };

    // 안전하게 body 로깅 처리 (순환 참조 방지)
    const safeLogBody = body ? this.getSafeLogObject(body) : 'no body';
    this.logger.log(
      `Forwarding ${method} request to ${url} with data: ${safeLogBody}`,
      'HttpRelayClient'
    );

    switch (method) {
      case 'GET':
        return this.handleRequest(
          () => firstValueFrom(this.httpService.get<T>(url, config)),
          method,
          url
        );
      case 'POST':
        return await firstValueFrom(
          this.httpService.post<T>(url, body, config)
        );
      case 'PUT':
        return this.handleRequest(
          () => firstValueFrom(this.httpService.put<T>(url, body, config)),
          method,
          url
        );
      case 'DELETE':
        return this.handleRequest(
          () => firstValueFrom(this.httpService.delete<T>(url, config)),
          method,
          url
        );
      default:
        throw new CustomException(
          ErrorCode.UNSUPPORTED_HTTP_METHOD,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }
}
