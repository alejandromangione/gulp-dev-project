'use strict';

var gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  jshint = require('gulp-jshint'),
  sass = require('gulp-sass'),
  cache = require('gulp-cache'),
  imagemin = require('gulp-imagemin'),
  // uglify = require('gulp-uglify'),
  // minifyCss = require('gulp-minify-css'),
  // uncss = require('gulp-uncss'),
  useref = require('gulp-useref'),
  gulpif = require('gulp-if'),
  assets = useref.assets(),
  wiredep = require('wiredep').stream,
  connect = require('connect'),
  serveStatic = require('serve-static'),
  serveIndex = require('serve-index'),
  livereload = require('gulp-livereload'),
  fileinclude = require('gulp-file-include');


gulp.task('clean', function (cb) {
  require('rimraf')('preview', cb);
});

gulp.task('lint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('preview/scripts'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe(plumber())
    // .pipe(cache(imagemin({
    //   progressive: true,
    //   interlaced: true
    // })))
    .pipe(gulp.dest('preview/images'));
});

gulp.task('fonts', function () {
  return gulp.src('app/fonts/*')
    .pipe(plumber())
    .pipe(gulp.dest('preview/fonts'));
});

gulp.task('misc', function () {
  return gulp.src([
      'app/*.{ico,png,txt,json}',
      'app/.htaccess'
    ])
    .pipe(plumber())
    .pipe(gulp.dest('dist'));
});

gulp.task('html', ['styles'], function () {
  return gulp.src('app/*.html')
    .pipe(plumber())
    .pipe(assets)
    // .pipe(gulpif('*.js', uglify()))
    // .pipe(gulpif('*.css', minifyCss())) **** DONT REMOVE ****
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('wiredep', function () {
  gulp.src('app/*.html')
    .pipe(plumber())
    .pipe(wiredep({
      directory: 'bower_components'
    }))
    .pipe(gulp.dest('app'));
});

/* Live Reload */

gulp.task('fileinclude', function() {
  gulp.src(['app/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('preview'));
});

gulp.task('styles', function () {
  return gulp.src('app/styles/*.scss')
    .pipe(plumber())
    .pipe(sass({
      includePaths: ['bower_components/foundation-sites/scss'],
      precision: 10, 
      errLogToConsole: true
    }))
    // .pipe(uncss({
  //           html: ['index.html', 'app/**/*.html']
  //       }))
    .pipe(gulp.dest('preview/styles'));
});

gulp.task('connect', function () {
  var app = connect()
    .use(require('connect-livereload')({ port: 35729 }))
    .use(serveStatic('.'))
    .use(serveIndex('.'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function() {
      console.log('Started connect web server on http://localhost:9000.');
    });
});

gulp.task('serve', ['fileinclude' ,'styles', 'images', 'fonts', 'lint', 'connect'], function () {

  livereload.listen();

  require('opn')('http://localhost:9000');

  gulp.watch([
    'app/*.htm', // Partial files
    'app/*.html',
    'app/*.json',
    'app/styles/**/*.scss',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', livereload.changed);

  gulp.watch('app/styles/**/*.scss', ['styles']);

  gulp.watch('bower.json', ['wiredep']);

  gulp.watch(['app/*.html', 'app/*.htm'], ['fileinclude']);

  gulp.watch('app/images/**/*', ['images']);

  gulp.watch('app/scripts/**/*.js', ['lint']);

});

/* /Live Reload/ */

// gulp.task('build', ['lint', 'html', 'images', 'fonts', 'misc']);

gulp.task('default', ['clean'], function () {
  gulp.start('serve');
});

