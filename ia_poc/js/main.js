window.onload = function() {
    var snapper = new Snap({
        element: document.getElementById("content")
    });
    
    snapper.disable();
    
    
    document.getElementById("snap-button").addEventListener('click', function() {
        if( snapper.state().state=="left" ){
            snapper.close();
        } else {
            snapper.open('left');
        }
    });
    
}