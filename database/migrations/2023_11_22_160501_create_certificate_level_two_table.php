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
        Schema::create('certificate_level_twos', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->unsignedBigInteger('level_student_id');
            $table->unsignedBigInteger('level_course_id');
            $table->string('Grammar & Writing',10);
            $table->string('Reading & Vocabulary',10);
            $table->string('Speech & Listening',10);
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
        Schema::dropIfExists('certificate_level_twos');
    }
};
