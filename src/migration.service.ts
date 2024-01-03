import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { ApiService } from './Api.service';
import { MediaSoftProductDto, MediaSoftProductStockDto } from './dto/mediasoft-product.dto';
import * as he from 'he';

@Injectable()
export class MigrationService {
  private imagePrefix = 'product/';
  private brandPrefix = 'brand/';

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

  // get product imei
  async getProductIMEIInfoByModelNo(modelNo: number) {
    if (!modelNo) {
      throw new BadRequestException('modelNo is required');
    }
    const apiService = new ApiService();
    await apiService.login();
    return await apiService.getProductIMEIInfoByModel(Number(modelNo));
  }

  // return media soft products
  async getMediaSoftProductStock(mediaSoftProductStockDto: MediaSoftProductStockDto) {
    const apiService = new ApiService();
    await apiService.login();
    return await apiService.mediaSoftStockApi(mediaSoftProductStockDto);
  }

  // migrate with new database from media soft product
  async migrateMediaSoftProduct() {
    const products = await this.getMediaSoftProduct();
    if (!products?.data) {
      throw new NotFoundException('product not found');
    }

    // create category
    const mediaSoftCategoriesSet = new Set(products.data.map(product => product.categoryName));
    const newDbCategories = await this.saas('category');
    const newDbCategoriesMap = new Map(newDbCategories?.map(category => [category.name, category.id]));

    const createCategoryPromise = [...mediaSoftCategoriesSet].map(async (category) => {
      if (!newDbCategoriesMap.has(category)) {
        const [newCategoryId] = await this.saas('category').insert({ name: String(category), slug: this.generateSlug(String(category)), leaf: 0 });
        newDbCategoriesMap.set(category, newCategoryId);
      }
    });

    // create brand
    const mediaSoftBrandsSet = new Set(products.data.map(product => product.brandName));
    const newDbBrands = await this.saas('brand');
    const newDbBrandsMap = new Map(newDbBrands?.map(brand => [String(brand.name).toLowerCase(), brand.id]));

    const createBrandPromise = [...mediaSoftBrandsSet].map(async (brandName) => {
      if (!newDbBrandsMap.has(String(brandName).toLowerCase())) {
        const [newBrandId] = await this.saas('brand').insert({ name: String(brandName), slug: this.generateSlug(String(brandName)) });
        newDbBrandsMap.set(String(brandName).toLowerCase(), newBrandId);
      }
    });

    await Promise.all([...createCategoryPromise, ...createBrandPromise]);

    // return [...newDbBrandsMap];
    // create map for all new products
    const allNewProducts = await this.saas('product').select('id', 'mediasoft_model_id', 'name');
    const allNewProductsMap = new Map(allNewProducts?.map(product => [product.mediasoft_model_id, product]));


    return this.saas.transaction(trx => {
      const migratePromises = products.data?.map(async (product) => {
        // const existedProduct = await this.saas('product').where('mediasoft_model_id', product.modelId).first();
        const existedProduct = allNewProductsMap.get(Number(product.modelId));

        const categoryId = newDbCategoriesMap.get(product.categoryName);
        const brandId = newDbBrandsMap.get(String(product.brandName).toLowerCase());
        if (!existedProduct) {
          // insert products to new db
          return await this.insertProductToNewDb(product, categoryId, brandId);
        } else {

          // update products to new db
          return await this.updateProductToNewDb(product, existedProduct, categoryId, brandId, trx);
        }
      })

      Promise.all(migratePromises)
        .then(trx.commit)
        .catch(trx.rollback);
    });

    return `${products.data.length} products successfully migrated`;
  }

  // migrate stock quantity
  async migrateStockQuantity(mediaSoftProductStockDto: MediaSoftProductStockDto) {
    const stock = await this.getMediaSoftProductStock(mediaSoftProductStockDto);

    if (!stock?.data?.length) {
      throw new NotFoundException('stock not found');
    }

    const stockListMap = new Map();
    stock.data?.forEach(stockItem => {
      stockItem?.stockList?.forEach(item => {
        const sku = item?.itemID || 'undefined';
        if (!stockListMap.has(sku)) {
          stockListMap.set(sku, [{ ...item, sku }]);
        } else {
          const existedItems: any[] = stockListMap.get(sku);
          existedItems.push({ ...item, sku });
          stockListMap.set(sku, existedItems);
        }
      })
    });

    // return [...stockListMap];

    const warehouses = await this.saas('warehouse');
    const warehouseMap = new Map(warehouses?.map(house => [house.code, house]));
    // return [...warehouseMap];

    const skuProducts = await this.saas('sku').select('id', 'sku');
    const existedSkuStocks = await this.saas('warehouse_skus_stock')
      .leftJoin(
        'warehouse',
        'warehouse.id',
        '=',
        'warehouse_skus_stock.warehouse_id'
      ).leftJoin(
        'sku',
        'sku.id',
        '=',
        'warehouse_skus_stock.sku_id'
      ).select(
        'warehouse_skus_stock.id as stockId',
        'warehouse.id as warehouse_id',
        'code as store_code',
        'sku_id',
        'sku',
        'qty as quantity'
      );

    // return existedSkuStocks;

    const existedSkuStocksMap = new Map(existedSkuStocks?.map(stockItem => [stockItem.sku + stockItem.store_code, stockItem]));

    // const existedSkuStocks = await this.saas('sku_stock');
    // const existedSkuStocksMap = new Map(existedSkuStocks?.map(stockItem => [stockItem.sku + stockItem.store_code, { stockId: stockItem.id, quantity: stockItem.stock_quantity }]));

    const insertItemsMap = new Map();
    const updateItemsMap = new Map();
    const notMatchedShopId = new Set();

    skuProducts?.forEach(product => {
      const stockProducts = stockListMap.get(product.sku);
      if (stockProducts) {
        stockProducts?.forEach(item => {
          const stockExist = existedSkuStocksMap.get(item.sku + item.shopID);

          if (stockExist) {
            if (stockExist.quantity != item.balQty) {
              updateItemsMap.set(stockExist.sku + stockExist.store_code, {
                id: stockExist.stockId,
                stock_quantity: item.balQty,
                ...stockExist
              })
            }
          } else {
            const existingWarehouse = warehouseMap.get(item.shopID);
            let warehouseId = null;
            if (existingWarehouse) {
              warehouseId = existingWarehouse.id;
            } else {
              notMatchedShopId.add(item.shopID);
              warehouseId = item.shopID;
            }

            insertItemsMap.set(item.sku + item.shopID, {
              sku_id: product.id,
              warehouse_id: warehouseId,
              sku: item.sku,
              store_code: item.shopID,
              stock_quantity: item.balQty,
            })
          }
        })
      }
    })

    if ([...notMatchedShopId].length) {
      await this.saas('warehouse').insert([...notMatchedShopId].map(shopId => {
        return {
          name: 'null',
          address: 'null',
          lat: 'null',
          long: 'null',
          phone: 'null',
          open_time: 'null',
          code: shopId
        };
      }))
    }

    const newWarehouses = await this.saas('warehouse');
    const newWarehouseMap = new Map(newWarehouses?.map(house => [house.code, house.id]));

    const insertItems = [...insertItemsMap.values()].map(item => {
      return {
        sku_id: item.sku_id,
        warehouse_id: newWarehouseMap.get(item.warehouse_id) || item.warehouse_id,
        qty: item.stock_quantity
      }
    });

    const updateItems = [...updateItemsMap.values()];

    if (insertItems.length) {
      await this.saas('warehouse_skus_stock').insert(insertItems);
    }
    if (updateItems.length) {
      const updated = updateItems.map(async (item) => {
        return await this.saas('warehouse_skus_stock').update({ qty: item.stock_quantity }).where('id', item.id);
      });

      await Promise.all(updated);
    }

    return { updateItems: [...updateItemsMap.values()], insertItems: insertItems };
    // return [...existedSkuStocksMap]
  }

  // migrate with old db sku
  async migrateWithOldDbSku() {
    const newDbAllSku = (await this.saas('sku').select('sku')).map(sku => sku.sku);

    const oldSkuProducts = await this.getAllOldSkuProductsInfo(newDbAllSku);
    // return oldSkuProducts;

    // update sku products
    return this.saas.transaction(trx => {
      const queries = oldSkuProducts.map(async (product) => {


        if (product.attributes?.length) {
          const skuProduct = await this.saas('sku').where('sku', product.sku).select('id').first();

          if (skuProduct) {
            await this.saas('sku_attribute').where('sku_id', skuProduct.id).del();

            await this.saas('sku_attribute').insert(product.attributes.map(attr => {
              return {
                ...attr,
                sku_id: skuProduct.id
              }
            }));
          }
        }

        return this.saas('sku').update({
          images: product.imagesStr,
          model_no: product.model_no
        }).where('sku', product.sku).transacting(trx);

      });

      Promise.all(queries)
        .then(trx.commit)
        .catch(trx.rollback);
    });
  }

  async changeQuoteFromProduct() {
    const products = await this.saas('product').select('id', 'name');

    const updatePromise = products?.map(async (product) => {
      return this.saas('product').update({ name: this.decodeHtmlEntities(product.name) }).where('id', product.id);
    });

    return await Promise.all(updatePromise);

  }

  // migrate with old db
  async migrateWithOldDbProduct() {
    const newDbAllSku = (await this.saas('sku').select('sku')).map(sku => sku.sku);

    const oldParentProducts = await this.getAllOldProductInfo(newDbAllSku);
    // console.log(oldParentProducts.length)
    // return oldParentProducts;

    // update parent products
    oldParentProducts.forEach(async (product) => {
      await this.updateNewDbFromOldProducts(product);
    });

    return "Successfully migrated";
  }

  // migrate brand category & attributes
  async migrateBrandCategoryAttribute() {
    await this.migrateCategory();
    await this.migrateBrand();
    await this.migrateAttribute();

    return "Successfully migrated";
  }

  // migrate customers
  async migrateCustomers() {
    const oldCustomers = await this.gng('portonics_customer');
    const status = ['inactive', 'active', 'disabled'];

    const newCustomers = oldCustomers?.map(customer => {
      return {
        id: customer.id,
        type: 'customer',
        avatar: customer.image,
        first_name: customer.full_name,
        last_name: null,
        email: customer.email,
        phone: customer.phone,
        gender: null,
        password: customer.password,
        status: status[Number(customer.status)],
        created_at: customer.created_at,
        updated_at: customer.updated_at
      }
    });

    return await this.saas('user').insert(newCustomers);
  }

  // migrate customers
  async migrateOrders() {
    const oldOrders = await this.gng('portonics_order')
      .leftJoin(
        'portonics_order_address',
        'portonics_order_address.order_id',
        '=',
        'portonics_order.order_id'
      );
    // return oldOrders;


    const usersWillCreate = new Map();

    oldOrders?.forEach(order => {
      if (order.customer_id == 0) {
        usersWillCreate.set(order.customer_phone, {
          type: 'customer',
          avatar: null,
          first_name: order.customer_name,
          last_name: null,
          email: order.customer_email,
          phone: order.customer_phone,
          gender: null,
          password: `p${Math.floor(Math.random() * 1000000)}`,
          status: 'active'
        });
      }
    });


    const existedCustomers = await this.saas('user').whereIn('phone', [...usersWillCreate.values()].map(user => user.phone));
    const existedCustomersSet = new Set(existedCustomers.map(customer => customer.phone));

    const insertAbleUsers = [...usersWillCreate.values()].filter(user => !existedCustomersSet.has(user.phone));

    if (insertAbleUsers.length) {
      await this.saas('user').insert(insertAbleUsers);
    }

    // return [insertAbleUsers.length, [...existedCustomersSet].length, [...usersWillCreate.values()].length];

    const newCreatedUsers = await this.saas('user').select('id', 'phone').whereIn('phone', [...usersWillCreate.values()].map(user => user.phone));
    const newCreatedUsersMap = new Map(newCreatedUsers?.map(user => [user.phone, user.id]));

    const newOrders = oldOrders?.map(order => {
      return {
        order_number: order.order_id,
        user_id: order.customer_id == 0 ? newCreatedUsersMap.get(order.customer_phone) : order.customer_id,
        subtotal: order.amount,
        delivery_charge: order.total_shipping_cost,
        grand_total: order.amount,
        paid: 0,
        due: 0,
        payment_method: order.payment_method,
        // payment_status: null,
        note: order.order_note,
        shipping_name: order.billing_customer_name || 'null',
        shipping_phone: order.billing_customer_phone || 'null',
        shipping_email: order.billing_customer_email || 'null',
        shipping_country: order.country,
        shipping_city: order.city,
        shipping_area: order.post_code + " " + order.area,
        shipping_street: order.address1,
        shipping_lat: null,
        shipping_lon: null,
        billing_name: order.billing_customer_name || 'null',
        billing_phone: order.billing_customer_phone || 'null',
        billing_email: order.billing_customer_email || 'null',
        billing_country: order.country,
        billing_city: order.city,
        billing_area: order.post_code + " " + order.area,
        billing_street: order.address1,
        billing_lat: null,
        billing_lon: null,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        deleted_at: null,
        shipping_postal_code: order.post_code,
        billing_postal_code: order.post_code,
        discount: null,
        offer_id: null,
      }
    });

    await this.saas('order').insert(newOrders);
    return await this.migrateOrderProducts();

    // return "successfully migrated";
  }

  async replaceStrFromLongText() {
    const products = await this.saas('product').select('id', 'long_description').whereNotNull('long_description');

    const newProducts = products?.map(async (product) => {
      const long_description = String(product?.long_description).replaceAll('https://gngp.sgp1.digitaloceanspaces.com/', 'https://gngmedia.s3.ap-southeast-1.amazonaws.com/');

      return await this.saas('product').update({
        long_description: long_description
      }).where('id', product.id);
    })

    return await Promise.all(newProducts);
  }

  async filterSkuWithOldSkuProduct() {
    // const newSkus = await this.saas('sku').pluck("sku");
    // const filteredOldSkusProducts = await this.gng('portonics_product').whereNotIn('sku', newSkus).whereNot('parent_id', 0);

    // await this.saas('portonics_product').insert(filteredOldSkusProducts);
    // return filteredOldSkusProducts;

    const newSkus = await this.saas('sku').pluck("sku");
    const filteredProducts = await this.gng('portonics_product').whereNotIn('sku', newSkus).where('parent_id', 0);

    await this.saas('portonics_parent_product').insert(filteredProducts);
    return filteredProducts;
  }

  async convertToJson() {
    const colorValues = await this.saas('all_color_value');
    const targetValues = colorValues.map(cv => {
      const target = {};

      target['name'] = cv.value;
      target['code'] = cv.color_code;

      if (cv.image) {
        target['image'] = `upload/attribute_value/${cv.image}`;
      }

      return target;
    });

    const updatePromise = targetValues.map(async (cv: any) => {
      return await this.saas('sku_attribute').update({
        code: cv.code,
        image: cv.image || null
      }).where('value', cv.name);
    });

    await Promise.all(updatePromise);
    return targetValues;
  }

  private async migrateOrderProducts() {
    const newOrders = await this.saas('order').select('id', 'order_number');
    const newProducts = await this.saas('product').select('id', 'category_id', 'brand_id');
    const newSkuProducts = await this.saas('sku').select('id', 'product_id', 'sku', 'images', 'custom_sku', 'vat', 'purchase_price');

    const orderMap = new Map(newOrders?.map(order => [order.order_number, order.id]));
    const skuMap = new Map(newSkuProducts?.map(product => [product.sku, product]));
    const productMap = new Map(newProducts?.map(product => [String(product.id), product]));
    // order product
    const oldOrderProducts = await this.gng('portonics_order_product');

    const newOrderProducts = oldOrderProducts?.map(product => {
      const skuProduct = product.sku ? skuMap.get(product.sku) : null;
      const parentProduct = skuProduct ? productMap.get(String(skuProduct.product_id)) : null;

      return {
        order_id: orderMap.get(product.order_id),
        order_number: product.order_id,
        product_id: skuProduct ? skuProduct.product_id : null,
        sku_id: skuProduct ? skuProduct.id : null,
        brand_id: parentProduct ? parentProduct.brand_id : null,
        category_id: parentProduct ? parentProduct.category_id : null,
        sku: product.sku,
        name: product.name,
        slug: '',
        thumbnail: skuProduct ? skuProduct.images : null,
        price: product.price,
        discounted_price: product.discount,
        quantity: product.quantity,
        total_price: product.total_price,
        status: product.status,
        created_at: product.created_at,
        updated_at: product.updated_at,
        deleted_at: null,
        vat: skuProduct ? skuProduct.vat : null,
        custom_sku: skuProduct ? skuProduct.custom_sku : null,
        purchase_price: skuProduct ? skuProduct.purchase_price : null,
      }
    });

    return await this.saas('order_product').insert(newOrderProducts);

  }

  async migrateOrderProductAttributes() {
    const oldProductAttributes = await this.gng('portonics_order_product_attribute_combination');
    const newOrderProducts = await this.saas('order_product');

    const newProductAttributes = [];
    newOrderProducts?.forEach(product => {
      const oldMatchedAttributes = oldProductAttributes.filter(attribute => attribute.order_id == product.order_number);
      if (oldMatchedAttributes) {
        oldMatchedAttributes.forEach(mattr => {
          newProductAttributes.push({
            order_product_id: product.id,
            key: mattr.attr_name,
            value: mattr.value,
            created_at: mattr.created_at,
            updated_at: mattr.updated_at,
          });
        })
      }
    });

    return await this.saas('order_product_attribute').insert(newProductAttributes);
    // return newProductAttributes;
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
        'model_no',
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

      const feature = await this.gng('portonics_product_features')
        .rightJoin(
          'portonics_feature_translation',
          'portonics_feature_translation.feature_id',
          '=',
          'portonics_product_features.feature_id'
        )
        // .select('product_id', 'title', '')
        .where('product_id', product.id);

      const images = await this.gng('portonics_product_images')
        .where('product_id', product.id);

      const categoryRes = await this.gng('portonics_product_categories').where('product_id', product.id);
      const category = categoryRes[categoryRes.length - 1];

      const imagesStr = images?.map(image => this.imagePrefix + image.name).toString();

      return {
        category_id: category ? category.cat_id : null,
        ...product,
        specification: specification,
        feature: feature,
        images: images,
        imagesStr: imagesStr || null
      }
    })

    const allMatchedProducts = await Promise.all(allProductsPromise);

    const newDbSkuAndProductIds = await this.saas('sku').distinct('product_id', 'sku').whereIn('sku', [...oldProductsParentIdsMap.values()]);
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
        'model_no',
        'brand_id',
        'status'
      )
      .whereIn('sku', newDbAllSku);

    const attributesNames = await this.gng('portonics_attribute_translation').select('attr_id', 'name');
    const attributesNamesMap = new Map(attributesNames?.map(attr => [attr.attr_id, attr.name]));

    const attributesValues = await this.gng('portonics_attribute_values_translation').select('attr_value_id', 'value');
    const attributesValuesMap = new Map(attributesValues?.map(attr => [attr.attr_value_id, attr.value]));

    console.log({ names: [...attributesNamesMap], values: [...attributesValuesMap] });
    const allSkuProductsPromise = oldSkuProducts.map(async (product) => {
      const images = await this.gng('portonics_product_images')
        .where('product_id', product.id);
      const imagesStr = images?.map(image => this.imagePrefix + image.name).toString();

      // attributes
      const attributesList = await this.gng('portonics_product_attribute_combination').where('product_id', product.id);
      const attributes = attributesList?.map(attr => {
        return {
          key: attributesNamesMap.get(attr.attr_id),
          value: attributesValuesMap.get(attr.attr_value_id)
        }
      });

      return {
        ...product,
        // images: images,
        imagesStr: imagesStr || null,
        attributes: attributes || null
      }
    });

    return await Promise.all(allSkuProductsPromise);
  }

  // update product to new dab
  private async updateProductToNewDb(product, existedProduct, categoryId, brandId, trx) {

    // return await this.saas('product').update({
    //   category_id: categoryId,
    //   brand_id: brandId,
    //   slug: this.generateSlug(String(product.modelName))
    // }).where({ mediasoft_model_id: product.modelId, slug: null }).transacting(trx);

    product.productDetailResponses?.map(async (subProduct) => {
      const existedSkuProduct = await this.saas('sku').where('sku', subProduct.pBarCode).first();

      if (!existedSkuProduct) {
        await this.insertIntoSkuAndAttribute(existedProduct.id, subProduct);
      } else {

        await this.saas('sku').update({
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
  private async insertProductToNewDb(product, categoryId: number, brandId: number) {
    const [productId] = await this.saas('product').insert({
      mediasoft_model_id: product.modelId,
      mediasoft_model_name: product.modelName,
      name: product.modelName,
      category_id: categoryId,
      brand_id: brandId,
      status: 'inactive'
    });

    product.productDetailResponses?.map(async (subProduct) => {
      await this.insertIntoSkuAndAttribute(productId, subProduct);
    })
  }

  // insert sku product & attributes 
  private async insertIntoSkuAndAttribute(productId: number, subProduct) {
    const [skuId] = await this.saas('sku').insert({
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

    await this.saas('sku_attribute').insert([{
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

    await this.saas('product').update({
      name: product.name,
      slug: product.slug,
      thumbnail: product.imagesStr,
      long_description: this.decodeHtmlEntities(String(product.description)),
      category_id: product.category_id,
      brand_id: product.brand_id,
      warranty: product.ws_title,
      warranty_policy: product.ws_text,
      vat: product.percent,
      status: 'active'
    }).where('id', product.new_db_product_id);

    const seo = await this.saas('seo').where('ref_id', product.new_db_product_id);
    if (!seo?.length) {

      await this.saas('seo').insert({
        ref_id: product.new_db_product_id,
        title: product.name,
        description: product.meta_description,
        tag: JSON.stringify(product.keywords?.split(',')),
        img_alt_text: product.name,
        image: product.images?.[0]?.name,
        type: 'product',
      });
    }

    const specification = await this.saas('specification').where('product_id', product.new_db_product_id).first();

    if (!specification?.length) {
      const specificationWillInsert = [];

      product.feature?.forEach(async (spec) => {
        // const isExist = await this.saas('specification').where('product_id', product.new_db_product_id)
        specificationWillInsert.push({
          product_id: product.new_db_product_id,
          key: spec.title,
          value: spec.description
        });
      });

      product.specification?.forEach(async (spec) => {
        // const isExist = await this.saas('specification').where('product_id', product.new_db_product_id)
        specificationWillInsert.push({
          product_id: product.new_db_product_id,
          key: spec.title,
          value: spec.description
        });
      })

      if (specificationWillInsert.length) {
        await this.saas('specification').insert(specificationWillInsert);
      }
    }
  }

  // migrate category from old db to new
  private async migrateCategory() {
    const category = await this.saas('category').count('id', { as: 'total' }).first();
    if (category && Number(category.total) > 0) return;

    const categories = await this.gng('portonics_category').join(
      'portonics_category_translation',
      'portonics_category.id',
      'portonics_category_translation.cat_id',
    );
    const categoryList = [];
    categories?.forEach(category => {
      const cat = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        parent_id: category.parent,
        logo: category.image_banner,
        code: '',
        description: category.description,
        is_featured: 1,
        status: category.status,
        leaf: 0,
        created_at: category.created_at,
        updated_at: category.updated_at,
      };
      categoryList.push(cat);
    });

    return await this.saas('category').insert(categoryList);
  }

  // migrate brand from old db to new
  private async migrateBrand() {
    const brand = await this.saas('brand').count('id', { as: 'total' }).first();
    if (brand && Number(brand.total) > 0) return;

    const brands = await this.gng('portonics_brand').join(
      'portonics_brand_translation',
      'portonics_brand.id',
      'portonics_brand_translation.brand_id',
    );
    const brandList = [];
    for (let i = 0; i < brands.length; i++) {
      const brand = brands[i];
      const brandInfo = {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        banner: brand.banner ? this.brandPrefix + brand.banner : null,
        logo: brand.banner ? this.brandPrefix + brand.image_large : null,
        description: brand.description,
        status: brand.status,
        is_featured: 1,
        created_at: brand.created_at,
        updated_at: brand.updated_at,
      };
      brandList.push(brandInfo);
    }
    return await this.saas('brand').insert(brandList);
  }

  // migrate attribute from old db to new
  private async migrateAttribute() {
    const attribute = await this.saas('attribute').count('id', { as: 'total' }).first();
    if (attribute && Number(attribute.total) > 0) return;

    const attributes = await this.gng('portonics_attribute_translation');

    attributes.forEach(async (attribute) => {
      const attributeValues = await this.gng('portonics_attribute_values_translation').where('attr_id', attribute.attr_id);
      const attributeValuesStr = attributeValues?.map(attr => attr.value).join(',');

      await this.saas('attribute').insert({
        id: attribute.attr_id,
        name: attribute.name,
        label: attribute.name,
        type: 'singleSelect',
        options: attributeValuesStr || null,
        is_sale_prop: 0,
        status: attribute.status,
        created_at: attribute.created_at,
        updated_at: attribute.updated_at,
      });
    });
  }

  // decode html entities
  private decodeHtmlEntities(encodedString: string): string {
    return he.decode(encodedString);
  }

  // generate slug
  private generateSlug(str: string) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

}
