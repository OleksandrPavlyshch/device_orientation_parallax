'use strict';

var gulp = require('gulp')
	, mainBowerFiles = require('main-bower-files')
	, postcss = require('gulp-postcss')
	, sass = require('gulp-sass')
	, sassGlob = require('gulp-sass-glob')
	, jade = require('gulp-jade')
	, sourcemaps = require('gulp-sourcemaps')
	, autoprefixer = require('autoprefixer')
	, plumber = require('gulp-plumber')
	, connect = require('gulp-connect')
	, imagemin = require('gulp-imagemin')
	, pngquant = require('imagemin-pngquant')
	, gulpif = require('gulp-if')
	, spritesmith = require('gulp.spritesmith')
	, mqpacker = require("css-mqpacker")
	, uglify = require('gulp-uglify')
	, concat = require('gulp-concat')
	, fs = require('fs')
	, iconfont = require("gulp-iconfont")
	, iconfontCss = require('gulp-iconfont-css')
	, dirs = {
		'source': {
			'vendorJs': './source/js/vendor/'
			, 'vendorCss': './source/css/vendor/'
			, 'favicon': './source/favicon/*.ico'
			, 'js': './source/elements/**/*.js'
			, 'fonts': './source/fonts/**/*'
			, 'fontsFolder': './source/fonts/'
			, 'jade': './source/pages/*.jade'
			, 'jadeJson': './source/pages/jsons/index.json'
			, 'jade_watch': ['./source/pages/**/*.jade', './source/pages/**/*.json', './source/elements/**/*.jade', './source/elements/**/*.json']
			, 'sass': ['./source/sass/**/*.*', './source/elements/**/*.sass']
			, 'sassFolder': './source/sass/'
			, 'img': './source/img/*.*'
			, 'icons': './source/img/icons/*.png'
			, 'cssTemplate': './source/helpers/sprite.template.mustache'
			, 'helpers': './source/helpers/'
			, 'svgFontsAssets': './source/svg-font-assets/*.svg'
		}
		, 'build': {
			'vendorJs': './build/js/vendor/'
			, 'vendorCss': './build/css/vendor/'
			, 'css': './build/css/'
			, 'js': './build/js/'
			, 'fonts': './build/fonts/'
			, 'build': './build'
			, 'img': './build/img/'
		}
	};


gulp.task('favicon', function() {
	gulp.src(dirs.source.favicon)
	.pipe(plumber())
	.pipe(gulp.dest(dirs.build.build));
});

gulp.task('connect', function() {
	connect.server({
		root: dirs.build.build
		, livereload: true
		, port: 8888
	});
});


// icon font
var fontname = 'svgfont';

gulp.task('iconfont', function () {
	return gulp.src([dirs.source.svgFontsAssets])
	.pipe(plumber())
	.pipe(iconfontCss({
		fontName: fontname
		, path: 'source/helpers/_svgfont.sass'
		, targetPath: '../../' + dirs.source.sassFolder + '_svgfont.sass'
		, fontPath: '../fonts/'
		, cssClass: 'icon'
	}))
	.pipe(plumber())
	.pipe(iconfont({
		fontName: fontname
		, prependUnicode: true
		, formats: ['ttf', 'eot', 'woff', 'woff2']
		, normalize: true
		, fontHeight: 1001
		, fontStyle: 'normal'
		, fontWeight: 'normal'
	}))
	.pipe(gulp.dest(dirs.source.fontsFolder));
});


gulp.task('vendor-js', function() {
	return gulp.src(mainBowerFiles('**/*.js'))
	.pipe(plumber())
	.pipe(uglify())
	.pipe(gulp.dest(dirs.build.vendorJs));
});

gulp.task('vendor-css', function() {
	return gulp.src(mainBowerFiles('**/*.css'))
	.pipe(plumber())
	.pipe(gulp.dest(dirs.build.vendorCss));
});

//fonts
gulp.task('fonts', function() {
	gulp.src(dirs.source.fonts)
	.pipe(gulp.dest(dirs.build.fonts));
});

//jade
gulp.task('templates', function() {
	var jadeJson = JSON.parse( fs.readFileSync(dirs.source.jadeJson, { encoding: 'utf8' }));

	gulp.src(dirs.source.jade)
	.pipe(plumber())
	.pipe(jade({
		pretty: true
		, locals: jadeJson
	}))
	.pipe(gulp.dest(dirs.build.build))
	.pipe(connect.reload());
});

//sass
gulp.task('sass', function () {

	var processors = [
		autoprefixer({browsers: ['last 1 version'], cascade: false}),
		mqpacker({
			sort: function (a, b) {
				a = a.replace(/\D/g,'');
				b = b.replace(/\D/g,'');
				return b-a;
			}
		})
	];

	return gulp.src(dirs.source.sass)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sassGlob())
		.pipe(sass({
			outputStyle: 'compact'
		}).on('error', sass.logError))
		.pipe(postcss(processors))
		// .pipe(sourcemaps.write())
		.pipe(gulp.dest(dirs.build.css))
		.pipe(connect.reload());
});

//images
gulp.task('images', function() {
	return gulp.src(dirs.source.img)
		.pipe(plumber())
		.pipe(gulpif(/[.](png|jpeg|jpg|svg)$/, imagemin({
			progressive: true
			, svgoPlugins: [{
				removeViewBox: false
			}]
			, use: [pngquant()]
		})))
		.pipe(gulp.dest(dirs.build.img));
});

//backgrounds
// gulp.task('backgrounds', function() {
// 	return gulp.src(dirs.source.backgrounds)
// 		.pipe(plumber())
// 		.pipe(gulpif(/[.](png|jpeg|jpg|svg)$/, imagemin({
// 			progressive: true,
// 			svgoPlugins: [{
// 				removeViewBox: false
// 			}],
// 			use: [pngquant()]
// 		})))
// 		.pipe(gulp.dest(dirs.build.backgrounds));
// });

// sprite
gulp.task('sprite', function() {
	var spriteData = gulp.src(dirs.source.icons)
	.pipe(plumber())
	.pipe(spritesmith({
		imgName: 'icons.png'
		, cssName: '_sprite.sass'
		, imgPath: '../img/icons.png'
		, cssFormat: 'sass'
		, padding: 4
		, cssTemplate: dirs.source.cssTemplate
	}));
	spriteData.img
		.pipe(gulp.dest(dirs.build.img));
	spriteData.css
		.pipe(gulp.dest(dirs.source.sassFolder));
});

//js
gulp.task('js', function() {
	return gulp.src(dirs.source.js)
	.pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(uglify())
	.pipe(concat("index.js"))
	// .pipe(sourcemaps.write())
	.pipe(gulp.dest(dirs.build.js))
	.pipe(connect.reload());
});

gulp.task('watch', function(){
	gulp.watch(dirs.source.jade_watch, ['templates']);
	gulp.watch(dirs.source.sass, ['sass']);
	gulp.watch(dirs.source.js, ['js']);
	gulp.watch(dirs.source.img, ['images']);
	gulp.watch(dirs.source.icons, ['sprite']);
	gulp.watch(dirs.source.helpers + '*.*', ['iconfont']);
});

gulp.task('default', ['iconfont', 'favicon', 'fonts', 'vendor-js', 'vendor-css', 'js', 'sprite', 'images', 'templates', 'sass', 'connect', 'watch']);
