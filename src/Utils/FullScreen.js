var Fscreen = require('fscreen');
var Dom = require('../Pjax/Dom');
var Cookies = require('js-cookie');
var CustomEvent = require('custom-event');
var smoothscroll = require('smoothscroll-polyfill');
// var Utils = require('./Utils');

/**
 * Implements fscreen for fullscreen functionalities
 *
 * @type {Object}
 * @namespace Barba.FullScreen
 */

var FullScreen = {
  currentUrl: null,
  // use modal
  preference: false,
  // use manual calling of modal
  modal: null,
  isFullscreen: false,
  fullScreenChangeEvent: new CustomEvent('fullscreenChange'),
  browserSupportsFullscreen: false,
  scrollToElement: null,
  fullscreenElement: document.querySelector('.fullscreen'),
  fullScreenOnChangeEvent: function () {
    this.isFullscreen = !this.isFullscreen;

    if (this.scrollToElement !== null) {
      Barba.Utils.scrollToElement(this.scrollToElement, false);
      this.scrollToElement = null;
    }

    document.dispatchEvent(
      new CustomEvent('barbaFullscreenOnChange', {
        bubbles: false,
        cancelable: false
      })
    );
  },
  initFullScreen: function (options) {
    //dom should already be loaded here
    smoothscroll.polyfill();
    if (Fscreen.default.fullscreenEnabled) {
      this.browserSupportsFullscreen = true;
      document.querySelector('body').classList.add('fullscreen-capable');
      this.setFullScreenToggle();
      this.preference = options.showFullscreenModal;
      if (this.preference === true) {
        this.manualModal = options.manualModal;
        this.manualFullScreenToggle = options.manualFullScreenToggle;
        this.showingSplash = options.showingSplash;
      }
      this.initFullscreenModal();

      Fscreen.default.addEventListener('fullscreenchange', FullScreen.fullScreenOnChangeEvent.bind(FullScreen), false);
    } else {
      //browser is not capable
      document.querySelector('.fullscreen-toggle').style.display = 'none';
      document.querySelector('body').classList.add('no-fullscreen');
    }
  },
  setFullScreenToggle: function () {
    document.querySelector('.fullscreen-toggle').addEventListener('click', function (e) {
      e.preventDefault();
      if (FullScreen.isFullscreen) {
        Fscreen.default.exitFullscreen();
      } else {
        FullScreen.goFullScreen();
      }
    });
  },

  replaceBodyClasses: function () {
    var body = document.getElementsByTagName('body')[0];
    var additional_classes = '';
    if (FullScreen.browserSupportsFullscreen === false) {
      additional_classes = ' no-fullscreen'
    }
    body.className = Dom.currentBodyClasses + additional_classes;
  },

  // all fullscreen requests should go through this function
  goFullScreen: function () {
    this.enterFullScreen();
    this.removeFullscreenNoCookies();
  },

  initFullscreenModal: function () {
    if (this.preference === true) {
      FullScreen.applyFullscreenModal();
    }
  },

  toggleModal: function () {
    this.modal.classList.toggle('show');
  },

  showModal: function () {
    this.modal = document.querySelector('.fullscreen-modal');
    var buttonYes = this.modal.querySelector('.fullscreen-yes');
    var buttonNo = this.modal.querySelector('.fullscreen-no');

    this.toggleModal();

    this.setModalButtonEvents(buttonYes, buttonNo);
  },

  applyFullscreenModal: function () {
    // create fullscreen modal html
    var modalHtml = '\
			<style type="text/css">\
				.fullscreen-modal{\
	        align-items: center;\
					background-color: rgba(255,255,255,.8);\
					display: none;\
					height: 100%;\
	        justify-content: center;\
					left: 0;\
					position: fixed;\
					width: 100%;\
					text-align: center;\
					top: 0;\
          z-index: 100;\
				}\
				\
				.fullscreen-modal.show{\
					display: flex;\
				}\
				\
				button{\
					\
				}\
				button:hover{\
					cursor: pointer;\
        }\
			</style>\
      <div class="fullscreen-modal">\
      	<div class="fullscreen-inner-wrap">\
      	<h3>View site in fullscreen mode?</h3>\
      		<button class="fullscreen-yes">Yes Please!</button>\
      		<button class="fullscreen-no">No thanks.</button>\
      	</div>\
    	</div>\
';
    // add hidden html to page
    this.fullscreenElement.insertAdjacentHTML('beforeend', modalHtml);
    // check if user has cookies, permanent and session
    var showModal = this.shouldShowModal();

    if (showModal && this.manualModal === false ||
      showModal && this.showingSplash === true && Cookies.get('splashseen') === 'true'
    ) {
      this.showModal();
    }
  },

  shouldShowModal: function () {
    // if fullscreen-permanent cookie
    var permanentCookie = Cookies.get('fullscreen-permanent');
    if (permanentCookie !== undefined) {
      return permanentCookie === 'true';
    }

    // if we get here, we show modal
    return true;

  },

  setModalButtonEvents: function (buttonYes, buttonNo) {
    buttonYes.addEventListener('click', this.fullscreenYes.bind(this));
    buttonNo.addEventListener('click', this.fullscreenNo.bind(this));
  },

  enterFullScreen: function () {
    // get element at top of page
    var element = document.elementFromPoint(window.innerWidth / 2, 0);
    // go full screen
    Fscreen.default.requestFullscreen(FullScreen.fullscreenElement);
    this.scrollToElement = element;
  },

  fullscreenYes: function () {
    if (this.manualFullScreenToggle === false) {
      //hide modal
      this.toggleModal();
      this.goFullScreen();
    } else {
      // trigger custom yes event
      document.dispatchEvent(
        new CustomEvent('barbaFullScreenPreferenceYes', {
          bubbles: false,
          cancelable: false
        })
      );
    }
    this.setFullscreenYesCookies();
  },

  fullscreenNo: function () {
    if (this.manualFullScreenToggle === false) {
      //hide modal
      this.toggleModal();
    } else {
      // trigger custom no event
      document.dispatchEvent(
        new CustomEvent('barbaFullScreenPreferenceNo', {
          bubbles: false,
          cancelable: false
        })
      );
    }
    this.setFullscreenNoCookies();
  },

  setFullscreenNoCookies: function () {
    // set permanent
    Cookies.set('fullscreen-permanent', false, {expires: 365});
  },

  removeFullscreenNoCookies: function () {
    Cookies.remove('fullscreen-permanent');
  }

};

module.exports = FullScreen;
