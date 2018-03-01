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