#!/usr/bin/env node

/**
 * Build script for BadMax
 * Copies all necessary files to dist/ for deployment via Padawan or GitHub Pages
 *
 * Environment variables:
 *   BASE_PATH - Base path for the deployment (e.g., "/badmax/" for GitHub Pages)
 *               Default: "/sites/badmax/" (Padawan)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// Read version from package.json (single source of truth)
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const VERSION = pkg.version;

// Get base path from environment
// Default: "/" for custom domain (badmax.dso.mil)
// Use BASE_PATH=/sites/badmax/ for default Padawan URLs (websites.dso.mil/sites/badmax/)
// Use BASE_PATH=/badmax/ for GitHub Pages (alexjbuck.github.io/badmax/)
const BASE_PATH = process.env.BASE_PATH || '/';

// Files and directories to copy
const ITEMS_TO_COPY = [
  'index.html',
  '404.html',
  'service-worker.js',
  'src',
  'public'
];

// Files from public/ that should be at root level in dist/
const PUBLIC_TO_ROOT = true;

/**
 * Recursively copy a directory
 */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Copy a file or directory
 */
function copy(src, dest) {
  const srcPath = path.join(ROOT, src);
  const destPath = path.join(DIST, dest || src);

  if (!fs.existsSync(srcPath)) {
    console.log(`  [SKIP] ${src} (not found)`);
    return;
  }

  const stat = fs.statSync(srcPath);
  if (stat.isDirectory()) {
    copyDir(srcPath, destPath);
    console.log(`  [DIR]  ${src} -> dist/${dest || src}`);
  } else {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    console.log(`  [FILE] ${src} -> dist/${dest || src}`);
  }
}

/**
 * Main build function
 */
function build() {
  console.log('Building BadMax...\n');

  // Clean dist directory
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
    console.log('Cleaned dist/\n');
  }
  fs.mkdirSync(DIST, { recursive: true });

  console.log('Copying files:');

  // Copy main items
  for (const item of ITEMS_TO_COPY) {
    copy(item, item);
  }

  // Copy public/ contents to root of dist/ (for favicons, etc.)
  if (PUBLIC_TO_ROOT && fs.existsSync(path.join(ROOT, 'public'))) {
    console.log('\nCopying public/ contents to dist/ root:');
    const publicDir = path.join(ROOT, 'public');
    const entries = fs.readdirSync(publicDir, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(publicDir, entry.name);
      const destPath = path.join(DIST, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
        console.log(`  [DIR]  public/${entry.name} -> dist/${entry.name}`);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`  [FILE] public/${entry.name} -> dist/${entry.name}`);
      }
    }
  }

  // Process manifest.json with correct base path
  console.log('\nProcessing manifest.json...');
  processManifest();

  // Inject version into View.js
  console.log('\nInjecting version...');
  injectVersion();

  console.log('\nBuild complete! Output in dist/');
  console.log(`Version: ${VERSION}`);
  console.log(`Base path: ${BASE_PATH}`);
}

/**
 * Process manifest.json to use correct base path
 */
function processManifest() {
  const manifestSrc = path.join(ROOT, 'manifest.json');
  const manifestDest = path.join(DIST, 'manifest.json');

  if (!fs.existsSync(manifestSrc)) {
    console.log('  [SKIP] manifest.json (not found)');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestSrc, 'utf8'));

  // Update start_url to use the correct base path
  manifest.start_url = BASE_PATH;

  // Update scope
  manifest.scope = BASE_PATH;

  // Fix absolute icon paths to be relative
  if (manifest.icons) {
    manifest.icons = manifest.icons.map(icon => {
      if (icon.src.startsWith('/')) {
        // Convert absolute path to relative
        icon.src = icon.src.substring(1);
      }
      return icon;
    });
  }

  fs.writeFileSync(manifestDest, JSON.stringify(manifest, null, 2));
  console.log(`  [FILE] manifest.json (patched for ${BASE_PATH})`);
}

/**
 * Inject version from package.json into View.js
 */
function injectVersion() {
  const viewPath = path.join(DIST, 'src/app/View.js');

  if (!fs.existsSync(viewPath)) {
    console.log('  [SKIP] View.js (not found)');
    return;
  }

  let content = fs.readFileSync(viewPath, 'utf8');

  // Replace version placeholder or existing version string
  // Matches: Version: X.Y.Z or {{VERSION}}
  content = content.replace(/Version: [\d.]+/g, `Version: ${VERSION}`);
  content = content.replace(/\{\{VERSION\}\}/g, VERSION);

  fs.writeFileSync(viewPath, content);
  console.log(`  [FILE] View.js (version: ${VERSION})`);
}

// Run build
build();
