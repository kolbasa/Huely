import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FilePicker } from '@capawesome/capacitor-file-picker';

const {dateUtils} = await import('../../api/date.js');

/**
 * @returns {Promise<{success: boolean, filename: string}|{success: boolean, error: *}>}
 */
export async function exportLocalStorage() {
    try {
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

        return { success: true, filename };
    } catch (err) {
        console.error('Export error', err);
        return { success: false, error: err };
    }
}


export async function importLocalStorage() {
    try {
        // Let user pick .json file
        const result = await FilePicker.pickFiles({
            types: ['application/json'],
            multiple: false
        });

        if (!result?.files?.length) {
            throw new Error("No file selected");
        }

        const file = result.files[0];

        // FilePicker gives a URI – use Filesystem API to read it
        const readResult = await Filesystem.readFile({
            path: file.path,
            encoding: Encoding.UTF8
        });
        
        const jsonData = JSON.parse(readResult.data);

        // Clear existing storage if desired; or merge
        localStorage.clear();

        // Put data back into localStorage
        for (const [key, value] of Object.entries(jsonData)) {
            localStorage.setItem(key, JSON.stringify(value));
        }

        console.log('LocalStorage successfully restored');

    } catch (err) {
        console.error('Error importing localStorage:', err);
        throw err;
    }
}

export const backup = {
    export: exportLocalStorage,
    import: importLocalStorage
};