import { Controller, Post, Request } from '@nestjs/common';
import { MigrationService } from '../services/migration.service';
import CustomRequest from 'src/common/interfaces/request.interface';

@Controller('migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Post()
  async migrationResource(@Request() request: CustomRequest) {
    return this.migrationService.migrationImages(request.database);
  }
}
