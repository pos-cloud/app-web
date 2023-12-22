import { PartialType } from '@nestjs/mapped-types';
import { CreatePosCloudDto } from './create-pos-cloud.dto';

export class UpdatePosCloudDto extends PartialType(CreatePosCloudDto) {}
