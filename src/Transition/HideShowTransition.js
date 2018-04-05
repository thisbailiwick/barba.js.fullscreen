var BaseTransition = require('./BaseTransition');
var ScrollToElement = require('scroll-to-element');
var HistoryManager = require('../Pjax/HistoryManager');
var Promise = require('promise-polyfill');

/**
 * Basic Transition object, wait for the new Container to be ready,
 * scroll top, and finish the transition (removing the old container and displaying the new one)
 *
 * @private
 * @namespace Barba.HideShowTransition
 * @augments Barba.BaseTransition
 */
var HideShowTransition = BaseTransition.extend({
  start: function() {
    // As soon the loading is finished and the old page is faded out, let's fade the new page
    Promise
      .all([this.newContainerLoading, this.fadeOut()])
      .then(this.fadeIn.bind(this))
      .then(this.finish.bind(this));
  },

  finish: function() {
    document.body.scrollTop = 0;
    this.done();
  },
  fadeOut: function () {
    /**
     * this.oldContainer is the HTMLElement of the old Container
     */
    var _this = this;
    return new Promise(function (resolve, reject) {
      _this.fadeElementOut(_this.oldContainer).then(function () {
        if (HistoryManager.activePopStateEvent === false) {
          document.getElementById('wrapper').scrollIntoView();
        } else if (Barba.FullScreen.fullscreenElement()) {
          // Here we're getting the scroll position of the next to last element in Barba.HistoryManager.history. The last element being the page we are currently on, next to last being the one we're going to (whether it's a forwards or backwards popstateevent).
          HideShowTransition.fullscreenSetScrollPosition(Math.abs(HistoryManager.history[HistoryManager.history.length - 2].scrollPosition));
        }
        resolve(true);
      });
    });
  },

  fadeIn: function () {
    /**
     * this.newContainer is the HTMLElement of the new Container
     * At this stage newContainer is on the DOM (inside our #barba-container and with visibility: hidden)
     * Please note, newContainer is available just after newContainerLoading is resolved!
     */

    /*Add new classes to body*/
    Barba.FullScreen.replaceBodyClasses();


    var el = this.newContainer;

    el.style.display = 'none';
    el.style.opacity = 0;
    el.style.visibility = 'visible';
    this.fadeElementIn(el).then(function () {
      if (Barba.FullScreen.fullscreenElement() === false) {
        if (window.location.hash !== '') {
          HideShowTransition.goTo(document.querySelector('#' + window.location.hash));
        }
      } else {
        //we're in full screen, we don't have the hash in the url as it hasn't been added to the browser
        var hash = HistoryManager.history[HistoryManager.history.length - 1].url.match(/#(.*)/);
        if (hash !== null) {
          hash = hash[1];
          document.getElementById(hash).scrollIntoView();
        }
      }
    });
  },

  goTo: function (element) {
    ScrollToElement(element, {
      offset: 0,
      ease: 'out-bounce',
      duration: 1500
    });

    event.preventDefault();
  },

  fullscreenSetScrollPosition: function (scrollTop) {
    ScrollToElement('.fullscreen', {
      offset: scrollTop,
      ease: 'out-bounce',
      duration: 1500
    });
  },

  fadeElementOut: function (el) {
    el.style.opacity = 1;
    return new Promise(function (resolve, reject) {
      (function fade() {
        if ((el.style.opacity -= .05) < 0) {
          resolve(true);
        } else {
          requestAnimationFrame(fade);
  }
      })();
    });
  },

  fadeElementIn: function (el, display) {
    el.style.opacity = 0;
    el.style.display = display || "block";
    return new Promise(function (resolve, reject) {
      (function fade() {
        var val = parseFloat(el.style.opacity);
        if (!((val += .05) > 1)) {
          el.style.opacity = val;
          requestAnimationFrame(fade);
        } else {
          resolve(true);
        }
      })();
    });
  }

});

module.exports = HideShowTransition;
