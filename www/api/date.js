export const dateUtils = {

    /**
     * @returns {number}
     */
    firstDayInWeek: () => {
        const lang = window.navigator.language;
        const firstDay = new Intl.Locale(lang)['weekInfo']['firstDay'];
        if (firstDay === 7) {
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
     * @param {string} date
     * @returns {string}
     */
    localizedWeekday: (date) => {
        return new Date(date).toLocaleString('default', {weekday: 'short'});
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
    getMonday: (weekdayStart) => {
        switch (weekdayStart) {
            case 0: {
                return 1;
            }
            case 6: {
                return 2;
            }
            case 1: {
                return 0;
            }
        }
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
        for (let i = new Date(end); i > new Date(start); i.setDate(i.getDate() - 1)) {
            dates.push(new Date(i));
        }
        return dates;
    }

};