import { IsNumber } from 'class-validator';
import { CreateRoleRequestDto } from './create-role.request.dto';

export class UpdateRoleRequestDto extends CreateRoleRequestDto {
  @IsNumber()
  id!: number;
}
