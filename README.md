# Sticky Sidebar [![Build Status](https://travis-ci.org/abouolia/sticky-sidebar.svg?branch=3.2.0)](https://travis-ci.org/abouolia/sticky-sidebar)

Pure JavaScript plugin for making smart and high performance sticky sidebars.

[Basic Example](https://abouolia.github.io/sticky-sidebar/examples/basic.html)

[Scrollable Sticky Element](https://abouolia.github.io/sticky-sidebar/examples/scrollable-element.html)

For complete documentation and examples see [abouolia.github.com/sticky-sidebar](http://abouolia.github.com/sticky-sidebar)

## Why is sticky sidebar so awesome?

* It does not re-calculate all dimensions when scrolling, just necessary dimensions.
* Super smooth without incurring scroll lag or jank and no page reflows.
* Integrated with resize sensor to re-calculate all dimenstions of the plugin when size of sidebar or its container is changed.
* It has event trigger on each affix type to hook your code under particular situation.
* Handle the sidebar when is tall or too short compared to the rest of the container.
* Zero dependencies and super simple to setup.

## Install

You can download sticky sidebar jQuery plugin from Bowser, NPM or just simply download it from this page and link to the ``sticky-sidebar.js`` file in your project folder.

#### Bower

If you are using bower as package manager:

````
bower install sticky-sidebar
````

#### NPM

If you are using NPM as package manager:

````
npm install sticky-sidebar
````

## Usage

Your website's html structure has to be similar to this in order to work:

````html
<div class="main-content">
    <div class="sidebar">
        <div class="sidebar__inner">
            <!-- Content goes here -->
        </div>
    </div>
    <div class="content">
        <!-- Content goes here -->
    </div>
</div>
````

Note that inner sidebar wrapper ``.sidebar__innner`` is optional but highly recommended, if you don't write it yourself, the script will create one for you under class name ``inner-wrapper-sticky``. but this may cause many problems.

For the above example, you can use the following JavaScript:

````html
<script type="text/javascript" src="./js/sticky-sidebar.js"></script>

<script type="text/javascript">
  var sidebar = new StickySidebar('.sidebar', {
    topSpacing: 20,
    bottomSpacing: 20,
    containerSelector: '.main-content',
    innerWrapperSelector: '.sidebar__inner'
  });
</script>
````

#### Via jQuery/Zepto

You can configure sticky sidebar as a jQuery plugin, just include ``jquery.sticky-sidebar.js`` instead ``sticky-sidebar.js`` file than configure it as any jQuery plugin.

````html
<script type="text/javascript" src="./js/jquery.js"></script>
<script type="text/javascript" src="./js/jquery.sticky-sidebar.js"></script>

<script type="text/javascript">
  $('#sidebar').stickySidebar({
    topSpacing: 60,
    bottomSpacing: 60
  });
</script>
````

Make sure to include ``sticky-sidebar.js`` script file after ``jquery.js``.

## Usage with [ResizeSensor.js](https://github.com/marcj/css-element-queries/blob/master/src/ResizeSensor.js)

Sticky sidebar integrated with [ResizeSensor.js](https://github.com/marcj/css-element-queries/blob/master/src/ResizeSensor.js) to detect when sidebar or container is changed. To use resize sensor with this plugin just make sure to include ResizeSensor.js before `sticky-sidebar.js` code whether through module loader, bundle or event inclusion as a `<script>` and enable `resizeSensor` option (enabled by default) and it will works.

You can choose not to include `ResizeSensor.js` and sticky sidebar will continue work without any problem but without automatically detect resize changes.

## Browser Support

Sticky sidebar works in all modern browsers including Internet Explorer 9 and above, but if you want it to work with IE9, should include [`requestAnimationFrame`](https://gist.github.com/paulirish/1579671) polyfill before sticky sidebar code.

If you have any issues with browser compatibility don’t hesitate to [Submit an issue](https://github.com/abouolia/sticky-sidebar/issues/new).

## License

Sticky Sidebar is released under the MIT license. Have at it.

-------

Made by Ahmed Bouhuolia
