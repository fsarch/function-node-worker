import { FsArchAppBuilder } from '@fsarch/server';
import { descriptor } from './lib/index.js';

async function bootstrap() {
  const app = await new FsArchAppBuilder(descriptor.module.register(), {
    name: 'Function-Server',
    version: '1.0.0',
  })
    .addSwagger(descriptor.swagger)
    .enableAuth()
    .build();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
