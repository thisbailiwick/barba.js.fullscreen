/**
 * Object that is going to deal with DOM parsing/manipulation
 *
 * @namespace Barba.Pjax.Dom
 * @type {Object}
 */
var Dom = {
  /**
   * The name of the data attribute on the container
   *
   * @memberOf Barba.Pjax.Dom
   * @type {String}
   * @default
   */
  dataNamespace: 'namespace',

  /**
   * Id of the main wrapper
   *
   * @memberOf Barba.Pjax.Dom
   * @type {String}
   * @default
   */
  wrapperId: 'barba-wrapper',

  /**
   * Class name used to identify the containers
   *
   * @memberOf Barba.Pjax.Dom
   * @type {String}
   * @default
   */
  containerClass: 'barba-container',

  /**
   * Full HTML String of the current page.
   * By default is the innerHTML of the initial loaded page.
   *
   * Each time a new page is loaded, the value is the response of the xhr call.
   *
   * @memberOf Barba.Pjax.Dom
   * @type {String}
   */
  currentHTML: document.documentElement.innerHTML,

    /**
     * Classes added to body tag on the current page
     *
     * Each time a new page is loaded we replace the body tag classes with the returned ones.
     *
     * @memberOf Barba.Pjax.Dom
     * @type {String}
     */
    currentBodyClasses: '',

  /**
   * Parse the responseText obtained from the xhr call
   *
   * @memberOf Barba.Pjax.Dom
   * @private
   * @param  {String} responseText
   * @return {HTMLElement}
   */
  parseResponse: function(responseText) {
    this.currentHTML = responseText;

    var wrapper = document.createElement('div');
    wrapper.innerHTML = responseText;

    var titleEl = wrapper.querySelector('title');

      this.replaceWithNewBodyId(responseText);
      this.replaceWithNewBodyClasses(responseText);

    if (titleEl)
      document.title = titleEl.textContent;

    return this.getContainer(wrapper);
  },

    /**
     * Replace the body classes on the page with the new classes contained with the string returned from
     *  the server
     *
     * @memberOf Barba.Pjax.Dom
     * @private
     * @param  {String} responseText
     * @return {HTMLElement}
     */
    replaceWithNewBodyClasses: function(responseText) {
      var classReg = /<body.*?class="([^"]*?)".*?>/;
      var bodyClasses = responseText.match(classReg)[1];
      this.currentBodyClasses = bodyClasses;
    },

    /**
     * Replace the body id on the page with the new id contained with the string returned from
     *  the server
     *
     * @memberOf Barba.Pjax.Dom
     * @private
     * @param  {String} responseText
     * @return {HTMLElement}
     */
    replaceWithNewBodyId: function(responseText) {
      var idReg = /<body.*?id="([^"]*?)".*?>/;
      var bodyId = responseText.match(idReg);
      if(bodyId) {
        bodyId = bodyId[1];
        document.querySelector('body').id = bodyId;
      }
    },

  /**
   * Get the main barba wrapper by the ID `wrapperId`
   *
   * @memberOf Barba.Pjax.Dom
   * @return {HTMLElement} element
   */
  getWrapper: function() {
    var wrapper = document.getElementById(this.wrapperId);

    if (!wrapper)
      throw new Error('Barba.js: wrapper not found!');

    return wrapper;
  },

  /**
   * Get the container on the current DOM,
   * or from an HTMLElement passed via argument
   *
   * @memberOf Barba.Pjax.Dom
   * @private
   * @param  {HTMLElement} element
   * @return {HTMLElement}
   */
  getContainer: function(element) {
    if (!element)
      element = document.body;

    if (!element)
      throw new Error('Barba.js: DOM not ready!');

    var container = this.parseContainer(element);

    if (container && container.jquery)
      container = container[0];

    if (!container)
      throw new Error('Barba.js: no container found');

    return container;
  },

  /**
   * Get the namespace of the container
   *
   * @memberOf Barba.Pjax.Dom
   * @private
   * @param  {HTMLElement} element
   * @return {String}
   */
  getNamespace: function(element) {
    if (element && element.dataset) {
      return element.dataset[this.dataNamespace];
    } else if (element) {
      return element.getAttribute('data-' + this.dataNamespace);
    }

    return null;
  },

  /**
   * Put the container on the page
   *
   * @memberOf Barba.Pjax.Dom
   * @private
   * @param  {HTMLElement} element
   */
  putContainer: function(element) {
    element.style.visibility = 'hidden';

    var wrapper = this.getWrapper();
    wrapper.appendChild(element);
  },

  /**
   * Get container selector
   *
   * @memberOf Barba.Pjax.Dom
   * @private
   * @param  {HTMLElement} element
   * @return {HTMLElement} element
   */
  parseContainer: function(element) {
    return element.querySelector('.' + this.containerClass);
    },

    /**
     * Get current menu item in nav
     *
     * @memberOf Barba.Pjax.Dom
     * @param  {HTMLElement} elementId
     */
    getCurrentMenuItem: function() {
      // TODO: apply config variables for menu in future
      var currentMenuItem = document.querySelector('.current-menu-item, .current-page-ancestor');
      if(currentMenuItem) {
        return currentMenuItem.id;
      }
    },

    /**
     * Set current menu item in nav
     *
     * @memberOf Barba.Pjax.Dom
     * @param  {HTMLElement} elementId
     */
    setCurrentMenuItem: function(elementId) {
      // TODO: apply config variables for menu in future
      this.clearCurrentMenuItem();
      var currentMenuItem = document.getElementById(elementId);
      if(currentMenuItem) {
        currentMenuItem.classList.add('current-menu-item');
      }
    },


    /**
     * Clear current menu item in nav
     *
     * @memberOf Barba.Pjax.Dom
     */
    clearCurrentMenuItem:

      function() {
        // TODO: apply config variables for menu in future
        var currentMenuItem = document.querySelector('.current-menu-item, .current-page-ancestor');
        if(currentMenuItem) {
          currentMenuItem.classList.remove('current-menu-item', 'current-page-ancestor');
        }
      }

    ,

    /**
     * Get id of page
     *
     * @memberOf Barba.Pjax.Dom
     */
    getPageId: function() {
      var pageId = document.getElementsByTagName('body')[0].id.trim();
      if(pageId !== '') {
        pageId = pageId.match(/\d+$/)[0];
  }

      return pageId;
    }
  }
;

module.exports = Dom;
