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

    public $addSubitemLabel = 'rainlab.pages::lang.snippetmenu.add_subitem';

    public $noRecordsMessage = 'rainlab.pages::lang.snippetmenu.no_records';

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
    }

    public function makeTrimedPartial($partial, $params = [], $throwException = true)
    {
        $partialString = $this->makePartial($partial, $params, $throwException);
        $partialString = trim(preg_replace('/\s+/', ' ', $partialString));
        return $partialString;
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

        $extractSnippetItems = SnippetItem::extractSnippetItemsFromMarkupCached(Theme::getEditTheme(), $this->model->attributes['fileName'], $this->model->attributes['markup']);
        Debugbar::info('[SnippetItems] prepareVars $extractSnippetItems', $extractSnippetItems);
        $this->vars['items'] = $extractSnippetItems;

        // TODO use extractSnippets ..

        $this->vars['itemProperties'] = json_encode($snippetItem->fillable);
        // $this->vars['items'] = $this->model->items;

        // $this->vars['items'] = [];


        Debugbar::info('[SnippetItems] prepareVars $this->model->attributes', $this->model->attributes);

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
        $this->addCss('css/list.css', 'core');
        $this->addJs('js/rivets.bundled.min.js', 'core');
        $this->addJs('js/utilities.js', 'core');
        $this->addJs('js/formatters.js', 'core');
        $this->addJs('js/binders.js', 'core');
        $this->addJs('js/components.js', 'core');
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


    protected function findReferenceName($search, $typeOptionList)
    {
        Debugbar::info('[SnippetItems] findReferenceName $search', $search);
        // $iterator = function($optionList, $path) use ($search, &$iterator) {
        //     foreach ($optionList as $reference => $info) {
        //         if ($reference == $search) {
        //             $result = $this->getSnippetItemTitle($info);

        //             return strlen($path) ? $path.' / ' .$result : $result;
        //         }

        //         if (is_array($info) && isset($info['items'])) {
        //             $result = $iterator($info['items'], $path.' / '.$this->getSnippetItemTitle($info));

        //             if (strlen($result)) {
        //                 return strlen($path) ? $path.' / '.$result : $result;
        //             }
        //         }
        //     }
        // };

        // $result = $iterator($typeOptionList, null);
        // if (!strlen($result)) {
        //     $result = trans('rainlab.pages::lang.snippetitem.unnamed');
        // }

        // $result = preg_replace('|^\s+\/|', '', $result);

        // return $result = trans('rainlab.pages::lang.snippetitem.unnamed');
        return 'findReferenceName TODO';
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
