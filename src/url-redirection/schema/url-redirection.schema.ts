import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class UrlRedirection {
    @Prop()
    dummy_url: string;

    @Prop()
    original_url: string;

    @Prop({ default: 1 })
    status: number;

    @Prop()
    createdBy: string;

    @Prop({ default: null })
    deletedAt: Date;
}

export const urlRedirectionSchema = SchemaFactory.createForClass(UrlRedirection);