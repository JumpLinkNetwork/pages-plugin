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
     * @var string Specifies the menu title
     */
    public $title;

    /**
     * @var array Specifies the item subitems
     */
    public $items = [];

    /**
     * @var string Specifies the parent menu item.
     * An object of the RainLab\Pages\Classes\SnippetItem class or null.
     */
    public $parent;

    /**
     * @var boolean Determines whether the auto-generated menu items could have subitems.
     */
    public $nesting;

    /**
     * @var string Specifies the menu item type - URL, static page, etc.
     */
    public $type;

    /**
     * @var string Specifies the URL for URL-type items.
     */
    public $url;

    /**
     * @var string Specifies the menu item code.
     */
    public $code;

    /**
     * @var string Specifies the object identifier the item refers to.
     * The identifier could be the database identifier or an object code.
     */
    public $reference;

    /**
     * @var boolean Indicates that generated items should replace this item.
     */
    public $replace;

    /**
     * @var string Specifies the CMS page path to resolve dynamic menu items to.
     */
    public $cmsPage;

    /**
     * @var boolean Used by the system internally.
     */
    public $exists = false;

    public $fillable = [
        'title',
        'nesting',
        'type',
        'url',
        'code',
        'reference',
        'cmsPage',
        'replace',
        'viewBag'
    ];

    /**
     * @var array Contains the view bag properties.
     * This property is used by the menu editor internally.
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
            $snippetProperties = $snippetInfo['properties'];
            // $partial = Partial::loadCached($theme, $partialFileName);

            $snippet = $snippetManager->findByCodeOrComponent($theme, $snippetCode, $componentClass, true);
            $snippetItem = self::initFromSnippet($snippet);

            $snippetItems[] = $snippetItem;
        }

        return $snippetItems;
    }

    /**
     * Create a SnippetItem object from a Snippet object 
     */
    public static function initFromSnippet($snippet)
    {
        $snippetItem = new self;
        foreach ($snippet as $name => $value) {
            if ($name != 'items') {
                if (property_exists($snippetItem, $name)) {
                    $snippetItem->$name = $value;
                }
            }
            else {
                $snippetItem->items = self::initFromArray($value);
            }
        }
        return $snippetItem;
    }

    /**
     * Initializes a menu item from a data array. 
     * @param array $items Specifies the menu item data.
     * @return Returns an array of the SnippetItem objects.
     */
    public static function initFromArray($items)
    {
        $result = [];

        foreach ($items as $itemData) {
            $obj = new self;

            foreach ($itemData as $name => $value) {
                if ($name != 'items') {
                    if (property_exists($obj, $name)) {
                        $obj->$name = $value;
                    }
                }
                else {
                    $obj->items = self::initFromArray($value);
                }
            }

            $result[] = $obj;
        }

        return $result;
    }

    public function getCmsPageOptions($keyValue = null)
    {
        return []; // CMS Pages are loaded client-side
    }

    public function getReferenceOptions($keyValue = null)
    {
        return []; // References are loaded client-side
    }

    public static function getTypeInfo($type)
    {
        $result = [];
        $apiResult = Event::fire('pages.snippetitem.getTypeInfo', [$type]);

        Debugbar::info('[SnippetItem] getTypeInfo('.$type.') $apiResult (event)', $apiResult);

        if (is_array($apiResult)) {
            foreach ($apiResult as $typeInfo) {
                if (!is_array($typeInfo)) {
                    continue;
                }

                foreach ($typeInfo as $name => $value) {
                    $result[$name] = $value;
                }
            }
        }

        return $result;
    }

    /**
     * Converts the menu item data to an array
     * @return array Returns the menu item data as array
     */
    public function toArray()
    {
        $result = [];

        foreach ($this->fillable as $property) {
            $result[$property] = $this->$property;
        }

        return $result;
    }
}
