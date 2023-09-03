<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('gng')
        ->create('mediasoft_product_variations', function (Blueprint $table) {
            $table->id();
            $table->string('product_id');
            $table->string('item_id');
            $table->string('s_bar_code');
            $table->string('p_bar_code');
            $table->integer('quantity')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('gng')->dropIfExists('product_variations');
    }
};
