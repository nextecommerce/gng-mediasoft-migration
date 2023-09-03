<?php

namespace App\Http\Controllers;

use App\Http\Service\MediaSoftService;
use App\Http\Service\MigrationService;
use App\Http\Service\ProductMigrationService;
use Illuminate\Http\Request;

class MigrationController extends Controller
{
    public function index()
    {
        // $service = new MigrationService();
        // return $service->migrate();

        // $product = new ProductMigrationService();
        // return $product->migrate();

        $mediaSoftService = new MediaSoftService();
        return $mediaSoftService->dump();
    }

    /**
     * Display a listing of the resource.
     */
    public function mediasoft()
    {
        $mediaSoftService = new MediaSoftService();
        return $mediaSoftService->dump();
    }
}
