import stickySidebar from './sticky-sidebar';

if( 'undefined' === typeof widow ) return;

const DATA_NAMESPACE = 'stickySidebar'
function jqueryPlugin(){
    return this.each(function(){
        var $this = $(this);
        var data = $(this).data(DATA_NAMESPACE);

        if( ! data ){
            data = new StickySidebar(this)
        }

    });
}