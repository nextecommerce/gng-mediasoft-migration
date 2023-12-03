import { Injectable, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { ApiService } from './Api.service';
import { MediaSoftProductDto } from './dto/mediasoft-product.dto';

@Injectable()
export class MigrationService {
  constructor(
    @InjectConnection('gng') private readonly gng: Knex,
    @InjectConnection('saas') private readonly saas: Knex,
  ) { }

  // return media soft products
  async getMediaSoftProduct(mediaSoftProductDto?: MediaSoftProductDto) {
    const apiService = new ApiService();
    await apiService.login();
    return await apiService.mediaSoftApi(mediaSoftProductDto);
  }

  // migrate with new database from media soft product
  async migrateMediaSoftProduct() {
    const products = await this.getMediaSoftProduct();
    if (!products?.data) {
      throw new NotFoundException('product not found');
    }

    products.data?.map(async (product) => {
      try {
        const existedProduct = await this.saas('new_product').where('mediasoft_model_id', product.modelId).first();

        if (!existedProduct) {
          // insert products to new db
          await this.insertProductToNewDb(product);
        } else {

          // update products to new db
          await this.updateProductToNewDb(product, existedProduct);
        }
      } catch (error) {
        console.log(error.message);
      }
    })


    return `${products.data.length} products successfully migrated`;
  }

  // migrate with old db sku
  async migrateWithOldDbSku() {
    const newDbAllSku = (await this.saas('new_sku').select('sku')).map(sku => sku.sku);

    const oldSkuProducts = await this.getAllOldSkuProductsInfo(newDbAllSku);

    // update sku products
    oldSkuProducts.forEach(async (product) => {
      await this.saas('new_sku').update({ images: product.imagesStr }).where('sku', product.sku);
    });

    return "Successfully migrated";
  }

  // migrate with old db
  async migrateWithOldDbProduct() {
    const newDbAllSku = (await this.saas('new_sku').select('sku')).map(sku => sku.sku);

    const oldParentProducts = await this.getAllOldProductInfo(newDbAllSku);

    // update parent products
    oldParentProducts.forEach(async (product) => {
      await this.updateNewDbFromOldProducts(product);
    });

    return "Successfully migrated";
  }


  // get all old products info
  private async getAllOldProductInfo(newDbAllSku: string[]) {
    // parent products
    const oldProductsParentIdsAndSku = await this.gng('portonics_product').distinct('parent_id', 'sku').whereIn('sku', newDbAllSku);
    const oldProductsParentIdsMap = new Map(oldProductsParentIdsAndSku?.map(product => [product.parent_id, product.sku]));

    const oldProductsParentIds = [...oldProductsParentIdsMap.keys()];
    const oldProducts = await this.gng('portonics_product')
      .select(
        'portonics_product.id',
        'slug',
        'sku',
        'brand_id',
        'ws_title',
        'ws_text',
        'name',
        'percent',
        'keywords',
        'meta_description',
        'portonics_product_translation.description',
        'short_description',
        'items_in_the_box',
        'header',
        'footer'
      )
      .leftJoin(
        'portonics_product_translation',
        'portonics_product_translation.product_id',
        '=',
        'portonics_product.id'
      )
      .leftJoin(
        'portonics_product_tax',
        'portonics_product_tax.product_id',
        '=',
        'portonics_product.id'
      )
      .leftJoin(
        'portonics_product_warranty_and_support',
        'portonics_product_warranty_and_support.product_id',
        '=',
        'portonics_product.id'
      )
      .whereIn('portonics_product.id', oldProductsParentIds);

    const allProductsPromise = oldProducts.map(async (product) => {
      const specification = await this.gng('portonics_product_specification')
        .rightJoin(
          'portonics_specification_translation',
          'portonics_specification_translation.specification_id',
          '=',
          'portonics_product_specification.specification_id'
        )
        .where('product_id', product.id);
      const images = await this.gng('portonics_product_images')
        .where('product_id', product.id);

      const imagesStr = images?.map(image => image.name).toString();

      return {
        ...product,
        specification: specification,
        images: images,
        imagesStr: imagesStr || null
      }
    })

    const allMatchedProducts = await Promise.all(allProductsPromise);

    const newDbSkuAndProductIds = await this.saas('new_sku').distinct('product_id', 'sku').whereIn('sku', [...oldProductsParentIdsMap.values()]);
    const newProductsProductIdsMap = new Map(newDbSkuAndProductIds?.map(product => [product.sku, product.product_id]));

    return allMatchedProducts?.map(product => {
      const sku = oldProductsParentIdsMap.get(product.id);
      const productId = newProductsProductIdsMap.get(sku);

      return {
        new_db_product_id: productId,
        ...product,
        sku,
      }
    })
  }

  // get all old sku products info
  private async getAllOldSkuProductsInfo(newDbAllSku: string[]) {
    // sku products
    const oldSkuProducts = await this.gng('portonics_product')
      .select(
        'portonics_product.id',
        'slug',
        'sku',
        'brand_id',
        'status'
      )
      .whereIn('sku', newDbAllSku);

    const allSkuProductsPromise = oldSkuProducts.map(async (product) => {
      const images = await this.gng('portonics_product_images')
        .where('product_id', product.id);
      const imagesStr = images?.map(image => image.name).toString();

      return {
        ...product,
        images: images,
        imagesStr: imagesStr || null
      }
    });

    return await Promise.all(allSkuProductsPromise);
  }

  // update product to new dab
  private async updateProductToNewDb(product, existedProduct) {
    product.productDetailResponses?.map(async (subProduct) => {
      const existedSkuProduct = await this.saas('new_sku').where('sku', subProduct.pBarCode).first();

      if (!existedSkuProduct) {
        await this.insertIntoSkuAndAttribute(existedProduct.id, subProduct);
      } else {

        await this.saas('new_sku').update({
          stock_quantity: 1,
          price: subProduct.salePrice,
          discounted_price: subProduct.salePrice,
          cost_price: subProduct.costPrice,
          point_earn: subProduct.pointEarn,
          sbarcode: subProduct.sBarCode,
          vat: subProduct.vatPercent
        }).where('id', existedSkuProduct.id);
      }
    })
  }

  // insert product into new db
  private async insertProductToNewDb(product) {
    const [productId] = await this.saas('new_product').insert({
      mediasoft_model_id: product.modelId,
      mediasoft_model_name: product.modelName,
      name: product.modelName,
    });

    product.productDetailResponses?.map(async (subProduct) => {
      await this.insertIntoSkuAndAttribute(productId, subProduct);
    })
  }

  // insert sku product & attributes 
  private async insertIntoSkuAndAttribute(productId: number, subProduct) {
    const [skuId] = await this.saas('new_sku').insert({
      product_id: productId,
      sku: subProduct.pBarCode,
      custom_sku: subProduct.pBarCode,
      stock_quantity: 1,
      price: subProduct.salePrice,
      discounted_price: subProduct.salePrice,
      cost_price: subProduct.costPrice,
      point_earn: subProduct.pointEarn,
      sbarcode: subProduct.sBarCode,
      vat: subProduct.vatPercent
    });

    await this.saas('new_sku_attribute').insert([{
      sku_id: skuId,
      key: 'Color',
      value: subProduct.colorName,
    }, {
      sku_id: skuId,
      key: 'Memory',
      value: subProduct.memoryCapacity,
    }]);
  }

  // update new db from old db products
  private async updateNewDbFromOldProducts(product) {
    await this.saas('new_product').update({
      name: product.name,
      slug: product.slug,
      thumbnail: product.imagesStr,
      long_description: product.description,
      brand_id: product.brand_id,
      warranty: product.ws_title,
      warranty_policy: product.ws_text,
      vat: product.percent,
    }).where('id', product.new_db_product_id);

    const seo = await this.saas('new_seo').where('ref_id', product.new_db_product_id);
    if (!seo?.length) {

      await this.saas('new_seo').insert({
        ref_id: product.new_db_product_id,
        title: product.name,
        description: product.meta_description,
        tag: product.keywords,
        img_alt_text: product.name,
        image: product.images?.[0]?.name,
        type: 'product',
      });
    }

    const specification = await this.saas('new_specification').where('product_id', product.new_db_product_id);
    if (!specification?.length) {
      product.specification?.forEach(async (spec) => {
        // const isExist = await this.saas('new_specification').where('product_id', product.new_db_product_id)
        await this.saas('new_specification').insert({
          product_id: product.new_db_product_id,
          key: spec.title,
          value: spec.description
        });
      })
    }
  }
}
