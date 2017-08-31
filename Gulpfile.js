const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const header = require('gulp-header');
const concat = require('gulp-concat');
const gutil = require('gulp-util');
const rollup = require('gulp-rollup');
const pkg = require('./package.json'); 

const banner = [
  '/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @author <%= pkg.author %>',
  ' * @license <%= pkg.license %>',
  '**/',
  '',
].join('\n');

gulp.task("default", ['babel', 'concat', 'uglify']);

gulp.task("babel", function(){
  return gulp.src("src/*.js")
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});

gulp.task('concat', ['babel'], function(){
  return gulp.src(['bower_components/raf.js/raf.js', './dist/sticky-sidebar.js'])
    .pipe(concat('sticky-sidebar.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('bundle', ['concat'], function(){
  return gulp.src(["dist/sticky-sidebar.js", "dist/jquery.sticky-sidebar.js"])
    .pipe(sourcemaps.init())
    // transform the files here.
    .pipe(rollup({
      // any option supported by Rollup can be set here.
      entry: ['./dist/sticky-sidebar.js', './dist/jquery.sticky-sidebar.js'],
      format: 'iife',
      moduleName: 'stickySidebarModule'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('uglify', ['bundle'], function(){
  return gulp.src(["dist/sticky-sidebar.js", "dist/jquery.sticky-sidebar.js"])
    .pipe(uglify())
    .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(header(banner, {pkg}))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest("dist/"));
});
 
gulp.task('default', ['babel', 'concat', 'bundle', 'uglify']);