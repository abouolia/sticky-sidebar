/**
 * Sticky Sidebar for jQuery.
 * @version 1.0.0
 * @author Ahmed Bouhuolia <a.bouhuolia@gmail.com>
 * @license The MIT License (MIT)
 */
;(function($){

    var _window = $(window);

    /**
	 * Sticky Sidebar.
     * @public
	 * @constructor
     * @param {HTMLElement|jQuery} sidebar - The sidebar element
     * @param {Object} options - The options of sticky sidebar.
	 */
    function StickySidebar(sidebar, options){
        // Current options set by the caller and including defaults.
        this.options = $.extend({}, StickySidebar.DEFAULTS, options);

        // Sidebar wrapper and inner wrapper element.
        this.$sidebar = $(sidebar);
        this.$sidebarInner = false;
       
        // Sidebar container element.
        this.$container = this.$sidebar.closest(this.options.containerSelector);

        // Current Affix Type of sidebar element.
        this.affixedType = 'static';

		this._initialized = false;
        this._breakpoint = false;
        this._resizeListeners = [];
        
        // Dimenstions of sidebar, container and screen viewport.
        this.dimensions = {
            translateY: 0,
            topSpacing: 0,
            bottomSpacing: 0,
            sidebarHeight: 0,
            sidebarWidth: 0,
            containerTop: 0,
            containerHeight: 0,
            viewportHeight: 0,
            viewportTop: 0, 
            lastViewportTop: 0,
        };

        // Initialize sticky sidebar for first time.
        this.initialize();
    }

    /**
     * Version of sticky sidebar plugin.
     * @static
     */
    StickySidebar.VERSION = '1.0.0';

    /**
     * Events namespace of sticky sidebar plugin.
     * @static
     */
    StickySidebar.EVENT_KEY = '.sticky';

    /**
     * Default options for the sticky sidebar.
     * @static
     */
    StickySidebar.DEFAULTS = {
        
        /**
         * Additional top spacing of the element when it becomes sticky.
         * @type {Numeric|Function}
         */
        topSpacing: 0,

        /**
         * Additional bottom spacing of the element when it becomes sticky.
         * @type {Numeric|Function}
         */
        bottomSpacing: 0,

        /**
         * Container sidebar selector to know what the beginning and end of sticky element.
         * @type {String|False}
         */
        containerSelector: false,

        /**
         * Wrapper class of sticky sidebar.
         * @type {String}
         */
        innerWrapperClass: 'inner-wrapper-sticky',
        
        /**
         * The name of CSS class to apply to elements when they have become stuck.
         * @type {String}
         */
        stickyClass: 'is-affixed',

        /**
         * Detect when sidebar and its container change height so re-calculate their dimensions.
         * @type {Boolean}
         */
        resizeSensor: true,

        /**
         * The sidebar returns to its normal position if its width below this value.
         * @type {Numeric}
         */
        minWidth: false
    };
    
    /**
     * Detarmine if the browser is Internet Explorer.
     * @function
     * @static
     */
    StickySidebar.isIE = function(){
        return Boolean(navigator.userAgent.match(/Trident/));
    };

    /**
     * Detarmine if the browser supports CSS transfrom feature.
     * @function
     * @static
     * @param {Boolean} transform3d - Detect transform with translate3d.
     */
    StickySidebar.supportTransform = function(transform3d){
        var result = false,
            property = (transform3d) ? 'perspective' : 'transform',
            upper = property.charAt(0).toUpperCase() + property.slice(1),
            prefixes = 'Webkit Moz O ms'.split(' '),
            style = $('<support>').get(0).style;

        $.each((property + ' ' + prefixes.join(upper + ' ') + upper).split(' '), function(i, property) {
            if (style[property] !== undefined) {
                result = property;
                return false;
            }
        });
        return result;
    };

    StickySidebar.prototype = {

        /**
         * Initializes the sticky sidebar by adding inner wrapper, define its container, 
         * min-width breakpoint, calculating dimenstions, adding helper classes and inline style.
         * @public
         */
        initialize: function(){
            this.$sidebar.trigger('initialize' + StickySidebar.EVENT_KEY);

            // Get sticky sidebar inner wrapper, if not found, will create one.
            if( this.options.innerWrapperClass ){
                this.$sidebarInner = this.$sidebar.find('.' + this.options.innerWrapperClass);

                if( 0 === this.$sidebarInner.length )
                    this.$sidebarInner = false;
            }

            if( ! this.$sidebarInner ){
                var wrapper = $('<div class="'+ this.options.innerWrapperClass +'" />');
                var innerWrapSelector = '> div';

                if( this.options.innerWrapSelector )
                    innerWrapSelector = '.' + this.options.innerWrapSelector;

                this.$sidebar.wrapInner(wrapper);
                this.$sidebarInner = this.$sidebar.find(innerWrapSelector);
            }

            // If there's no specific container, user parent of sidebar as container.
            if( ! this.$container.length )
               this.$container = this.$sidebar.parent();
            
            // If top/bottom spacing is not function parse value to integer.
            if( 'function' !== typeof this.options.topSpacing )
                this.options.topSpacing = parseInt(this.options.topSpacing) || 0;

            if( 'function' !== typeof this.options.bottomSpacing )
                this.options.bottomSpacing = parseInt(this.options.bottomSpacing) || 0;
                
            // Breakdown sticky sidebar if screen width below `options.minWidth`.
            this._widthBreakpoint();

            // Calculate dimensions of sidebar, container and viewport.
            this.calcDimensions();

            // Affix sidebar in proper position.
            this.stickyPosition();

            // Bind all events.
            this.bindEvents();
            
            // Inform other properties the sticky sidebar is initialized.
            this._initialized = true;

            this.$sidebar.trigger('initialized' + StickySidebar.EVENT_KEY);
        },

         /**
         * Bind all events of sticky sidebar plugin.
         * @protected
         */
        bindEvents: function(){
            var options = this.options;

            _window
                .on('resize.'+ StickySidebar.EVENT_KEY, $.proxy(this._onResize, this))
                .on('scroll.'+ StickySidebar.EVENT_KEY, $.proxy(this._onScroll, this));

            this.$sidebar
                .on('recalcDimenstions.' + StickySidebar.EVENT_KEY, $.proxy(this.updateSticky, this));

            if( this.options.resizeSensor ){
                this.addResizerListener(this.$sidebarInner, $.proxy(this.updateSticky, this));
                this.addResizerListener(this.$container, $.proxy(this.updateSticky, this));
            }
        },

        /**
         * Handles scroll top/bottom when detected.
         * @protected
         * @param {Object} event - Event object passed from listener.
         */
        _onScroll: function(event){
            if( ! this.$sidebar.is(':visible') ) return;
            
            this.animateSticky();
        },

        /**
         * Holds resize event when detected. When the browser is resizes re-calculate
         * all dimensions of sidebar and container.
         * @protected
         * @param {Object} event - Event object passed from listener.
         */
        _onResize: function(event){
            requestAnimationFrame($.proxy(function(){
                this._widthBreakpoint();
                this.updateSticky();
            }, this) );
        },

        /**
         * Calculates dimesntions of sidebar, container and screen viewpoint
         * @public
         */
        calcDimensions: function(){
            if( this._breakpoint ) return;

            var dimensions = this.dimensions;

            // Container of sticky sidebar dimensions.
            dimensions.containerTop = this.$container.offset().top;
            dimensions.containerHeight = this.$container.outerHeight();
            dimensions.containerBottom = dimensions.containerTop + dimensions.containerHeight;

            // Sidebar dimensions.
            dimensions.sidebarHeight = this.$sidebarInner.outerHeight();
            dimensions.sidebarWidth = this.$sidebar.outerWidth();
            
            // Screen viewport dimensions.
            dimensions.viewportHeight = _window.prop('innerHeight');

            this._calcDimensionsWithScroll();
        },

        /**
         * Some dimensions values need to be up-to-date when scrolling the page.
         * @private
         */
        _calcDimensionsWithScroll: function(){
            var dimensions = this.dimensions;

            dimensions.sidebarLeft = this.$sidebar.offset().left;

            dimensions.viewportTop = document.documentElement.scrollTop || document.body.scrollTop;
            dimensions.viewportBottom = dimensions.viewportTop + dimensions.viewportHeight;
            dimensions.viewportLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

            dimensions.topSpacing = this.options.topSpacing;
            dimensions.bottomSpacing = this.options.bottomSpacing;

            if( 'function' === typeof dimensions.topSpacing )
                dimensions.topSpacing = parseInt(dimensions.topSpacing(this.$sidebar)) || 0;

            if( 'function' === typeof dimensions.bottomSpacing )
                dimensions.bottomSpacing = parseInt(dimensions.bottomSpacing(this.$sidebar)) || 0;
        },
        
        /**
         * Detarmine wheather the sidebar is bigger than viewport.
         * @public
         * @return {Boolean}
         */
        isSidebarFitsViewport: function(){
            return this.dimensions.sidebarHeight < this.dimensions.viewportHeight;
        },

        /**
         * Detarmine wheather the page is scrolling to top.
         * @public
         * @return {Boolean} 
         */
        isScrollingTop: function(){
            return this.dimensions.viewportTop < this.dimensions.lastViewportTop;
        },

        /**
         * Gets affix type of sidebar according to current scrollTop and scrollLeft.
         * Holds all logical affix of the sidebar when scrolling up and down and when sidebar 
         * is bigger than viewport and vice versa.
         * @public
         * @return {String|False} - Proper affix type.
         */
        getAffixType: function(){
            var dimensions = this.dimensions, affixType = false;

            this._calcDimensionsWithScroll();

            var sidebarBottom = dimensions.sidebarHeight + dimensions.containerTop;
            var colliderTop = dimensions.viewportTop + dimensions.topSpacing;
            var colliderBottom = dimensions.viewportBottom - dimensions.bottomSpacing;

            // When browser is scrolling top.
            if( this.isScrollingTop() ){
                if( colliderTop <= dimensions.containerTop ){
                    dimensions.translateY = 0;
                    affixType = 'STATIC';

                } else if( colliderTop <= dimensions.translateY + dimensions.containerTop ){
                    dimensions.translateY = colliderTop - dimensions.containerTop;
                    affixType = 'VIEWPORT-TOP';

                } else if( ! this.isSidebarFitsViewport() && dimensions.containerTop <= colliderTop ){
                    affixType = 'VIEWPORT-UNBOTTOM';
                }
            // When browser is scrolling up.
            } else {
                // When sidebar element is not bigger than screen viewport.
                if( this.isSidebarFitsViewport() ){

                    if( dimensions.sidebarHeight + colliderTop >= dimensions.containerBottom ){
                        dimensions.translateY = dimensions.containerBottom - sidebarBottom;
                        affixType = 'CONTAINER-BOTTOM'; 

                    } else if( colliderTop >= dimensions.containerTop ){
                        dimensions.translateY = colliderTop - dimensions.containerTop;
                        affixType = 'VIEWPORT-TOP';
                    }
                // When sidebar element is bigger than screen viewport.
                } else {
            
                    if( dimensions.containerBottom <= colliderBottom ){
                        dimensions.translateY = dimensions.containerBottom - sidebarBottom; 
                        affixType = 'CONTAINER-BOTTOM';    

                    } else if( sidebarBottom + dimensions.translateY <= colliderBottom ){
                        dimensions.translateY = colliderBottom - sidebarBottom;
                        affixType = 'VIEWPORT-BOTTOM';
                    
                    } else if( dimensions.containerTop + dimensions.translateY <= colliderTop ){
                        affixType = 'VIEWPORT-UNBOTTOM';
                    }
                }
            }

            dimensions.lastViewportTop = dimensions.viewportTop;
            return affixType;
        },

        /**
         * Gets inline style of sticky sidebar wrapper and inner wrapper according 
         * to its affix type.
         * @private
         * @param {String} affixType - Affix type of sticky sidebar.
         * @return {Object}
         */
        _getStyle: function(affixType){
           if( 'undefined' === typeof affixType ) return;

           var style = {inner: {}, outer: {}};

           var dimensions = this.dimensions;

            switch( affixType ){
                case 'VIEWPORT-TOP':
                    style.inner = {position: 'fixed', top: this.options.topSpacing,
                            left: dimensions.sidebarLeft - dimensions.viewportLeft, width: dimensions.sidebarWidth};
                    break;
                case 'VIEWPORT-BOTTOM':
                    style.inner = {position: 'fixed', top: 'auto', left: dimensions.sidebarLeft,
                            bottom: this.options.bottomSpacing, width: dimensions.sidebarWidth};
                    break;
                case 'CONTAINER-BOTTOM':
                case 'VIEWPORT-UNBOTTOM':
                     style.inner = {position: 'absolute', top: dimensions.containerTop + dimensions.translateY};
                        
                    if( StickySidebar.supportTransform(translate3d = true) )
                        style.inner = {transform: 'translate3d(0, '+ dimensions.translateY +'px, 0)'};

                    else if ( StickySidebar.supportTransform() )
                        style.inner = {transform: 'translate(0, '+ dimensions.translateY +'px)'};
                    break;
            }
            
            switch( affixType ){
                case 'VIEWPORT-TOP':
                case 'VIEWPORT-BOTTOM':
                case 'VIEWPORT-UNBOTTOM':
                case 'CONTAINER-BOTTOM':
                    style.outer = {minHeight: dimensions.translateY + dimensions.sidebarHeight};
                    break;
            }

            style.outer = $.extend({}, {minHeight: ''}, style.outer);
            style.inner = $.extend({}, {position: 'relative', top: '', left: '', bottom: '', width: '',  transform: ''}, style.inner);

            return style;
       },
       
        /**
         * Cause the sidebar to be sticky according to affix type by adding inline
         * style, adding helper class and trigger events.
         * @function
         * @protected
         * @param {string} affixType - Affix type of sticky sidebar.
         */
       stickyPosition: function(){
            if( ! this.$sidebar.is(':visible') || this._breakpoint ) return;
            
            var offsetTop = this.options.topSpacing;
            var offsetBottom = this.options.bottomSpacing;

            var affixType = this.getAffixType();
            var style = this._getStyle(affixType);

            if( this.affixedType != affixType && affixType ){
                var affixEvent = $.Event('affix.' + affixType.replace('viewport-', '') + StickySidebar.EVENT_KEY);
                
                this.$sidebar.trigger(affixEvent);

                if( 'static' === affixType )
                    this.$sidebar.removeClass(this.options.stickyClass);
                else
                    this.$sidebar.addClass(this.options.stickyClass);
                
                var affixedEvent = $.Event('affixed.'+ affixType.replace('viewport', '') + StickySidebar.EVENT_KEY);
                
                this.$sidebarInner.css(style.inner);
                this.$sidebar.trigger(affixedEvent);
            }

            if( this._initialized ) this.$sidebarInner.css('left', style.inner.left);

            this.$sidebar.css(style.outer);
            
            this.affixedType = affixType;
        },

        /**
         * Breakdown sticky sidebar when window width is below `options.minWidth` value.
         * @protected
         */
        _widthBreakpoint: function(){

            if( _window.innerWidth() <= this.options.minWidth ){
                this._breakpoint = true;
                this.affixedType = 'static';
                this.$sidebar.removeAttr('style').removeClass(this.options.stickyClass);
                this.$sidebarInner.removeAttr('style');
            } else {
                this._breakpoint = false;
            }
        },

        /**
         * Force re-calculate dimesnstions of sticky sidebar, container and screen viewport.
         * @public
         */
        updateSticky: function(){
            this.calcDimensions();
            this.stickyPosition();
        },

        /**
         * RequestAnimationFrame wrapper.
         * @public
         */
        animateSticky: function(){
            requestAnimationFrame( $.proxy(function(){
                this.stickyPosition();
            }, this) );
        },
        
        /**
         * Add resize sensor listener to specifc element.
         * @public
         * @param {DOMElement|jQuery} element - 
         * @param {Function} callback - 
         */
        addResizerListener: function(element, callback){
            var $element = $(element);

            if( ! $element.prop('resizeListeners') ){
                $element.prop('resizeListeners', []);
                this._appendResizeSensor($element);
            }
            
            $element.prop('resizeListeners').push(callback);
        },

        /**
         * Remove resize sonser listener from specific element.
         * @function
         * @public
         * @param {DOMElement|jQuery} element - 
         * @param {Function} callback - 
         */
        removeResizeListener: function(element, callback){
            var $element = $(element);
            var resizeListeners = $element.prop('resizeListeners');
            var index = resizeListeners.indexOf(callback);

            this._resizeListeners.splice(index, 1);

            if( $element.prop('resizeListeners').length ){
                var resizeTrigger = $element.prop('resizeTrigger');
                var _window = $(resizeTrigger.contentDocument.defaultView);

                _window.off('resize', this._resizeListener);
                resizeTrigger = $element.find(resizeTrigger).remove();
            }
        },

        /**
         * Append resize sensor object on DOM in specific element.
         * @private
         * @param {DOMElement|jQuery} element - 
         */
        _appendResizeSensor: function(element){
            var $element = $(element);

            if( 'static' == $element.css('position') )
                $element.css('position', 'relative');

            var wrapper = $('<object>');
            var style = 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%;' + 
                    'overflow: hidden; pointer-events: none; z-index: -1;';

            wrapper.attr('style', style);
            wrapper.prop('resizeElement', $element[0]);
            
            var _this = this;

            wrapper.on('load', function(event){
                this.contentDocument.defaultView.resizeTrigger = this.resizeElement;
                $(this.contentDocument.defaultView).on('resize', _this._resizeListener);
            });

            wrapper.prop('type', 'text/html');

            if( StickySidebar.isIE() ) wrapper.prop(data, 'about:blank');
            
            $element.prop('resizeTrigger', wrapper.get(0));
            $element.append(wrapper);
        },

        /**
         * Resize sensor listener to call callbacks of trigger.
         * @private 
         * @param {Object} event - Event object passed from listener.
         */
        _resizeListener: function(event){
            var _window = event.target || event.srcElement;
            
            cancelAnimationFrame(_window.resizeSensorRAF);

            _window.resizeSensorRAF = requestAnimationFrame(function(){
                var trigger = _window.resizeTrigger;

                trigger.resizeListeners.forEach(function(callback){
                    callback.call(trigger, event);
                });
            });
        },

        /**
         * Destroy sticky sidebar plugin.
         * @public
         */
        destroy: function(){
            _window
                .off('resize' + StickySidebar.EVENT_KEY).off('scroll' + StickySidebar.EVENT_KEY);
            
            this.$sidebar
                .removeClass(this.options.stickyClass)
                .css({minHeight: ''})
                .off('recalcDimenstions' + StickySidebar.EVENT_KEY)
                .removeData('stickySidebar');

            this.$sidebarInner
                .css({position: '', top: '', left: '', bottom: '', width: '',  transform: ''});

            if( this.options.resizeSensor ){
                this.removeResizeListener(this.$sidebarInner, $.proxy(this.updateSticky, this));
                this.removeResizeListener(this.$container, $.proxy(this.updateSticky, this));
            }
        }
    };

    /**
     * Sticky Sidebar Plugin Defintion.
     * @param {Object|String} - config
     */
    function _jQueryPlugin(config){
        return this.each(function(){
            var $this = $(this),
                data = $(this).data('stickySidebar');
                
            if( ! data ){
                data = new StickySidebar(this, typeof config == 'object' && config);
                $this.data('stickySidebar', data);
            }

            if( 'string' === typeof config){
                if (data[config] === undefined && ['destory', 'updateSticky'].indexOf(config) != -1) {
                    throw new Error('No method named "'+ config +'"');
                }
                data[config]();
            }
        });
    }

    $.fn.stickySidebar = _jQueryPlugin;
    $.fn.stickySidebar.Constructor = StickySidebar;

    var old = $.fn.stickySidebar;
    
    /**
     * Sticky Sidebar No Conflict.
     */
    $.fn.stickySidebar.noConflict = function(){
        $.fn.stickySidebar = old;
        return this;
    };

    /**
     * Sticky Sidebar Data-API.
     */
    _window.on('load', function(){
        $('[data-sticky-sidebar]').each(function(){
            var $sidebar = $(this);
            var data = $sidebar.data() || {};

            var $container = $sidebar.closest('[data-sticky-sidebar-container]');

            if( $container.length )
                data.containerSelector = $container;

            _jQueryPlugin.call($sidebar, data);
        });
    });

})(jQuery);