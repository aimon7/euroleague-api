import { PartialType } from '@nestjs/swagger';
import { CreatePlayByPlayDto } from './create-play-by-play.dto';

export class UpdatePlayByPlayDto extends PartialType(CreatePlayByPlayDto) {}
