import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'johnydoe@email.com' })
    @IsEmail()
    @IsString()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: 'johnydoe', minLength: 3 })
    @IsString()
    @MinLength(3)
    @IsOptional()
    username?: string;

    @ApiPropertyOptional({ example: 'johny doe', minLength: 3 })
    @IsString()
    @MinLength(3)
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: 'newpassword', minLength: 6 })
    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;

    @ApiPropertyOptional({ example: 'https://photolink.com/foto.jpg' })
    @IsString()
    @IsOptional()
    photo?: string;
}