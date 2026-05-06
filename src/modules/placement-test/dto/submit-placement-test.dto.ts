import { IsArray, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PlacementAnswerDto {
  @ApiProperty({ example: 'Q001' })
  @IsString()
  questionId: string;

  @ApiProperty({ example: '3' })
  @IsString()
  answer: string;

  @ApiProperty({ example: 3073 })
  @IsNumber()
  @Min(0)
  timeSpentMs: number;
}

export class SubmitPlacementTestDto {
  @ApiProperty({ type: [PlacementAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlacementAnswerDto)
  answers: PlacementAnswerDto[];
}
