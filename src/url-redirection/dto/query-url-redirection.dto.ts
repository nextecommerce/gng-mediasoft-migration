import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";
import mongoose from "mongoose";

export class QueryUrlRedirection  {
    @IsOptional()
    @IsString()
    dummy_url: string;

    @IsOptional()
    @IsString()
    original_url: string;

    @IsOptional()
    @IsEnum({ zero: 0, one: 1 })
    status: number;
}

export class MongoIdParams {
    @IsNotEmpty()
    @IsMongoId()
    id: mongoose.Types.ObjectId;
}