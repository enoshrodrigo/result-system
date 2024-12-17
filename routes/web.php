<?php

use App\Http\Controllers\Axios;
use App\Http\Controllers\CsvUpload;
use App\Http\Controllers\DisplayStudent;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UploadResult;
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
Route::get('/add-new/intake', function () {
    return Inertia::render('AddNewIntake');
})->name('AddNewIntake');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/view/render-result', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('viewAllBatchResult');

Route::get('/add-result', function () {
    return Inertia::render('AddResult');
})->middleware(['auth', 'verified'])->name('addResult');


Route::get('/add-subject', function () {
    return Inertia::render('AddSubject');
})->middleware(['auth', 'verified'])->name('getsubjects');


Route::get('/view-result', function () {
    return Inertia::render('StudentView/ViewNewResult');
})->name('ViewResult');

Route::post('/check-result', [ViewResult::class,'get'])->name('checkresult'); 

Route::get('/check-result', [ViewResult::class, 'show'])->name('checkresult');

 Route::post('/Display/render-result',[DisplayStudent::class,'DisplayResult'])->name('DisplayResult');
    Route::get('/Display/render-result',[DisplayStudent::class,'getresult'])->name('DisplayResult');
 

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    // Route::post('/upload/result', [UploadResult::class,'store'])->name('uploadresult');
    // Route::post('/upload/result',[CsvUpload::class,'uploadcsv'])->name('Auploadcsv');
    Route::post('/view/render-result',[Axios::class,'viewAllBatchResult'])->name('viewAllBatchResult');
    Route::get('/view/getStatistics',[Axios::class,'getStatistics'])->name('getStatistics'); 
    







});

require __DIR__.'/auth.php';
