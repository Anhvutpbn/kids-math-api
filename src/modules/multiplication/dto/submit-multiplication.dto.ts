import { IsString, IsIn, IsInt, IsBoolean, Min, Max } from 'class-validator';

export class SubmitMultiplicationDto {
  @IsString()
  @IsIn(['basic', 'medium', 'hard'])
  level: string;

  @IsInt()
  @Min(0)
  correctCount: number;

  @IsInt()
  @Min(1)
  @Max(20)
  totalCount: number;

  @IsInt()
  @Min(0)
  @Max(3)
  heartsLeft: number;

  @IsBoolean()
  passed: boolean;

  @IsInt()
  @Min(0)
  durationMs: number;
}
