
export class MediaSoftProductDto {
    categoryName?: string;
    productName?: string;
    modelName?: string;
    brandName?: string;
    createDate?: Date;
}

export class MediaSoftProductStockDto {
    barcode?: string | string[];
    modelName?: string;
    shopID?: string;
}