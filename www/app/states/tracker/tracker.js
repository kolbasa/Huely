await import('../../app.js');

const {dom} = await import('../../../api/dom.js');
const {string} = await import('../../../api/string.js');
const {state} = await import('../../../api/routing/state.js');
const {states} = await import('../states.js');
const {router} = await import('../../../api/routing/router.js');
const {trackers} = await import('../../database/trackers.js');
const {dateUtils} = await import('../../../api/date.js');

/* ------------------------------------------------------ */
/*                      Tracker Data                      */
/* ------------------------------------------------------ */

/**
 * @type {Tracker}
 */
let tracker = undefined;

/**
 * @returns {Promise<void>}
 */
const loadTracker = async () => {
    const params = await state.getParams();
    tracker = (await trackers.list())[params.tracker];
    dom.set('tracker', 'name', tracker.name);
    dom.set('title', 'name', tracker.name);
    for (let date in tracker.dates) {
        dom.addClass(date, `fill-${tracker.dates[date]}`);
    }
};

/**
 * @param {string} date
 * @param {1|2|3|4} type
 * @returns {Promise<void>}
 */
const saveTracker = async (date, type) => {
    if (type == null) {
        delete tracker.dates[date];
    } else {
        tracker.dates[date] = type;
    }
    await trackers.update(tracker);
};

/* ------------------------------------------------------ */
/*                     Generate Table                     */
/* ------------------------------------------------------ */

/**
 * @type {number}
 */
const WEEK_DAY_START = dateUtils.firstDayInWeek();

/**
 * @type {number}
 */
const WEEK_DAY_END = dateUtils.getWeekdayEnd(WEEK_DAY_START);

/**
 * @type {number}
 */
const MONDAY = dateUtils.getMonday(WEEK_DAY_START);

/**
 * @returns {void}
 */
const renderHeader = () => {
    dom.repeat('weekday', 6, {
        name: (i) => {
            if (i === MONDAY + 1) {
                // The date is simply a known Monday.
                return dateUtils.localizedWeekday('2024-03-25');
            }
            if (i === MONDAY + 2) {
                // Wednesday
                return dateUtils.localizedWeekday('2024-03-27');
            }
            if (i === MONDAY + 3) {
                // Friday
                return dateUtils.localizedWeekday('2024-03-29');
            }
        },
        colspan: (i) => {
            if (i > MONDAY && i < MONDAY + 4) {
                return 2;
            }
            return 1;
        }
    });
};

/**
 * @returns {Date[][]}
 */
const generateYear = () => {
    /**
     * @type {Date[]}
     */
    const days = dateUtils.getDays();

    /**
     * @type {Date[]}
     */
    let week = [];

    /**
     * @type {Date[][]}
     */
    let weeks = [week];

    days.forEach((day, i) => {
        if (day.getDay() === WEEK_DAY_END && i < (days.length - 1)) {
            week = [];
            weeks.push(week);
        }
        week.unshift(day);
    });

    return weeks;
};

/**
 * @returns {void}
 */
const generateRowTemplate = () => {
    dom.repeat('day', 9, {
        day: (index) => {
            return `{{day-${index}}}`;
        },
        date: (index) => {
            return `{{date-${index}}}`;
        }
    });
};

/**
 * @param {Date[]} week
 * @param {number} day
 * @returns {string}
 */
const addMonthLabel = (week, day) => {
    if (day !== 0 && day !== 8) {
        return '';
    }
    let month = '';
    week.forEach((day) => {
        if (day.getDate() === 1) {
            month = day.toLocaleString('default', {month: 'short'});
        }
    });
    return month;
};

/**
 * @param {Date[]} week
 * @param {number} day
 * @returns {string}
 */
const addCell = (week, day) => {
    if (day === 0) {
        return 'month';
    }
    const isActive = week[day - 1] != null;
    let date = '';
    if (isActive) {
        date = week[day - 1].toISOString().split('T')[0];
    }
    return `${date}${isActive ? ' active' : ''}`;
};

/**
 * @returns {void}
 */
const renderTable = () => {
    generateRowTemplate();
    const weeks = generateYear();
    let rowFiller = {};
    for (let day = 0; day < 9; day++) {
        rowFiller[`day-${day}`] = (weekIndex) => addMonthLabel(weeks[weekIndex], day);
        rowFiller[`date-${day}`] = (weekIndex) => addCell(weeks[weekIndex], day);
    }
    dom.repeat('week', weeks.length, rowFiller);
};

/**
 * @returns {void}
 */
window.load = async () => {
    backButtonListener();
    bodyClickListener();

    renderHeader();
    renderTable();

    await loadTracker();
};

/* ------------------------------------------------------ */
/*                     Color Selector                     */
/* ------------------------------------------------------ */

/**
 * @type {HTMLElement}
 */
let selected = undefined;

/**
 * @returns {void}
 */
const reset = () => {
    selected = undefined;
    dom.purgeClass('selected');
    dom.hide('color-picker');
};

/**
 * @param {Event} event
 */
const onBodyClick = (event) => {
    if (event.target == null) {
        return;
    }
    ['c1', 'c2', 'c3', 'tracker', 'month', 'weekday']
        .forEach((cl) => {
            if (event.target['classList'].contains(cl)) {
                reset();
            }
        });
};

/**
 * @param {HTMLElement} element
 * @returns {string}
 */
const getElementDate = (element) => {
    let date;
    element.classList.forEach((cl) => {
        if (cl.split('-').length === 3) {
            date = cl;
        }
    });
    return date;
};


/**
 * @returns {void}
 */
const bodyClickListener = () => {
    document.body.addEventListener('click', onBodyClick);
};

/**
 * @param {number=} type
 */
window.fill = async (type) => {
    if (selected == null) {
        return;
    }

    const date = getElementDate(selected);
    if (date == null) {
        return;
    }

    ['fill-1', 'fill-2', 'fill-3', 'fill-4'].forEach((c) => selected.classList.remove(c));

    if (type != null) {
        selected.classList.add(`fill-${type}`);
    }

    await saveTracker(date, type);

    reset();
};

/**
 * @param {HTMLElement} cell
 * @returns {void}
 */
const createPopover = (cell) => {

    /**
     * @type {string}
     */
    let date = getElementDate(cell);

    /**
     * @type {HTMLElement}
     */
    const picker = dom.element('color-picker');
    dom.set('color-picker', 'date', dateUtils.formatDate(date));

    const cellHeight = 22;
    const popoverHeight = 70;
    const popoverMargin = 15;

    const screenCenter = window.innerHeight / 2;
    const topHalfScreen = cell.offsetTop < screenCenter;

    const offsetTopHalfScreen = cellHeight + popoverMargin;
    const offsetBottomHalfScreen = -(popoverHeight + popoverMargin);

    const popoverOffset = topHalfScreen ? offsetTopHalfScreen : offsetBottomHalfScreen;

    const cellOffsetTop = cell.getBoundingClientRect().top + window.scrollY;
    picker.style.top = `${cellOffsetTop + popoverOffset}px`;
    dom.show('color-picker');
};

/**
 * @param {HTMLElement} element
 * @returns {Promise<void>}
 */
window.onSelect = async (element) => {
    if (element == null) {
        return;
    }
    reset();

    const classList = element.classList;
    if (!classList.contains('active')) {
        return;
    }
    selected = element;
    classList.add('selected');

    createPopover(element);
};


/* ------------------------------------------------------ */
/*                        Routing                         */
/* ------------------------------------------------------ */

/**
 * @returns {Promise<void>}
 */
window.goToTrackerList = async () => {
    await router.go(states.START);
};

/**
 * @returns {Promise<void>}
 */
const onBackButton = async () => {
    if (selected != null) {
        reset();
        return;
    }
    await window.goToTrackerList();
};

/**
 * @returns {void}
 */
const backButtonListener = () => {
    if (window.Capacitor == null) {
        return;
    }
    window.Capacitor.addListener('App', 'backButton', onBackButton);
};
