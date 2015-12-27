//require("babel/register");

var gulp = require("gulp");
var sass = require("gulp-sass");
var slim = require("gulp-slim");
var karma = require("karma");
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var babelify = require('babelify');
var browsersync = require('browser-sync');

gulp.task('slim', function(){
  gulp.src("./src/**/*.slim")
    .pipe(slim({
      pretty: true
    }))
    .pipe(gulp.dest("./dest"))
    .pipe(browsersync.stream());
});

gulp.task('sass', function() {
  gulp.src('./src/sass/**/*.sass')
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(gulp.dest('./dest'))
    .pipe(browsersync.stream());
});

gulp.task('concat', function() {
  browserify({
    entries: ['./src/js/main.js'],
    debug : !gulp.env.production
  }).transform(babelify, { presets: ["es2015"] })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest("./dest"))
    .pipe(browsersync.stream());
});

gulp.task('bs', function() {
  browsersync.init({
    server: {
      baseDir: 'dest'
    },
    open: false,
    //logLevel: 'debug'
  });
});

gulp.task('karma', function (done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});

// Watch
gulp.task('default', ['bs'], function() {
  gulp.watch("./src/**/*.slim", ['slim']);
  gulp.watch("./src/sass/**/*.sass", ['sass']);
  gulp.watch("./src/js/**/*.js", ['concat']);
  gulp.watch("./spec/**/*Spec.js", ['karma']);
});

