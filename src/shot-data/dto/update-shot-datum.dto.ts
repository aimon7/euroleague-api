import { PartialType } from '@nestjs/swagger';
import { CreateShotDatumDto } from './create-shot-datum.dto';

export class UpdateShotDatumDto extends PartialType(CreateShotDatumDto) {}
