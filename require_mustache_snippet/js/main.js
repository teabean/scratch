define(["jquery", "mustache", "text!templates/test_mustache.html"], function($, mustache, template) {
    var result = mustache.render(template, { "test" : "Hooray!", "test3" : "This works"});
    $("#whatever").html(result);
});