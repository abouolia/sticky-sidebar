# Sticky Sidebar 

Pure JavaScript plugin for making smart and high performance sticky sidebars.

[Basic Example](https://abouolia.github.io/sticky-sidebar/examples/basic.html)

[Scrollable Sticky Element](https://abouolia.github.io/sticky-sidebar/examples/scrollable-element.html)

See for complete documents and examples [abouolia.github.com/sticky-sidebar](http://abouolia.github.com/sticky-sidebar)

## Why sticky sidebar is awesome? 

* It does not re-calculate all dimensions when scrolling, just neccessary dimensions.
* Super smooth without incurring scroll lag or jank and no page reflows.
* Has resize sensor to re-calculate all dimenstions when size of sidebar and its container is changed.
* It has event trigger on each affix type to hook your code under particular situation.
* Handle the sidebar when is tall or too short compared to the rest of the container.
* Zero dependencies and super simple to setup.

## Install

You can download sticky sidebar jquery plugin from Bowser, NPM or just simply download it from here than put ``sticky-sidebar.js`` file in your project folder.

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

Your website's html structure has to be similer to this in order to work:

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

Note that inner sidebar wrapper ``.sidebar__inner`` is optional but highly recommended, if you don't write it yourself, the script will create one for you under class name ``inner-wrapper-sticky``. but this may cause many problems.

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

## Broswers Support

Compatible with Firefox, Chrome, Safari, and IE9+. We looking forward to support IE8+.

## License 

Sticky Sidebar is released under the MIT license. Have at it.

-------

Made by Ahmed Bouhuolia
