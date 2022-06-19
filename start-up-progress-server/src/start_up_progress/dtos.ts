import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class Phase {
  constructor(public id: string, public name: string, public orderNo: number) {}
}
export class Task {
  constructor(
    public id: string,
    public name: string,
    // orderNo's could be strings to allow for more efficient inserts and updates (O(logN) instead of O(N))
    public orderNo: number,
    public phaseId: string,
    public status: boolean = false,
  ) {}
}

export class CreatePhaseDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNumber()
  @IsOptional()
  orderNo: number;
}

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNumber()
  @IsOptional()
  orderNo: number;
  @IsNotEmpty()
  @IsString()
  phaseId: string;
}
// will only accept the status for simplicity
export class UpdateTaskDto {
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
