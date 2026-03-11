import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: 'john@email.com or johndoe',
        description: 'Can be the email or the username'
    })
    @IsString()
    @IsNotEmpty()
    identifier: string;

    @ApiProperty({ example: 'pass123', minLength: 6 })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}