import { Body, Controller, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RunExecutionDto } from "../../models/RunExecution.model.js";
import { FunctionServerService } from "../../services/function-server/function-server.service.js";
import { FunctionExecuterService } from "../../services/function-executer/function-executer.service.js";
import { FunctionExecuteQueryParams } from "../../services/function-executer/function-executer.model.js";

@ApiTags('executions')
@Controller({
  path: 'functions/:functionId',
  version: '1',
})
@ApiBearerAuth()
export class ExecutionsController {
  constructor(
    private readonly functionServerService: FunctionServerService,
    private readonly functionExecuterService: FunctionExecuterService,
  ) {
  }

  @Post('executions')
  @ApiQuery({
    name: 'wait',
    required: true,
    type: 'boolean',
  })
  @ApiParam({
    name: 'functionId',
    type: 'string',
  })
  public async runExecution(
    @Body() body: RunExecutionDto,
    @Query() query: FunctionExecuteQueryParams,
    @Param('functionId') functionId: string,
  ) {
    const functionVersion = await this.functionServerService.getVersion(functionId);
    const workerMeta = await this.functionServerService.getWorkerMetadata();

    console.log('workerMeta', workerMeta);

    const promise = this.functionExecuterService.execute(functionVersion, workerMeta, body.arguments);

    console.log('wait', query, typeof query.wait);

    if (query.wait) {
      return await promise;
    }

    return new Response(null, {
      status: 202,
    });
  }

  @Post('versions/:versionId/executions')
  @ApiQuery({
    name: 'wait',
    required: true,
    type: 'boolean',
  })
  @ApiParam({
    name: 'functionId',
    type: 'string',
  })
  @ApiParam({
    name: 'versionId',
    type: 'string',
  })
  public async runVersionExecution(
    @Body() body: RunExecutionDto,
    @Query() query: FunctionExecuteQueryParams,
    @Param('functionId') functionId: string,
    @Param('versionId') versionId: string,
  ) {
    const functionVersion = await this.functionServerService.getVersion(functionId, versionId);
    const workerMeta = await this.functionServerService.getWorkerMetadata();

    const promise = this.functionExecuterService.execute(functionVersion, workerMeta, body.arguments);

    if (query.wait) {
      return await promise;
    }

    return new Response(null, {
      status: 202,
    });
  }
}
