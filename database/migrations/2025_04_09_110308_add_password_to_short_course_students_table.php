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
        Schema::table('short_course_students', function (Blueprint $table) {
            //
            $table->string('password')->nullable();
            $table->string('profile_image')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('short_course_students', function (Blueprint $table) {
            //
            $table->dropColumn('password');
            $table->dropColumn('profile_image');
        });
    }
};
