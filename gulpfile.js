var gulp = require('gulp');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var gulpSass = require('gulp-sass');

gulp.task('js', function () {
    return gulp.src('client-app/js/*.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('public-app/js'));
});

gulp.task('sass', function () {
    return gulp.src('client-app/scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(gulpSass({outputStyle: 'compressed'}).on('error', gulpSass.logError))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('public-app/css'));
});

gulp.task('watch', function() {
    gulp.watch('client-app/js/*.js', ['js']);
    gulp.watch('client-app/scss/*.scss', ['sass']);
});

gulp.task('default', ['js', 'sass', 'watch']);