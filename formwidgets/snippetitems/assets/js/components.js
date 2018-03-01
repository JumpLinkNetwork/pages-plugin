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
 *      {id:1, label: 'Watt', value: 'Watt'},
 *      {id:2, label: 'Land', value: 'Land'},
 *      {id:3, label: 'Fluss', value: 'Fluss'},
 *      {id:4, label: 'Spezial', value: 'Spezial'},
 * ];
 * 
 * controller.onSelectChanged = function(selectedValue) {
        controller.debug('onSelectChanged', selectedValue);
    };
 */
rivets.components['rv-select'] = {
    template: function() {
      return jumplink.templates['rv-select'];
    },
    initialize: function(el, data) {
      var controller = this;
      controller.debug = debug('rivets:rv-select');
      controller.debug('initialize', el, data);
      var $el = $(el);
      var $select = $el.find('select');
      
      controller.label = data.label || '';
      controller.description = data.description || '';
      controller.values = data.values;
      controller.id = data.id ? 'rv-select-'+data.id : Date.now();
      
      var onChange = function() {
          if (jumplink.utilities.isFunction(data.onChange)) {
              data.onChange(controller.selected);
          }
      }
      
      controller.selected = controller.values[0];
      onChange();
      
  
      
      /**
       * Get the selected value of a select option DOM element
       */
      controller.get = function() { 
          $selected = $select.children('option:selected');
          if($selected.length) {
              var data = $selected.data();
              if(data.index >= 0) {
                  var value = controller.values[data.index];
                  controller.debug('get', value );
                  return value;
              }
          }
          return null;
      };
      
      /**
       * set a value
       */
      controller.set = function(value) {
          $select.val(value).change();
          controller.debug('set', value);
          return controller.get();
      };
      
      controller.values.forEach(function(value, i) {
          var $option = $('<option>', {
              'data-index': i,
              'data-id': value.id,
              value: value.value,
              text : value.label,
          });
          
          // select first element by default
          if(i === 0) {
              $option.attr('selected', true);
          }
          
          $select.append($option);
      });
      
      $select.on('change', function() {
          var $this = $(this);
          var value = controller.get();
          controller.selected = value;
          onChange();
          controller.debug('select', value );
      });
  
      return controller;
    }
};

rivets.components['rv-checkbox'] = {
    template: function() {
      return jumplink.templates['rv-checkbox'];
    },
    initialize: function(el, data) {
      var controller = this;
      controller.debug = debug('rivets:rv-checkbox');
      controller.debug('initialize', el, data);
      var $el = $(el);
      var $checkbox = $el.find('input[type="checkbox"]');
      
      controller.ready = false;
      controller.label = data.label;
      controller.description = data.description;
      controller.id = data.id ? 'rv-checkbox-'+data.id : Date.now();
      controller.checked = data.default;
      jumplink.utilities.setCheckboxValue($checkbox, controller.checked);
          
      $checkbox.change(function() {
          controller.checked = $checkbox.is(":checked");
          controller.debug('changed', controller.checked);
          if (jumplink.utilities.isFunction(data.onChange)) {
              data.onChange(controller.checked);
          }
      });
      
      // WORKAROUND
      setTimeout(function() {
          controller.ready = true;
      }, 200);
      
      
      return controller;
    }
}

rivets.components['items'] = {
    template: function() {
      return jumplink.templates['items'];
    },
    initialize: function(el, data) {
      var controller = this;
      controller.debug = debug('rivets:items');
      var $el = $(el);
      controller.debug('initialize', $el, data);
      controller.items = JSON.parse(data.items);
      controller.debug('items', controller.items);
      
      return controller;
    }
}

/** 
 * TODO rename to sortable-list?
 */
rivets.components['itemlist'] = {
    template: function() {
      return jumplink.templates['itemlist'];
    },
    initialize: function(el, data) {
        var controller = this;
        controller.debug = debug('rivets:itemlist');
        var $el = $(el);
        controller.debug('initialize', $el, data);
        controller.items = data.items;

        /**
         * Makes the list sortable
         * @see https://octobercms.com/docs/ui/drag-sort
         */
        $el.sortable();

        return controller;
    }
}

rivets.components['item'] = {
    template: function() {
      return jumplink.templates['item'];
    },
    initialize: function(el, data) {
      var controller = this;
      controller.debug = debug('rivets:item');
      var $el = $(el);
      controller.debug('initialize', $el, data);
      controller.item = data.item;
      
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