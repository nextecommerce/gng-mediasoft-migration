import { PartialType } from '@nestjs/mapped-types';
import { CreateUrlRedirectionDto } from './create-url-redirection.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateUrlRedirectionDto extends PartialType(CreateUrlRedirectionDto) {
    @IsOptional()
    @IsEnum({ zero: 0, one: 1 })
    status: number;
}
