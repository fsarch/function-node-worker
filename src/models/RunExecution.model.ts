import { ApiProperty } from "@nestjs/swagger";

export class RunExecutionDto {
  @ApiProperty({
    isArray: true,
    oneOf: [{}],
  })
  arguments: Array<unknown>;
}
