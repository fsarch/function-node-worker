import { AppModule } from './app.module.js';
import { FsArchAppBuilder } from '@fsarch/server';

async function bootstrap() {
  const app = await new FsArchAppBuilder(AppModule, {
    name: 'Function-Server',
    version: '1.0.0',
  })
    .addSwagger({
      title: 'Function-Server',
      description: 'The Function-Server API description',
      version: '1.0',
      path: 'docs',
    })
    .enableAuth()
    .build();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
