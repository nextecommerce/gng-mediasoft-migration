<?php

namespace App\Http\Service;

use Illuminate\Support\Facades\DB;

class MigrationService
{
    public function migrate()
    {
        // return $this->migrateCategory();
        // return $this->migrateBrand();
        // return $this->migrateAttribute();
        return $this->attributeValueMigration();
    }

    private function migrateCategory()
    {
        $categories = DB::connection('gng')
        ->table('portonics_category')
        ->join('portonics_category_translation', 'portonics_category.id', '=', 'portonics_category_translation.cat_id')
        ->get();
        $categoryList = array();
        for ($i=0; $i < count($categories); $i++) {
            $category = $categories[$i];
            $category = [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'parent_id' => $category->parent,
                'logo' => $category->image_banner,
                'code' => '',
                'description' => $category->description,
                'is_featured' => 1,
                'status' => $category->status,
                'leaf' => 0,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
            ];
            array_push($categoryList, $category);
        }
        return DB::connection('saas')
        ->table('categories')
        ->insert($categoryList);
    }

    public function migrateBrand()
    {
        $brands = DB::connection('gng')
        ->table('portonics_brand')
        ->join('portonics_brand_translation', 'portonics_brand.id', '=', 'portonics_brand_translation.brand_id')
        ->get();
        $brandList = array();
        for ($i=0; $i < count($brands); $i++) {
            $brand = $brands[$i];
            $brand = [
                'id' => $brand->id,
                'name' => $brand->name,
                'slug' => $brand->slug,
                'logo' => $brand->banner,
                'description' => $brand->description,
                'status' => $brand->status,
                'is_featured' => 1,
                'created_at' => $brand->created_at,
                'updated_at' => $brand->updated_at,
            ];
            array_push($brandList, $brand);
        }
        return DB::connection('saas')
        ->table('brand')
        ->insert($brand);
    }

    public function migrateAttribute()
    {
        $attributes = DB::connection('gng')
        ->table('portonics_attribute')
        ->join('portonics_attribute_translation', 'portonics_attribute.id', '=', 'portonics_attribute_translation.attr_id')
        ->get();
        $attributeList = array();
        for ($i=0; $i < count($attributes); $i++) {
            $attribute = $attributes[$i];
            $attribute = [
                'id' => $attribute->id,
                'name' => $attribute->name,
                'label' => $attribute->name,
                'type' => 'singleSelect',
                'required' => $attribute->is_required,
                'filterable' => $attribute->use_in_filter,
                'is_sale_prop' => 0,
                'status' => $attribute->status,
                'created_at' => $attribute->created_at,
                'updated_at' => $attribute->updated_at,
            ];
            array_push($attributeList, $attribute);
        }
        return DB::connection('saas')
        ->table('attributes')
        ->insert($attributeList);
    }

    public function attributeValueMigration()
    {
        $attributes = DB::connection('gng')
            ->table('portonics_attribute')
            ->take(5)
            ->get();

        for ($i=0; $i < count($attributes); $i++) {
            try {
                $attributeValues = DB::connection('gng')
                    ->table('portonics_attribute_values')
                    ->join('portonics_attribute_values_translation', 'portonics_attribute_values.id', '=', 'portonics_attribute_values_translation.attr_value_id')
                    ->where('portonics_attribute_values.attr_id', $attributes[$i]->id)
                    ->get();

                    $attributeValueList = array();
                    for ($j=0; $j < count($attributeValues); $j++) {
                        array_push($attributeValueList, $attributeValues[$j]->value);
                    }
                    $attributeValueString = implode(',', $attributeValueList);
                    DB::connection('saas')
                        ->table('attributes')
                        ->where('id', $attributes[$i]->id)
                        ->update(['options' => $attributeValueString]);
            } catch (\Throwable $th) {
                print($th->getMessage());
            }
        }
    }

    public function specificationMigration()
    {
        return $specifications = DB::connection('gng')
        ->table('portonics_specification')
        ->join('portonics_specification_translation', 'portonics_specification.id', '=', 'portonics_specification_translation.specification_id')
        ->get();
    }
}
