/*eslint no-console: 0*/
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const eslint = require('gulp-eslint');
const jasmine = require('gulp-jasmine-phantom');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');

gulp.task('default', ['copy-html','copy-images','styles', 'lint', 'serve'], () => {
	gulp.watch('sass/**/*.scss', ['styles']);
	gulp.watch('js/**/*.js',['lint']);
	gulp.watch('./*.html',['copy-html']);
	gulp.watch('./*.html').on('change', browserSync.reload);
});

gulp.task('serve', () => {

	browserSync.init({
		server: './dist'
	});

	gulp.watch('app/scss/*.scss', ['sass']);
	gulp.watch('app/*.html').on('change', browserSync.reload);
});

gulp.task('scripts',()=>{
	gulp.src('js/**/*.js')
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist',()=>{
	gulp.src('js/**/*.js')
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('lint', () => {
	// ESLint ignores files with "node_modules" paths.
	// So, it's best to have gulp ignore the directory as well.
	// Also, Be sure to return the stream from the task;
	// Otherwise, the task may end before the stream has finished.
	gulp.src(['./*.js','js/**/*.js','!node_modules/**'])
	// eslint() attaches the lint output to the "eslint" property
	// of the file object so it can be used by other modules.
		.pipe(eslint())
	// eslint.format() outputs the lint results to the console.
	// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
	// To have the process exit with an error code (1) on
	// lint error, return the stream and pipe to failAfterError last.
		.pipe(eslint.failAfterError());
});

gulp.task('styles', () => {
	gulp.src('sass/**/*.scss')
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});

gulp.task('copy-html', () =>{
	gulp.src('./*.html')
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', () =>{
	gulp.src('img/*')
		.pipe(gulp.dest('dist/img'));
});

gulp.task('unitTests', () => {
	return gulp.src('spec/test.js')
		.pipe(jasmine());
});
   
gulp.task('integrationTests', () => {
	return gulp.src('spec/test.js')
		.pipe(jasmine({
			integration: true,
			vendor: 'js/**/*.js'
		}));
});