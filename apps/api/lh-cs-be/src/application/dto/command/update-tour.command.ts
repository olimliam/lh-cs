import { PartialType } from '@nestjs/swagger';
import { CreateTourCommand } from './create-tour.command';

export class UpdateTourCommand extends PartialType(CreateTourCommand) {}
