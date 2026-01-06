await import('./../../app.js');

const {dom} = await import('./../../../api/dom.js');
const {app} = await import('./../../../api/native/app.js');
const {state} = await import('./../../../api/routing/state.js');
const {states} = await import('./../../../app/states/states.js');
const {string} = await import('./../../../api/string.js');
const {router} = await import('./../../../api/routing/router.js');
const {haptics} = await import('./../../../api/native/haptics.js');
const {trackers} = await import('./../../database/trackers.js');
const {dateUtils} = await import('./../../../api/date.js');

/* ------------------------------------------------------ */
/*                      Tracker Data                      */
/* ------------------------------------------------------ */

/**
 * @type {Tracker}
 */
let _tracker = undefined;

/**
 * @returns {Promise<void>}
 */
async function loadTracker() {
    const params = await state.getParams();
    _tracker = (await trackers.list())[params.tracker];
}

/**
 * @param {string} date
 * @param {1|2|3|4|undefined} type
 * @param {string} notes
 * @returns {Promise<void>}
 */
async function saveTracker(date, type, notes) {
    if (type == null && notes == null) {
        delete _tracker.dates[date];
    } else {
        _tracker.dates[date] = [type];
        if (notes != null) {
            _tracker.dates[date].push(notes);
        }
    }
    await trackers.update(_tracker);
}

/* ------------------------------------------------------ */
/*                     Generate Table                     */
/* ------------------------------------------------------ */

/**
 * @returns {void}
 */
function renderHeader() {
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
}

/**
 * @param {Date=} start
 * @returns {Date[][]}
 */
function generateYear(start) {
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
}

/**
 * @param {Date[]} week
 * @param {number} day
 * @returns {string|undefined}
 */
function addMonthLabel(week, day) {
    if (day !== 0 && day !== 8) {
        return;
    }
    let month;
    week.forEach((day) => {
        if (day.getDate() === 1) {
            month = dateUtils.localizedMonth(day);
        }
    });
    return month;
}

/**
 * @param {Date[]} week
 * @param {number} day
 * @returns {string|undefined}
 */
function addDate(week, day) {
    let date;
    if (week[day - 1] != null) {
        date = dateUtils.isoDateWithoutTime(week[day - 1]);
    }
    return date;
}

/**
 * @param {Date[]} week
 * @param {number} day
 * @returns {string|undefined}
 */
function addActive(week, day) {
    if (day === 0) {
        return;
    }
    return week[day - 1] != null ? 'active' : null;
}

/**
 * @param {Date[]} week
 * @param {number} day
 * @returns {string|undefined}
 */
function addNote(week, day) {
    if (week[day - 1] != null) {
        const date = dateUtils.isoDateWithoutTime(week[day - 1]);
        const entry = _tracker.dates[date];
        if (entry != null && entry[1] != null) {
            return;
        }
    }
    return 'hidden';
}

/**
 * @returns {void}
 */
function generateRowTemplate() {
    const indices = {};
    ['month', 'date', 'active', 'note'].forEach((name) => {
        indices[name] = (index) => `{{${name}-${index}}}`;
    });
    dom.repeat('day', 9, indices);
}

/**
 * @returns {Promise<void>}
 */
async function renderTable() {
    renderHeader();
    generateRowTemplate();
    await loadTracker();

    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);

    const firstMarker = Object.keys(_tracker.dates)[0];
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
        rowFiller[`active-${day}`] = (weekIndex) => addActive(weeks[weekIndex], day);
        rowFiller[`note-${day}`] = (weekIndex) => addNote(weeks[weekIndex], day);
    }
    dom.repeat('week', weeks.length, rowFiller);

    dom.set('tracker', 'name', _tracker.name);
    for (let date in _tracker.dates) {
        dom.addClass(`day ${date}`, `fill-${_tracker.dates[date][0]}`);
    }
}

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
async function onResume(status) {
    if (status == null || !status.isActive) {
        return;
    }
    const cell = dom.element('day ' + dateUtils.isoDateWithoutTime(new Date()));
    if (cell == null) { // a new day has begun.
        await renderTable();
    }
}

/**
 * @returns {Promise<void>}
 */
async function resumeListener() {
    await app.stateChangeListener(onResume);
}

/* ------------------------------------------------------ */
/*                     Color Selector                     */
/* ------------------------------------------------------ */

/**
 * @type {HTMLElement}
 */
let _selected = undefined;

/**
 * @returns {Promise<void>}
 */
async function reset() {
    await saveNotes();
    _selected = undefined;
    dom.purgeClass('selected');
    dom.hide('editor');
}

/**
 * @returns {Promise<void>}
 */
async function saveNotes() {
    if (_selected == null) {
        return;
    }

    const date = getElementDate(_selected);
    if (date == null) {
        return;
    }

    let notes = dom.getValue('entry-notes');
    if (notes == null) {
        return;
    }

    notes = notes.trim();
    if (notes.length === 0) {
        notes = undefined;
    }

    let entry = _tracker.dates[date];

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
}

/**
 * @param {Event} event
 */
async function onBodyClick(event) {
    if (_selected == null) {
        return;
    }

    let node = event.target;
    if (node == null) {
        return;
    }

    let cls = node['classList'];
    if (cls.contains('day') && cls.contains('active')) {
        return;
    }

    for (let i = 0; i < 4; i++) {
        cls = node['classList'];
        if (cls != null && cls.contains('editor')) {
            return;
        }
        node = node.parentNode;
    }

    await reset();
}

/**
 * @param {HTMLElement} element
 * @returns {string}
 */
function getElementDate(element) {
    let date;
    element.classList.forEach((cl) => {
        if (cl.split('-').length === 3) {
            date = cl;
        }
    });
    return date;
}

/**
 * @returns {void}
 */
function bodyClickListener() {
    document.body.addEventListener('click', onBodyClick);
}

/**
 * @param {number=} type
 */
window.fill = async (type) => {
    if (_selected == null) {
        return;
    }

    const date = getElementDate(_selected);
    if (date == null) {
        return;
    }

    ['fill-1', 'fill-2', 'fill-3', 'fill-4']
        .forEach((c) => _selected.classList.remove(c));

    if (type != null) {
        _selected.classList.add(`fill-${type}`);
    }

    await haptics.light();

    await saveTracker(date, type, (_tracker.dates[date] || [])[1]);

    await reset();
};

/**
 * @param {HTMLElement} cell
 * @returns {void}
 */
function createPopover(cell) {

    /**
     * @type {string}
     */
    let date = getElementDate(cell);

    /**
     * @type {HTMLElement}
     */
    const picker = dom.element('editor');
    dom.set('editor', 'date', dateUtils.formatDate(date));

    const cellHeight = 22;
    const popoverHeight = 110;
    const popoverMargin = 15;

    const topHalfScreen = cell.offsetTop < 150;

    const offsetTopHalfScreen = cellHeight + popoverMargin;
    const offsetBottomHalfScreen = -(popoverHeight + popoverMargin);

    const popoverOffset = topHalfScreen ? offsetTopHalfScreen : offsetBottomHalfScreen;

    const cellOffsetTop = cell.getBoundingClientRect().top + window.scrollY;
    picker.style.top = `${cellOffsetTop + popoverOffset}px`;

    const entry = _tracker.dates[date];
    if (entry != null && entry[1] != null) {
        dom.setValue('entry-notes', entry[1]);
    }

    if (entry != null && entry[0] != null) {
        dom.addClass(`color fill-${entry[0]}`, 'selected');
    }

    dom.show('editor');
}

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
    _selected = element;
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
async function onBackButton() {
    if (_selected != null) {
        await reset();
        return;
    }
    await window.goToTrackerList();
}

/**
 * @returns {Promise<void>}
 */
async function backButtonListener() {
    await app.backButtonListener(onBackButton);
}
