// Generated by CoffeeScript 1.7.1
(function() {
  var root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.IFish = (function() {
    function IFish(fishpond_or_options, options) {
      if (options == null) {
        options = {};
      }
      this.sendQuery = __bind(this.sendQuery, this);
      this.checkboxChanged = __bind(this.checkboxChanged, this);
      this.sliderChanged = __bind(this.sliderChanged, this);
      this.installSliders = __bind(this.installSliders, this);
      this.installDialog = __bind(this.installDialog, this);
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
      this.options = {
        containerSelector: '#ifish',
        resultsSelector: 'ul.results',
        fishSelector: 'li',
        controlsSelector: 'form.controls',
        searchSelector: 'form.search',
        favoritesSelector: '#favorites',
        totopSelector: '.totop',
        favoriteSelector: '.favorite',
        isotope: {
          sortBy: 'score',
          layoutMode: 'masonry',
          getSortData: {
            score: function(item) {
              return parseInt($(item).attr('data-score'), 10);
            }
          }
        },
        fishpondResultsUpdated: this.fishpondResultsUpdated,
        fishpondLoading: this.fishpondLoading,
        fishpondReady: this.fishpondReady,
        afterInitialisingFavorites: function(favorites) {
          return favorites;
        },
        beforeAddFavorite: function(fish) {
          return fish;
        },
        afterAddFavorite: function(fish) {
          return fish;
        },
        beforeRemoveFavorite: function(favorite) {
          return favorite;
        },
        afterRemoveFavorite: function(favorite) {
          return favorite;
        },
        beforeLoadFavorite: function(fish) {
          return fish;
        },
        beforeLoadFavorites: function(ids) {
          return ids;
        },
        afterLoadFavorites: function(favorites) {
          return favorites;
        },
        beforeApplyBindings: function(view, container) {
          return view;
        },
        afterApplyBindings: function(view, container) {
          return view;
        },
        ready: function(pond) {
          return pond;
        },
        metadata: false,
        development: false,
        debug: false
      };
      if (/localhost|ngrok/.test(document.domain)) {
        $.extend(this.options, {
          development: true,
          debug: false
        });
      }
      if (fishpond_or_options instanceof Fishpond) {
        this.fishpond = fishpond_or_options;
      } else {
        $.extend(true, this.options, fishpond_or_options);
      }
      this.container = this.options.containerSelector instanceof jQuery ? this.options.containerSelector : $(this.options.containerSelector);
      this.api_key = this.options.apiKey || this.container.data('api_key');
      this.pond_id = this.options.pondId || this.container.data('pond_id');
      this.api_endpoint = this.options.apiEndpoint || this.container.data('api_endpoint');
      $.extend(this.options, {
        api_endpoint: this.api_endpoint
      });
      this.results = $(this.options.resultsSelector, this.container);
      this.controls = $(this.options.controlsSelector, this.container);
      this.search = $(this.options.searchSelector, this.container);
      this.favorites = $(this.options.favoritesSelector);
      if (this.results.length === 0) {
        console.log("[iFish Warning] Could not find a results container under " + this.results.selector + ".");
      }
      if (this.controls.length === 0) {
        console.log("[iFish Warning] Could not find an ifish controls container under " + this.controls.selector + ".");
      }
      if (this.search.length === 0) {
        console.log("[iFish Warning] Could not find a search field under " + this.search.selector + ".");
      }
      if (this.favorites.length === 0) {
        console.log("[iFish Warning] Could not find a favorites container under " + this.favorites.selector + ".");
      }
      this.view = {};
      if (!(fishpond_or_options instanceof Fishpond)) {
        this.fishpond = new Fishpond(this.api_key, this.options);
        this.fishpond.loading(this.options.fishpondLoading);
        this.fishpond.ready((function(_this) {
          return function(pond) {
            _this.installControls(pond, _this.options.fishpondReady);
            return _this.options.ready(pond);
          };
        })(this));
        this.fishpond.resultsUpdated(this.options.fishpondResultsUpdated);
        this.fishpond.init(this.pond_id);
      }
    }

    IFish.prototype.installControls = function(pond, finished) {
      var fish, _i, _len, _ref;
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
      return this.initializeFish(pond, (function(_this) {
        return function(fish) {
          var element, grouped, groupedArrays, _j, _len1, _ref1;
          _this.view.fish = ko.observableArray(fish);
          _this.view.tags = ko.observableArray(pond.tags.map(function(tag) {
            return $.extend(tag, {
              value: 10
            });
          }));
          grouped = {};
          pond.filters.map(function(tag) {
            var _name;
            $.extend(tag, {
              value: 1
            });
            grouped[_name = tag.group] || (grouped[_name] = []);
            return grouped[tag.group].push(tag);
          });
          groupedArrays = [];
          $.each(grouped, function(i, group) {
            return groupedArrays[i] = {
              id: i,
              filters: ko.observableArray(group)
            };
          });
          _this.view.filterGroups = ko.observableArray(groupedArrays);
          _this.view.favorites = ko.observableArray([]);
          _this.options.afterInitialisingFavorites(_this.view.favorites);
          _this.view.favorites(_this.loadFavorites(pond, fish));
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
          _this.options.beforeApplyBindings(_this.view, _this.container);
          _ref1 = _this.container;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            element = _ref1[_j];
            console.log('[iFish Info] Applying dynamic bindings to ' + element.tagName + '#' + element.id + '.');
            ko.applyBindings(_this.view, element);
          }
          _this.options.afterApplyBindings(_this.view, _this.container);
          return finished(pond);
        };
      })(this));
    };

    IFish.prototype.loadFavorites = function(pond, fish) {
      var favorites, ids, idsString;
      idsString = localStorage.getItem(this.localStorageKey(pond, 'favorites'));
      if (idsString) {
        ids = idsString.split(',');
      } else {
        ids = [];
      }
      ids = this.options.beforeLoadFavorites(ids);
      favorites = $.map(ids, (function(_this) {
        return function(id) {
          return _this.options.beforeLoadFavorite(_this.mappedFish[id]);
        };
      })(this));
      favorites = this.options.afterLoadFavorites(favorites);
      return favorites;
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
        fish = this.options.beforeAddFavorite(fish);
        this.view.favorites.push(fish);
        return this.options.afterAddFavorite(fish);
      }
    };

    IFish.prototype.removeFavorite = function(fish) {
      fish = this.options.beforeRemoveFavorite(fish);
      this.view.favorites.remove(fish);
      return this.options.afterRemoveFavorite(fish);
    };

    IFish.prototype.localStorageKey = function(pond, type) {
      return "ifish-" + pond.id + "-" + type;
    };

    IFish.prototype.initializeFish = function(pond, afterInitialize) {
      var fishWithMetadata, pondSize;
      pondSize = pond.fish.length;
      fishWithMetadata = [];
      return pond.fish.map((function(_this) {
        return function(fish) {
          var callback;
          callback = function(fish) {
            fish.score = ko.observable(100);
            fish.visible = ko.observable(1);
            fish.fromMetadata = ko.computed(function() {
              return fish.visible() && fish.metadata;
            });
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
        };
      })(this));
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
      return this.controls.find(".slider[data-target='query[tags][" + token + "]']");
    };

    IFish.prototype.filterFor = function(token) {
      return this.controls.find("input[name='query[filters][" + token + "]']");
    };

    IFish.prototype.updateView = function() {
      return this.results.isotope('updateSortData', this.results.find(this.options.fishSelector)).isotope();
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
      var isotopeOptions;
      this.installSliders();
      this.controls.find('input:checkbox').change(this.checkboxChanged);
      this.installSearchField(pond);
      this.showInterface();
      this.installDialog();
      isotopeOptions = $.extend({
        itemSelector: this.options.fishSelector,
        filter: this.options.fishSelector + '[data-visible="1"]'
      }, this.options.isotope);
      return this.results.isotope(isotopeOptions);
    };

    IFish.prototype.installDialog = function() {
      $.each(this.results.find(this.options.fishSelector), (function(_this) {
        return function(i, li) {
          var dialog;
          li = $(li);
          dialog = li.find('.dialog');
          return li.click(function(event) {
            var element, fish;
            element = event.currentTarget;
            fish = ko.dataFor(element);
            return fish.get_metadata(function(fish) {
              fish.visible.notifySubscribers();
              return dialog.modal('toggle');
            });
          });
        };
      })(this));
      return this.results.find('li .dialog').appendTo("body").modal('hide');
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
      $(".progress").removeClass("active");
      $(".loading").delay(500).fadeOut(200);
      $(".form-and-results", this.container).delay(1000).removeClass('hidden');
      return this.favorites.delay(500).removeClass('hidden');
    };

    IFish.prototype.installSearchField = function(pond) {
      var field, format, mappedFish, searchedFields, typeaheadOptions, _i, _len;
      mappedFish = this.mappedFish;
      format = [];
      searchedFields = this.options.search && this.options.search.fields || ['title'];
      if (this.options.search && this.options.search.format) {
        format = this.options.search.format;
      } else {
        for (_i = 0, _len = searchedFields.length; _i < _len; _i++) {
          field = searchedFields[_i];
          format.push('%s');
        }
        format = format.join(', ');
      }
      typeaheadOptions = $.extend({
        items: 5,
        source: this.fishIds,
        matcher: function(item) {
          var fish, result, _j, _len1;
          fish = mappedFish[item];
          result = false;
          for (_j = 0, _len1 = searchedFields.length; _j < _len1; _j++) {
            field = searchedFields[_j];
            result || (result = fish[field].score(this.query) > 0.1);
          }
          return result;
        },
        sorter: function(items) {
          var query;
          query = this.query;
          items.sort((function(_this) {
            return function(item1, item2) {
              var fish1, fish2, score1, score2, _j, _k, _len1, _len2;
              fish1 = mappedFish[item1];
              fish2 = mappedFish[item2];
              score1 = 0;
              score2 = 0;
              for (_j = 0, _len1 = searchedFields.length; _j < _len1; _j++) {
                field = searchedFields[_j];
                score1 += fish1[field].score(query);
              }
              for (_k = 0, _len2 = searchedFields.length; _k < _len2; _k++) {
                field = searchedFields[_k];
                score2 += fish2[field].score(query);
              }
              if (score1 > score2) {
                -1;
              }
              if (score1 < score2) {
                1;
              }
              return 0;
            };
          })(this));
          return items;
        },
        highlighter: (function(_this) {
          return function(item) {
            var fish, highlighted, _j, _len1;
            fish = _this.mappedFish[item];
            highlighted = format;
            for (_j = 0, _len1 = searchedFields.length; _j < _len1; _j++) {
              field = searchedFields[_j];
              highlighted = highlighted.replace(/%s/, fish[field]);
            }
            return highlighted;
          };
        })(this),
        updater: (function(_this) {
          return function(item) {
            var fish;
            fish = _this.mappedFish[item];
            _this.controls.find("input[name^='query[filters]']:checkbox").removeAttr('checked');
            _this.setSortValues(fish);
            _this.sendQuery();
            return fish.title;
          };
        })(this)
      }, this.options.search);
      return this.search.find('input[type="text"]').typeahead(typeaheadOptions);
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
