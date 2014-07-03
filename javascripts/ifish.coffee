#= require api/v2/fishpond

root = exports ? this

# This is the comfortable interface in front of the pond.
#
# @options: Contain configuration to override convention.
#
class root.IFish
  constructor: (fishpond_or_options, options = {}) ->

    # Default options.
    #
    # Contains:
    #  * Selectors
    #  * Callbacks
    #  * System options (not documented to users).
    #
    @options = {
      containerSelector: 'section#query', # Selector for the container surrounding the iFish elements.
      resultsSelector: '#results ul', # Selector for the results list.
      controlsSelector: '#fish', # Selector for the HTML element containing iFish controls.
      searchSelector: '#search', # Selector for the HTML element containing the search field.
      favoritesSelector: '#favorites', # Selector for the HTML element containing the favorites.
      fishSelector: 'li', # Selector for the fish inside the results/favorites container.

      totopSelector: '.totop', # Make element inside fish clickable (to send to top).
      favoriteSelector: '.favorite', # Make element inside a fish or favorite clickable (and add/remove to/from favorites).

      # Callbacks.
      #
      # Fishpond.
      #
      fishpondResultsUpdated: @fishpondResultsUpdated, # Callback when results have been updated.
      fishpondLoading: @fishpondLoading, # Callback when fishpond is loading.
      fishpondReady: @fishpondReady, # Callback when fishpond is ready.

      # Client-only callbacks (defaults do nothing).
      #
      # Favorites.
      #
      beforeAddFavorite: (fish) -> fish,
      afterAddFavorite: (fish) -> fish,
      beforeRemoveFavorite: (favorite) -> favorite,
      afterRemoveFavorite: (favorite) -> favorite,
      beforeLoadFavorite: (fish) -> fish,
      beforeLoadFavorites: (ids) -> ids,
      afterLoadFavorites: (favorites) -> favorites,

      # Metadata.
      #
      metadata: false, # Initially load metadata (very slow on large ponds).
      
      # Dev.
      #
      development: false,
      debug: false
    }

    # Override system options using heuristics.
    #
    if /localhost|ngrok/.test document.domain
      $.extend @options, { development: true, debug: false }

    # Check if a Fishpond has been given.
    #
    # Extend options if not.
    #
    if fishpond_or_options instanceof Fishpond
      @fishpond = fishpond_or_options
    else
      # Override default options with the given options.
      #
      $.extend @options, fishpond_or_options

    # Set up container and extract data.
    #
    @container    = $ @options.containerSelector
    @api_key      = @container.data 'api_key'
    @pond_id      = @container.data 'pond_id'
    @api_endpoint = @container.data 'api_endpoint'

    # Override default options from container data options.
    #
    $.extend @options, { api_endpoint: @api_endpoint }

    # Set up view elements.
    #
    @results = $ @options.resultsSelector, @container
    @controls = $ @options.controlsSelector
    @search = $ @options.searchSelector
    @favorites = $ @options.favoritesSelector

    # Warnings.
    #
    console.log "[Warning] Could not find a results container under #{@results.selector}." if @results.length == 0
    console.log "[Warning] Could not find an ifish controls container under #{@controls.selector}." if @controls.length == 0
    console.log "[Warning] Could not find a search field under #{@search.selector}." if @search.length == 0
    console.log "[Warning] Could not find a favorites container under #{@favorites.selector}." if @favorites.length == 0

    # Add a knockout view model.
    # Update this to update the controls/fish.
    #
    @view = {}

    # Finally, set up fishpond, if options have been given.
    #
    unless fishpond_or_options instanceof Fishpond
      @fishpond = new Fishpond @api_key, @options
      @fishpond.loading @options.fishpondLoading
      @fishpond.ready (pond) =>
        @installBindings()
        @installControls pond, @options.fishpondReady
      @fishpond.resultsUpdated @options.fishpondResultsUpdated
      @fishpond.init @pond_id

  installBindings: () =>
    # Install necessary knockout bindings in the HTML.
    # (Find structure, set "data-bind")
    #
    @results.attr 'data-bind', "foreach: fish"
    @favorites.attr 'data-bind', 'foreach: favorites'
    @tags = @controls.find 'fieldset.tags'
    @filters = @controls.find 'fieldset.filters'
    #
    @results.find(@options.fishSelector).attr 'data-bind', "attr: { 'data-score': score, 'data-visible': visible }"
    #
    @tags.attr 'data-bind', "foreach: tags"
    @tags.find('label:first').attr 'data-bind', "text: name + ' (' + value + ')' "
    @tags.find('input[type="checkbox"]').attr 'data-bind', "attr: { id: 'query_switch_' + id, name: 'query[switch][' + id + ']' }"
    @tags.find('input[type="hidden"]').attr 'data-bind', "attr: { id: 'query_tags_' + id, name: 'query[tags][' + id + ']', value: value, 'data-slug': slug }"
    @tags.find('.slider').attr 'data-bind', "attr: { 'data-target': 'query[tags][' + id + ']' }"
    #
    @filters.find('.control-label').attr 'data-bind', "foreach: filters"
    @filters.find('input[type="checkbox"]').attr 'data-bind', "attr: { id: 'query_filters_' + id, name: 'query[filters][' + id + ']', value: value, 'data-slug': slug }"
    @filters.find('label div:first').attr 'data-bind', "text: name"

    # Install jQuery bindings.
    #
    # Anything with the class .totop (default) will move a fish to the top.
    #
    @results.find(@options.fishSelector).find(@options.totopSelector).attr 'data-bind', "click: $root.setSortValues, clickBubble: false"
    #
    # Anything with the class .favorite (default) will put a fish into the favorites.
    #
    @results.find(@options.fishSelector).find(@options.favoriteSelector).attr 'data-bind', "click: $root.addFavorite, clickBubble: false"
    @favorites.find(@options.fishSelector).find(@options.favoriteSelector).attr 'data-bind', "click: $root.removeFavorite, clickBubble: false"

  # Installs iFish controls based on the given pond.
  #
  # @method fishpondReady
  # @param {Fishpond::Pond} pond A ready-to-go pond
  # @param {function} finished A callback function to call after finishing
  #
  installControls: (pond, finished) =>
    # Map fish for easy retrieval.
    #
    @mappedFish = {}
    @fishIds = []
    for fish in pond.fish
      @mappedFish[fish.id] = fish
      @fishIds.push fish.id

    # Set up view model.
    #
    @view.name = ko.observable pond.name

    # Hook view model functions into the iFish lib.
    #
    @view.setSortValues = @setSortValues
    @view.addFavorite = @addFavorite
    @view.removeFavorite = @removeFavorite

    # Fish
    #
    # Note: Callback is triggered after fish are loaded and initialized.
    #
    @initializeFish pond, (fish) =>
      #
      #
      @view.fish = ko.observableArray fish

      # Controls
      #
      @view.tags = ko.observableArray pond.tags.map (tag) -> $.extend tag, value: 10
      @view.filters = ko.observableArray pond.filters.map (tag) -> $.extend tag, value: 1

      # favorites
      #
      @view.favorites = ko.observableArray @loadFavorites(pond, fish)
      #
      # Each time the favorites are modified, store them in localStorage.
      #
      @view.favorites.subscribe (fish) =>
        ids = $.map @view.favorites(), (favorite) -> favorite.id
        localStorage.setItem @localStorageKey(pond, 'favorites'), ids

      # Add community tag.
      #
      @view.tags.push
        has_binary_options: false
        id: "community"
        name: "Community"
        slug: "community"
        value: 10

      # Trigger knockout.
      #
      ko.applyBindings @view

      # Call finished callback.
      #
      finished pond

  # Loads favorites from local storage.
  #
  # @method loadFavorites
  # @param {Fishpond} pond A fishpond
  # @param {Fishpond::Fish} fish A fish
  #
  loadFavorites: (pond, fish) =>
    idsString = localStorage.getItem @localStorageKey(pond, 'favorites')
    if idsString
      ids = idsString.split ','
    else
      ids = []
    ids = @options.beforeLoadFavorites ids
    favorites = $.map ids, (id) =>
      @options.beforeLoadFavorite @mappedFish[id]
    favorites = @options.afterLoadFavorites favorites
    favorites

  # Adds a fish to the favorites.
  #
  # @method addFavorite
  # @param {Fishpond::Fish} fish A fish
  #
  addFavorite: (fish) =>
    found = false
    $.each @view.favorites(), (i, favorite) ->
      found = true if favorite.id == fish.id
    unless found
      fish = @options.beforeAddFavorite fish
      @view.favorites.push fish
      @options.afterAddFavorite fish

  # Removes a fish from the favorites.
  #
  # @method removeFavorite
  # @param {Fishpond::Fish} fish A fish
  #
  removeFavorite: (fish) =>
    fish = @options.beforeRemoveFavorite fish
    @view.favorites.remove fish
    @options.afterRemoveFavorite fish

  # Generate a localStorage key for the given pond and type.
  #
  # @method localStorageKey
  # @param {Fishpond} pond A fishpond
  # @param {String} type A string to define what is stored
  #
  localStorageKey: (pond, type) -> "ifish-#{pond.id}-#{type}"

  # Initialize the fish.
  #
  initializeFish: (pond, afterInitialize) =>
    pondSize = pond.fish.length
    fishWithMetadata = []
    pond.fish.map (fish) =>
      callback = (fish) => # Empty.
        fish.score = ko.observable 100
        fish.visible = ko.observable 1
        fish.fromMetadata = ko.computed ->
          # Use dummy observable to trigger computable recalculation.
          #
          fish.visible() && fish.metadata
        fishWithMetadata.push fish
        afterInitialize fishWithMetadata if fishWithMetadata.length == pondSize
      if @options.metadata
        fish.get_metadata callback
      else
        callback fish

  # Update all fish with new results.
  # Sets all fish invisible, then shows only the ones in the result.
  #
  updateFish: (results) ->
    $.each @view.fish(), (i, fish) -> fish.visible 0
    $.each results, (i, result) ->
      fish = result.fish
      fish.score result.score
      fish.visible 1
      fish

  sliderFor: (token) ->
    $ "form#fish .slider[data-target='query[tags][" + token + "]']"

  filterFor: (token) ->
    $ "form#fish input[name='query[filters][" + token + "]']"

  # Let isotope know to update the view.
  #
  updateView: ->
    @results.isotope('updateSortData', @results.find('li')).isotope()

  # Sets the tag and filter value such that the given fish has a score of 0 (best).
  #
  # @method setInputValues
  # @param {Fishpond::Fish} fish A fish
  #
  setInputValues: (fish) =>
    @setSortValues fish
    @setFilterValues fish

  setSortValues: (fish) =>
    for token, value of fish.tags
      @sliderFor(token).slider "value", value

  setFilterValues: (fish) =>
    for token, value of fish.tags
      if value >= 1
        # We have to explicitly trigger the change event.
        #
        @filterFor(token).attr('checked', 'checked').change()

  # Fishpond results updated handler
  #
  # @method fishpondResultsUpdated
  # @param {Array} Array Fishpond::Result objects
  #
  fishpondResultsUpdated: (results) =>
    @updateFish results
    @updateView()

  # Fishpond loading callback method.
  #
  # @method fishpondLoading
  # @param {Float} percentage Total loading percent complete
  #
  fishpondLoading: (percentage) =>
    $(".progress .bar", @container).width (percentage * 100) + "%"

  # Fishpond ready handler.
  #
  # @method fishpondReady
  # @param {Fishpond::Pond} pond A ready-to-go pond
  #
  fishpondReady: (pond) =>
    @installSliders()
    @controls.find('input:checkbox').change @checkboxChanged
    @installSearchField(pond)
    @showInterface()
    @installDialog()

    # TODO Make configurable.
    #
    @results.isotope
      itemSelector: @options.fishSelector,
      filter: @options.fishSelector + '[data-visible="1"]'
      sortBy: 'score'
      layoutMode: 'masonry'
      getSortData:
        score: (item) -> parseInt $(item).attr('data-score'), 10

  installDialog: () =>
    $.each @results.find('li'), (i, li) =>
      li = $(li)
      dialog = li.find '.dialog'
      li.click (event) =>
        element = event.currentTarget
        fish = ko.dataFor element
        fish.get_metadata (fish) =>
          # Trigger dummy observable to trigger fromMetadata
          # computable reevaluation.
          #
          fish.visible.notifySubscribers()
          dialog.modal()
    # Append to body to move out of the original structure.
    #
    @results.find('li .dialog').appendTo("body").modal

  installSliders: () =>
    @controls.find('.slider').slider {
      value: 10,
      min: 0,
      max: 20,
      step: 0.1,
      slide: @sliderChanged,
      change: @sliderChanged
    }

  # Show the standard fish interface.
  #
  showInterface: () ->
    $(".progress").removeClass "active"
    $(".loading").delay(500).fadeOut 200
    $(".form-and-results", @container).fadeOut 1
    $(".form-and-results", @container).delay(500).fadeIn 200, => @sendQuery()
    @favorites.delay(500).fadeIn 200

  # Install the search field functionality.
  #
  installSearchField: (pond) ->
    mappedFish = @mappedFish;

    @search.find('input[type="text"]').typeahead
      items: 5
      source: @fishIds
      matcher: (item) -> return mappedFish[item].title.score(this.query) > 0.1
      sorter: (items) ->
        query = this.query
        items.sort (item1, item2) =>
          score1 = mappedFish[item1].title.score query
          score2 = mappedFish[item2].title.score query
          if score1 > score2
            -1
          if score1 < score2
            1
          0
        items
      highlighter: (item) => return @mappedFish[item].title
      updater: (item) =>
        fish = @mappedFish[item]
        $("form#fish input[name^='query[filters]']:checkbox").removeAttr('checked')
        @setSortValues fish
        @sendQuery()
        fish.title

  # jQuery UI slider slide and change event handler
  #
  # @method sliderChanged
  # @param {Event} e A jQuery event
  # @param {DOMElement} ui A jQuery slider
  #
  sliderChanged: (e, ui) =>
    slider = $ ui.handle.parentNode
    label = slider.parents('.control-group').find('label:first')
    hiddenField = $ "input[name='" + slider.data('target') + "']"
    value = Math.round ui.value

    if value.toString() != hiddenField.val().toString()
      hiddenField.val value
      label.html label.html().split("(")[0] + " (" + value.toString() + ")"
      @sendQuery()

  # Checkbox state change handler.
  #
  # @method checkboxChanged
  #
  checkboxChanged: => @sendQuery()

  #Compiles and processes a query.
  #
  # @method sendQuery
  #
  sendQuery: =>
    $("form#search input").val ""
    tags = {}
    filters = {}

    @controls.find("input[name*='tags']").each ->
      if $(this).siblings("input:checked").length == 0
        tags[$(this).data('slug')] = false
      else
        tags[$(this).data('slug')] = $(this).val()

    @controls.find("input[name*='filters']").each ->
      value = 0
      if this.checked
        value = 1

      filters[$(this).data('slug')] = value

    @fishpond.query tags, filters