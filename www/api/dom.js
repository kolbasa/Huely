const {root} = await import('./root.js');
const {string} = await import('./string.js');

/**
 * @type {Object.<string, string>}
 */
const knownReplacements = {};

/**
 * @type {string[]}
 */
let hidden = [], shown = [];

/**
 * @param {Element} element
 * @param {string} placeholder
 * @param {string|number} value
 *
 * @returns {void}
 */
const _setAttributes = (element, placeholder, value) => {
    element.getAttributeNames().forEach((attr) => {
        const attrValue = element.getAttribute(attr);
        if (attrValue.includes(placeholder)) {
            element.setAttribute(attr, string.replaceAll(attrValue, placeholder, value));
        }
    });
};

/**
 * @param {string} selector
 * @param {boolean=} expectOne
 * @returns {HTMLInputElement|HTMLElement|Element[]}
 */
const _by = (selector, expectOne) => {
    let elements = document.getElementsByClassName(selector);
    if (expectOne && elements.length > 1) {
        throw new Error(`Multiple "${selector}" elements found`);
    }
    elements = elements == null ? [] : Array.from(elements);
    if (expectOne) {
        return elements[0];
    }
    return elements;
};

/**
 * @param {string} selector
 * @returns {HTMLInputElement|HTMLElement|Element[]}
 */
const _element = (selector) => _by(selector, true);

/**
 * @param {string} selector
 * @returns {HTMLInputElement|HTMLElement|Element[]}
 */
const _elements = (selector) => _by(selector, false);

/**
 * @param {string} selector
 * @param {Boolean=} hide
 * @returns {boolean}
 */
const _toggleVisibility = (selector, hide) => {
    _elements(selector).forEach((element) => {
        if (hide == null) {
            hide = !element.classList.contains('hidden');
        }
        element.classList[hide ? 'add' : 'remove']('hidden');
    });

    if (hide) {
        if (!hidden.includes(selector)) {
            hidden.push(selector);
            shown = shown.filter((s) => s !== selector);
        }
    } else {
        if (!shown.includes(selector)) {
            shown.push(selector);
            hidden = hidden.filter((s) => s !== selector);
        }
    }
    return hide;
};

/**
 * @param {string} html
 * @param {string} selector
 */
const _containsSelector = (html, selector) => {
    selector = selector.slice(1);
    const attributes = string.getBetweenQuotationMarks(html);
    return attributes.find((attr) => attr.includes(selector)) != null;
};

/**
 * @param {string} className
 * @returns {void}
 */
const _reset = (className) => {
    if (knownReplacements[className] == null) {
        return;
    }

    const element = _by(className, true);
    element.innerHTML = knownReplacements[className];

    hidden.forEach((selector) => {
        if (_containsSelector(element.innerHTML, selector)) {
            _toggleVisibility(selector, true);
        }
    });

    shown.forEach((selector) => {
        if (_containsSelector(element.innerHTML, selector)) {
            _toggleVisibility(selector, false);
        }
    });
};

/**
 * @type {{timestamp: number, renderId: number}}
 */
let render = {};

/**
 * @param {string} id
 * @returns {number}
 */
const _cancelRunningRender = (id) => {
    if (render[id] == null) {
        return 0;
    }

    if (render[id].renderId != null) {
        clearTimeout(render[id].renderId);
    }

    return render[id].timestamp;
};

export const dom = {

    /**
     * @param {string} selector
     * @returns {HTMLInputElement|HTMLElement|Element[]}
     */
    element: _element,

    /**
     * @param {string} selector
     * @returns {HTMLInputElement|HTMLElement|Element[]}
     */
    elements: _elements,

    /**
     * @param {string} selector
     * @returns {boolean}
     */
    hide: (selector) => _toggleVisibility(selector, true),

    /**
     * @param {string} selector
     * @returns {boolean}
     */
    show: (selector) => _toggleVisibility(selector, false),

    /**
     * @param {string} selector
     * @returns {void}
     */
    remove: (selector) => _elements(selector).forEach((el) => el.remove()),

    /**
     * @returns {boolean}
     */
    resize: () => window.dispatchEvent(new Event('resize')),

    /**
     * @param {string} selector
     * @param {string} className
     * @returns {void}
     */
    addClass: (selector, className) => (_elements(selector).forEach((e) => e.classList.add(className))),

    /**
     * @param {string} className
     * @returns {void}
     */
    purgeClass: (className) => (_elements(className).forEach((e) => e.classList.remove(className))),

    /**
     * @param {string} className
     * @param {string} value
     * @returns {void}
     */
    setValue: (className, value) => {
        const el = _element(className);
        if (el != null) {
            el.value = value;
        }
    },

    /**
     * @param {string} className
     * @returns {string|undefined}
     */
    getValue: (className) => {
        const el = _element(className);
        if (el == null) {
            return;
        }
        return el.value;
    },

    /**
     * @param {string} className
     * @returns {void}
     */
    focus: (className) => {
        const el = _element(className);
        if (el != null) {
            el.focus();
        }
    },

    /**
     * @param {string} str
     * @returns {string}
     */
    sanitize: (str) => {
        str = string.normalizeWhitespaces(str.replace(/<(?:.|\n)*?>/gm, ''));
        return (new DOMParser().parseFromString(str, 'text/html')).documentElement.textContent;
    },

    /**
     * @param {string} className
     * @param {function(object):void} callback
     * @returns {void}
     */
    onFormSubmit: (className, callback) => {
        const el = _element(className);
        if (el == null) {
            return;
        }
        el.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            callback(Object.fromEntries(formData));
        });
    },

    /**
     * @param {string} name
     * @param {function} instruction
     */
    frameSkip: (name, instruction) => {
        const timestamp = _cancelRunningRender(name);
        render[name] = {
            renderId: setTimeout(() => {
                instruction();
                render[name].timestamp = Date.now();
                delete render[name].renderId;
            }, (Date.now() - timestamp > 100) ? 0 : 10)
        };
    },

    /**
     * @param {string} className
     * @param {string} name
     * @param {string|number} value
     * @returns {void}
     */
    set: function (className, name, value) {
        const element = _element(className);
        if (element == null) {
            return;
        }

        let html = element.innerHTML;
        if (knownReplacements[className] == null) {
            knownReplacements[className] = html;
        }

        if (!html.includes(`{{${name}}}`)) { // update
            _reset(className);
            html = element.innerHTML;
        }

        html = string.replaceAll(html, `{{${name}}}`, value);
        element.innerHTML = html;
    },

    /**
     * @param {string} templateUrl
     * @param {string} stylesheetUrl
     * @returns {Promise<function():void>}
     */
    appendToBody: async (templateUrl, stylesheetUrl) => {
        // stylesheet first
        const stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = root.path + stylesheetUrl;
        document.head.appendChild(stylesheet);

        const request = await fetch(root.path + templateUrl);
        const templateString = await request.text();
        const templateParent = new DOMParser().parseFromString(templateString, 'text/html');
        const template = templateParent.body.firstChild;
        document.body.appendChild(template);

        return () => {
            template.remove();
            stylesheet.remove();
        };
    },

    /**
     * @param {string} className
     * @param {number} repeat
     * @param {Object.<string, function(number):(String|Number)>=} map
     */
    repeat: (className, repeat, map) => {
        const elements = _elements(className);
        if (elements.length === 0) {
            return;
        }

        elements.forEach((element, index) => {
            if (index > 0) {
                element.remove();
            }
        });

        const parentNode = elements[0].parentNode;
        const elementToRepeat = elements[0].cloneNode(true);
        elementToRepeat.classList.remove('hidden');

        // for the 'options' tag, the 'hidden' class does not work.
        if (elements[0].tagName === 'OPTION') {
            elements[0].remove();
        }

        const repeats = [];
        for (let i = 0; i < repeat; i++) {
            repeats.push(elementToRepeat.cloneNode(true));
        }

        repeats.forEach((node, index) => {
            // inject index to function calls in parent node
            _setAttributes(node, ')', `, ${index})`);
            _setAttributes(node, '(, ', `(`);

            let html = node.innerHTML;

            // inject index to function calls in child nodes
            html = string.replaceAll(html, ')"', `, ${index})"`);
            html = string.replaceAll(html, '(, ', `(`);

            if (map != null) {
                for (let name in map) {
                    const placeholder = `{{${name}}}`;
                    let value = map[name](index);

                    if (value === true) {
                        value = '';
                    } else if (value === false) {
                        value = 'hidden';
                    }

                    value = value == null ? '' : value;
                    html = string.replaceAll(html, placeholder, value);
                    _setAttributes(node, placeholder, value);
                }
            }

            node.innerHTML = html;
            parentNode.appendChild(node);
        });
    }

};