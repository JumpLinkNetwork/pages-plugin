<?php namespace RainLab\Pages\FormWidgets;

use Request;
use Backend\Classes\FormWidgetBase;
use RainLab\Pages\Classes\SnippetItem;

use Cms\Classes\Theme;

use Debugbar as Debugbar;

/**
 * Menu items widget.
 *
 * @package october\backend
 * @author Alexey Bobkov, Samuel Georges
 */
class SnippetItems extends FormWidgetBase
{
    protected $typeListCache = false;
    protected $typeInfoCache = [];

    /**
     * {@inheritDoc}
     */
    protected $defaultAlias = 'snippetitems';

    public $addSubitemLabel = 'rainlab.pages::lang.menu.add_subitem';

    public $noRecordsMessage = 'rainlab.pages::lang.menu.no_records';

    public $titleRequiredMessage = 'rainlab.pages::lang.snippetitem.title_required';

    public $referenceRequiredMessage = 'rainlab.pages::lang.snippetitem.reference_required';

    public $urlRequiredMessage = 'rainlab.pages::lang.snippetitem.url_required';

    public $cmsPageRequiredMessage = 'rainlab.pages::lang.snippetitem.cms_page_required';
    
    public $newItemTitle = 'rainlab.pages::lang.snippetitem.new_item';

    /**
     * {@inheritDoc}
     */
    public function init()
    {
        Debugbar::info('init');
    }

    /**
     * {@inheritDoc}
     */
    public function render()
    {
        $this->prepareVars();

        Debugbar::info('[SnippetItems] render');

        return $this->makePartial('snippetitems');
    }

    /**
     * Prepares the list data
     */
    public function prepareVars()
    {
        $snippetItem = new SnippetItem;

        // $pageSnippets = $snippetItem->listPageComponents($this->model->attributes['fileName'], Theme::getEditTheme(), $this->model->attributes['markup']);
        // Debugbar::info('[SnippetItems] prepareVars $pageSnippets', $pageSnippets);

        $this->vars['itemProperties'] = json_encode($snippetItem->fillable);
        // $this->vars['items'] = $this->model->items;

        $this->vars['items'] = [];

        Debugbar::info('[SnippetItems] prepareVars $this->model->attributes[markup]', $this->model->attributes['markup']);

        $emptyItem = new SnippetItem;
        $emptyItem->title = trans($this->newItemTitle);
        $emptyItem->type = 'theme';
        // $emptyItem->url = '/';

        $this->vars['emptyItem'] = $emptyItem;

        $widgetConfig = $this->makeConfig('~/plugins/rainlab/pages/classes/snippetitem/fields.yaml');
        $widgetConfig->model = $snippetItem;
        $widgetConfig->alias = $this->alias.'SnippetItem';

        $this->vars['itemFormWidget'] = $this->makeWidget('Backend\Widgets\Form', $widgetConfig);

        Debugbar::info('[SnippetItems] prepareVars $this->vars', $this->vars);
    }

    /**
     * {@inheritDoc}
     */
    protected function loadAssets()
    {
        $this->addJs('js/snippet-items-editor.js', 'core');
    }

    /**
     * {@inheritDoc}
     */
    public function getSaveValue($value)
    {
        return strlen($value) ? $value : null;
    }

    //
    // Methods for the internal use
    //

    /**
     * Returns the item reference description.
     * @param \RainLab\Pages\Classes\SnippetItem $item Specifies the menu item
     * @return string 
     */
    protected function getReferenceDescription($item)
    {
        Debugbar::info('[SnippetItems] getReferenceDescription', $item);
        if ($this->typeListCache === false) {
            $this->typeListCache = $item->getTypeOptions();
        }

        if (!isset($this->typeInfoCache[$item->type])) {
            $this->typeInfoCache[$item->type] = SnippetItem::getTypeInfo($item->type);
        }

        if (isset($this->typeInfoCache[$item->type]) ) {
            $result = trans($this->typeListCache[$item->type]);

            if ($item->type !== 'url') {
                if (isset($this->typeInfoCache[$item->type]['references'])) {
                    $result .= ': '.$this->findReferenceName($item->reference, $this->typeInfoCache[$item->type]['references']);
                }
            }
            else {
                $result .= ': '.$item->url;
            }

        }
        else {
            $result = trans('rainlab.pages::lang.snippetitem.unknown_type');
        }

        return $result;
    }

    protected function findReferenceName($search, $typeOptionList)
    {
        Debugbar::info('[SnippetItems] findReferenceName $search', $search);
        $iterator = function($optionList, $path) use ($search, &$iterator) {
            foreach ($optionList as $reference => $info) {
                if ($reference == $search) {
                    $result = $this->getSnippetItemTitle($info);

                    return strlen($path) ? $path.' / ' .$result : $result;
                }

                if (is_array($info) && isset($info['items'])) {
                    $result = $iterator($info['items'], $path.' / '.$this->getSnippetItemTitle($info));

                    if (strlen($result)) {
                        return strlen($path) ? $path.' / '.$result : $result;
                    }
                }
            }
        };

        $result = $iterator($typeOptionList, null);
        if (!strlen($result)) {
            $result = trans('rainlab.pages::lang.snippetitem.unnamed');
        }

        $result = preg_replace('|^\s+\/|', '', $result);

        return $result;
    }

    protected function getSnippetItemTitle($itemInfo)
    {
        Debugbar::info('[SnippetItems] getSnippetItemTitle $itemInfo', $itemInfo);
        if (is_array($itemInfo)) {
            if (!array_key_exists('name', $itemInfo) || !strlen($itemInfo['name'])) {
                return trans('rainlab.pages::lang.snippetitem.unnamed');
            }

            return $itemInfo['name'];
        }

        return strlen($itemInfo) ? $itemInfo : trans('rainlab.pages::lang.snippetitem.unnamed');
    }
}
