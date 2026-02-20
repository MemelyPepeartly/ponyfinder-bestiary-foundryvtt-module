import gulp from 'gulp';
import fs from 'fs';
import path from 'path';

const PACK_SRC = 'src/packs';
const DIST_DIR = 'dist';
const PACKS_DIST = path.join(DIST_DIR, 'packs');

function clean(done) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  done();
}

// Compile JSON files into line-delimited .db files
function compilePacks(done) {
  if (!fs.existsSync(PACK_SRC)) {
    done();
    return;
  }

  const categories = fs.readdirSync(PACK_SRC, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  categories.forEach(category => {
    const categoryPath = path.join(PACK_SRC, category);
    const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.json'));

    const dbContents = files.map(file => {
      const filePath = path.join(categoryPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(fileContent);
      return JSON.stringify(json);
    }).join('\n');

    if (!fs.existsSync(PACKS_DIST)) {
      fs.mkdirSync(PACKS_DIST, { recursive: true });
    }

    const packName = category.endsWith('.db') ? category.slice(0, -3) : category;
    const dbPath = path.join(PACKS_DIST, packName);
    fs.writeFileSync(dbPath, dbContents.length > 0 ? `${dbContents}\n` : '');
  });

  done();
}

function copyModuleJson() {
  return gulp.src('src/module.json')
    .pipe(gulp.dest(DIST_DIR));
}

function copyLang() {
  return gulp.src('src/lang/**/*.json')
    .pipe(gulp.dest(path.join(DIST_DIR, 'lang')));
}

function copyAssets() {
  return gulp.src('src/assets/**/*')
    .pipe(gulp.dest(path.join(DIST_DIR, 'assets')));
}

export const build = gulp.series(
  clean,
  compilePacks,
  copyModuleJson,
  copyLang,
  copyAssets
);

export default build;
