export const string = {

    /**
     * @param {string} replaceIn
     * @param {string} strToReplace
     * @param {string} replaceWith
     *
     * @returns {string}
     */
    replaceAll: (replaceIn, strToReplace, replaceWith) => {

        if (typeof String.prototype.replaceAll === 'function') {
            return replaceIn.replaceAll(strToReplace, replaceWith);
        }

        const specialChars = ['-', '[', ']', '/', '{', '}', '(', ')', '*', '+', '?', '.', '\\', '^', '$', '|'];

        strToReplace = strToReplace.replace(
            new RegExp('[' + specialChars.join('\\') + ']', 'g'), '\\$&'
        );

        return replaceIn.replace(new RegExp(strToReplace, 'g'), replaceWith);
    },

    /**
     * @param {string} str
     * @returns {string[]}
     */
    getBetweenQuotationMarks: (str) => {
        const result = [];
        str.split('"').forEach((part, index) => {
            if (index % 2 === 0) {
                return;
            }
            result.push(part);
        });
        return result;
    },

    /**
     * @param {string} url
     * @returns {string}
     */
    removeURLDomain: (url) => {
        if (!url.includes('://')) {
            return url;
        }
        return '/' + url.split('/').slice(3).join('/');
    },

    /**
     * @param {string} str
     * @returns {string}
     */
    normalizeWhitespaces: (str) => {
        return str.replace(/\s+/g, ' ').trim();
    },

    /**
     * @param {string} str
     * @param {number} maxLength
     * @param {string=} separator
     *
     * @returns {string}
     */
    truncateText: (str, maxLength, separator) => {
        if (str.length <= maxLength) {
            return str;
        }

        separator = separator || '[...]';

        const sepLength = separator.length;
        const availableLength = maxLength - sepLength;

        return str.substring(0, availableLength) + separator;
    }

};