import { PartialType } from '@nestjs/mapped-types';
import { CreatePostCloudDto } from './create-post-cloud.dto';

export class UpdatePostCloudDto extends PartialType(CreatePostCloudDto) {}
