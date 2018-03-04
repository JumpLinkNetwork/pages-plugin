// JumpLink object
window.jumplink = window.jumplink || {};
window.jumplink.utilities = window.jumplink.utilities || {};

/**
 * Get a radom css color
 */
jumplink.utilities.getRandomColor = function() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

/**
 * Debug messages, extended version of console.log with colors and modul name
 * Similar to https://github.com/visionmedia/debug but much simpler
 */
jumplink.utilities.debug = function(name) {
    var color = jumplink.utilities.getRandomColor();
    return function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('%c['+name+']', 'color: '+color);
        return console.log.apply(null, args);
    };
};
  
/**
 * Check if value is a function
 */
jumplink.utilities.isFunction = function (value) {
    return typeof(value) === 'function';
}; 

/**
 * Check if variable is an Array
 * @see https://stackoverflow.com/a/4775737/1465919
 */
jumplink.utilities.isArray = function (value) {
    return Object.prototype.toString.call( value ) === '[object Array]';
};

/**
 * Check whether variable is number or string in JavaScript
 * @see https://stackoverflow.com/a/1421988/1465919
 */
jumplink.utilities.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
}

/**
 * heck if type is Object
 * @see https://stackoverflow.com/a/4775737/1465919
 */
jumplink.utilities.isObject = function (obj) {
    return obj && typeof obj === 'object';
};

/**
 * Check if type is Boolean
 * @see https://stackoverflow.com/a/28814615/1465919
 */
jumplink.utilities.isBoolean = function (boolean) {
    return typeof(boolean) == typeof(true);
};

jumplink.utilities.isString = function (string) {
    return string && typeof string === 'string';
};

/**
 * Check if value is undefined
 */
jumplink.utilities.isUndefined = function (value) {
    return typeof(value) === 'undefined';
};

/**
 * Get the selected value of a select option DOM element
 */
jumplink.utilities.getSelectedValue = function(selector) { 
    $selected = $(selector + ' option:selected');
    return $selected.val();
};

/**
 * set a value on a select dom element
 */
jumplink.utilities.setSelectedValue = function(selector, value) {
    $select = $(selector);
    $select.val(value).change();
    return window.jumplink.utilities.getSelectedValue(selector);
};

jumplink.utilities.setCheckboxValue = function(selector, value) {
    $(selector).prop('checked', value);
};

jumplink.utilities.getCheckboxValue = function(selector) {
    $(selector).is(':checked');
};