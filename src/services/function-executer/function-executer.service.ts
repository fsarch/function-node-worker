import { Injectable, Logger } from '@nestjs/common';
import { FunctionVersionDto } from "../function-server/function-server.types.js";
import * as vm from "node:vm";

@Injectable()
export class FunctionExecuterService {
  private readonly logger = new Logger(FunctionExecuterService.name);

  public async execute(functionVersion: FunctionVersionDto, args: Array<unknown>) {
    const { functionId, code } = functionVersion;

    const createLoggerFunction = (type: keyof typeof console) => {
      return (...args) => {
        this.logger.log('log from function', {
          logData: args,
          method: type,
          functionId,
        });
      };
    };

    const context = {
      console: {
        log: createLoggerFunction('log'),
        trace: createLoggerFunction('trace'),
        debug: createLoggerFunction('debug'),
        info: createLoggerFunction('info'),
        warn: createLoggerFunction('warn'),
        error: createLoggerFunction('error'),
      },
    };

    vm.createContext(context);

    const module = new vm.SourceTextModule(code, { context });

    await module.link(() => {
      throw new Error('could not find module code');
    });

    const moduleExports = (module.namespace as { run: (...args: Array<unknown>) => Promise<unknown> });

    return await moduleExports.run(args);
  }
}
