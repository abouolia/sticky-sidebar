var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var header = require('gulp-header');
var concat = require('gulp-concat');

var pkg = require('./package.json');

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

gulp.task("babel", function () {
  return gulp.src("src/*.js")
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"));
});

gulp.task('concat', function() {
  return gulp.src(['bower_components/raf.js/raf.js', './dist/sticky-sidebar.js'])
    .pipe(concat('sticky-sidebar.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('uglify', function(){
  return gulp.src("dist/sticky-sidebar.js")
    .pipe(uglify())
    .pipe(header(banner, {pkg}))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest("dist"));
});
