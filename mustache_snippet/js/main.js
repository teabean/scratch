window.onload = function() {
    // Example with a template from a String
    var template = "{{text}}";
    var firstDiv = document.getElementById("first");
    var data = { "text" : "Hello Moustache :{"};
    
    // Note it is 'Mustache' (Upper case first letter)
    firstDiv.innerHTML = "<p>" + Mustache.render(template, data) + "</p>"; 
    
    // Example from a template file.
    // In this case we don't have require.js so cannot use text plugin to get the template for us, have to load in the file and handle it manually, no error handling here, can do this with jquery
    var client = new XMLHttpRequest();
    // Relative to the index.html
    client.open('GET', 'js/templates/test_mustache.html');
    client.onreadystatechange = function() {
        var test2 = client.responseText;
        var secondDiv = document.getElementById("second");
        secondDiv.innerHTML = Mustache.render(test2, {"test" : "Loaded from template"});
        // Note in this example the template file does NOT have the html, head, body etc tags as we don't want to have to strip the body out.
    }
    client.send();
}
