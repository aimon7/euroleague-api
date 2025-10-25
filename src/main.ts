import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Bootstrap function for the Euroleague API
 * Can be used to start a development server for testing the API
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS for development
  app.enableCors();

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Euroleague API')
    .setDescription(
      'A comprehensive TypeScript/NestJS SDK for accessing Euroleague and Eurocup basketball data. ' +
        'Get game stats, player stats, team stats, standings, shot data, play-by-play, and more.',
    )
    .setVersion('0.0.1')
    .addTag('Boxscore', 'Boxscore information')
    .addTag('Clubs', 'Club information')
    .addTag('Coaches', 'Coach information')
    .addTag('Game Metadata', 'Game metadata (stadium, referees, etc.)')
    .addTag('Game Statistics', 'Access game-level statistics and reports')
    .addTag('Play-by-Play', 'Play-by-play game events')
    .addTag('Player Statistics', 'Player performance statistics')
    .addTag('Shot Data', 'Shot-level data and analytics')
    .addTag('Standings', 'League standings and rankings')
    .addTag('Team Statistics', 'Team performance statistics')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: 'api/json',
    yamlDocumentUrl: 'api/yaml',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n🏀 Euroleague API is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  console.log(`📄 OpenAPI JSON: http://localhost:${port}/api/json\n`);
}

// Only start the server if this file is run directly
if (require.main === module) {
  void bootstrap();
}

export { bootstrap };
