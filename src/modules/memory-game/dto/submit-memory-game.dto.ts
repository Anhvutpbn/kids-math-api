import { IsInt, IsBoolean, Min, Max } from 'class-validator';

export class SubmitMemoryGameDto {
  @IsInt()
  @Min(1)
  @Max(16)
  level: number;

  @IsInt()
  @Min(0)
  mistakesMade: number;

  @IsBoolean()
  passed: boolean;

  @IsInt()
  @Min(0)
  durationMs: number;
}
