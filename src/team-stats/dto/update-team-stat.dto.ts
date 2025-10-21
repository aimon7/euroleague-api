import { PartialType } from '@nestjs/swagger';
import { CreateTeamStatDto } from './create-team-stat.dto';

export class UpdateTeamStatDto extends PartialType(CreateTeamStatDto) {}
