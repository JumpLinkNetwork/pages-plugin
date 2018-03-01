/*
 * The menu item editor. Provides tools for managing the 
 * menu items.
 */
+function ($) { "use strict";
    var SnippetItemsEditor = function (el, options) {
        this.$el = $(el)
        this.options = options

        this.init()
    }

    SnippetItemsEditor.prototype.init = function() {
        console.log('[SnippetItemsEditor] init');
        var self = this

        this.alias = this.$el.data('alias')
        this.$treeView = this.$el.find('div[data-control="treeview"]')

        this.typeInfo = {}

        // Menu items is clicked
        this.$el.on('open.oc.treeview', function(e) {
            return self.onItemClick(e.relatedTarget)
        })

        // Submenu item is clicked in the master tabs
        this.$el.on('submenu.oc.treeview', $.proxy(this.onSubmenuItemClick, this))

        this.$el.on('click', 'a[data-control="add-item"]', function(e) {
            console.log('[SnippetItemsEditor.init] onClick a[data-control="add-item"]');
            self.onCreateItem(e.target)
            return false
        })
    }

    /*
     * Triggered when a submenu item is clicked in the menu editor.
     */
    SnippetItemsEditor.prototype.onSubmenuItemClick = function(e) {
        console.log('[SnippetItemsEditor.onSubmenuItemClick]');
        if ($(e.relatedTarget).data('control') == 'delete-menu-item')
            this.onDeleteMenuItem(e.relatedTarget)

        if ($(e.relatedTarget).data('control') == 'create-item')
            this.onCreateItem(e.relatedTarget)

        return false
    }

    /*
     * Removes a menu item
     */
    SnippetItemsEditor.prototype.onDeleteMenuItem = function(link) {
        console.log('[SnippetItemsEditor.onDeleteMenuItem]');
        if (!confirm('Do you really want to delete the menu item? This will also delete the subitems, if any.'))
            return

        $(link).trigger('change')
        $(link).closest('li[data-menu-item]').remove()

        $(window).trigger('oc.updateUi')

        this.$treeView.treeView('update')
        this.$treeView.treeView('fixSubItems')
    }

    /*
     * Opens the menu item editor
     */
    SnippetItemsEditor.prototype.onItemClick = function(item, newItemMode) {
        var $item = $(item),
            $container = $('> div', $item),
            self = this

        console.log('[SnippetItemsEditor.onItemClick]');

        $container.one('show.oc.popup', function(e){
            $(document).trigger('render');

            self.$popupContainer = $(e.relatedTarget);
            self.$itemDataContainer = $container.closest('li[data-snippet-item]');

            console.log('[SnippetItemsEditor] show.oc.popup self.$popupContainer', self.$popupContainer, 'self.$itemDataContainer', self.$itemDataContainer);

            $('input[type=checkbox]', self.$popupContainer).removeAttr('checked')

            self.loadProperties(self.$popupContainer, self.$itemDataContainer.data('snippet-item'))
            self.$popupForm = self.$popupContainer.find('form')
            self.itemSaved = false

            var $titleField = $('input[name=title]', self.$popupContainer).focus().select()
            var $typeField = $('select[name=type]', self.$popupContainer).change(function(){
                self.loadTypeInfo(false, true)
            })

            $('select[name=reference]', self.$popupContainer).change(function() {
                console.log('[SnippetItemsEditor] select[name=reference] changed');
                var selectedTitle = $(this).find('option:selected').text();
                // If the saved title is the default new item title, use reference title,
                // removing CMS page [base file name] suffix
                if (selectedTitle && self.properties.title === self.$popupForm.attr('data-new-item-title')) {
                    $titleField.val(selectedTitle.replace(/\s*\[.*\]$/, ''))
                }
            })

            self.$popupContainer.on('keydown', function(e) {
                console.log('[SnippetItemsEditor] keydown');
                if (e.which == 13)
                    self.applyMenuItem()
            })

            $('button[data-control="apply-btn"]', self.$popupContainer).click($.proxy(self.applyMenuItem, self))

            var $updateTypeOptionsBtn = $('<a class="sidebar-control" href="#"><i class="icon-refresh"></i></a>')
            $('div[data-field-name=reference]').addClass('input-sidebar-control').append($updateTypeOptionsBtn)

            $updateTypeOptionsBtn.click(function(){
                self.loadTypeInfo(true)

                return false
            })

            $updateTypeOptionsBtn.keydown(function(ev){
                if (ev.which == 13 || ev.which == 32) {
                    self.loadTypeInfo(true)
                    return false
                }
            })

            self.$popupContainer.on('change', 'select[name="referenceSearch"]', function() {
                
                var $select = $(this),
                    val = $select.val(),
                    parts

                if (!val) return

                console.log('[SnippetItemsEditor] select[name="referenceSearch"] changed val', val);

                // type::reference ID
                parts = val.split('::', 2)

                self.referenceSearchOverride = parts[1];

                $select.empty().trigger('change.select2');

                $typeField
                    .val(parts[0])
                    .triggerHandler('change')
            })

            var $updateCmsPagesBtn = $updateTypeOptionsBtn.clone(true)
            $('div[data-field-name=cmsPage]').addClass('input-sidebar-control').append($updateCmsPagesBtn)

            self.loadTypeInfo()
        })

        $container.one('hide.oc.popup', function(e) {
            if (!self.itemSaved && newItemMode)
                $item.remove()

            self.$treeView.treeView('update')
            self.$treeView.treeView('fixSubItems')

            $container.removeClass('popover-highlight')
        })

        $container.popup({
            content: $('script[data-editor-template]', this.$el).html()
        })

        /*
         * Highlight modal target
         */
        $container.addClass('popover-highlight')
        $container.blur()

        return false
    }

    SnippetItemsEditor.prototype.loadProperties = function($popupContainer, properties) {
        this.properties = properties
        console.log('[SnippetItemsEditor.loadProperties] properties', properties);
        var setPropertyOnElement = function($input, val) {
            if ($input.prop('type') == 'checkbox') {
                var checked = !(val == '0' || val == 'false' || val == 0 || val == undefined || val == null)
                checked ? $input.prop('checked', 'checked') : $input.removeAttr('checked')
            }
            else if ($input.prop('type') == 'radio') {
                $input.filter('[value="'+val+'"]').prop('checked', true)
            }
            else {
                $input.val(val)
                $input.change()
            }
        }

        // TODO
        var $snippetProperies = $popupContainer.find('.snippet-properies');
        console.log('[SnippetItemsEditor.loadProperties] $snippetProperies', $snippetProperies);
        $snippetProperies.append(
            '<select class="form-control custom-select">'+
                '<option selected="selected" value="2">Approved</option>'+
                '<option value="3">Deleted</option>'+
                '<option value="1">New</option>'+
            '</select>'
        );

        $.each(properties, function(property, val) {

            

            if (property == 'viewBag') {
                $.each(val, function(vbProperty, vbVal) {
                    var $input = $('[name="viewBag['+vbProperty+']"]', $popupContainer).not('[type=hidden]')
                    setPropertyOnElement($input, vbVal)
                })

                /**
                 * Mediafinder support
                 */
                var mediafinderElements = $('[data-control="mediafinder"]');
                var storageMediaPath = $('[data-storage-media-path]').data('storage-media-path');

                $.each(mediafinderElements, function() {

                      var input = $(this).find('>input');
                      var propertyName = input.attr('name');

                      if( propertyName.length ) {
                          var propertyNameSimple = propertyName.substr(8).slice(0,-1);
                      }

                      var propertyValue = '';

                      $.each(val, function(vbProperty, vbVal) {
                          if( vbProperty == propertyNameSimple ) {
                              propertyValue = vbVal;
                          }
                      });

                      if( propertyValue != '' ) {

                          $(this).toggleClass('is-populated');
                          input.attr('value', propertyValue);

                          var image = $(this).find('[data-find-image]');

                          if( image.length ) {
                              image.attr('src', storageMediaPath + propertyValue );
                          }

                          var file = $(this).find('[data-find-file-name]');

                          if( file.length ) {
                              file.text( propertyValue.substr(1) );
                          }

                      }

                });

            }
            else {
                var $input = $('[name="'+property+'"]', $popupContainer).not('[type=hidden]')
                setPropertyOnElement($input, val)
            }
        })
    }

    SnippetItemsEditor.prototype.loadTypeInfo = function(force, focusList) {
        console.log('[SnippetItemsEditor.loadTypeInfo] focusList', focusList);
        var type = $('select[name=type]', this.$popupContainer).val()

        var self = this

        if (!force && this.typeInfo[type] !== undefined) {
            self.applyTypeInfo(this.typeInfo[type], type, focusList)
            return
        }

        $.oc.stripeLoadIndicator.show()
        this.$popupForm.request('onGetMenuItemTypeInfo')
            .always(function(){
                $.oc.stripeLoadIndicator.hide()
            })
            .done(function(data){
                self.typeInfo[type] = data.menuItemTypeInfo
                self.applyTypeInfo(data.menuItemTypeInfo, type, focusList)
            })
    }

    SnippetItemsEditor.prototype.applyTypeInfo = function(typeInfo, type, focusList) {
        var $referenceFormGroup = $('div[data-field-name="reference"]', this.$popupContainer),
            $optionSelector = $('select', $referenceFormGroup),
            $nestingFormGroup = $('div[data-field-name="nesting"]', this.$popupContainer),
            $urlFormGroup = $('div[data-field-name="url"]', this.$popupContainer),
            $replaceFormGroup = $('div[data-field-name="replace"]', this.$popupContainer),
            $cmsPageFormGroup = $('div[data-field-name="cmsPage"]', this.$popupContainer),
            $cmsPageSelector = $('select', $cmsPageFormGroup),
            prevSelectedReference = $optionSelector.val(),
            prevSelectedPage = $cmsPageSelector.val()

        // Search selection
        if (this.referenceSearchOverride) {
            prevSelectedReference = this.referenceSearchOverride;
            this.referenceSearchOverride = null;
        }
        
        if (typeInfo.references) {
            $optionSelector.find('option').remove()
            $referenceFormGroup.show()

            var iterator = function(options, level, path) {
                $.each(options, function(code) {
                    var $option = $('<option></option>').attr('value', code),
                        offset = Array(level*4).join('&nbsp;'),
                        isObject = $.type(this) == 'object'

                    $option.text(isObject ? this.title : this)

                    var optionPath = path.length > 0
                        ? (path + ' / ' + $option.text())
                        : $option.text()

                    $option.data('path', optionPath)

                    $option.html(offset + $option.html())

                    $optionSelector.append($option)

                    if (isObject)
                        iterator(this.items, level+1, optionPath)
                })
            }

            iterator(typeInfo.references, 0, '')

            $optionSelector
                .val(prevSelectedReference ? prevSelectedReference : this.properties.reference)
                .triggerHandler('change')
        }
        else {
            $referenceFormGroup.hide()
        }

        if (typeInfo.cmsPages) {
            $cmsPageSelector.find('option').remove()
            $cmsPageFormGroup.show()

            $.each(typeInfo.cmsPages, function(code) {
                var $option = $('<option></option>').attr('value', code)

                $option.text(this).val(code)
                $cmsPageSelector.append($option)
            })

            $cmsPageSelector
                .val(prevSelectedPage ? prevSelectedPage : this.properties.cmsPage)
                .triggerHandler('change')
        }
        else {
            $cmsPageFormGroup.hide()
        }

        $nestingFormGroup.toggle(typeInfo.nesting !== undefined && typeInfo.nesting)
        $urlFormGroup.toggle(type == 'url')
        $replaceFormGroup.toggle(typeInfo.dynamicItems !== undefined && typeInfo.dynamicItems)

        $(document).trigger('render')

        if (focusList) {
            var focusElements = [
                $referenceFormGroup,
                $cmsPageFormGroup,
                $('div.custom-checkbox', $nestingFormGroup),
                $('div.custom-checkbox', $replaceFormGroup),
                $('input', $urlFormGroup)
            ]

            $.each(focusElements, function(){
                if (this.is(':visible')) {
                    var $self = this

                    window.setTimeout(function() {
                        if ($self.hasClass('dropdown-field'))
                            $('select', $self).select2('focus', 100)
                        else $self.focus()
                    })

                    return false;
                }
            })
        }
    }

    SnippetItemsEditor.prototype.applyMenuItem = function() {
        var self = this,
            data = {},
            propertyNames = this.$el.data('item-properties'),
            basicProperties = {
                'title': 1,
                'type': 1,
                'code': 1
            },
            typeInfoPropertyMap = {
                reference: 'references',
                replace: 'dynamicItems',
                cmsPage: 'cmsPages'
            },
            typeInfo = {},
            validationErrorFound = false

        console.log('[SnippetItemsEditor.applyMenuItem] propertyNames', propertyNames);

        $.each(propertyNames, function() {
            var propertyName = this,
                $input = $('[name="'+propertyName+'"]', self.$popupContainer).not('[type=hidden]')

            if ($input.prop('type') !== 'checkbox') {
                data[propertyName] = $.trim($input.val())

                if (propertyName == 'type')
                    typeInfo = self.typeInfo[data.type]

                if (data[propertyName].length == 0) {
                    var typeInfoProperty = typeInfoPropertyMap[propertyName] !== undefined ? typeInfoPropertyMap[propertyName] : propertyName

                    if (typeInfo[typeInfoProperty] !== undefined) {

                        $.oc.flashMsg({
                            class: 'error',
                            text: self.$popupForm.attr('data-message-'+propertyName+'-required')
                        })

                        if ($input.prop("tagName") == 'SELECT')
                            $input.select2('focus')
                        else
                            $input.focus()

                        validationErrorFound = true

                        return false
                    }
                }
            }
            else {
                data[propertyName] = $input.prop('checked') ? 1 : 0
            }
        })

        if (validationErrorFound)
            return

        if (data.type !== 'url') {
            delete data['url']

            $.each(data, function(properrty) {
                if (property == 'type')
                    return

                var typeInfoProperty = typeInfoPropertyMap[property] !== undefined ? typeInfoPropertyMap[property] : property
                if ((typeInfo[typeInfoProperty] === undefined || typeInfo[typeInfoProperty] === false) 
                    && basicProperties[property] === undefined)
                    delete data[property]
            })
        }
        else {
            $.each(propertyNames, function(){
                if (this != 'url' && basicProperties[this] === undefined)
                    delete data[this]
            })
        }

        if ($.trim(data.title).length == 0) {
            $.oc.flashMsg({
                class: 'error',
                text: self.$popupForm.data('messageTitleRequired')
            })

            $('[name=title]', self.$popupContainer).focus()

            return
        }

        if (data.type == 'url' && $.trim(data.url).length == 0) {
            $.oc.flashMsg({
                class: 'error',
                text: self.$popupForm.data('messageUrlRequired')
            })

            $('[name=url]', self.$popupContainer).focus()

            return
        }

        $('> div span.title', self.$itemDataContainer).text(data.title)

        var referenceDescription = $.trim($('select[name=type] option:selected', self.$popupContainer).text())

        if (data.type == 'url') {
            referenceDescription += ': ' + $('input[name=url]', self.$popupContainer).val()
        }
        else if (typeInfo.references) {
            referenceDescription += ': ' + $.trim($('select[name=reference] option:selected', self.$popupContainer).data('path'))
        }

        $('> div span.comment', self.$itemDataContainer).text(referenceDescription)

        this.attachViewBagData(data)

        this.$itemDataContainer.data('menu-item', data)
        this.itemSaved = true
        this.$popupContainer.trigger('close.oc.popup')
        this.$el.trigger('change')
    }

    SnippetItemsEditor.prototype.attachViewBagData = function(data) {
        var fields = this.$popupForm.serializeArray(),
            fieldName,
            fieldValue;

        console.log('[SnippetItemsEditor.attachViewBagData] fields', fields);

        $.each(fields, function(index, field) {
            fieldName = field.name
            fieldValue = field.value

            if (fieldName.indexOf('viewBag[') != 0) {
                return true // Continue
            }

            /*
             * Break field name in to elements
             */
            var elements = [],
                searchResult,
                expression = /([^\]\[]+)/g

            while ((searchResult = expression.exec(fieldName))) {
                elements.push(searchResult[0])
            }

            /*
             * Attach elements to data with value
             */
            var currentData = data,
                elementsNum = elements.length,
                lastIndex = elementsNum - 1,
                currentProperty

            for (var i = 0; i < elementsNum; ++i) {
                currentProperty = elements[i]

                if (i === lastIndex) {
                    currentData[currentProperty] = fieldValue
                }
                else if (currentData[currentProperty] === undefined) {
                    currentData[currentProperty] = {}
                }

                currentData = currentData[currentProperty]
            }
        })
    }

    SnippetItemsEditor.prototype.onCreateItem = function(target) {
        console.log('[SnippetItemsEditor] onCreateItem');
        var parentList = $(target).closest('li[data-snippet-item]').find(' > ol'),
            item = $($('script[data-item-template]', this.$el).html())

        if (!parentList.length)
            parentList = $(target).closest('div[data-control=treeview]').find(' > ol')

        parentList.append(item)
        this.$treeView.treeView('update')
        $(window).trigger('oc.updateUi')

        this.onItemClick(item, true)
    }

    SnippetItemsEditor.DEFAULTS = {
    }

    // SnippetItemsEditor PLUGIN DEFINITION
    // ============================

    var old = $.fn.SnippetItemsEditor

    $.fn.SnippetItemsEditor = function (option) {
        var args = Array.prototype.slice.call(arguments, 1)
        return this.each(function () {
            var $this   = $(this)
            var data    = $this.data('oc.SnippetItemsEditor')
            var options = $.extend({}, SnippetItemsEditor.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('oc.SnippetItemsEditor', (data = new SnippetItemsEditor(this, options)))
            else if (typeof option == 'string') data[option].apply(data, args)
        })
    }

    $.fn.SnippetItemsEditor.Constructor = SnippetItemsEditor

    // SnippetItemsEditor NO CONFLICT
    // =================

    $.fn.SnippetItemsEditor.noConflict = function () {
        $.fn.SnippetItemsEditor = old
        return this
    }

    // SnippetItemsEditor DATA-API
    // ===============

    $(document).on('render', function() {
        $('[data-control="snippet-item-editor"]').SnippetItemsEditor();
    });
}(window.jQuery);