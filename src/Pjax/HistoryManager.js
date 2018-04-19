/**
 * HistoryManager helps to keep track of the navigation
 *
 * @namespace Barba.HistoryManager
 * @type {Object}
 */
var Promise = require('promise-polyfill');
var Dom = require('./Dom');

var HistoryManager = {
  /**
   * Keep track of the status in historic order
   *
   * @memberOf Barba.HistoryManager
   * @readOnly
   * @type {Array}
   */
  history: [],

  /**
   * Keep track of an activePopStateEvent
   *
   * @memberOf Barba.HistoryManager
   * @readOnly
   * @type {Array}
   */
  activePopStateEvent: false,

  /**
   * Keep track of an pageTransition
   *
   * @memberOf Barba.HistoryManager
   * @readOnly
   * @type {Array}
   */
  activePageTransition: false,


  /**
   * Track clicked urls when in transition - only tracks last link clicked
   *
   * @memberOf Barba.HistoryManager
   * @readOnly
   * @type {Array}
   */
  queued_url: [],

  /**
   * Add a new set of url and namespace
   *
   * @memberOf Barba.HistoryManager
   * @param {String} url
   * @param {String} namespace
   * @private
   */
  add: function(url, namespace, pageTitle) {
    var FullScreen = require('../Utils/FullScreen');
    // send a page load event to google analytics
    var isFullScreen = FullScreen.fullscreenElement();
    var pageId = Dom.getPageId();
    var currentMenuItemId = Dom.getCurrentMenuItem();
    var yOffset = isFullScreen ? document.querySelector('.fullscreen-wrapper').getBoundingClientRect().top : window.scrollY;

    if (!namespace)
      namespace = undefined;

    if(!pageTitle)
      pageTitle = undefined;

    var urlObject = {
      url: url,
      namespace:      namespace,
      pageTitle:      pageTitle,
      scrollPosition: yOffset
    };

    if(typeof ga !== 'undefined') {
      ga('send', {'hitType': 'pageview', 'page': url, 'title': pageTitle});
    }

    this.history.push(urlObject);

    if(isFullScreen && !this.activePopStateEvent) {
      this.addHistoryToBrowser(urlObject, pageId, currentMenuItemId);
    }
  },

  addSingleUrlToHistory: function(urlObject) {
    return new Promise(function(resolve, reject) {
      document.title = urlObject.pageTitle;
      var pageId = Dom.getPageId();
      var currentMenuItemId = Dom.getCurrentMenuItem();

      HistoryManager.addHistoryToBrowser(urlObject, pageId, currentMenuItemId);

      // add to HistoryManager history
      HistoryManager.add(urlObject.url, urlObject.namespace, urlObject.pageTitle);
      resolve(true);
    });
  },

  addHistoryToBrowser: function(urlObject, pageId, currentMenuItemId) {
    // add to browser history
    window.history.pushState({
      url:               urlObject.url,
      pageId:            pageId,
      currentMenuItemId: currentMenuItemId
    }, urlObject.title, urlObject.url);
  },

  /**
   * Return information about the current status
   *
   * @memberOf Barba.HistoryManager
   * @return {Object}
   */
  currentStatus: function() {
    return this.history[this.history.length - 1];
  },

  /**
   * Return information about the previous status
   *
   * @memberOf Barba.HistoryManager
   * @return {Object}
   */
  prevStatus: function() {
    var history = this.history;

    if (history.length < 2)
      return null;

    return history[history.length - 2];
  },

  setPopStateActiveState: function(state) {
    this.activePopStateEvent = state;
  },

  setPageTransitionActiveState: function(state) {
    this.activePageTransition = state;
  }
};

module.exports = HistoryManager;
