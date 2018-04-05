var Fscreen = require('fscreen');
var Utils = require('../Utils/Utils');
var Dispatcher = require('../Dispatcher/Dispatcher');
var HideShowTransition = require('../Transition/HideShowTransition');
var BaseCache = require('../Cache/BaseCache');

var HistoryManager = require('./HistoryManager');
var Dom = require('./Dom');

/**
 * Pjax is a static object with main function
 *
 * @namespace Barba.Pjax
 * @borrows Dom as Dom
 * @type {Object}
 */
var Pjax = {
  Dom: Dom,
  History: HistoryManager,
  Cache: BaseCache,

  /**
   * Indicate wether or not use the cache
   *
   * @memberOf Barba.Pjax
   * @type {Boolean}
   * @default
   */
  cacheEnabled: true,

  /**
   * Indicate if there is an animation in progress
   *
   * @memberOf Barba.Pjax
   * @readOnly
   * @type {Boolean}
   */
  transitionProgress: false,

  /**
   * Class name used to ignore links
   *
   * @memberOf Barba.Pjax
   * @type {String}
   * @default
   */
  ignoreClassLink: 'no-barba',

  /**
   * Function to be called to start Pjax
   *
   * @memberOf Barba.Pjax
   */
  start: function() {
    this.init();
  },

  /**
   * Init the events
   *
   * @memberOf Barba.Pjax
   * @private
   */
  init: function() {
    var container = this.Dom.getContainer();
    var wrapper = this.Dom.getWrapper();

    wrapper.setAttribute('aria-live', 'polite');

    var pageTitle = document.querySelector('title');
    var loadPageUrl = this.getCurrentUrl();
    var pageId = this.Dom.getPageId();
    var currentMenuItemId = this.Dom.getCurrentMenuItem();

    this.History.add(
      loadPageUrl,
      this.Dom.getNamespace(container),
      pageTitle
    );

    //Fire for the current view.
    Dispatcher.trigger('initStateChange', this.History.currentStatus());
    Dispatcher.trigger('newPageReady',
      this.History.currentStatus(),
      {},
      container,
      this.Dom.currentHTML
    );
    Dispatcher.trigger('transitionCompleted', this.History.currentStatus());

    this.bindEvents();

    Pjax.History.addHistoryToBrowser({
      url:               loadPageUrl,
      pageId:            pageId,
      currentMenuItemId: currentMenuItemId
    }, pageId, currentMenuItemId);

    //dom should already be loaded here
    document.querySelector('.fullscreen-toggle').addEventListener('click', function(e) {
      e.preventDefault();
      Fscreen.default.requestFullscreen(document.querySelector('.fullscreen'));
    });
  },

  /**
   * Attach the eventlisteners
   *
   * @memberOf Barba.Pjax
   * @private
   */
  bindEvents: function() {
    document.addEventListener('click',
      this.onLinkClick.bind(this)
    );

    window.addEventListener('popstate', function(e) {
      Pjax.History.setPopStateActiveState(true);
      Pjax.onStateChange(window.location.href, e);
      Pjax.History.setPageTransitionActiveState(true);
    });
  },

  /**
   * Return the currentURL cleaned
   *
   * @memberOf Barba.Pjax
   * @return {String} currentUrl
   */
  getCurrentUrl: function() {
    return Utils.cleanLink(
      Utils.getCurrentUrl()
    );
  },

  /**
   * Change the URL with pushstate and trigger the state change
   *
   * @memberOf Barba.Pjax
   * @param {String} newUrl
   */
  goTo: function(url) {
    var pageId = this.Dom.getPageId();

    var currentMenuItemId = this.Dom.getCurrentMenuItem();
    var title = document.querySelector('title').textContent;
    Pjax.History.addHistoryToBrowser({
      url:               url,
      title:             title,
      currentMenuItemId: currentMenuItemId
    }, pageId, currentMenuItemId);

    Pjax.History.setPageTransitionActiveState(true);
    this.onStateChange(url);
  },

  /**
   * Force the browser to go to a certain url
   *
   * @memberOf Barba.Pjax
   * @param {String} url
   * @private
   */
  forceGoTo: function(url) {
    window.location = url;
  },

  /**
   * Load an url, will start an xhr request or load from the cache
   *
   * @memberOf Barba.Pjax
   * @private
   * @param  {String} url
   * @return {Promise}
   */
  load: function(url) {
    var deferred = Utils.deferred();
    var _this = this;
    var xhr;

    xhr = this.Cache.get(url);

    if (!xhr) {
      xhr = Utils.xhr(url);
      this.Cache.set(url, xhr);
    }

    xhr.then(
      function(data) {
        var container = _this.Dom.parseResponse(data);

        _this.Dom.putContainer(container);

        if (!_this.cacheEnabled)
          _this.Cache.reset();

        deferred.resolve(container);
      },
      function() {
        //Something went wrong (timeout, 404, 505...)
        _this.forceGoTo(url);

        deferred.reject();
      }
    );

    return deferred.promise;
  },

  /**
   * Get the .href parameter out of an element
   * and handle special cases (like xlink:href)
   *
   * @private
   * @memberOf Barba.Pjax
   * @param  {HTMLElement} el
   * @return {String} href
   */
  getHref: function(el) {
    if (!el) {
      return undefined;
    }

    if (el.getAttribute && typeof el.getAttribute('xlink:href') === 'string') {
      return el.getAttribute('xlink:href');
    }

    if (typeof el.href === 'string') {
      return el.href;
    }

    return undefined;
  },

  /**
   * Callback called from click event
   *
   * @memberOf Barba.Pjax
   * @private
   * @param {MouseEvent} evt
   */
  onLinkClick: function(evt) {
    var FullScreen = require('../Utils/FullScreen');
    var el = evt.target;

    //Go up in the nodelist until we
    //find something with an href
    while (el && !this.getHref(el)) {
      el = el.parentNode;
    }
    if(el !== null) {
      var preventCheckResult = this.preventCheck(evt, el);

      if(preventCheckResult === 'same-page') {
        // do nothing
        evt.preventDefault();
      } else if(preventCheckResult) {
      evt.stopPropagation();
      evt.preventDefault();

      Dispatcher.trigger('linkClicked', el, evt);

      var href = this.getHref(el);


        if(!FullScreen.fullscreenElement()) {
      this.goTo(href);
        } else {
          this.onStateChange(href);
        }
      }
    }
  },

  /**
   * Determine if the link should be followed
   *
   * @memberOf Barba.Pjax
   * @param  {MouseEvent} evt
   * @param  {HTMLElement} element
   * @return {Boolean}
   */
  preventCheck: function(evt, element) {
    if (!window.history.pushState)
      return false;

    var href = this.getHref(element);
    var cleanHref = Utils.cleanLink(href);
    var same_page = cleanHref === Utils.cleanLink(location.href);

    //User
    if (!element || !href)
      return false;

    //Middle click, cmd click, and ctrl click
    if (evt.which > 1 || evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey)
      return false;

    //Ignore target with _blank target
    if (element.target && element.target === '_blank')
      return false;

    //Check if it's the same domain
    if (window.location.protocol !== element.protocol || window.location.hostname !== element.hostname)
      return false;

    //Check if the port is the same
    if (Utils.getPort() !== Utils.getPort(element.port))
      return false;

    //Ignore case when a hash is being tacked on the current URL
    if(href.indexOf('#') > -1 && same_page)
      return false;

    //Ignore case where there is download attribute
    if (element.getAttribute && typeof element.getAttribute('download') === 'string')
      return false;

    //In case you're trying to load the same page
    if(same_page)
      return 'same-page';

    if(element.classList.contains(this.ignoreClassLink) || element.parentNode.classList.contains(this.ignoreClassLink))
      return false;

    return true;
  },

  /**
   * Return a transition object
   *
   * @memberOf Barba.Pjax
   * @return {Barba.Transition} Transition object
   */
  getTransition: function() {
    //User customizable
    return HideShowTransition;
  },

  /**
   * Method called after a 'popstate' or from .goTo()
   *
   * @memberOf Barba.Pjax
   * @private
   */
  onStateChange: function(newUrl, popStateEvent) {
    popStateEvent = popStateEvent !== undefined ? popStateEvent : null;

    if(popStateEvent !== null) {
      // set the current menu item
      if(popStateEvent.state) {
        Dom.setCurrentMenuItem(popStateEvent.state.currentMenuItemId);
      }

      newUrl = document.location.href;
    } else if(newUrl === undefined) {
      newUrl = this.getCurrentUrl();
    }

    // check if page is in transition and add to queue if so
    if(this.transitionProgress) {
      if(newUrl !== this.History.queued_url[0]) {
        this.History.queued_url[0] = newUrl;
        return false;
      }
    }

    if (this.History.currentStatus().url === newUrl)
      return false;

    var newContainer = this.load(newUrl);
    this.History.add(newUrl, null, document.querySelector('title').textContent);
    var transition = Object.create(this.getTransition());

    this.transitionProgress = true;

    Dispatcher.trigger('initStateChange',
      this.History.currentStatus(),
      this.History.prevStatus()
    );

    var transitionInstance = transition.init(
      this.Dom.getContainer(),
      newContainer
    );

    newContainer.then(
      this.onNewContainerLoaded.bind(this)
    );

    transitionInstance.then(
      this.onTransitionEnd.bind(this)
    );
  },

  /**
   * Function called as soon the new container is ready
   *
   * @memberOf Barba.Pjax
   * @private
   * @param {HTMLElement} container
   */
  onNewContainerLoaded: function(container) {
    var currentStatus = this.History.currentStatus();
    currentStatus.namespace = this.Dom.getNamespace(container);

    Dispatcher.trigger('newPageReady',
      this.History.currentStatus(),
      this.History.prevStatus(),
      container,
      this.Dom.currentHTML
    );
  },

  /**
   * Function called as soon the transition is finished
   *
   * @memberOf Barba.Pjax
   * @private
   */
  onTransitionEnd: function() {
    this.transitionProgress = false;

    Dispatcher.trigger('transitionCompleted',
      this.History.currentStatus(),
      this.History.prevStatus()
    );
  }
};

module.exports = Pjax;
