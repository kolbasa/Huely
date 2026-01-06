import path from 'path';
import {readdir} from 'fs/promises';
import {defineConfig} from 'vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function listFilesRecursive(dir) {
    const entries = await readdir(dir, {withFileTypes: true});
    const files = await Promise.all(
        entries.map(async (entry) => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                return listFilesRecursive(fullPath);
            } else {
                return fullPath;
            }
        })
    );
    return files.flat();
}

let rollup = {};
let targets = [];
const files = await listFilesRecursive('./www');
files.forEach((file, index) => {
    if (file.includes('.html')) {
        rollup[index] = file;
    }
    if (!file.includes('.css') && !file.includes('.json')) {
        return;
    }
    let dest = file.replace(`www${path.sep}`, `dist${path.sep}`);
    let destSplit = dest.split(path.sep);
    destSplit.pop();
    dest = destSplit.join(path.sep) + path.sep;
    targets.push({
        src: `..${path.sep}` + file,
        dest: `..${path.sep}` + dest
    });
});

export default defineConfig({
    root: './www/',
    build: {
        rollupOptions: {
            input: rollup
        },
        outDir: '../dist',
        minify: true,
        emptyOutDir: true
    },
    plugins: [
        viteStaticCopy({
            targets: targets
        })
    ]
});
