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
        Schema::create('email_operations', function (Blueprint $table) {
            $table->id();
            $table->string('operation_type');
            $table->uuid('batch_id');
            $table->string('subject')->nullable();
            $table->string('batch_code')->nullable();
            $table->integer('email_count')->nullable();
            $table->json('progress')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->boolean('stopped')->default(false);
            $table->timestamp('stopped_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('email_operations');
    }
};
