import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const corsOptions: CorsOptions = {
  //   origin: '*', // Replace with your frontend domain
  //   methods: ['GET', 'POST', 'POST'], // Add any other methods your frontend uses
  //   allowedHeaders: ['Content-Type', 'Authorization'], // Add any headers your frontend sends
  // };

  // Enable CORS with the specified options
  // app.enableCors(corsOptions);

  console.log(process.env);
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}

bootstrap();
