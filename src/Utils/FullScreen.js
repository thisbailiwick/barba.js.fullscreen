var Fscreen = require('fscreen');
var Dom = require('../Pjax/Dom');
var Cookies = require('js-cookie');

/**
 * Implements fscreen for fullscreen functionalities
 *
 * @type {Object}
 * @namespace Barba.FullScreen
 */

var FullScreen = {
  currentUrl:              null,
	preference: false,
	modal: null,
  fullscreenElement:       function() {
    return Fscreen.default.fullscreenElement !== null;
  },
  fullScreenOnChangeEvent: function() {

  },
	initFullScreen: function(options){
		//dom should already be loaded here
		if(Fscreen.default.fullscreenEnabled){
			document.querySelector('body').classList.add('fullscreen-capable');
			this.setFullScreenToggle();
			this.preference = options.showFullscreenModal
			this.initFullscreenModal();
		}else{
			//browser is not capable
			document.querySelector('.fullscreen-toggle').style.display = 'none';
		}
	},
	setFullScreenToggle: function(){
		document.querySelector('.fullscreen-toggle').addEventListener('click', function(e) {
			e.preventDefault();
			FullScreen.goFullScreen();
		});
	},
  replaceBodyClasses:      function() {
    var body = document.getElementsByTagName('body')[0];
    body.className = Dom.currentBodyClasses;
  },
	goFullScreen: function(){
		Fscreen.default.requestFullscreen(document.querySelector('.fullscreen'));
		if(this.preference === false){
			this.preference = true;
			this.setFullscreenYesCookies();
		}
	},
	initFullscreenModal: function(){
		if(this.preference === true){
			FullScreen.applyFullscreenModal();
		}
	},
  applyFullscreenModal: function(){
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
	  document.querySelector('.fullscreen').insertAdjacentHTML('beforeend', modalHtml);
    // check if user has cookies, permanent and session
	  var showModal = this.shouldShowModal();
    if(showModal){
	    this.modal = document.querySelector('.fullscreen-modal');
	    var buttonYes = this.modal.querySelector('.fullscreen-yes');
	    var buttonNo = this.modal.querySelector('.fullscreen-no');

	    this.modal.classList.toggle('show');

	    this.setModalButtonEvents(buttonYes, buttonNo)
    }
  },
	shouldShowModal: function(){
  	// check if session cookie
		var sessionCookie = Cookies.get('fullscreen-session');
		if(sessionCookie !== undefined){
			return sessionCookie === 'true';
		}

		// if no session cookie check for permanent cookie
		if(sessionCookie === undefined){
			var permanentCookie = Cookies.get('fullscreen-permanent');
			if(permanentCookie !== undefined){
				return permanentCookie === 'true';
			}
		}

		// if we get here, we show modal
		return true;

	},
	setModalButtonEvents: function(buttonYes, buttonNo){
  	buttonYes.addEventListener('click', this.fullscreenYes.bind(this) );
  	buttonNo.addEventListener('click', this.fullscreenNo.bind(this) );
	},
	fullscreenYes: function(){
  	//hide modal
		this.modal.classList.toggle('show');
		Fscreen.default.requestFullscreen(document.querySelector('.fullscreen'));
		this.setFullscreenYesCookies();
	},
	fullscreenNo: function(){
		//hide modal
		this.modal.classList.toggle('show');
  	this.setFullscreenNoCookies();
	},
	setFullscreenYesCookies: function(){
  	// set permanent
		Cookies.set('fullscreen-permanent', true, { expires: 365 });
		// set session
		Cookies.set('fullscreen-session', true);
	},
	setFullscreenNoCookies: function(){
		// set permanent
		Cookies.set('fullscreen-permanent', false, { expires: 365 });
		// set session
		Cookies.set('fullscreen-session', false);
	}

};

Fscreen.default.addEventListener('fullscreenchange', FullScreen.fullScreenOnChangeEvent, false);
module.exports = FullScreen;
