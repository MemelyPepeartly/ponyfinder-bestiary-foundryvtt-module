import gulp from 'gulp';
import fs from 'fs';
import path from 'path';

const PACK_SRC = 'src/packs';
const DIST_DIR = 'dist';
const PACKS_DIST = path.join(DIST_DIR, 'packs');

// Function to compile JSON files into .db files
async function compilePacks() {
  const categories = fs.readdirSync(PACK_SRC, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  categories.forEach(category => {
    const categoryPath = path.join(PACK_SRC, category);
    const files = fs.readdirSync(categoryPath);

    // Ensure each JSON object is a single line
    const dbContents = files.map(file => {
      const filePath = path.join(categoryPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(fileContent);
      return JSON.stringify(json); // This ensures it's a single line
    }).join('\n');

    if (!fs.existsSync(PACKS_DIST)) {
      fs.mkdirSync(PACKS_DIST, { recursive: true });
    }

    // Ensure the .db extension is added to the filename
    const dbPath = path.join(PACKS_DIST, `${category}`);
    fs.writeFileSync(dbPath, dbContents);
  });
}

// Function to copy module.json to the dist directory
function copyModuleJson() {
  return gulp.src('src/module.json')
    .pipe(gulp.dest(DIST_DIR));
}

// Function that copies over the assets directory
function copyAssets() {
  return gulp.src('src/assets/**/*')
    .pipe(gulp.dest(path.join(DIST_DIR, 'assets')));
}

// Default task that runs everything
export default gulp.series(
  compilePacks,
  copyModuleJson,
  copyAssets
);
