var gulp       = require('gulp'),
	less         = require('gulp-less'),
	browserSync  = require('browser-sync'),
	concat       = require('gulp-concat'),
	uglify       = require('gulp-uglifyjs'),
	cssnano      = require('gulp-cssnano'),
	rename       = require('gulp-rename'),
	del          = require('del'),
	autoprefixer = require('gulp-autoprefixer'),
	plumber      = require('gulp-plumber'),
	notify       = require("gulp-notify"),
	spritesmith  = require("gulp.spritesmith"),
	sourcemaps	 = require('gulp-sourcemaps'),
	svgSprite		 = require('gulp-svg-sprite'),
	svgmin 		 	 = require('gulp-svgmin'),
	replace 		 = require('gulp-replace'),
	cheerio 		 = require('gulp-cheerio'),
	babel        = require('gulp-babel');

gulp.task('less', function(){
	return gulp.src(['dev/less/**/main.less'])
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(less({outputStyle: 'expanded'}))
		.on("error", notify.onError(function(error) {
			return {
				title: 'Less',
				message: error.message
			};
		}))
		.pipe(autoprefixer(['last 5 versions'], { cascade: true }))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('dev/css'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'dev'
		},
	notify: false
	});
});

gulp.task('scripts', function() {
	return gulp.src([
		'dev/libs/slick/slick.min.js',
		'dev/libs/wowjs/wow.min.js'
		])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dev/js'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('cleansprite', function() {
	return del.sync('dev/img/pngSprite/sprite.png');
});

gulp.task('pngSpriteBuild', function() {
	var spriteData =
		gulp.src('dev/img/pngSprite/*.*')
		.pipe(spritesmith({
			imgName: 'sprite.png',
			cssName: 'pngSprite.less',
			padding: 15,
			cssFormat: 'less',
			algorithm: 'binary-tree', 
			// cssTemplate: 'handlebarsInheritance.sass.handlebars',
			cssVarMap: function(sprite) {
				sprite.name = 's-' + sprite.name;
			}
		}));

	spriteData.img.pipe(gulp.dest('dev/img/pngSprite/'));
	spriteData.css.pipe(gulp.dest('dev/less/'));
});
gulp.task('pngSprite', ['cleansprite', 'pngSpriteBuild']);

gulp.task('svgSpriteBuild', function () {
	return gulp.src('./dev/img/svgSprite/*.svg')
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parserOptions: {xmlMode: true}
		}))
		.pipe(replace('&gt;', '>'))
		.pipe(svgSprite({
			mode: {
				symbol: {
					sprite: "sprite.svg"
				}
			}
		}))
		.pipe(gulp.dest('./dev/img/svgSprite/'));
});
gulp.task('svgSprite', ['svgSpriteBuild']);

gulp.task('common-scripts', function() {
	return gulp.src([
		'dev/js/common.js'
		])
		.pipe(plumber())
		.pipe(babel())    
		.pipe(concat('common.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dev/js'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('css-main', ['less'], function() {
	return gulp.src('dev/css/main.css')
		.pipe(plumber())
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dev/css'));
});

gulp.task('watch', ['browser-sync', 'css-main', 'scripts'], function() {
	gulp.watch('dev/less/**/*.less', ['less']);
	gulp.watch('dev/*.html', browserSync.reload);
	gulp.watch('dev/js/**/*.js', ['common-scripts']);
});

gulp.task('clean', function() {
	return del.sync('build');
});

gulp.task('img', function() {
	return gulp.src('dev/img/**/*')
		.pipe(gulp.dest('build/img'));
});

gulp.task('build', ['clean', 'img', 'less', 'common-scripts', 'scripts'], function() {

	var buildCssMainMin = gulp.src([
		'dev/css/main.min.css',
		'dev/css/main.css'
		])
	.pipe(gulp.dest('build/css'))

	var buildFonts = gulp.src('dev/fonts/**/*')
	.pipe(gulp.dest('build/fonts'))

	var buildSvg = gulp.src('dev/img/svgSprite/symbol/sprite.svg')
	.pipe(gulp.dest('build/img/svgSprite/symbol'))

	var buildJs = gulp.src('dev/js/**/*')
	.pipe(gulp.dest('build/js'))

	var buildHtml = gulp.src('dev/*.html')
	.pipe(gulp.dest('build'));

	var buildImg = gulp.src('dev/img/pngSprite/sprite.png')
	.pipe(gulp.dest('build/img/sprite/'));
});

gulp.task('default', ['watch']);