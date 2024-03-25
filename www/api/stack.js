const {string} = await import('./string.js');

export const stack = {
    /**
     * @param {object} error
     * @returns {{message: string, stack: string[]}}
     */
    parse: (error) => {
        if (error === null) {
            error = {};
        }

        if (typeof error !== 'object') {
            error = {message: error};
        }

        if (typeof error.reason === 'object' && error.reason.message != null) {
            error = error.reason;
        }

        let message;
        let stack;

        if (error.reason != null) {
            message = error.reason;
        }

        if (error.message != null) {
            message = error.message;
        }

        if (typeof message !== 'string') {
            message = undefined;
            stack = JSON.stringify(message, null, 4);
        }

        if (error.stack != null) {
            stack = error.stack;
        }

        if (error.stderr != null) {
            stack = error.stderr;
        }

        if (typeof stack === 'string') {
            stack = stack.split('\n');
        }

        if (message == null && stack == null) {
            message = 'Unknown error';
        }

        if (stack == null) {
            stack = [];
        }

        stack = stack.map((line) => string.removeURLDomain(line));

        return {
            message: message,
            stack: stack
        };
    }
};


