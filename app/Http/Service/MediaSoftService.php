<?php

namespace App\Http\Service;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class MediaSoftService
{
    public function dump()
    {
        $mediaSoftData = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Access_token' => 'kVU41twDyttUL/SM7IO0vQ==@kVU41twDyttUL/SM7IO0vQ==yBjDG6h3c8EHJOfVj7yGnRl9Rf2Or3IAASWNxi1eNm4=',
        ])
        ->post('http://203.76.110.162:8081/Product/GetProductData', [
            "categoryName" => "",
            "productName" => "",
            "modelName" => "",
            "brandName" => "",
            "createDate" => ""
        ]);
        return $this->storeData($mediaSoftData['data']);
    }

    public function storeData($data)
    {
        for ($i=0; $i < count($data); $i++) {
            DB::connection('gng')
                ->table('chinafashion')
                ->insert([
                    'product_id' => $data[$i]['productId'],
                    'name' => $data[$i]['productName'],
                    'category_id' => $data[$i]['categoryId'],
                    'model_id' => $data[$i]['modelId'],
                    'brand_id' => $data[$i]['brandId'],
                    'category_name' => $data[$i]['categoryName'],
                    'model_name' => $data[$i]['modelName'],
                    'brand_name' => $data[$i]['brandName'],
                ]);
            $this->storeDetail($data[$i]['productDetailResponses']);
        }
        return;
    }

    public function storeDetail($data) {
        for ($i=0; $i < count($data); $i++) {
            DB::connection('chinafashion')
                ->table('product_variations')
                ->insert([
                    'product_id' => $data[$i]['productId'],
                    'item_id' => $data[$i]['itemId'],
                    's_bar_code' => $data[$i]['categoryId'],
                    'p_bar_code' => $data[$i]['modelId'],
                ]);
        }
        return;
    }
}
