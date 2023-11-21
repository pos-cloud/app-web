import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UploadModule } from './modules/upload/upload.module';
import { MigrationModule } from './modules/migration/migration.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    UploadModule,
    MigrationModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
