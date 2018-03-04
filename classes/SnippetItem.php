<?php namespace RainLab\Pages\Classes;

use ApplicationException;
use Validator;
use Lang;
use Event;
use RainLab\Pages\Classes\Snippet;

use RainLab\Pages\Classes\SnippetManager;
use Cms\Classes\Partial;

use Debugbar as Debugbar;

/**
 * Represents a menu item.
 * This class is used in the back-end for managing the menu items.
 * On the front-end items are represented with the
 * \RainLab\Pages\Classes\SnippetItemReference objects.
 *
 * @package rainlab\pages
 * @author Alexey Bobkov, Samuel Georges
 */
class SnippetItem extends Snippet
{
    /**
     * @var string Specifies the snippet description.
     */
    public $description = null;

    /**
     * @var string Specifies the snippet name.
     */
    public $name = null;

    /**
     * @var string Snippet properties.
     */
    public $properties;

    public $fillable = [
        'properties'
    ];

    /**
     * @var array Contains the view bag properties.
     * This property is used by the menu editor internally.
     * 
     * TODO did we need this?
     */
    public $viewBag = [];

    public static function extractSnippetItemsFromMarkupCached($theme, $pageName, $markup)
    {
        $snippetManager = SnippetManager::instance();
        $map = self::extractSnippetsFromMarkupCached($theme, $pageName, $markup);
        $partialSnippetMap = $snippetManager->getPartialSnippetMap($theme);
        $snippetItems = [];

        foreach ($map as $snippetDeclaration => $snippetInfo) {
            $snippetCode = $snippetInfo['code'];
            $componentClass = $snippetInfo['component'];
            $partialFileName = $partialSnippetMap[$snippetCode];
            // $snippetType = $componentClass === null ? 'theme' : 'component';

            // key -> value of snippet properties from the current page
            $snippetPropertieValues = $snippetInfo['properties'];
            $snippet = $snippetManager->findByCodeOrComponent($theme, $snippetCode, $componentClass, true);
            $snippetItem = self::initFromSnippet($snippet, $snippetPropertieValues);

            $snippetItems[] = $snippetItem;
        }

        return $snippetItems;
    }

    /**
     * Create a SnippetItem object from a Snippet object 
     */
    public static function initFromSnippet($snippet, $propertieValues)
    {
        $snippetItem = new self;

        // Debugbar::info('[SnippetItem] initFromSnippet get_object_vars($snippet)->properties', get_object_vars($snippet)['properties']);

        // take over the public object properties
        foreach ($snippet as $name => $value) {
            if (property_exists($snippetItem, $name)) {
                $snippetItem->$name = $value;
            }
        }

        // set values from object (protected in $snippet object)
        $snippetItem->setProperties(get_object_vars($snippet)['properties']);

        // set the snippet propertie values
        foreach ($propertieValues as $name => $value) {
            if (array_key_exists($name, $snippetItem->properties)) {
                // Debugbar::info('[SnippetItem] $name', $name);
                $snippetItem->properties[$name]['value'] = $value;
            }
        }

        return $snippetItem;
    }

    public function setProperties($properties)
    {
        $this->properties = $properties;
        return $properties;
    }

    /**
     * Get the snippet item properties
     * @return array Returns the snippet item properties as array
     */
    public function getProperties()
    {
        return $this->properties;
    }

}
