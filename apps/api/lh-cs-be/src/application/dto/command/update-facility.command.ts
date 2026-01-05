import { PartialType } from '@nestjs/swagger';
import { CreateFacilityCommand } from './create-facility.command';

export class UpdateFacilityCommand extends PartialType(CreateFacilityCommand) {}
