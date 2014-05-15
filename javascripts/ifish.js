(function() {
  var root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.IFish = (function() {
    function IFish(fishpond_or_options, options) {
      var _this = this;
      if (options == null) {
        options = {};
      }
      this.sendQuery = __bind(this.sendQuery, this);
      this.checkboxChanged = __bind(this.checkboxChanged, this);
      this.sliderChanged = __bind(this.sliderChanged, this);
      this.installSliders = __bind(this.installSliders, this);
      this.fishpondReady = __bind(this.fishpondReady, this);
      this.fishpondLoading = __bind(this.fishpondLoading, this);
      this.fishpondResultsUpdated = __bind(this.fishpondResultsUpdated, this);
      this.setFilterValues = __bind(this.setFilterValues, this);
      this.setSortValues = __bind(this.setSortValues, this);
      this.setInputValues = __bind(this.setInputValues, this);
      this.initializeFish = __bind(this.initializeFish, this);
      this.removeFavorite = __bind(this.removeFavorite, this);
      this.addFavorite = __bind(this.addFavorite, this);
      this.loadFavorites = __bind(this.loadFavorites, this);
      this.installControls = __bind(this.installControls, this);
      this.installBindings = __bind(this.installBindings, this);
      this.options = {
        container: 'section#query',
        resultsList: '#results ul',
        fishSelector: 'li',
        controls: '#fish',
        search: '#search',
        favorites: '#favorites',
        totop: '.totop',
        favorite: '.favorite',
        fishpondResultsUpdated: this.fishpondResultsUpdated,
        fishpondLoading: this.fishpondLoading,
        fishpondReady: this.fishpondReady,
        development: false,
        debug: false
      };
      if (/localhost|ngrok/.test(document.domain)) {
        $.extend(this.options, {
          development: true,
          debug: false
        });
      }
      this.container = $(this.options.container);
      this.api_key = this.container.data('api_key');
      this.pond_id = this.container.data('pond_id');
      this.api_endpoint = this.container.data('api_endpoint');
      $.extend(this.options, {
        api_endpoint: this.api_endpoint
      });
      this.results = $(this.options.resultsList, this.container);
      this.controls = $(this.options.controls);
      this.search = $(this.options.search);
      this.favorites = $(this.options.favorites);
      if (this.results.length === 0) {
        console.log("[Warning] Could not find a results container under " + this.results.selector + ".");
      }
      if (this.controls.length === 0) {
        console.log("[Warning] Could not find an ifish controls container under " + this.controls.selector + ".");
      }
      if (this.search.length === 0) {
        console.log("[Warning] Could not find a search field under " + this.search.selector + ".");
      }
      if (this.favorites.length === 0) {
        console.log("[Warning] Could not find a favorites container under " + this.favorites.selector + ".");
      }
      this.view = {};
      if (fishpond_or_options instanceof Fishpond) {
        this.fishpond = fishpond_or_options;
      } else {
        $.extend(this.options, fishpond_or_options);
        this.fishpond = new Fishpond(this.api_key, this.options);
        this.fishpond.loading(this.options.fishpondLoading);
        this.fishpond.ready(function(pond) {
          _this.installBindings();
          return _this.installControls(pond, _this.options.fishpondReady);
        });
        this.fishpond.resultsUpdated(this.options.fishpondResultsUpdated);
        this.fishpond.init(this.pond_id);
      }
    }

    IFish.prototype.installBindings = function() {
      this.results.attr('data-bind', "foreach: fish");
      this.favorites.attr('data-bind', 'foreach: favorites');
      this.tags = this.controls.find('fieldset.tags');
      this.filters = this.controls.find('fieldset.filters');
      this.results.find(this.options.fishSelector).attr('data-bind', "attr: { 'data-score': score, 'data-visible': visible }");
      this.tags.attr('data-bind', "foreach: tags");
      this.tags.find('label:first').attr('data-bind', "text: name + ' (' + value + ')' ");
      this.tags.find('input[type="checkbox"]').attr('data-bind', "attr: { id: 'query_switch_' + id, name: 'query[switch][' + id + ']' }");
      this.tags.find('input[type="hidden"]').attr('data-bind', "attr: { id: 'query_tags_' + id, name: 'query[tags][' + id + ']', value: value, 'data-slug': slug }");
      this.tags.find('.slider').attr('data-bind', "attr: { 'data-target': 'query[tags][' + id + ']' }");
      this.filters.find('.control-label').attr('data-bind', "foreach: filters");
      this.filters.find('input[type="checkbox"]').attr('data-bind', "attr: { id: 'query_filters_' + id, name: 'query[filters][' + id + ']', value: value, 'data-slug': slug }");
      this.filters.find('label div:first').attr('data-bind', "text: name");
      this.results.find(this.options.fishSelector).find(this.options.totop).attr('data-bind', "click: $root.setSortValues");
      this.results.find(this.options.fishSelector).find(this.options.favorite).attr('data-bind', "click: $root.addFavorite");
      return this.favorites.find(this.options.fishSelector).find(this.options.favorite).attr('data-bind', "click: $root.removeFavorite");
    };

    IFish.prototype.installControls = function(pond, finished) {
      var fish, _i, _len, _ref,
        _this = this;
      this.mappedFish = {};
      this.fishIds = [];
      _ref = pond.fish;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        fish = _ref[_i];
        this.mappedFish[fish.id] = fish;
        this.fishIds.push(fish.id);
      }
      this.view.name = ko.observable(pond.name);
      this.view.setSortValues = this.setSortValues;
      this.view.addFavorite = this.addFavorite;
      this.view.removeFavorite = this.removeFavorite;
      return this.initializeFish(pond, function(fish) {
        _this.view.fish = ko.observableArray(fish);
        _this.view.tags = ko.observableArray(pond.tags.map(function(tag) {
          return $.extend(tag, {
            value: 10
          });
        }));
        _this.view.filters = ko.observableArray(pond.filters.map(function(tag) {
          return $.extend(tag, {
            value: 1
          });
        }));
        _this.view.favorites = ko.observableArray(_this.loadFavorites(pond, fish));
        _this.view.favorites.subscribe(function(fish) {
          var ids;
          ids = $.map(_this.view.favorites(), function(favorite) {
            return favorite.id;
          });
          return localStorage.setItem(_this.localStorageKey(pond, 'favorites'), ids);
        });
        _this.view.tags.push({
          has_binary_options: false,
          id: "community",
          name: "Community",
          slug: "community",
          value: 10
        });
        ko.applyBindings(_this.view);
        return finished(pond);
      });
    };

    IFish.prototype.loadFavorites = function(pond, fish) {
      var ids, idsString,
        _this = this;
      idsString = localStorage.getItem(this.localStorageKey(pond, 'favorites'));
      if (idsString) {
        ids = idsString.split(',');
      } else {
        ids = [];
      }
      return $.map(ids, function(id) {
        return _this.mappedFish[id];
      });
    };

    IFish.prototype.addFavorite = function(fish) {
      var found;
      found = false;
      $.each(this.view.favorites(), function(i, favorite) {
        if (favorite.id === fish.id) {
          return found = true;
        }
      });
      if (!found) {
        return this.view.favorites.push(fish);
      }
    };

    IFish.prototype.removeFavorite = function(fish) {
      return this.view.favorites.remove(fish);
    };

    IFish.prototype.localStorageKey = function(pond, type) {
      return "ifish-" + pond.id + "-" + type;
    };

    IFish.prototype.initializeFish = function(pond, afterInitialize) {
      var fishWithMetadata, pondSize,
        _this = this;
      pondSize = pond.fish.length;
      fishWithMetadata = [];
      return pond.fish.map(function(fish) {
        var callback;
        callback = function(fish) {
          fish.score = ko.observable(100);
          fish.visible = ko.observable(1);
          fishWithMetadata.push(fish);
          if (fishWithMetadata.length === pondSize) {
            return afterInitialize(fishWithMetadata);
          }
        };
        if (_this.options.metadata) {
          return fish.get_metadata(callback);
        } else {
          return callback(fish);
        }
      });
    };

    IFish.prototype.updateFish = function(results) {
      $.each(this.view.fish(), function(i, fish) {
        return fish.visible(0);
      });
      return $.each(results, function(i, result) {
        var fish;
        fish = result.fish;
        fish.score(result.score);
        fish.visible(1);
        return fish;
      });
    };

    IFish.prototype.sliderFor = function(token) {
      return $("form#fish .slider[data-target='query[tags][" + token + "]']");
    };

    IFish.prototype.filterFor = function(token) {
      return $("form#fish input[name='query[filters][" + token + "]']");
    };

    IFish.prototype.updateView = function() {
      return this.results.isotope('updateSortData', this.results.find('li')).isotope();
    };

    IFish.prototype.setInputValues = function(fish) {
      this.setSortValues(fish);
      return this.setFilterValues(fish);
    };

    IFish.prototype.setSortValues = function(fish) {
      var token, value, _ref, _results;
      _ref = fish.tags;
      _results = [];
      for (token in _ref) {
        value = _ref[token];
        _results.push(this.sliderFor(token).slider("value", value));
      }
      return _results;
    };

    IFish.prototype.setFilterValues = function(fish) {
      var token, value, _ref, _results;
      _ref = fish.tags;
      _results = [];
      for (token in _ref) {
        value = _ref[token];
        if (value >= 1) {
          _results.push(this.filterFor(token).attr('checked', 'checked').change());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    IFish.prototype.fishpondResultsUpdated = function(results) {
      this.updateFish(results);
      return this.updateView();
    };

    IFish.prototype.fishpondLoading = function(percentage) {
      return $(".progress .bar", this.container).width((percentage * 100) + "%");
    };

    IFish.prototype.fishpondReady = function(pond) {
      this.installSliders();
      this.controls.find('input:checkbox').change(this.checkboxChanged);
      this.installSearchField(pond);
      this.showInterface();
      return this.results.isotope({
        itemSelector: this.options.fishSelector,
        filter: this.options.fishSelector + '[data-visible="1"]',
        sortBy: 'score',
        layoutMode: 'cellsByRow',
        cellsByRow: {
          columnWidth: 160,
          rowHeight: 120
        },
        getSortData: {
          score: function(item) {
            return parseInt(item.attr('data-score'), 10);
          }
        }
      });
    };

    IFish.prototype.installSliders = function() {
      return this.controls.find('.slider').slider({
        value: 10,
        min: 0,
        max: 20,
        step: 0.1,
        slide: this.sliderChanged,
        change: this.sliderChanged
      });
    };

    IFish.prototype.showInterface = function() {
      var _this = this;
      $(".progress").removeClass("active");
      $(".loading").delay(500).fadeOut(200);
      $(".form-and-results", this.container).fadeOut(1);
      return $(".form-and-results", this.container).delay(500).fadeIn(200, function() {
        return _this.sendQuery();
      });
    };

    IFish.prototype.installSearchField = function(pond) {
      var mappedFish,
        _this = this;
      mappedFish = this.mappedFish;
      return this.search.find('input[type="text"]').typeahead({
        items: 5,
        source: this.fishIds,
        matcher: function(item) {
          return mappedFish[item].title.score(this.query) > 0.1;
        },
        sorter: function(items) {
          var query,
            _this = this;
          query = this.query;
          items.sort(function(item1, item2) {
            var score1, score2;
            score1 = mappedFish[item1].title.score(query);
            score2 = mappedFish[item2].title.score(query);
            if (score1 > score2) {
              -1;
            }
            if (score1 < score2) {
              1;
            }
            return 0;
          });
          return items;
        },
        highlighter: function(item) {
          return _this.mappedFish[item].title;
        },
        updater: function(item) {
          var fish;
          fish = _this.mappedFish[item];
          $("form#fish input[name^='query[filters]']:checkbox").removeAttr('checked');
          _this.setSortValues(fish);
          _this.sendQuery();
          return fish.title;
        }
      });
    };

    IFish.prototype.sliderChanged = function(e, ui) {
      var hiddenField, label, slider, value;
      slider = $(ui.handle.parentNode);
      label = slider.parents('.control-group').find('label:first');
      hiddenField = $("input[name='" + slider.data('target') + "']");
      value = Math.round(ui.value);
      if (value.toString() !== hiddenField.val().toString()) {
        hiddenField.val(value);
        label.html(label.html().split("(")[0] + " (" + value.toString() + ")");
        return this.sendQuery();
      }
    };

    IFish.prototype.checkboxChanged = function() {
      return this.sendQuery();
    };

    IFish.prototype.sendQuery = function() {
      var filters, tags;
      $("form#search input").val("");
      tags = {};
      filters = {};
      this.controls.find("input[name*='tags']").each(function() {
        if ($(this).siblings("input:checked").length === 0) {
          return tags[$(this).data('slug')] = false;
        } else {
          return tags[$(this).data('slug')] = $(this).val();
        }
      });
      this.controls.find("input[name*='filters']").each(function() {
        var value;
        value = 0;
        if (this.checked) {
          value = 1;
        }
        return filters[$(this).data('slug')] = value;
      });
      return this.fishpond.query(tags, filters);
    };

    return IFish;

  })();

}).call(this);
