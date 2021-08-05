import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mongoService from './mongo.service';

async function bootstrap() {
  await mongoService.connect();
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
