import { PartialType } from '@nestjs/swagger';
import { CreateBoxscoreDto } from './create-boxscore.dto';

export class UpdateBoxscoreDto extends PartialType(CreateBoxscoreDto) {}
