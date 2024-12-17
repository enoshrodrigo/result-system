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
        Schema::create('certificate_level_finals', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->unsignedBigInteger('level_student_id');
            $table->unsignedBigInteger('level_course_id');
            $table->string('Grammar',10);
            $table->string('Compostion',10);
            $table->string('Comprehesion',10);
            $table->string('Literature',10);
            $table->string('Speech',10);
            $table->string('status')->nullable();

            $table->foreign('level_student_id')->references('id')->on('students');
            $table->foreign('level_course_id')->references('id')->on('course_levels');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('certificate_level_finals');
    }
};
