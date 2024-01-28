import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class CreateUrlRedirectionDto {

    @IsNotEmpty()
    @IsString()
    dummy_url: string;

    @IsNotEmpty()
    @IsString()
    original_url: string;
}
