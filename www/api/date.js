export const dateUtils = {

    /**
     * @returns {number}
     */
    firstDayInWeek: () => {
        let lang = window.navigator.language;
        // lang = 'en-US';
        // lang = 'fa-IR';
        const locale = new Intl.Locale(lang);
        let firstDay = 0;
        if (locale['getWeekInfo'] != null) {
            firstDay = locale['getWeekInfo']()['firstDay'];
        } else if (locale['weekInfo'] != null) {
            firstDay = locale['weekInfo']['firstDay'];
        }
        if (firstDay > 6) {
            return 0;
        }
        return firstDay;
    },

    /**
     * @param {string} date
     * @returns {string}
     */
    formatDate: (date) => {
        const formatter = new Intl.DateTimeFormat(
            window.navigator.language,
            {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }
        );
        return formatter.format(new Date(date));
    },

    /**
     * @param {Date|string} date
     * @returns {string}
     */
    localizedMonth: (date) => {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleString(window.navigator.language, {month: 'short'});
    },

    /**
     * @param {Date} date
     * @returns {string}
     */
    isoDateWithoutTime: (date) => {
        return date.toISOString().split('T')[0];
    },

    /**
     * @param {number} weekdayStart
     * @returns {number}
     */
    getWeekdayEnd: (weekdayStart) => {
        // 0 := Sunday
        // 1 := Monday
        // 6 := Saturday
        return (weekdayStart + 6) % 7;
    },

    /**
     * @param {Date=} start
     * @param {Date=} end
     * @returns {Date[]}
     */
    getDays: (start, end) => {
        if (start == null) {
            start = new Date();
            start.setDate(start.getDate() - 364);
        }

        if (end == null) {
            end = new Date();
        }

        let dates = [];
        for (let i = new Date(end); i >= new Date(start); i.setDate(i.getDate() - 1)) {
            dates.push(new Date(i));
        }
        return dates;
    },

    /**
     * @returns {string}
     */
    filenameFriendlyDate: () => {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // Format: YYYY-MM-DD__HH-MM-SS
        return `${year}-${month}-${day}__${hours}-${minutes}-${seconds}`;
    }


};