<?php

use App\Http\Controllers\Axios; 
use App\Http\Controllers\DisplayStudent;
use App\Http\Controllers\ProfileController; 
use App\Http\Controllers\ViewResult;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});
 

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified','role:admin'])->name('dashboard');

/* Route::get('/view/render-result', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified','role:admin'])->name('viewAllBatchResult'); */

  
Route::get('/upload-result', function () {
    return Inertia::render('UploadResult');
})->middleware(['auth', 'verified','role:admin'])->name('upload');





Route::get('/add-subject', function () {
    return Inertia::render('AddSubject');
})->middleware(['auth', 'verified','role:manager,admin'])->name('getsubjects');


Route::get('/view-result', function () {
    return Inertia::render('StudentView/ViewNewResult');
})->name('ViewResult');

Route::post('/check-result', [ViewResult::class,'get'])->name('checkresult'); 

Route::get('/check-result', [ViewResult::class, 'show'])->name('checkresult');

 Route::post('/display/student-result',[DisplayStudent::class,'DisplayResult'])->name('DisplayResult');
    Route::get('/display/student-result',[DisplayStudent::class,'getresult'])->name('DisplayResult');
 

Route::middleware('auth','role:admin')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy'); 
    Route::get('/view/batch',[Axios::class,'viewAllBatchResult'])->name('viewAllBatchResult');
    Route::get('/view/getStatistics',[Axios::class,'getStatistics'])->name('getStatistics'); 
   
});

require __DIR__.'/auth.php';
