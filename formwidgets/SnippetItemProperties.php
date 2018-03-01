<?php namespace RainLab\Pages\FormWidgets;

use Request;
use Backend\Classes\FormWidgetBase;
use RainLab\Pages\Classes\SnippetItem;

use Cms\Classes\Theme;

use Debugbar as Debugbar;

/**
 * 
 *
 * @package october\backend
 * @author Pascal Garber
 */
class SnippetItemProperties extends FormWidgetBase
{
    /**
     * {@inheritDoc}
     */
    protected $defaultAlias = 'snippetitemproperties';

    /**
     * {@inheritDoc}
     */
    public function init()
    {
    }

    /**
     * {@inheritDoc}
     */
    public function render()
    {
        $this->prepareVars();

        Debugbar::info('[SnippetItemProperties] render');

        return $this->makePartial('snippetitemproperties');
    }

    /**
     * Prepares the list data
     */
    public function prepareVars()
    {
        // $snippetItem = new SnippetItem;

        // $this->vars['itemProperties'] = json_encode($snippetItem->fillable);
        $this->vars['foo'] = 'bar';
    }
}
