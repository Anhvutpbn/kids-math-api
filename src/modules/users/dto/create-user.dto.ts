import { IsEmail, IsString, MinLength, IsInt, Min, Max, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'parent@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'Minh', minLength: 2 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  childName?: string;

  @ApiPropertyOptional({ example: 6, minimum: 5, maximum: 7 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(7)
  childAge?: number;

  @ApiPropertyOptional({ example: 'vi', enum: ['vi', 'en'] })
  @IsOptional()
  @IsIn(['vi', 'en'])
  language?: string;
}
