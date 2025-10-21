import { PartialType } from '@nestjs/swagger';
import { CreateGameMetadatumDto } from './create-game-metadatum.dto';

export class UpdateGameMetadatumDto extends PartialType(
  CreateGameMetadatumDto,
) {}
