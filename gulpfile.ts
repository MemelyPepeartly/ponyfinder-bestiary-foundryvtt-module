const gulp = require('gulp')
const ts = require('gulp-typescript');
const project = ts.createProject('tsconfig.json')

const through2 = require("through2");
const yaml = require("js-yaml");
const Datastore = require("nedb");
const cb = require("cb");
const mergeStream = require("merge-stream");
const fs = require("fs");
const path = require("path");

const MODULE = JSON.parse(fs.readFileSync("src/module.json"));
const STATIC_FILES = ["src/module.json", "src/assets/**/*"];
const PACK_SRC = "src/packs";
const DIST_DIR = "dist";


gulp.task('compile', () => {
  compilePacks()

  return gulp.src('src/**/*.ts')
    .pipe(project())
    .pipe(gulp.dest('dist/'));
})

gulp.task('copy', async () => {
  return new Promise<void>((resolve,reject) => {
    gulp.src('README.md').pipe(gulp.dest("dist/"))
    gulp.src("src/module.json").pipe(gulp.dest('dist/'))
    gulp.src("src/lang/**").pipe(gulp.dest('dist/lang/'))
    gulp.src("src/scripts/**").pipe(gulp.dest('dist/scripts/'))
    gulp.src("src/styles/**").pipe(gulp.dest('dist/styles/'))
    gulp.src("src/assets/**").pipe(gulp.dest('dist/assets/'))
    resolve();
  })
})

function compilePacks() {
  // determine the source folders to process
  const folders = fs.readdirSync(PACK_SRC).filter((file) => {
    return fs.statSync(path.join(PACK_SRC, file)).isDirectory();
  });

  // process each folder into a compendium db
  const packs = folders.map((folder) => {
    
    const db = new Datastore({
      filename: path.resolve(__dirname, DIST_DIR, "packs",`${folder}`),
      autoload: true });

    return gulp.src(path.join(PACK_SRC, folder, "**.json")).pipe(through2.obj((file, enc, cb) => {
        let json = yaml.loadAll(file.contents.toString());
        db.insert(json);
        cb(null, file);
      })
    );
  });
  return mergeStream.call(null, packs);
}

gulp.task('build', gulp.parallel('compile', 'copy'));


/*
// This is supposed to copy the dist folder into the modules directory for testing. Only works if you've set it up the right way
//This works if development path is FoundryVTT/Data/dev/modules/swade-item-macros
const MODULEPATH = "../../../modules/swade-item-macros/"

gulp.task('foundry', () => {
  return gulp.src('dist/**').pipe(gulp.dest(MODULEPATH))
})

gulp.task("update", gulp.series('build', 'foundry'))
*/
