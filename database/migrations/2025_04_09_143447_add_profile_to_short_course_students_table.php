<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('short_course_result_lives', function (Blueprint $table) {
            //profile_view is tiniyint
            
            $table->tinyInteger('profile_view')->default(0)->after('student_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('short_course_result_lives', function (Blueprint $table) {
            //
            // Drop the column if it exists
            if (Schema::hasColumn('short_course_result_lives', 'profile_view')) {
                $table->dropColumn('profile_view');
            }
        });
    }
};
