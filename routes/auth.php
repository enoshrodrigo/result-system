<?php

use App\Http\Controllers\AddBatchsAndSubs;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Axios;
use App\Http\Controllers\CSVFile; 
use App\Http\Controllers\DeleteRequets;
use App\Http\Controllers\EmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    // Route::get('register', [RegisteredUserController::class, 'create'])
    //             ->name('register');

    // Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
                ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
                ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
                ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
                ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
                ->name('password.store');

   
 
});

Route::middleware('auth','role:admin')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
                ->name('verification.notice');

    Route::get('register', [RegisteredUserController::class, 'create'])
                ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);


    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
                ->middleware(['signed', 'throttle:6,1'])
                ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
                ->middleware('throttle:6,1')
                ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
                ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
                ->name('logout');
                 

    Route::post('/admin/get/short/courses',[Axios::class,'getCourses'])->name('getcourses');
    Route::post('/admin/get/levels',[Axios::class,'getLevels'])->name('getlevels');
    Route::post('/admin/get/all/short-courses',[Axios::class,'getAllShortCourses'])->name('allShortcourses');
    Route::post('/admin/get/all/subjects',[Axios::class,'Shortsubjects'])->name('reqsubjects');


    // Route::post('get/semorintake',[Axios::class,'semorintake'])->name('semorintake');
    Route::post('/admin/get/subject',[Axios::class,'getsubjects'])->name('subjects');


    Route::post('/admin/add/shortCourse',[AddBatchsAndSubs::class,'addShortCourse'])->name('addShortCourse');

    Route::post('/admin/get/get_short_course_result_live',[Axios::class,'get_short_course_result_lives'])->name('shortlive');
    Route::post('/admin/get/get_short_course_result_lives/update',[Axios::class,'ShortCourseUpdateLive'])->name('ShortCourseUpdateLive');

    Route::post('/admin/delete/batch',[DeleteRequets::class,'deleteBatch'])->name('deleteBatch');
    
   
    Route::post('/admin/get/updatesubject-status',[Axios::class,'updatesubject'])->name('updatesubject');
   


    Route::post('/admin/get/batchcode', [Axios::class, 'checkBatchCode'])->name('checkBatchCode');
    Route::post('/admin/put/result',[CSVFile::class,'uploadjson'])->name('uploadjson');




 Route::post('/admin/put/updateGrade',[Axios::class,'updateGrade'])->name('updateGrade');
 /* Delete result for one studnt */
    Route::post('/admin/delete/result',[DeleteRequets::class,'deleteResult'])->name('deleteResult');
    /* Add studnt to batch with subjects*/
    Route::post('/admin/update-batch', [Axios::class, 'updateBatch'])->name('updateBatch');
    Route::post('/admin/add/student',[AddBatchsAndSubs::class,'addStudentBatch'])->name('addStudentBatch');
    Route::post('/admin/put/updateStatus',[Axios::class,'updateStatus'])->name('updateStatus');
  
    /* verifySubjects */
  
    Route::post('/admin/verify/subjects',[AddBatchsAndSubs::class,'verifySubjects'])->name('verifySubjects');
    
    Route::post('/admin/send-result-email', [EmailController::class, 'sendResultEmail'])->name('sendResultEmail');
    Route::get('/admin/check-email-progress/{batchId}', [EmailController::class, 'checkEmailProgress'])->name('checkEmailProgress');
    Route::post('/admin/stop-email-process', [EmailController::class, 'stopEmailProcess'])
    ->name('stopEmailProcess');
});

Route::middleware('auth','role:manager,admin')->group(function () {
     Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
                ->name('logout');
    Route::post('/admin/add/subject',[AddBatchsAndSubs::class,'addSubject'])->name('addSubject');
    Route::post('/admin/get/all-subject-status',[Axios::class,'allsubjectsStatus'])->name('allsubjectstatus');
    Route::post('/admin/updatesubject', [AddBatchsAndSubs::class, 'updateSubject'])->name('updatesubject'); 
    Route::post('/admin/delete/subject',[DeleteRequets::class,'deletesubject'])->name('deletesubject');
    
});