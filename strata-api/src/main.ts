import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription(`
  Strata API - Documentation

  ### WebSockets
  - **URL:** \`ws://localhost:3000\`
  
  **Events (Emit):**
  - \`joinTrip\`: Send \`{ "tripId": "uuid" }\` Enters the trip chat.

  - \`message\`: Send \`{ "tripId": "uuid", "message": "texto" }\` to send a message in the chat.

  **Events (Listen):**
  - \`syncNeeded\`: Receive \`{ "tripId": "uuid" }\` when someone makes changes to the trip.
  
  - \`newMessage\`: Receive the data of the new message in the chat.
  `)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
