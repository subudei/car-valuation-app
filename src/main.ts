import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// cookieSession has to be imported this way because of the typescript.config setup
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieSession = require('cookie-session');
// import cookieSession from 'cookie-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cookieSession({
      keys: ['plane_string'], // for now we are using a single key, but in production we should use an array of keys
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
