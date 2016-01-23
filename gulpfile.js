//
// Gulp is a task runner, it helps you automate things.
// In this case, we're going to use it so it can automatically
// update your JavaScript js files when you edit your TypeScript ts files.
// Read more about Gulp at http://gulpjs.com/
//
var gulp = require('gulp');

// This is a Gulp Plugin for TypeScript.
var typescript = require('gulp-tsc');

// This is the task for compiling our TypeScript source files and outputting them.
gulp.task('compile-typescript', function() {
	var typescriptPaths = {
		src: [
			'ts/*.ts'
		],
		dest: 'js/'
	};

	return gulp.src(typescriptPaths.src)
        .pipe(typescript({
        	emitError: false
        }))
        .pipe(gulp.dest(typescriptPaths.dest));
});

// This is the default task that will run when we run `gulp` at the command line.
gulp.task('default', function() {
	gulp.watch('ts/*.ts', ['compile-typescript']);
});
