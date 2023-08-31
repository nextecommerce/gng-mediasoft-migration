<?php

namespace App\Http\Service;

use Illuminate\Support\Facades\DB;

class ProductMigrationService
{
    public function migrate()
    {
        return $this->migrateProduct();
        return $this->specificationMigration();
    }

    private function migrateProduct()
    {
        return $products = DB::connection('gng')
        ->table('portonics_product')
        ->join('portonics_product_translation', 'portonics_product.id', '=', 'portonics_product_translation.product_id')
        ->join('portonics_product_categories', 'portonics_product.id', '=', 'portonics_product_categories.product_id')
        ->join('portonics_product_options', 'portonics_product.id', '=', 'portonics_product_options.product_id')
        ->join('portonics_product_warranty_and_support', 'portonics_product.id', '=', 'portonics_product_warranty_and_support.product_id')
        ->take(30)
        ->get();

        for ($i=0; $i < count($products); $i++) {
            $product = $products[$i];
            DB::connection('saas')
            ->table('product')
            ->insert([
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'category_id' => $product->cat_id,
                'brand_id' => $product->brand_id,
                'short_description' => $product->short_description,
                'warranty' => $product->ws_title,
                'warranty_policy' => $product->ws_text,
                'package_weight' => $product->weight,
                'package_length' => $product->length,
                'package_width' => $product->width,
                'package_height' => $product->height,
            ]);
        }
    }

    public function imageMigration()
    {

    }

    public function specificationMigration()
    {
        $specification = DB::connection('gng')
        ->table('portonics_product_specification')
        ->join('portonics_specification', 'portonics_product_specification.specification_id', '=', 'portonics_specification.id')
        ->join('portonics_specification_translation', 'portonics_specification.id', '=', 'portonics_specification_translation.specification_id')
        ->take(10)
        ->get();

        $specificationList = array();
        for ($i=0; $i < count($specification); $i++) {
            $spec = $specification[$i];
            $obj = [
                'id' => $spec->id,
                'product_id' => $spec->product_id,
                'key' => $spec->description,
                'value' => $spec->title,
            ];
            array_push($specificationList, $obj);
        }

        return DB::connection('saas')
        ->table('specification')
        ->insert($specificationList);
    }

    private function skuMigration()
    {
        
    }

    public function faqMigration()
    {
        $faqs = DB::connection('gng')
        ->table('portonics_product_faqs')
        ->get();
    }
}
