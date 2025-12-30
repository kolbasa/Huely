await import('../../app.js');

import {App} from '@capacitor/app';
import {Haptics, ImpactStyle} from '@capacitor/haptics';

const {dom} = await import('../../../api/dom.js');
const {state} = await import('../../../api/routing/state.js');
const {states} = await import('../../../app/states/states.js');
const {string} = await import('../../../api/string.js');
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
};

/**
 * @param {string} date
 * @param {1|2|3|4|undefined} type
 * @param {string} notes
 * @returns {Promise<void>}
 */
const saveTracker = async (date, type, notes) => {
    if (type == null && notes == null) {
        delete tracker.dates[date];
    } else {
        tracker.dates[date] = [type];
        if (notes != null) {
            tracker.dates[date].push(notes);
        }
    }
    await trackers.update(tracker);
};

/* ------------------------------------------------------ */
/*                     Generate Table                     */
/* ------------------------------------------------------ */

/**
 * @returns {void}
 */
const renderHeader = () => {
    const MONDAY = dateUtils.getMonday(dateUtils.firstDayInWeek());
    dom.repeat('weekday', 6, {
        name: (i) => {
            if (i === MONDAY + 1) {
                // The hardcoded date is a known Monday.
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
            // Week starts with a Monday
            if (MONDAY === 0 && i === MONDAY + 4) {
                // Sunday
                return dateUtils.localizedWeekday('2024-03-31');
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
 * @param {Date=} start
 * @returns {Date[][]}
 */
const generateYear = (start) => {
    /**
     * @type {Date[]}
     */
    const days = dateUtils.getDays(start);

    /**
     * @type {Date[]}
     */
    let week = [];

    /**
     * @type {Date[][]}
     */
    let weeks = [week];

    const weekDayEnd = dateUtils.getWeekdayEnd(dateUtils.firstDayInWeek());
    days.forEach((day, i) => {
        if (day.getDay() === weekDayEnd && i < (days.length - 1)) {
            week = [];
            weeks.push(week);
        }
        week.unshift(day);
    });

    if (weeks[0].length === 0) {
        weeks.shift();
    }

    return weeks;
};

/**
 * @returns {void}
 */
const generateRowTemplate = () => {
    dom.repeat('day', 9, {
        month: (index) => {
            return `{{month-${index}}}`;
        },
        date: (index) => {
            return `{{date-${index}}}`;
        },
        cell: (index) => {
            return `{{cell-${index}}}`;
        },
        note: (index) => {
            return `{{note-${index}}}`;
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
            month = day.toLocaleString(window.navigator.language, {month: 'short'});
        }
    });
    return month;
};

/**
 * @param {Date[]} week
 * @param {number} day
 * @returns {string}
 */
const addDate = (week, day) => {
    let date = '';
    if (week[day - 1] != null) {
        date = dateUtils.isoDateWithoutTime(week[day - 1]);
    }
    return date;
};

/**
 * @param {Date[]} week
 * @param {number} day
 * @returns {string}
 */
const addActive = (week, day) => {
    if (day === 0) {
        return 'month';
    }
    return week[day - 1] != null ? 'active' : '';
};

/**
 * @param {Date[]} week
 * @param {number} day
 * @returns {string|undefined}
 */
const addNote = (week, day) => {
    if (week[day - 1] != null) {
        const date = dateUtils.isoDateWithoutTime(week[day - 1]);
        const entry = tracker.dates[date];
        if (entry != null && entry[1] != null) {
            return;
        }
    }
    return 'hidden';
};

/**
 * @returns {Promise<void>}
 */
const renderTable = async () => {
    renderHeader();
    generateRowTemplate();
    await loadTracker();

    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);

    const firstMarker = Object.keys(tracker.dates)[0];
    if (firstMarker != null) {
        const firstMarkerDate = new Date(firstMarker);
        const diffMs = new Date() - firstMarkerDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays > 364) {
            startDate = firstMarkerDate;
        }
    }

    const firstDayInWeek = dateUtils.firstDayInWeek();
    while (startDate.getDay() !== firstDayInWeek) {
        startDate.setDate(startDate.getDate() - 1);
    }

    const weeks = generateYear(startDate);

    let rowFiller = {};
    for (let day = 0; day < 9; day++) {
        rowFiller[`month-${day}`] = (weekIndex) => addMonthLabel(weeks[weekIndex], day);
        rowFiller[`date-${day}`] = (weekIndex) => addDate(weeks[weekIndex], day);
        rowFiller[`cell-${day}`] = (weekIndex) => addActive(weeks[weekIndex], day);
        rowFiller[`note-${day}`] = (weekIndex) => addNote(weeks[weekIndex], day);
    }
    dom.repeat('week', weeks.length, rowFiller);

    dom.set('tracker', 'name', tracker.name);
    for (let date in tracker.dates) {
        dom.addClass(`day ${date}`, `fill-${tracker.dates[date][0]}`);
    }
};

/**
 * @returns {void}
 */
window.load = async () => {
    await backButtonListener();
    bodyClickListener();
    await resumeListener();
    await renderTable();
};

/* ------------------------------------------------------ */
/*                       On Resume                        */
/* ------------------------------------------------------ */

/**
 * @param {{isActive: boolean}} status
 * @returns {Promise<void>}
 */
const onResume = async (status) => {
    if (status == null || !status.isActive) {
        return;
    }
    const cell = dom.element('day ' + dateUtils.isoDateWithoutTime(new Date()));
    if (cell == null) { // a new day has begun.
        await renderTable();
    }
};

/**
 * @returns {Promise<void>}
 */
const resumeListener = async () => {
    await App.addListener('appStateChange', onResume);
};

/* ------------------------------------------------------ */
/*                     Color Selector                     */
/* ------------------------------------------------------ */

/**
 * @type {HTMLElement}
 */
let selected = undefined;

/**
 * @returns {Promise<void>}
 */
const reset = async () => {
    await saveNotes();
    selected = undefined;
    dom.purgeClass('selected');
    dom.hide('cell-editor');
};

/**
 * @returns {Promise<void>}
 */
const saveNotes = async () => {
    if (selected == null) {
        return;
    }

    const date = getElementDate(selected);
    if (date == null) {
        return;
    }

    let notes = dom.getValue('entry-notes');
    if (notes == null) {
        return;
    }

    notes = notes.trim()
    if (notes.length === 0) {
        notes = undefined;
    }

    let entry = tracker.dates[date];

    let savedType = entry == null ? undefined : entry[0];
    let savedNotes = entry == null ? undefined : entry[1];

    if (notes === savedNotes) {
        return;
    }

    await saveTracker(date, savedType, notes);

    if (notes == null) {
        dom.hide(`note ${date}`);
    } else {
        dom.show(`note ${date}`);
    }
};

/**
 * @param {Event} event
 */
const onBodyClick = (event) => {
    if (event.target == null) {
        return;
    }
    ['c1', 'c2', 'c3', 'tracker', 'month', 'weekday']
        .forEach(async (cl) => {
            if (event.target['classList'].contains(cl)) {
                await reset();
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

    await Haptics.impact({style: ImpactStyle.Light});

    await saveTracker(date, type, (tracker.dates[date] || [])[1]);

    await reset();
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
    const picker = dom.element('cell-editor');
    dom.set('cell-editor', 'date', dateUtils.formatDate(date));

    const cellHeight = 22;
    const popoverHeight = 110;
    const popoverMargin = 15;

    const screenCenter = window.innerHeight / 2;
    const topHalfScreen = cell.offsetTop < screenCenter;

    const offsetTopHalfScreen = cellHeight + popoverMargin;
    const offsetBottomHalfScreen = -(popoverHeight + popoverMargin);

    const popoverOffset = topHalfScreen ? offsetTopHalfScreen : offsetBottomHalfScreen;

    const cellOffsetTop = cell.getBoundingClientRect().top + window.scrollY;
    picker.style.top = `${cellOffsetTop + popoverOffset}px`;

    const entry = tracker.dates[date];
    if (entry != null && entry[1] != null) {
        dom.setValue('entry-notes', entry[1]);
    }

    dom.show('cell-editor');
};

/**
 * @param {HTMLElement} element
 * @returns {Promise<void>}
 */
window.onSelect = async (element) => {
    if (element == null) {
        return;
    }
    await reset();

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
    dom.hide('c3');
    await router.go(states.START);
};

/**
 * @returns {Promise<void>}
 */
const onBackButton = async () => {
    if (selected != null) {
        await reset();
        return;
    }
    await window.goToTrackerList();
};

/**
 * @returns {Promise<void>}
 */
const backButtonListener = async () => {
    await App.addListener('backButton', onBackButton);
};
