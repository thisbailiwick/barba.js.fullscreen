var Cookies = require('js-cookie');
var FullScreen = require('./FullScreen');

/**
 * Just an object with some helpful functions
 *
 * @type {Object}
 * @namespace Barba.Utils
 */
var Utils = {
  /**
   * Return the current url
   *
   * @memberOf Barba.Utils
   * @return {String} currentUrl
   */
  getCurrentUrl: function () {
    return window.location.protocol + '//' +
      window.location.host +
      window.location.pathname +
      window.location.search;
  },

  /**
   * Given an url, return it without the hash
   *
   * @memberOf Barba.Utils
   * @private
   * @param  {String} url
   * @return {String} newCleanUrl
   */
  cleanLink: function (url) {
    return url.replace(/#.*/, '');
  },

  /**
   * Time in millisecond after the xhr request goes in timeout
   *
   * @memberOf Barba.Utils
   * @type {Number}
   * @default
   */
  xhrTimeout: 5000,

  /**
   * Start an XMLHttpRequest() and return a Promise
   *
   * @memberOf Barba.Utils
   * @param  {String} url
   * @return {Promise}
   */
  xhr: function (url) {
    var deferred = this.deferred();
    var req = new XMLHttpRequest();

    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        if (req.status === 200) {
          return deferred.resolve(req.responseText);
        } else {
          return deferred.reject(new Error('xhr: HTTP code is not 200'));
        }
      }
    };

    req.ontimeout = function () {
      return deferred.reject(new Error('xhr: Timeout exceeded'));
    };

    req.open('GET', url);
    req.timeout = this.xhrTimeout;
    req.setRequestHeader('x-barba', 'yes');
    req.send();

    return deferred.promise;
  },

  /**
   * Get obj and props and return a new object with the property merged
   *
   * @memberOf Barba.Utils
   * @param  {object} obj
   * @param  {object} props
   * @return {object}
   */
  extend: function (obj, props) {
    var newObj = Object.create(obj);

    for (var prop in props) {
      if (props.hasOwnProperty(prop)) {
        newObj[prop] = props[prop];
      }
    }

    return newObj;
  },

  /**
   * Return a new "Deferred" object
   * https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred
   *
   * @memberOf Barba.Utils
   * @return {Deferred}
   */
  deferred: function () {
    return new function () {
      this.resolve = null;
      this.reject = null;

      this.promise = new Promise(function (resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
      }.bind(this));
    };
  },

  /**
   * Return the port number normalized, eventually you can pass a string to be normalized.
   *
   * @memberOf Barba.Utils
   * @private
   * @param  {String} p
   * @return {Int} port
   */
  getPort: function (p) {
    var port = typeof p !== 'undefined'
      ? p
      : window.location.port;
    var protocol = window.location.protocol;

    if (port != '')
      return parseInt(port);

    if (protocol === 'http:')
      return 80;

    if (protocol === 'https:')
      return 443;
  },

  /**
   * Get the paramater/query of a url by name
   *
   * @memberOf Barba.Utils
   * @private
   * @param  {String} name
   * @param  {String} url
   * @return {String} value
   */
  getParameterByName: function (name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },

  /**
   * Check to see if url has query added to set cookie
   *
   * @memberOf Barba.Utils
   * @private
   * @param  {String} query name
   * @return {String} url
   */
  urlCookieSetCheck: function (url) {
    var results = this.getParameterByName('cookie', url);
    if (results !== '' || results !== null) {
      Cookies.set(results, true, {expires: 365});
    }
  },

  getElementTop: function (element) {
    var top = 0;
    do {
      top += element.offsetTop || 0;
      element = element.offsetParent;
    } while (element);
    return top;
  },

  getElementMiddle: function (element) {

    var elementHeight = element.clientHeight;
    var top = this.getElementTop(element);

    var scrollingWrapHeight = null;
    /* eslint-disable */
    if (FullScreen.isFullscreen) {
      /* eslint-enable */
      // use fullscreen
      scrollingWrapHeight = FullScreen.fullscreenElement.clientHeight;
    } else {
      // use window
      scrollingWrapHeight = window.innerHeight;
    }

    return top - ((scrollingWrapHeight - elementHeight) / 2);

  },

  scrollToByPixels: function (scrollAmount) {
    if (FullScreen.isFullscreen) {
      FullScreen.fullscreenElement.scrollTo({top: scrollAmount, left: 0, behavior: 'smooth'});
    } else {
      window.scrollTo({top: scrollAmount, left: 0, behavior: 'smooth'});
    }
  },

  /**
   * Scroll to an elements top or middle
   *
   * @memberOf Barba.Utils
   * @private
   * @param  {Dom Element} element
   * @param  {Boolean} middle
   *
   */
  scrollToElement: function (element, middle) {
    var scrollAmount = 0;
    if(middle === true){
      scrollAmount = this.getElementMiddle(element);
    }else{
      scrollAmount = this.getElementTop(element);
    }
    this.scrollToByPixels(scrollAmount);
  }
};

module.exports = Utils;
