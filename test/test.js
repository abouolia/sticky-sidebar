var assert = chai.assert;
var fixture = document.getElementById('mocha-fixtures');
var mockRaf = createMockRaf();

describe('StickySidebar', () => {

  /**
   * ------------------------------------
   * Hooks
   * ------------------------------------
   */
  before(() => {
    var stub = sinon.stub(window, 'requestAnimationFrame');
    stub.callsFake(mockRaf.raf);
  })
  
  after(() => {
    window.requestAnimationFrame.restore();
  });

  afterEach(() => {
    fixture.innerHTML = '';
    window.requestAnimationFrame.resetHistory();
    window.scrollTo(0, 0);
  })

  /**
   * ------------------------------------
   * Unit Testing
   * ------------------------------------
   */
  describe('constructor', () => {

    it('Shoud throw explicit error when there is no specific element.', () => {
      assert.throws(() => { new StickySidebar() }, 'There is no specific sidebar element.');
    })

    it('should all default configuration options has the right value.', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar');
      assert.deepEqual(StickySidebar.defaults, stickySidebar.options);
    });

    it('Should options of custom configuration extend currectly with default options', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', {topSpacing: 60, bottomSpacing: 60});
      assert.equal(stickySidebar.options.topSpacing, 60);
      assert.equal(stickySidebar.options.bottomSpacing, 60);
    });

    it('Should throw explicit error in case sidebar is not inside the container.', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><div class="inner-sidebar"><span>Lorem Ipsum</span></div></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      assert.throws( () => {
        new StickySidebar('.sidebar', {containerSelector: '.sidebar-container'});
      }, 'The container does not contains on the sidebar.')
    });
  })

  describe('initialize', () => {

    it('Should create inner wrapper inside sticky sidebar automatically if not found one.', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';
      
      const sidebar = document.querySelector('.sidebar');
      const stickySidebar = new StickySidebar(sidebar, {
        innerWrapperSelector: '.inner',
        containerSelector: '.container'
      });

      const innerStickySidebar = sidebar.querySelector('.inner-wrapper-sticky'); 
      assert.isNotNull(innerStickySidebar, 'There is no inner sticky sidebar wrapper.');
    })

    it('Should not create inner sticky sidebar wrapper automatically if found', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><div class="inner-sidebar"><span>Lorem Ipsum</span></div></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const sidebar = document.querySelector('.sidebar');
      const stickySidebar = new StickySidebar(sidebar, {
        innerWrapperSelector: '.inner-sidebar',
        containerSelector: '.container'
      });
      const innerStickySidebar = sidebar.querySelector('.inner-sticky-sidebar');
      assert.isNull(innerStickySidebar, 'There is wrapper.');
    })

    it('Should topSpacing/bottomSpacing options be parsed from function to integer.', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><div class="inner-sidebar"><span>Lorem Ipsum</span></div></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', {
        topSpacing: () => { return 60; },
        bottomSpacing: () => { return 60; }
      });
      assert.equal(stickySidebar.dimensions.topSpacing, 60);
      assert.equal(stickySidebar.dimensions.bottomSpacing, 60);
    })

    it('Should query sidebar container currectly if it\'s specified inaccurately.', () => {
      fixture.innerHTML = '<div class="container"><div class="container">' + 
      '  <div class="container">' + 
      '    <div class="sidebar"><div class="inner-sidebar"><span>Lorem Ipsum</span></div></div>' +
      '    <div class="content"><span>Lorem Ipsum</span></div>' +
      '  </div>' + 
      '</div></div>';

      const container = document.body.querySelector('.container > .container > .container');
      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container',
      });
      assert.equal(container, stickySidebar.container);
    })
  })

  describe('calcDimensions', () => {

    it('Should calculate dimensions of sidebar and its container currectly.', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      var stickySidebar = new StickySidebar('.sidebar', {containerSelector: '.container'});
      const dims = stickySidebar.dimensions;

      // container.
      assert.equal(dims.containerTop, 75);
      assert.equal(dims.containerHeight, 2000);
      assert.equal(dims.containerBottom, 2075);

      // sidebar.
      assert.equal(dims.sidebarHeight, 300);
      assert.equal(dims.sidebarWidth, 200);      
      
      // top/bottom spacing.
      assert.equal(dims.topSpacing, 0);
      assert.equal(dims.bottomSpacing, 0);
    })

    it('Should adjusting translate Y when decreasing top spacing.', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';
 
      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', topSpacing: 0
      });

      stickySidebar.affixedType = 'VIEWPORT-TOP';

      stickySidebar.options.topSpacing = 20;
      stickySidebar.dimensions.lastTopSpacing = 100;
      stickySidebar.dimensions.translateY = 100;

      stickySidebar._calcDimensionsWithScroll();

      assert.equal(stickySidebar.dimensions.translateY, 180);
    })

    it('Should adjusting translate Y when decreasing bottom spacing.', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', bottomSpacing: 0
      })

      stickySidebar.affixedType = 'VIEWPORT-BOTTOM';

      stickySidebar.options.bottomSpacing = 20;
      stickySidebar.dimensions.lastBottomSpacing = 100;
      stickySidebar.dimensions.translateY = 100;

      stickySidebar._calcDimensionsWithScroll();

      assert.equal(stickySidebar.dimensions.translateY, 180);
    })
  });

  describe('isSidebarFitsViewport', () => {

    it('Should not sidebar be fit the viewport if sidebar taller than viewport', () =>{ 
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><div style="height: 150vh;" class="sidebar-inner"><span>Lorem Ipsum</span></div></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
      })
      assert.isNotTrue(stickySidebar.isSidebarFitsViewport());
    });

    it('Should sidebar be fit the viewport if sidebar smaller than viewport', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><div style="height: 50vh;" class="sidebar-inner"><span>Lorem Ipsum</span></div></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';
      
      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
      })
      assert.isTrue(stickySidebar.isSidebarFitsViewport());
    });

    it('Should not sidebar be fit viewport if sidebar height equal viewport height.', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><div class="sidebar-inner" style="height: 100vh;"><span>Lorem Ipsum</span></div></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';
      
      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
      })
      assert.isNotTrue(stickySidebar.isSidebarFitsViewport());
    });
  })
  
  describe('observeScrollDir', () => {

    it('Should scrolling direction be up.', () =>{ 
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><div class="inner-sidebar"><span>Lorem Ipsum</span></div></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', innerWrapperSelector: '.inner-sidebar'
      });

      stickySidebar.direction = 'down';
      stickySidebar.dimensions.viewportHeight = 1000;
      stickySidebar.dimensions.viewportTop = 100;
      stickySidebar.dimensions.lastViewportTop = 500;

      stickySidebar.observeScrollDir();

      assert.equal(stickySidebar.direction, 'up');

      stickySidebar.dimensions.viewportTop = 50;
      stickySidebar.dimensions.lastViewportTop = 100;

      stickySidebar.observeScrollDir();

      assert.equal(stickySidebar.direction, 'up');
    })

    it('Should scrolling direction be down.', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><div class="inner-sidebar"><span>Lorem Ipsum</span></div></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar');
      
      stickySidebar.direction = 'up';
      stickySidebar.dimensions.viewportHeight = 1000;
      stickySidebar.dimensions.viewportTop = 100;
      stickySidebar.dimensions.lastViewportTop = 10;

      stickySidebar.observeScrollDir();

      assert.equal(stickySidebar.direction, 'down');

      stickySidebar.dimensions.viewportTop = 200;
      stickySidebar.dimensions.lastViewportTop = 100;

      stickySidebar.observeScrollDir();

      assert.equal(stickySidebar.direction, 'down');
    })
  });

  describe('getAffixType', () => {

    describe('When scrolling bottom.', () => {

      it('Should sidebar has `static` affix type.', (done) => {
        fixture.innerHTML = '<div class="container">' + 
        '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
        '  <div class="content"><span>Lorem Ipsum</span></div>' +
        '</div>';

        const stickySidebar = new StickySidebar('.sidebar', {containerSelector: '.container'});

        window.addEventListener('scroll', (event) => {
          mockRaf.step();
          assert.equal(stickySidebar.affixedType, 'STATIC');
          done();
        }, {once: true})

        window.scrollTo(0, 74);
      })

      it('Should sidebar has `viewport-top` affix type. (sidebar fits viewport)', (done) => {
        fixture.innerHTML = '<div class="container">' + 
        '  <div class="sidebar"><div class="sidebar-inner" style="height: 50vh"><span>Lorem Ipsum</span></div></div>' +
        '  <div class="content"><span>Lorem Ipsum</span></div>' +
        '</div>';

        const stickySidebar = new StickySidebar('.sidebar', {
          containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
        })

        window.addEventListener('scroll', (event) => {
          mockRaf.step();
          assert.equal(stickySidebar.affixedType, 'VIEWPORT-TOP');
          done();
        }, {once: true});

        window.scrollTo(0, 300);
      })

      it('Should sidebar has `viewport-unbottom` affix type. (sidebar doesn\'t fit viewport)', (done) =>{
        fixture.innerHTML = '<div class="container">' + 
        '  <div class="sidebar"><div class="sidebar-inner" style="height: 150vh;"><span>Lorem Ipsum</span></div></div>' +
        '  <div class="content" style="height: 300vh;"><span>Lorem Ipsum</span></div>' +
        '</div>';

        const stickySidebar = new StickySidebar('.sidebar', {
          containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
        })

        const scrollTo = (scrollTop) => new Promise((resolve, reject) => {
          window.addEventListener('scroll', () => {
            mockRaf.step();
            resolve();
          }, {once: true})
          
          window.scrollTo(0, parseInt(scrollTop));
        })

        scrollTo((window.innerHeight * 3) + 75)
          .then(() => scrollTo(window.innerHeight + 75))
          .then(() => scrollTo((window.innerHeight * 1.2) + 75))
          .then(() =>{
            try{
              assert.equal(stickySidebar.affixedType, 'VIEWPORT-UNBOTTOM')
            } catch(error){
              done(error);
              return;
            }
            done();
          })
      })

      it('Should sidebar has `viewport-bottom` affix type. (sidebar doesn\'t fit viewport)', (done) => {
        fixture.innerHTML = '<div class="container">' + 
        '  <div class="sidebar"><div style="height: 150vh;" class="sidebar-inner"><span>Lorem Ipsum</span></div></div>' +
        '  <div class="content" style="height: 300vh;"><span>Lorem Ipsum</span></div>' +
        '</div>';

        const stickySidebar = new StickySidebar('.sidebar', {
          containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
        });

        window.addEventListener('scroll', (event) => {
          mockRaf.step();
          assert.equal(stickySidebar.affixedType, 'VIEWPORT-BOTTOM');
          done();
        }, {once: true})

        window.scrollTo(0, (window.innerHeight) + 75)
      })
 
      it('Should sidebar has `container-bottom` affix type. (sidebar doesn\'t fit the viewport)', (done) => {
        fixture.innerHTML = '<div class="container">' + 
        '  <div class="sidebar"><div style="height: 150vh;" class="sidebar-inner"><span>Lorem Ipsum</span></div></div>' +
        '  <div class="content" style="height: 300vh;"><span>Lorem Ipsum</span></div>' +
        '</div>';

        const stickySidebar = new StickySidebar('.sidebar', {
          containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
        });

        window.addEventListener('scroll', () => { 
          mockRaf.step();
          assert.equal(stickySidebar.affixedType, 'CONTAINER-BOTTOM');
          done();
        }, {once: true})
        
        window.scrollTo(0, document.body.scrollHeight - window.innerHeight)
      })
    })

    describe('When scrolling top.', () => {
         
      it('Should sidebar has `viewport-top` affix type.', (done) => {
        fixture.innerHTML = '<div class="container">' + 
        '  <div class="sidebar"><div class="sidebar-inner" style="height: 50vh"><span>Lorem Ipsum</span></div></div>' +
        '  <div class="content"><span>Lorem Ipsum</span></div>' +
        '</div>';
        
        const stickySidebar = new StickySidebar('.sidebar', {
          containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
        })

        const scrollToBottomDocument = () => new Promise( (resolve) => {
          window.addEventListener('scroll', () => {
            mockRaf.step();
            resolve();
          }, {once: true});
          
          window.scrollTo(0, document.body.scrollHeight - window.innerHeight);
        });

        const scrollOnViewportTopAffix = (scrollTop) => new Promise( (resolve, reject) => {
          window.addEventListener('scroll', (event) => {
            mockRaf.step();
            
            try{
              assert.equal(stickySidebar.affixedType, 'VIEWPORT-TOP');
              resolve();
            } catch(error){
              done(error);
              reject();
            }
          }, {once: true});

          window.scrollTo(0, parseInt(scrollTop));
        })
        
        scrollToBottomDocument()
          .then(() => scrollOnViewportTopAffix(76))
          .then(() => scrollOnViewportTopAffix(100))
          .then(() => scrollOnViewportTopAffix(1000))
          .then(() => scrollOnViewportTopAffix(1200))
          .then(done);
      })
      
      it('Should sidebar has `static` affix type.', (done) => {
        fixture.innerHTML = '<div class="container">' + 
        '  <div class="sidebar"><div class="sidebar-inner"><span>Lorem Ipsum</span></div></div>' +
        '  <div class="content"><span>Lorem Ipsum</span></div>' +
        '</div>';

        const stickySidebar = new StickySidebar('.sidebar', {
          containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
        })

        scrollTo(0, document.body.scrollHeight - window.innerHeight); // Scroll to end of the document.
        
        const scrollOnStaticAffix = (scrollTop) => new Promise((resolve, reject) => {
          window.addEventListener('scroll', (event) => {
            mockRaf.step()

            try{
              assert.equal(stickySidebar.affixedType, 'STATIC');
              resolve();
            } catch(error) {
              done(error);
              reject();
            }
          }, {once: true});

          window.scrollTo(0, parseInt(scrollTop));
        })

        scrollOnStaticAffix(74)
          .then(() => scrollOnStaticAffix(40))
          .then(() => scrollOnStaticAffix(0))
          .then(done);
      });

      it('Should sidebar has `viewport-unbottom` affix type. (Sidebar doesn\'t fit viewport)', (done) => {
        fixture.innerHTML = '<div class="container">' + 
        '  <div class="sidebar"><div style="height: 150vh;" class="sidebar-inner"><span>Lorem Ipsum</span></div></div>' +
        '  <div class="content" style="height: 300vh;"><span>Lorem Ipsum</span></div>' +
        '</div>';

        const stickySidebar = new StickySidebar('.sidebar', {
          containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
        })

        const scrollTo = (scrollTop) => new Promise( (resolve, reject) => {
          window.addEventListener('scroll', (event) => {
            mockRaf.step();
            resolve();
          }, {once: true})

          window.scrollTo(0, parseInt(scrollTop));
        });
        
        scrollTo(window.innerHeight + 75)
          .then(() => scrollTo((window.innerHeight * 0.75) + 75) )
          .then(() => {
            try{
              assert.equal(stickySidebar.affixedType, 'VIEWPORT-UNBOTTOM');
              done();
            } catch(error){
              done(error);
            }
          });
      })
    })
  })

  describe('getStyle', () => {
    
    it('Should get style properties of `static` or undefined affix type currectly.', (done) => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', topSpacing: 60, bottomSpacing: 60
      });

      window.addEventListener('scroll', (event) => {
        assert.deepOwnInclude( stickySidebar._getStyle('STATIC'), {
          inner: {position: 'relative', top: '', bottom: '', left: '', width: '', transform: ''},
          outer: {height: '', position: ''}
        });
        done();
      }, {once: true});
      
      window.scrollTo(0, 70);
    });

    it('Should get style properties of `viewport-top` affix type currectly.', (done) => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', topSpacing: 60, bottomSpacing: 60
      });
      
      window.addEventListener('scroll', function onScroll(event){
        mockRaf.step();
        
        assert.deepOwnInclude( stickySidebar._getStyle('VIEWPORT-TOP'), {
          inner: {position: 'fixed', top: 60, bottom: '', left: 100, width: 200, transform: ''},
          outer: {height: 300, position: 'relative' }
        });
        done();
      }, {once: true});
      
      window.scrollTo(0, 100);
    });

    it('Should get style properties of `viewport-bottom` affix type currectly.', (done) => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><div style="height: 150vh;" class="sidebar-inner"><span>Lorem Ipsum</span></div></div>' +
      '  <div class="content" style="height: 300vh;"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', innerWrapperSelector: '.sidebar-inner',
        topSpacing: 60, bottomSpacing: 60
      });

      window.addEventListener('scroll', (event) => {
        mockRaf.step();

        assert.deepOwnInclude( stickySidebar._getStyle('VIEWPORT-BOTTOM'), {
          inner: {position: 'fixed', top: 'auto', bottom: 60, left: 100, width: 200, transform: ''},
          outer: {height: Math.round(window.innerHeight * 1.5), position: 'relative'}
        });
        done();
      }, {once: true})

      window.scrollTo(0, Math.round(window.innerHeight * 2));
    });

    it('Should get style properties of `container-bottom` affix type currectly.', (done) => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', topSpacing: 0, bottomSpacing: 0
      });

      window.addEventListener('scroll', (event) => {
        mockRaf.step();
        
        assert.deepOwnInclude( stickySidebar._getStyle('CONTAINER-BOTTOM'), {
          inner: { position: 'relative', top: '', left: '', bottom: '', width: '',
            transform: 'translate3d(0, 1700px, 0)'},
          outer: {height: 300, position: 'relative'}
        });
        done();
      }, {once: true});

      window.scrollTo(0, document.body.scrollHeight - window.innerHeight);
    })

    it('Should get style properties of `viewport-unbottom` affix type currectly.', (done) => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><div class="sidebar-inner" style="height: 150vh;"><span>Lorem Ipsum</span></div></div>' +
      '  <div class="content" style="height: 300vh;"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
      })

      const scrollTo = (scrollTop) => new Promise((resolve, reject) => {
        window.addEventListener('scroll', (event) => {
          mockRaf.step();
          resolve();
        }, {once: true})

        window.scrollTo(0, (scrollTop));
      });

      scrollTo(window.innerHeight + 75)
        .then(() => scrollTo((window.innerHeight * 0.8) + 75))
        .then(() => {
          mockRaf.step();

          try{  
            assert.deepOwnInclude( stickySidebar._getStyle('VIEWPORT-UNBOTTOM'), {
              inner: { position: 'relative', top: '', left: '', bottom: '', width: '',
                transform: 'translate3d(0, '+ Math.round(parseInt(window.innerHeight / 2) - stickySidebar.options.bottomSpacing) +'px, 0)' },
              outer: {height: Math.round(window.innerHeight * 1.5), position: 'relative'}
            })
          } catch(error){
            done(error);
            return;
          }
          done();
        })
    })
  });

  describe('stickyPosition', () => {

    it('Should add/remove options.stickyClass class currectly.', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>'; 

      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
      })

      assert.isNotTrue(stickySidebar.sidebar.classList.contains(stickySidebar.options.stickyClass));
    });

    it('Should fire `affix.static` and `affixed.static` event.', (done) => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';
      
      const stickySidebar = new StickySidebar('.sidebar', { containerSelector: '.container' });
      
      stickySidebar.sidebar.addEventListener('affix.static.stickySidebar', (event) => {
        stickySidebar.sidebar.addEventListener('affixed.static.stickySidebar', (event) => {
          done()
        }, {once: true});
      }, {once: true})

      const scrollTo = (scrollTop) => new Promise((resolve, reject) => {
        window.addEventListener('scroll', (event) => {
          mockRaf.step();
          resolve();
        }, {once: true});
        window.scrollTo(0, parseInt(scrollTop));
      });

      scrollTo(300)
        .then(() => scrollTo(40));
    })

    it('Should fire `affix.viewport-top` and `affixed.viewport-top` event currectly.', (done) => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', { containerSelector: '.container' });
      const sidebar = stickySidebar.sidebar;

      window.addEventListener('scroll', (event) => {

        sidebar.addEventListener('affix.top.stickySidebar', () => {
          sidebar.addEventListener('affixed.top.stickySidebar', () => {
            done()
          }, {once: true});
        }, {once: true});

        mockRaf.step();
      }, {once: true});
      window.scrollTo(0, 100);
    })

    it('Should fire `affix.viewport-bottom` and `affixed.viewport-bottom` event.', (done) => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><div style="height: 150vh" class="sidebar-inner"><span>Lorem Ipsum</span></div></div>' +
      '  <div class="content" style="height: 300vh"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', { 
        containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
      });

      window.addEventListener('scroll', (event) => {
        stickySidebar.sidebar.addEventListener('affix.bottom.stickySidebar', (event) => {
          stickySidebar.sidebar.addEventListener('affixed.bottom.stickySidebar', () => {
            done()
          }, {once: true})
        }, {once: true})

        mockRaf.step();
      }, {once: true});

      window.scrollTo(0, (window.innerHeight * 1.5) + 75);
    })

    it('Should fire `affix.viewport-unbottom` and `affixed.viewport-unbottom` event.', (done) => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><div style="height: 150vh;" class="sidebar-inner"><span>Lorem Ipsum</span></div></div>' +
      '  <div class="content" style="height: 300vh;"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', innerWrapperSelector: '.sidebar-inner'
      });

      const scrollTo = (scrollTop) => new Promise((resolve, reject) => {
        window.addEventListener('scroll', (event) => {
          mockRaf.step();
          resolve();
        }, {once: true})

        window.scrollTo(0, parseInt(scrollTop));
      });

      stickySidebar.sidebar.addEventListener('affix.unbottom.stickySidebar', () => {
        stickySidebar.sidebar.addEventListener('affixed.unbottom.stickySidebar', () => {
          done()
        }, {once: true});
      }, {once: true})

      scrollTo(window.innerHeight + 75)
        .then(() => scrollTo((window.innerHeight * 0.8) + 75));
    })

    it('Should fire `affix.container-bottom` and `affixed.container-bottom` event.', (done) => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', {containerSelector: '.container'});

      window.addEventListener('scroll', (event) => {
        stickySidebar.sidebar.addEventListener('affix.container-bottom.stickySidebar', () => {
          stickySidebar.sidebar.addEventListener('affixed.container-bottom.stickySidebar', () => {
            done()
          }, {once: true});
        }, {once: true})

        mockRaf.step();
      }, {once: true})
      
      window.scrollTo(0, document.body.scrollHeight - window.innerHeight);
    })
  })

  describe('widthBreakpoint', () => {

    it('Should stickness be broken if options.minWidth bigger than viewport width.', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><div class="sidebar-inner"><span>Lorem Ipsum</span></div></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar', {
        containerSelector: '.container', innerWrapperSelector: '.sidebar-inner', minWidth: 500
      })

      stickySidebar.dimensions.viewportWidth = 400;
      stickySidebar._widthBreakpoint();

      assert.isNull(stickySidebar.sidebar.getAttribute('style'))
      assert.isNull(stickySidebar.sidebarInner.getAttribute('style'));
      assert.isNotTrue(stickySidebar.sidebar.classList.contains(stickySidebar.options.stickyClass));
    })
  })
  
  describe('destroy', () => {

    it('Should sticky sidebar be destroyed completely on its element.', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const stickySidebar = new StickySidebar('.sidebar');
      stickySidebar.destroy();

      assert.isNotTrue(stickySidebar.sidebar.classList.contains(stickySidebar.options.stickyClass));
      assert.isNull(stickySidebar.sidebar.getAttribute('style'));
      assert.isNull(stickySidebar.sidebarInner.getAttribute('style'));
    });
  });

  describe('jQuery', () => {

    it('should return jquery collection containing the element', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      const $sidebar = $('.sidebar');
      const $stickySidebar = $sidebar.stickySidebar();
      assert.isTrue($stickySidebar instanceof $);
      assert.equal($sidebar[0], $stickySidebar[0])
    });

    it('should throw explicit error on undefined method', () => {
      fixture.innerHTML = '<div class="container">' + 
      '  <div class="sidebar"><span>Lorem Ipsum</span></div>' +
      '  <div class="content"><span>Lorem Ipsum</span></div>' +
      '</div>';

      assert.throws(() => { $('.sidebar').stickySidebar('noMethod'); }, 'No method named "noMethod"');
    });
  }); 
});