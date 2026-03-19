/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_KEY!
        );
    }

    async uploadFile(bucket: string, path: string, file: Express.Multer.File) {
        const { error } = await this.supabase.storage
            .from(bucket)
            .upload(path, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (error)
            throw new InternalServerErrorException('Failed to upload file to Supabase Storage');

        const { data } = this.supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }

    async deleteFile(bucket: string, url: string) {
        const separator = `/public/${bucket}/`;
        const parts = url.split(separator);

        if (parts.length < 2)
            throw new BadRequestException('Invalid file URL format');

        const path = parts[1];

        const { error } = await this.supabase.storage
            .from(bucket)
            .remove([path]);

        if (error)
            throw new InternalServerErrorException('Failed to delete file from Supabase Storage');

        return { message: 'File deleted successfully' };
    }
}