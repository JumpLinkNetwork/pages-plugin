<?php namespace RainLab\Pages\FormWidgets;

use Str;
use Lang;
use Input;
use Request;
use Response;
use Backend\Classes\FormWidgetBase;
use Cms\Classes\Theme;
use RainLab\Pages\Classes\SnippetItem;
use RainLab\Pages\Classes\SnippetManager;

use Debugbar as Debugbar;

/**
 * Menu item reference search.
 *
 * @package october\backend
 * @author Alexey Bobkov, Samuel Georges
 */
class SnippetItemSearch extends FormWidgetBase
{
    use \Backend\Traits\SearchableWidget;

    protected $theme;
    protected $snippetManager;

    public $searchPlaceholderMessage = 'rainlab.pages::lang.snippetitem.search_placeholder';

    public function __construct($controller, $formField, $configuration)
    {
        parent::__construct($controller, $formField, $configuration);
        $this->theme = Theme::getEditTheme();
        $this->snippetManager = SnippetManager::instance();
    }

    /**
     * Renders the widget.
     * @return string
     */
    public function render()
    {
        return $this->makePartial('body');
    }

    /*
     * Event handlers
     */
    public function onSearch()
    {
        $this->setSearchTerm(Input::get('term'));

        return $this->getData();
    }

    /*
     * Methods for internal use
     */
    protected function getData()
    {
        Debugbar::info('[SnippetItemSearch] getData');
        return [
            'results' => $this->getMatches()
        ];
    }

    protected function getMatches()
    {
        $searchTerm = Str::lower($this->getSearchTerm());
        if (!strlen($searchTerm)) {
            return [];
        }

        $types = [];
        $allSnippets = $this->snippetManager->listSnippets($this->theme);
        $words = explode(' ', $searchTerm);
        foreach (SnippetItem::getTypeOptions() as $type => $typeTitle) {
            $typeMatches = [];
            foreach ($allSnippets as $index => $snippet) {
                // Debugbar::info('[SnippetItemSearch] getMatches $snippet', $snippet);
                $code = $snippet->code;
                $name = $snippet->getName();
                $currentType = $snippet->getType();
                if ( $currentType == $type and $this->textMatchesSearch($words, $name) ) {
                    $typeMatches[] = [
                        'id'   => "$type::$code",
                        'text' => $name
                    ];
                }
            }

            if (!empty($typeMatches)) {
                $types[] = [
                    'text' => trans($typeTitle),
                    'children' => $typeMatches
                ];
            }
        }

        // Debugbar::info('[SnippetItemSearch] getMatches $types', $types);

        return $types;
    }
}
