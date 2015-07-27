var gulp = require('gulp');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var coffee = require('gulp-coffee');
var plumber = require('gulp-plumber');
var del = require('del');

/*************************
 * List of angular modules
 *************************/
var clientAppCoffeeBase = 'public/src/coffee/';
var clientAppScssBase = 'public/src/scss/';

var appModules = {
    shows: {
        paths: [clientAppCoffeeBase + 'shows.coffee', clientAppCoffeeBase + 'shows/*.coffee'],
    },
    'icon-selector': {
        paths: [clientAppCoffeeBase + 'icon-selector.coffee', clientAppCoffeeBase + 'icon-selector/*.coffee']
    }
};

/*************************
 * Gulp tasks
 *************************/
(function () {
    for (var m in appModules) {
        var paths = appModules[m].paths;
        var outFile = m + '.all.coffee';

        gulp.task(jsTaskName(m), gulpJsFunc(paths, outFile, false));
        gulp.task(jsTaskName(m, true), gulpJsFunc(paths, outFile, true));
    }
}());

// Set up tasks for sass
(function () {
    var srcFiles = clientAppScssBase + 'app.scss';

    gulp.task('sass', sassFunc(srcFiles, false));
    gulp.task('sassdebug', sassFunc(srcFiles, true));
})();

// Default task runs all js tasks then runs sass and watches all
gulp.task('default', jsTaskNames(true).concat(['sassdebug', 'watch']));
gulp.task('preprod', ['cleanmaps', 'sass'].concat(jsTaskNames()));

gulp.task('watch', function () {
    gulp.watch('public/src/scss/*.scss', ['sassdebug']);
    watchappModules();
});
gulp.task('cleanmaps', function (cb) {
    del('public-app/maps', cb);
});

/*************************
 * Supporting functions
 *************************/
function watchappModules() {
    for (var m in appModules) {
        var paths = appModules[m].paths;
        gulp.watch(paths, [jsTaskName(m, true)]);
    }
}

function gulpJsFunc(glob, outFile, isDebug) {
    function action(pipeline) {
        return pipeline
            .pipe(coffee())
            .pipe(concat(outFile));
    }

    return gulpFunc(glob, 'public/dist/js', '.min.js', !isDebug, action);
}

function sassFunc(glob, isDebug) {
    function action(pipeline) {
        var options = isDebug ? {} : {
            outputStyle: 'compressed'
        };

        return pipeline.pipe(sass(options).on('error', sass.logError));
    }

    return gulpFunc(glob, 'public/dist/css', '.min.css', false, action);
}

function gulpFunc(glob, outFolder, ext, isUglify, action) {
    return function () {
        var pipeline = gulp.src(glob)
            .pipe(plumber())
            .pipe(sourcemaps.init());

        var pipeline =
            action(pipeline)
            .pipe(rename({
                extname: ext
            }));

        pipeline = isUglify ? pipeline.pipe(uglify()) : pipeline;

        return pipeline
            .pipe(sourcemaps.write('../../maps'))
            .pipe(gulp.dest(outFolder));
    };
}

function jsTaskName(mod, debug) {
    return mod + 'js' + (!debug ? '' : 'debug');
}

function jsTaskNames(debug) {
    var names = [];
    for (var m in appModules) {
        names.push(jsTaskName(m, debug));
    }
    return names;
}