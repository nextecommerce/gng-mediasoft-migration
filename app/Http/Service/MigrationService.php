<?php

namespace App\Http\Service;

use Illuminate\Support\Facades\DB;

class MigrationService
{
    public function migrate()
    {
        $this->migrateCategory();
        // $this->migrateUsers();
        // $this->migratePosts();
        // $this->migrateComments();
    }

    private function migrateCategory()
    {
        DB::connection('mysql')
        ->table('category');
    }
}
