<?php

namespace App\Http\Service;

use Illuminate\Support\Facades\DB;

class ProductMigrationService
{
    public function migrate()
    {
        return $this->migrateProduct();
    }

    private function migrateProduct()
    {
        return $products = DB::connection('gng')
        ->table('portonics_product')
        ->join('portonics_product_translation', 'portonics_product.id', '=', 'portonics_product_translation.product_id')
        ->join('portonics_product_categories', 'portonics_product.id', '=', 'portonics_product_categories.product_id')
        ->take(3)
        ->get();
    }

    public function attributeMigration()
    {

    }

    public function attributeValueMigration()
    {

    }

    public function imageMigration()
    {

    }

    public function specificationMigration()
    {
        $specification = DB::connection('gng')
        ->table('portonics_specification')
        ->get();
    }

    public function tagMigration()
    {

    }

    public function warrentMigration()
    {
        $warrenty = DB::connection('gng')
        ->table('portonics_product_warrenty_and_support')
        ->get();
    }

    public function faqMigration()
    {
        $faqs = DB::connection('gng')
        ->table('portonics_product_faqs')
        ->get();
    }
}
