import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

@Injectable()
export class DataMigrationService {
  constructor(
    @InjectConnection('gng') private readonly gng: Knex,
    @InjectConnection('saas') private readonly saas: Knex,
  ) { }

  async migrate() {
    await this.saas.transaction(async (trx) => {
      await this.migrateCategory(trx);
      await this.migrateBrand(trx);
      // await this.migrateAttribute(trx);
      // return await this.attributeValueMigration(trx);
    })
  }

  async migrateCategory(trx: Knex.Transaction) {
    const categories = await this.gng('portonics_category').join(
      'portonics_category_translation',
      'portonics_category.id',
      'portonics_category_translation.cat_id',
    );
    const categoryList = [];
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
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
    }
    return await this.saas('category').insert(categoryList).transacting(trx);
  }

  async migrateBrand(trx: Knex.Transaction) {
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
        logo: brand.banner,
        description: brand.description,
        status: brand.status,
        is_featured: 1,
        created_at: brand.created_at,
        updated_at: brand.updated_at,
      };
      brandList.push(brandInfo);
    }
    return await this.saas('brand').insert(brandList).transacting(trx);
  }

  async migrateAttribute(trx: Knex.Transaction) {
    const attributes = await this.gng('portonics_attribute').join(
      'portonics_attribute_translation',
      'portonics_attribute.id',
      'portonics_attribute_translation.attr_id',
    );
    console.log(attributes)
    const attributeList = [];
    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i];
      const attributeInfo = {
        id: attribute.id,
        name: attribute.name,
        label: attribute.name,
        type: 'singleSelect',
        required: attribute.is_required,
        filterable: attribute.use_in_filter,
        is_sale_prop: 0,
        status: attribute.status,
        created_at: attribute.created_at,
        updated_at: attribute.updated_at,
      };
      attributeList.push(attributeInfo);
    }
    return await this.saas('attribute').insert(attributeList).transacting(trx);
  }

  async attributeValueMigration(trx: Knex.Transaction) {
    const attributes = await this.gng('portonics_attribute');

    for (let i = 0; i < attributes.length; i++) {
      try {
        const attributeValues = await this.gng('portonics_attribute_values')
          .join(
            'portonics_attribute_values_translation',
            'portonics_attribute_values.id',
            'portonics_attribute_values_translation.attr_value_id',
          )
          .where('portonics_attribute_values.attr_id', attributes[i].id);

        const attributeValueList = [];
        for (let j = 0; j < attributeValues.length; j++) {
          attributeValueList.push(attributeValues[j].value);
        }
        const attributeValueString = attributeValueList.join(',');
        this.saas('attribute')
          .where('id', attributes[i].id)
          .update({ options: attributeValueString }).transacting(trx);
      } catch (error) {
        console.log(error);
      }
    }
  }
}
