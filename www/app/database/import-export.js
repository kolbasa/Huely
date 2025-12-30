import {Filesystem, Directory, Encoding} from '@capacitor/filesystem';
import {FilePicker} from '@capawesome/capacitor-file-picker';

const {dateUtils} = await import('../../api/date.js');

/**
 * @returns {Promise<{filename: string}>}
 */
export async function exportLocalStorage() {
    const filename = 'Huely-Backup__' + dateUtils.filenameFriendlyDate() + '.json';

    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = JSON.parse(localStorage.getItem(key));
    }

    await Filesystem.writeFile({
        path: filename,
        data: JSON.stringify(data, null, 2),
        directory: Directory.Documents,
        encoding: Encoding.UTF8
    });

    return {filename};
}

/**
 * @returns {Promise<void>}
 */
export async function importLocalStorage() {
    const result = await FilePicker.pickFiles({
        types: ['application/json'],
        multiple: false
    });

    if (!result?.files?.length) {
        throw new Error('No file selected');
    }

    const file = result.files[0];

    let jsonData;

    if (file.path == null) {
        jsonData = JSON.parse(new TextDecoder().decode(await file.blob.arrayBuffer()));
    } else {
        const readResult = await Filesystem.readFile({
            path: file.path,
            encoding: Encoding.UTF8
        });
        jsonData = JSON.parse(readResult.data);
    }

    if (jsonData == null) {
        return;
    }

    localStorage.clear();

    for (const [key, value] of Object.entries(jsonData)) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

export const backup = {
    export: exportLocalStorage,
    import: importLocalStorage
};