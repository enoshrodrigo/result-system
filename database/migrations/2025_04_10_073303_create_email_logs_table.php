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
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id')->nullable();
            $table->string('student_name')->nullable();
            $table->string('nic')->nullable();
            $table->string('email');
            $table->string('subject')->nullable();
            $table->string('batch_code')->nullable();
            $table->string('batch_name')->nullable();
            $table->string('email_type')->default('general');
            $table->string('status');
            $table->uuid('tracking_id')->unique();
            $table->boolean('opened')->default(false);
            $table->timestamp('opened_at')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('opened_ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->text('opened_user_agent')->nullable();
            $table->text('error')->nullable();
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
        Schema::dropIfExists('email_logs');
    }
};
