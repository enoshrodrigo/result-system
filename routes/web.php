<?php

use App\Http\Controllers\Axios;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DisplayStudent;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
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
    Route::post('/send-student-result', [EmailController::class, 'sendStudentResult'])->name('sendStudentResult');

Route::middleware('auth','role:admin')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy'); 
    Route::get('/view/batch',[Axios::class,'viewAllBatchResult'])->name('viewAllBatchResult');
    Route::get('/view/getStatistics',[Axios::class,'getStatistics'])->name('getStatistics'); 
    Route::get('/admin/email-logs', [EmailController::class, 'viewLogs'])->name('admin.email-logs.index');
    Route::get('/admin/email-logs/api', [EmailController::class, 'getLogsApi'])->name('admin.email-logs.api');
    Route::get('/admin/email-operations/{operation}/logs', [EmailController::class, 'getOperationLogs'])->name('admin.email-operations.logs');
   
});

Route::middleware('auth','role:manager,admin')->group(function () {
   
        Route::get('/students', [StudentController::class, 'index'])->name('students.index');
        Route::post('/students', [StudentController::class, 'store'])->name('students.store');
        Route::put('/students/{student}', [StudentController::class, 'update'])->name('students.update');
        Route::delete('/students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');
    Route::get('/students/export', [StudentController::class, 'export'])->name('students.export');
    Route::post('/students/email', [StudentController::class, 'email'])->name('students.email');
     // Department Management Routes
     Route::get('/departments', [DepartmentController::class, 'index'])->name('departments.index');
     Route::post('/departments', [DepartmentController::class, 'storeDepartment'])->name('departments.store');
     Route::put('/departments/{id}', [DepartmentController::class, 'updateDepartment'])->name('departments.update');
     Route::delete('/departments/{id}', [DepartmentController::class, 'destroyDepartment'])->name('departments.destroy');
     
     // Course Management Routes
     Route::post('/courses', [DepartmentController::class, 'storeCourse'])->name('courses.store');
     Route::put('/courses/{id}', [DepartmentController::class, 'updateCourse'])->name('courses.update');
     Route::delete('/courses/{id}', [DepartmentController::class, 'destroyCourse'])->name('courses.destroy');
 
   
});

require __DIR__.'/auth.php';

 
/* public function uploadProfileImage(Request $request)
{
    // Validate the request
    $request->validate([
        'profile_image' => 'required|image|max:2048',
        'student_id' => 'required|exists:short_course_students,id'
    ]);
    
    // Store the file
    $file = $request->file('profile_image');
    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
    $path = 'profile-images/' . $fileName;
    
    // Save to storage
    Storage::disk('public')->put($path, file_get_contents($file));
    
    // Update student record
    $student = short_course_student::findOrFail($request->student_id);
    $student->profile_image = $path;
    $student->save();
    
    // Create a custom image URL that works on Hostinger
    $baseUrl = url('/'); // Your application base URL
    $imageUrl = $baseUrl . '/images/' . $path;
    
    return response()->json([
        'success' => true,
        'message' => 'Profile image updated successfully',
        'image_url' => $imageUrl,
        'path' => $path // Used for debugging
    ]);
} */


 
// Custom route for serving images (works on Hostinger without storage:link)
/* Route::get('/images/{path}', function($path) {
    // Security: Prevent directory traversal
    $path = str_replace('..', '', $path);
    
    // Get the file path in storage
    $fullPath = storage_path('app/public/' . $path);
    
    if (!file_exists($fullPath)) {
        abort(404);
    }
    
    // Get the file content and MIME type
    $fileContents = file_get_contents($fullPath);
    $mimeType = mime_content_type($fullPath) ?: 'image/jpeg';
    
    // Return the image with proper headers
    return response($fileContents)
        ->header('Content-Type', $mimeType)
        ->header('Cache-Control', 'public, max-age=86400');
})->where('path', '.*'); */