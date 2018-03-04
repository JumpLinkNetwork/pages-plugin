var debug = jumplink.utilities.debug;


/**
 * Component with some utilities fpr a select with generated select options 
 * @html:
 * <select
 *      label="'label'"
 *      description="'description'"
 *      values="values"
 *      on-change="onSelectChanged"
 * >
 * 
 * @parent controller:
 * controller.values = [
 *   {id:1, label: 'Watt', value: 'watt'},
 *   {id:2, label: 'Land', value: 'land'},
 *   {id:3, label: 'Fluss', value: 'fluss'},
 *   {id:4, label: 'Spezial', value: 'spezial'},
 *   {label: 'Grouped Example', grouped: [
 *     {id:5, label: 'A', value: 'a'},
 *     {id:6, label: 'B', value: 'b'},
 *     {id:7, label: 'C', value: 'c'},
 *     {id:8, label: 'D', value: 'd'},
 *   ]}
 * ];
 * 
 * controller.onSelectChanged = function(selectedValue) {
 *     controller.debug('onSelectChanged', selectedValue);
 * };
 * 
 * @see https://github.com/octobercms/october/blob/master/modules/system/assets/ui/js/select.js
 */
rivets.components['oc-select'] = {
    template: function() {
        return jumplink.templates['oc-select'];
    },
    initialize: function(el, data) {
        var controller = this;
        controller.debug = debug('rivets:oc-select');
        var $el = $(el);
        var $select = $el.find('select');
        controller.debug('initialize', $el, $select, data);
        
        controller.label = data.label;
        controller.description = data.description;
        controller.name = data.name;

        // set id, if not präsent generate the id
        controller.id = data.id ? 'oc-select-'+data.id : Date.now();

        if(data.values) {
            controller.values = data.values;
        }

        // you can also set the select values by a key -> value object
        if(data.keyValueValues) {
            controller.values = [];
            var counter = 0;
            for (var key in data.keyValueValues) {
                if (data.keyValueValues.hasOwnProperty(key)) {
                    var value = data.keyValueValues[key];
                    if(typeof(value) !== 'function') {
                        controller.values.push({
                            value: key,
                            label: value,
                            id: counter,
                        });
                        counter++;
                    }
                }
            }
        }

        /**
         * Get the selected value of a select option DOM element
         */
        controller.get = function() { 
            $selected = $select.find('option:selected');
            if($selected.length) {
                $parent = $selected.parent();
                // is grouped option
                if($parent.is('optgroup')) {
                    var groupData = $parent.data();
                    var data = $selected.data();
                    if(groupData.index >= 0 && data.index >= 0) {
                        var value = controller.values[groupData.index].grouped[data.index];
                        return value;
                    }
                } else {
                    // is ungrouped option
                    var data = $selected.data();
                    if(data.index >= 0) {
                        var value = controller.values[data.index];
                        return value;
                    }
                }
            }
            return null;
        };
        
        /**
         * set a value
         */
        controller.set = function(value) {
            if(jumplink.utilities.isObject(value)) {
                if(value.value) {
                    value = value.value;
                }

                if(value.grouped && value.grouped[0].value) {
                    value = value.grouped[0].value;
                }
            }
            $select.val(value).change();
            controller.debug('set', value);
            controller.value = value;
            return controller.get();
        };
        
        var onChange = function(value) {
            if (jumplink.utilities.isFunction(data.onChange)) {
                data.onChange(value);
            }
        }
        
        /*
         * set the selected value, if not defined as attribute select the first value from the values array
         */
        if(data.value) {
            controller.set(data.value);
        } else {
            controller.set(controller.values[0]);
        }
        
        /**
         * Append values to select dom element
         */
        controller.values.forEach(function(value, i) {

            var $option;
            
            // grouped option
            if(value.grouped) {
                $option = $('<optgroup>', {
                    'data-index': i,
                    label : value.label,
                });
                value.grouped.forEach(function(value, k) {
                    var $suboption = $('<option>', {
                        'data-index': k,
                        'data-id': value.id,
                        value: value.value,
                        text : value.label,
                    });
                    $option.append($suboption);
                });
            } else {
                // ungrouped option
                $option = $('<option>', {
                    'data-index': i,
                    'data-id': value.id,
                    value: value.value,
                    text : value.label,
                });
            }


            
            // select first element by default
            if(i === 0) {
                $option.attr('selected', true);
            }
            
            $select.append($option);
        });
        
        $select.on('change', function() {
            var $this = $(this);
            var value = controller.get();
            onChange(value);
            controller.debug('[$select.on(change] value', value );
        });
    
        return controller;
    }
};

rivets.components['oc-checkbox'] = {
    template: function() {
      return jumplink.templates['oc-checkbox'];
    },
    initialize: function(el, data) {
      var controller = this;
      controller.debug = debug('rivets:oc-checkbox');
      controller.debug('initialize', el, data);
      var $el = $(el);
      var $checkbox = $el.find('input[type="checkbox"]');
      
      controller.label = data.label;
      controller.description = data.description;
      controller.name = data.name;
      controller.type = data.type || 'checkbox';
      controller.id = data.id ? 'oc-checkbox-'+data.id : Date.now();
      controller.value = data.value;
      jumplink.utilities.setCheckboxValue($checkbox, controller.value);
          
      $checkbox.change(function() {
          controller.value = $checkbox.is(":checked");
          controller.debug('changed', controller.value);
          if (jumplink.utilities.isFunction(data.onChange)) {
              data.onChange(controller.value);
          }
      });     
      
      return controller;
    }
}

rivets.components['snippet-editor'] = {
    template: function() {
      return jumplink.templates['snippet-editor'];
    },
    initialize: function(el, data) {
      var controller = this;
      controller.debug = debug('rivets:snippet-editor');
      var $el = $(el);
      controller.debug('initialize', $el, data);
      controller.items = JSON.parse(data.items);
      controller.debug('items', controller.items);
      
      return controller;
    }
}

/** 
 * 
 */
rivets.components['snippet-itemlist'] = {
    template: function() {
      return jumplink.templates['snippet-itemlist'];
    },
    initialize: function(el, data) {
        var controller = this;
        controller.debug = debug('rivets:snippet-itemlist');
        var $el = $(el);
        controller.debug('initialize', $el, data);
        controller.items = data.items;

        /**
         * Makes the list sortable
         * @see https://octobercms.com/docs/ui/drag-sort
         */
        $el.sortable({
            itemSelector: 'snippet-item',
            placeholder: '<snippet-item class="placeholder"></snippet-item>',
            handle: '.drag-handle',
        });

        return controller;
    }
}

rivets.components['snippet-item'] = {
    template: function() {
      return jumplink.templates['snippet-item'];
    },
    initialize: function(el, data) {
      var controller = this;
      controller.debug = debug('rivets:snippet-item');
      var $el = $(el);
      controller.debug('initialize', $el, data);
      controller.item = data.item;

      controller.onEdit = function(event) {
        var template = '<snippet-properties-form item="data"></snippet-properties-form>';
        var componentName = 'snippet-properties-form';
        $.event.trigger('rivets:oc-popup', [true, template, componentName, controller.item]);
      }
      
      return controller;
    }
}

/**
 * A modal component for alerts, do you need to use this component in dom only once
 * and you can call by tigger a global event:
 * @example $.event.trigger('rivets:oc-popup', [true, data]);
 * 
 * The data param should have title, body, ..
 * 
 * @events
 *  * rivets:oc-popup (event, show, data)
 * 
 * @see https://github.com/octobercms/october/blob/master/modules/system/assets/ui/js/popup.js
 */
rivets.components['oc-popup'] = {

    template: function() {
        return jumplink.templates['oc-popup'];
    },
  
    initialize: function(el, data) {
        var controller = this;
        controller.debug = debug('rivets:oc-popup');
        controller.debug('initialize', el, data);
        
        controller.data = {};
        
        var $el = $(el);

        var popupRivetsView;

        $el.off('show.oc.popup').on('show.oc.popup', function(e) {
            controller.debug('show.oc.popup init component data', controller.data, popupRivetsView);
            // rivets.init(controller.componentName, $('body > .control-popup'), {data: controller.data});

            popupRivetsView = rivets.bind($('body > .control-popup ' + controller.componentName), {data: controller.data});
                        
            
            // trigger render to render octobercms javascript forms like the select form
            $(document).trigger('render');
        });


        $el.off('hidden.oc.popup').on('hidden.oc.popup', function(e) {
            controller.debug('hidden.oc.popup');
            popupRivetsView.unbind();
        });

        
        /**
         * WORKAROUND global event to show / hide this popup 
         * 
         */
        $(document).bind('rivets:oc-popup', function (event, show, template, componentName, data) {
            controller.debug('rivets:oc-popup', 'template', template, 'componentName', componentName, 'data', data);
            if(show) {
                controller.template = template;
                controller.componentName = componentName;
                controller.data = data;
                controller.show(event);
            } else {
                ontroller.hide(event);
            }
        });
        
        /**
         * Problem durch .trigger("click") ist das element nicht am ende des bodys
         * Durch $el.popup muss ein content übergeben werden wodurch vermutlich rivets nicht verwendet werden kann
         */
        controller.show = function(event) {
            controller.debug('show', controller.data);
            $el.popup({
                content: controller.template,
            });
        };
        
        controller.hide = function(event) {
            // $popup.modal('hide');
        };
    
        return controller;
    }
};

rivets.components['snippet-properties-form'] = {
    template: function() {
        return jumplink.templates['snippet-properties-form'];
    },
    initialize: function(el, data) {
        var controller = this;
        controller.debug = debug('rivets:snippet-properties-form');
        var $el = $(el);
        controller.debug('initialize', $el, data);
        controller.item = data.item;

        return controller;
    }
}

rivets.components['snippet-item-search-form'] = {
    template: function() {
        return jumplink.templates['snippet-item-search-form'];
    },
    initialize: function(el, data) {
        var controller = this;
        controller.debug = debug('rivets:snippet-item-search-form');
        var $el = $(el);
        controller.debug('initialize', $el, data);
        controller.item = data.item;

        controller.values = [
            {label: 'Grouped 1', grouped: [
                {id:1, label: 'X', value: 'y'},
                {id:2, label: 'Y', value: 'x'},
                {id:3, label: 'Z', value: 'z'},
            ]},
            {id:1, label: 'Watt', value: 'watt'},
            {id:2, label: 'Land', value: 'land'},
            {id:3, label: 'Fluss', value: 'fluss'},
            {id:4, label: 'Spezial', value: 'spezial'},
            {label: 'Grouped 2', grouped: [
                {id:5, label: 'A', value: 'a'},
                {id:6, label: 'V', value: 'b'},
                {id:7, label: 'C', value: 'c'},
                {id:8, label: 'D', value: 'd'},
            ]}
        ];

        return controller;
    }
}

// $(document).on('render', function() {
//     rivets.bind($('.snippet-properies'), {})
// });
var view;
$(function() {
    view = rivets.bind($('[data-control="snippet-item-editor"]'), {});
});