import { ApiProperty } from '@nestjs/swagger';

export class GetUserDepartmentsResponse {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '부서 목록',
    example: ['개발팀', '영업팀', '운영팀'],
  })
  data: {
    departments: string[];
  };
}
