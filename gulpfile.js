var gulp = require('gulp');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var gulpSass = require('gulp-sass');
var concat = require('gulp-concat');
var del = require('del');

// Define all the js angular modules we're going to process
var jsModules = {
    shows: {
        paths: ['client-app/js/shows.js', 'client-app/js/shows/*.js'],
    },
    'icon-selector': {
        paths: ['client-app/js/icon-selector.js', 'client-app/js/icon-selector/*.js']
    }
};

// Set up tasks for each js module separately (so files combine and generate separately)
(function () {
    for (var m in jsModules) {
        var paths = jsModules[m].paths;
        var outFile = m + '.all.js';

        gulp.task(jsTaskName(m), GulpJsFunc(paths, outFile, false));
        gulp.task(jsTaskName(m, true), GulpJsFunc(paths, outFile, true));
    }
}());

// Set up tasks for sass
(function() {
    var srcFiles = 'client-app/scss/app.scss';
    
    gulp.task('sass', GulpSassFunc(srcFiles, false));
    gulp.task('sassdebug', GulpSassFunc(srcFiles, true));
})();

// Default task runs all js tasks then runs sass and watches all
gulp.task('default', jsTaskNames(true).concat(['sassdebug', 'watch']));
gulp.task('preprod', ['cleanmaps', 'sass'].concat(jsTaskNames()));

gulp.task('watch', function () {
    gulp.watch('client-app/scss/*.scss', ['sassdebug']);
    watchJsModules();
});
gulp.task('cleanmaps', function (cb) {
    del('public-app/maps', cb);
});

function watchJsModules() {
    for (var m in jsModules) {
        var paths = jsModules[m].paths;
        gulp.watch(paths, [jsTaskName(m, true)]);
    }
}

function GulpJsFunc(glob, outFile, isDebug) {
    function action() {
        return concat(outFile);
    }
    
    return GulpFunc(glob, 'public-app/js', '.min.js', !isDebug, isDebug, action);
}

function GulpSassFunc(glob, isDebug) {
    function action() {
        var options = isDebug ? {} : { outputStyle: 'compressed' };
        return gulpSass(options).on('error', gulpSass.logError);
    }
    
    return GulpFunc(glob, 'public-app/css', '.min.css', false, isDebug, action);
}

function GulpFunc(glob, outFolder, ext, isUglify, isMap, action) {
    return function () {
        var pipeline = gulp.src(glob)

        pipeline = isMap ? pipeline.pipe(sourcemaps.init()) : pipeline;

        pipeline = pipeline
            .pipe(action())
            .pipe(rename({
                extname: ext
            }));
        
        pipeline = isUglify ? pipeline.pipe(uglify()) : pipeline;
        
        pipeline = isMap ? pipeline.pipe(sourcemaps.write('../maps')) : pipeline;

        return pipeline.pipe(gulp.dest(outFolder));
    };
}

function jsTaskName(mod, debug) {
    return mod + 'js' + (!debug ? '' : 'debug');
}

function jsTaskNames(debug) {
    var names = [];
    for (var m in jsModules) {
        names.push(jsTaskName(m, debug));
    }
    return names;
}