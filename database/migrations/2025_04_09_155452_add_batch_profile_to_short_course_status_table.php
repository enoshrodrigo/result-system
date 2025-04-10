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
        Schema::table('short_course_status', function (Blueprint $table) {
            //
            $table->tinyInteger('student_profile_view')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('short_course_status', function (Blueprint $table) {
            //
            // Drop the column if it exists
            if (Schema::hasColumn('short_course_status', 'student_profile_view')) {
                $table->dropColumn('student_profile_view');
            }
        });
    }
};
