## Barba.js.fullscreen
Barba.js.fullscreen helps to implement a site which can be fully used within a fullsreen environment using the [fullscreen api](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API). It takes care of some issues which come into play when in fullscreen but there will still be unique changes needed to be made for each site.

This is built upon [barba.js](https://github.com/luruke/barba.js). The setup/use information there is still relevant.

Initial batch of custom changes can be viewed in this [commit](https://github.com/thisbailiwick/barba.js.fullscreen/commit/194d9addd2f5cee3aa7cf822e8ac95ceec1ea8ed).

There is a [WordPress Plugin](https://github.com/thisbailiwick/wp.barba.js.fullscreen) implementing this code.

Demo using the above WordPress plugin: [http://wpbarbafullscreen.thisbailiwick.com](http://wpbarbafullscreen.thisbailiwick.com). This could help with implementation.

The demo uses a simple [WP child theme](https://github.com/thisbailiwick/wp.barba.js.fullscreen.demo.theme) which can also help with implementation.

<hr>

**Examples of unique issues for fullscreen implementation.**

— Any javascript used on page load needs to be called from or moved to the [transition object events](http://barbajs.org/transition.html).

— Depending on your site there may need to be styles added to accommodate scrolling in fullscreen.

— The element which is being made fullscreen needs to have `overflow: scroll` set in styles. This can conflict with child elements who need `position: sticky` set. No parent/grandparent elements can have `overflow: scroll` set (at least as I've experienced so far).

— Submitted forms will bump a user out of fullscreen.

From MDN:
> Note that sticky, by specification, will not work inside element with overflow: hidden or auto. (ref: [Github issue on W3C CSSWG](https://github.com/w3c/csswg-drafts/issues/865))

The link to the W3C CSSWG issue may have further information or workarounds but I haven't looked into it further.

<hr>

**How to use:**

* Add files in `/dist` to your site.
* Add `fullscreen` class to a dom element. This will be the element used when requesting fullscreen. [Example code](https://github.com/thisbailiwick/wp.barba.js.fullscreen.demo.theme/blob/master/header.php).
* Add some js to spin up Barba.js.fullscreen. [Example code](https://github.com/thisbailiwick/wp.barba.js.fullscreen.demo.theme/blob/master/main.js).

**Options different from barba.js**
`showFullscreenModal`
* boolean
* default `false`
* setting this to true will trigger Barba.js.fullscreen to display a modal on a user's first time visiting the site. The modal will ask the user if they want to view the site in fullscreen mode. A permanent cookie will be saved based on the response. In addition and session cookie will be saved with the response. If a user selects to view in fullscreen mode the view goes fullscreen and on further visits once the session cookie no longer exists the same modal will show. If a user selects not to go into fullscreen mode no modal is shown in further visits. However, if they at any point click any button to go into fullscreen the permanent and session cookies will be changed so that in further visits the modal will show.
`manualModal`
* boolean
* default `false`
* setting this to true will keep Barba.js from showing a fullscreen modal asking the if they want to go fullscreen.
`showModalOnNewSession`
* boolean
* default `false`
* setting this to true will show.
`manualFullScreenToggle`
* boolean
* default `false`
* setting this to true will .
`showingSplash`
* boolean
* default `false`
* setting this to true will .


Example: `Barba.Pjax.start({ showFullscreenModal: true });`
