import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PlacementAnswerDto {
  @ApiProperty({ example: 'Q001' })
  @IsString()
  questionId: string;

  @ApiProperty({ example: 'SK01' })
  @IsString()
  skillId: string;

  @ApiProperty({ example: '3' })
  @IsString()
  answer: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect: boolean;
}

export class SubmitPlacementTestDto {
  @ApiProperty({ type: [PlacementAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlacementAnswerDto)
  answers: PlacementAnswerDto[];
}
