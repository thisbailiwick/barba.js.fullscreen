var Fscreen = require('fscreen');
var Dom = require('../Pjax/Dom');

/**
 * Implements fscreen for fullscreen functionalities
 *
 * @type {Object}
 * @namespace Barba.FullScreen
 */

var FullScreen = {
  currentUrl:              null,
  fullscreenElement:       function() {
    return Fscreen.default.fullscreenElement !== null;
  },
  fullScreenOnChangeEvent: function() {

  },
  replaceBodyClasses:      function() {
    var body = document.getElementsByTagName('body')[0];
    body.className = Dom.currentBodyClasses;
  }
};

Fscreen.default.addEventListener('fullscreenchange', FullScreen.fullScreenOnChangeEvent, false);
module.exports = FullScreen;
