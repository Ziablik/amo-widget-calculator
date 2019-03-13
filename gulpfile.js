const { src, watch, series, dest } = require('gulp');
const debug = require('gulp-debug');
const clean = require('gulp-clean');
const sass = require("gulp-sass");
const copy = require("gulp-copy");
const zip = require("gulp-zip");
const uglify = require('gulp-uglify-es').default;

const buildFiles = ["i18n/**/*", "images/**/*", "js/**/*", "templates/**/*", "css/*", "manifest.json", "script.js", 'style.css'];


function clean_up(cb) {
  return src(["widget", "widget.zip", "style.css"], {allowEmpty: true})
    .pipe(debug({title: "Deleting"}))
    .pipe(clean({force: true}))
}

function sass_load (cb) {
  return src("style.scss")
    .pipe(debug({title: "Styling"}))
    .pipe(sass().on("error", sass.logError))
    .pipe(dest("./"))
}
function minimize(cb) {
  return src("src/**/**/*.js")
    .pipe(debug({title: "Minimize"}))
    .pipe(uglify())
    .pipe(dest("./widget/src/"))
}

function copy_build (cb) {
  return src(buildFiles)
    .pipe(debug({title: "Copying"}))
    .pipe(copy("widget"))
}

function zip_widget (cb) {
  return src("widget/**/*")
    .pipe(debug({title: "Zipping"}))
    .pipe(zip("widget.zip"))
    .pipe(dest("./"));
}

function watching (cb) {
  watch("style.scss", series(sass_load))
  watch(buildFiles, series(clean_up, copy_build, zip_widget))
}

exports.build = series(clean_up, minimize, sass_load, copy_build)
exports.zip_widget = series(clean_up, minimize, sass_load, copy_build, zip_widget)
exports.default = watching
