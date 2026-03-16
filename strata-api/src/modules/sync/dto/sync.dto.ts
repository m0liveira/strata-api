import { IsNumber, IsString, IsOptional, ValidateNested, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncTripDto {
  @IsUUID() trip_id: string;
  @IsOptional() @IsString() banner?: string;
  @IsString() name: string;
  @IsOptional() @IsString() visibility?: string;
  @IsOptional() @IsDateString() start_date?: string;
  @IsOptional() @IsDateString() end_date?: string;
  @IsString() budget_level: string;
  @IsString() intensity_level: string;
  @IsString() travel_style: string;
  @IsOptional() @IsNumber() rating?: number;
  @IsOptional() @IsDateString() created_at?: string;
  @IsOptional() @IsDateString() updated_at?: string;
}

export class SyncDestinationDto {
  @IsUUID() destination_id: string;
  @IsUUID() trip_id: string;
  @IsString() destination: string;
  @IsOptional() @IsDateString() created_at?: string;
  @IsOptional() @IsDateString() updated_at?: string;
}

export class SyncLocationDto {
  @IsUUID() location_id: string;
  @IsUUID() trip_id: string;
  @IsString() name: string;
  @IsOptional() @IsDateString() scheduled_time?: string;
  @IsNumber() day: number;
  @IsOptional() @IsString() ticket_url?: string;
  @IsOptional() @IsDateString() created_at?: string;
  @IsOptional() @IsDateString() updated_at?: string;
}

export class SyncExpenseDto {
  @IsUUID() expense_id: string;
  @IsUUID() trip_id: string;
  @IsNumber() user_id: number;
  @IsString() type: string;
  @IsNumber() amount: number;
  @IsOptional() @IsDateString() created_at?: string;
  @IsOptional() @IsDateString() updated_at?: string;
}

export class SyncTripTableDto {
  @ValidateNested({ each: true }) @Type(() => SyncTripDto) created: SyncTripDto[];
  @ValidateNested({ each: true }) @Type(() => SyncTripDto) updated: SyncTripDto[];
  @IsString({ each: true }) deleted: string[];
}

export class SyncDestinationTableDto {
  @ValidateNested({ each: true }) @Type(() => SyncDestinationDto) created: SyncDestinationDto[];
  @ValidateNested({ each: true }) @Type(() => SyncDestinationDto) updated: SyncDestinationDto[];
  @IsString({ each: true }) deleted: string[];
}

export class SyncLocationTableDto {
  @ValidateNested({ each: true }) @Type(() => SyncLocationDto) created: SyncLocationDto[];
  @ValidateNested({ each: true }) @Type(() => SyncLocationDto) updated: SyncLocationDto[];
  @IsString({ each: true }) deleted: string[];
}

export class SyncExpenseTableDto {
  @ValidateNested({ each: true }) @Type(() => SyncExpenseDto) created: SyncExpenseDto[];
  @ValidateNested({ each: true }) @Type(() => SyncExpenseDto) updated: SyncExpenseDto[];
  @IsString({ each: true }) deleted: string[];
}

export class SyncChangesDto {
  @ValidateNested() @Type(() => SyncTripTableDto) @IsOptional() trips?: SyncTripTableDto;
  @ValidateNested() @Type(() => SyncDestinationTableDto) @IsOptional() destinations?: SyncDestinationTableDto;
  @ValidateNested() @Type(() => SyncLocationTableDto) @IsOptional() locations?: SyncLocationTableDto;
  @ValidateNested() @Type(() => SyncExpenseTableDto) @IsOptional() expenses?: SyncExpenseTableDto;
}

export class SyncPushDto {
  @ValidateNested() @Type(() => SyncChangesDto) changes: SyncChangesDto;
  @IsNumber() lastPulledAt: number;
}