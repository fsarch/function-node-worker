import { Transform } from "class-transformer";
import { IsBoolean } from "class-validator";

export class FunctionExecuteQueryParams {
  @Transform((val) => val.value === 'true')
  @IsBoolean()
  wait: boolean;
}
