window.onload = function() {
    
    // Display a time in the div box to demonstrate that we are not reloading the page when the a tags are selected
    var div = document.getElementById("box");
    var date = new Date();
    div.innerHTML = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    
    // Add listeners to the a tags
    setupHistoryClicks();
    
    // Ensure our div gets coloured if a param has been passed
    changeColour(location.href);
    
    function setupHistoryClicks() {
        addClicker(document.getElementById("red"));
        addClicker(document.getElementById("blue"));
        addClicker(document.getElementById("green"));
    }
    
    function addClicker(link) {
        link.addEventListener("click", function(e) {
            // When the link is clicked change the colour of the box div
            changeColour(link.href);
            // Use the history api to change the url etc
            history.pushState(null, null, link.href);
            // Catch and ignore the link 
            e.preventDefault();
        }, false);
    }
    
    function changeColour(href) {
        // Get the params from the url
        var params = href.substring(href.indexOf("?") + 1, href.length);
        
        // Change the class of the div based on the supplied param
        if (params === "colour=red") {
            div.className = "red";
        } else if (params === "colour=blue") {
            div.className = "blue";
        } else if (params === "colour=green") {
            div.className = "green";
        }
    }
    
    // When the back button is selected we take the previous url and put it through our change colour function.
    window.addEventListener("popstate", function(e) {
        changeColour(location.href);
        console.log(location.search);
    });
};