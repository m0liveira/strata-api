import { Controller, Post, UseInterceptors, UploadedFile, Body, Delete, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from './supabase.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('supabase')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('supabase')
export class SupabaseController {
    constructor(private readonly supabaseService: SupabaseService) { }

    @Post('upload')
    @ApiOperation({ summary: 'Upload a file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload',
                },
                bucket: {
                    type: 'string',
                    example: 'tickets',
                    default: 'tickets',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('bucket') bucket: string
    ) {
        if (!file)
            throw new BadRequestException('File is required');

        const path = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        const url = await this.supabaseService.uploadFile(bucket, path, file);

        return { url };
    }

    @Delete('delete')
    @ApiOperation({ summary: 'Delete a file by URL' })
    @ApiQuery({ name: 'url', required: true, description: 'Public URL of the file' })
    @ApiQuery({ name: 'bucket', required: false, example: 'tickets || avatars' })
    async deleteFile(
        @Query('url') url: string,
        @Query('bucket') bucket: string
    ) {
        if (!url) {
            throw new BadRequestException('File URL is required');
        }

        return this.supabaseService.deleteFile(bucket, url);
    }
}