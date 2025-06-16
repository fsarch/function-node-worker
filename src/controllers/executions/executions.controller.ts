import { Body, Controller, Logger, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RunExecutionDto } from "../../models/RunExecution.model.js";
import { FunctionServerService } from "../../services/function-server/function-server.service.js";
import { FunctionExecuterService } from "../../services/function-executer/function-executer.service.js";

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
    @Query() wait: boolean,
    @Param('functionId') functionId: string,
  ) {
    const functionVersion = await this.functionServerService.getVersion(functionId);

    return await this.functionExecuterService.execute(functionVersion, body.arguments);
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
    @Query() wait: boolean,
    @Param('functionId') functionId: string,
    @Param('versionId') versionId: string,
  ) {
    const functionVersion = await this.functionServerService.getVersion(functionId, versionId);

    return await this.functionExecuterService.execute(functionVersion, body.arguments);
  }
}
