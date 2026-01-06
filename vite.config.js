import {defineConfig} from 'vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';

export default defineConfig({
    root: './www/',
    build: {
        rollupOptions: {
            input: {
                log: './www/app/log/modal/log.html',
                index: './www/index.html',
                home: './www/app/states/home/home.html',
                error: './www/app/log/toast/error.html',
                create: './www/app/states/home/dialog/create/create.html',
                delete: './www/app/states/home/dialog/delete/delete.html',
                update: './www/app/states/home/dialog/update/update.html',
                tracker: './www/app/states/tracker/tracker.html',
                settings: './www/app/states/home/dialog/settings/settings.html',
            }
        },
        outDir: '../dist',
        minify: true,
        emptyOutDir: true
    },
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: '../www/app/language/de.json',
                    dest: '../dist/app/language/'
                },
                {
                    src: '../www/app/language/en.json',
                    dest: '../dist/app/language/'
                },
                {
                    src: '../www/app/log/toast/error.css',
                    dest: '../dist/app/log/toast/'
                },
                {
                    src: '../www/app/log/modal/log.css',
                    dest: '../dist/app/log/modal/'
                },
                {
                    src: '../www/app/states/home/dialog/create/create.css',
                    dest: '../dist/app/states/home/dialog/create/'
                },
                {
                    src: '../www/app/states/home/dialog/delete/delete.css',
                    dest: '../dist/app/states/home/dialog/delete/'
                },
                {
                    src: '../www/app/states/home/dialog/settings/settings.css',
                    dest: '../dist/app/states/home/dialog/settings/'
                },
                {
                    src: '../www/app/states/home/dialog/update/update.css',
                    dest: '../dist/app/states/home/dialog/update/'
                }
            ]
        })
    ]
});
