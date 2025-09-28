/* istanbul ignore file */

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Documents management API')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, cleanupOpenApiDoc(openApiDoc));

  const configService = app.get(ConfigService);

  const appPort = configService.get('APP_PORT');
  const contractServiceQueue = {
    name: configService.get('CONTRACT_SERVICE_QUEUE_NAME'),
    user: configService.get('RABBIT_USER'),
    password: configService.get('RABBIT_PASSWORD'),
    host: configService.get('RABBIT_HOST'),
    port: configService.get('RABBIT_PORT'),
  };

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${contractServiceQueue.user}:${contractServiceQueue.password}@${contractServiceQueue.host}:${contractServiceQueue.port}`,
      ],
      queue: contractServiceQueue.name,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(appPort);
}
bootstrap();
