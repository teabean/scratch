define(["jquery", "mustache", "text!../templates/box_template.html"], function($, mustache, template) {
    var content = $("#content");
    
    $(window).scroll(function(eventObject) {
        // do stuff! You can find out about how far the window has scrolled via the eventObject.
/*         console.log(eventObject); */
    });
    
    var running_mustache = false;
    var running_html = false;
    
    $("#mustache_populate").click(function() {
        var i = 0;
        
        if (running_mustache) {
            running_mustache = false;
            $("#mustache_populate").text("Start Mustache Populate");
            i = 0;
        } else {
            content.empty();
            running_mustache = true;
            runnning_html = false;
            $("#mustache_populate").text("Stop Mustache Populate");
            
            setTimeout(function() {
                i++;
                if (running_mustache) {
                    mustache_add_box();
                    setTimeout(arguments.callee, Math.random() * 1500);
                } 
                
                if (i > 500) {
                    // Remove the last box, we are at our limit
                    $("#content .box").last().remove();
                }
                
            }, 500);
        }
    }); 
    
    var mustache_add_box = function() {
        $.getJSON("json/test.js", function(data) {
            var test_data = data.mydata[Math.floor(Math.random() * data.mydata.length)];
            console.log(test_data);
            
            var type = test_data.type;
            var gradient = null;
            switch (type) {
                case "bet":
                    gradient = "bggold";
                    break;
                case "new_account":
                    gradient = "bggreen";
                    break;
                case "failed_bet":
                    gradient = "bgred";
                    break;
                case "payrec" :
                    gradient = "bgbronze";
                    break;
            }
/*             gradient_array[Math.floor(Math.random() * gradient_array.length)]; */
            var amount = Math.floor(Math.random() * 100);
            
            var bet_create_date = new Date();
            var time = new Date();
            
            var result = mustache.render(template, { 
                "background_gradient" : gradient,
                "left_content" : "£" + amount + ".00", 
                "left_sub_label" : type === "bet" ? test_data.bet_type : type, 
                "account_description" : test_data.account_description, 
                "account_username" : test_data.username,
                "account_number" : test_data.account_number,
                "description" : test_data.description,
                "right_footer_left" : "Potential Win £" + (amount * 3) + ".00",
                "right_footer_middle" : "Total Stake £" + amount + ".00",
                "right_footer_right" : time          
            });
            
            content.prepend(result);
            
            // This kills it.
    /*         animate($("#content .box").first(), "animated bounceInLeft"); */
            
            var justAdded = $("#content .box").first();
            var timeSection = justAdded.find(".right_footer_right");
/*             justAdded.attr("id", time.getTime()); */
            
            // We can add the json data to the added item for future reference
            justAdded.data("data", test_data);
            
            window.setTimeout(function() {
                var date = new Date();
                var seconds = Math.round((date.getTime() - bet_create_date.getTime()) / 1000);
                var minutes = 59;
                
                var prettyDate = seconds + "s ago";
                
                // We can play with this timeout to make things easier on the cpu
                var newTimeout = 15000;
                
                if (seconds > 59) {
                  minutes = Math.floor(seconds / 60);
                  prettyDate = minutes + "m ago";
                  newTimeout = 20000;
                }  
                
                if (minutes > 59 && seconds > 59) {
                  var hours = Math.floor(minutes / 60);
                  prettyDate = hours + "h ago";
                  newTimeout = 60000;
                }
          
                timeSection.html("About " + prettyDate);
                setTimeout(arguments.callee, newTimeout);
            }, 0);
            
            justAdded.click(function() {
                console.log(justAdded.data("data").username); 
            });

        });
    
    };
    
    // Perform the given css animation on the given element. Once complete we remove the css animation so the element can be animated again later if we need.
    function animate(element, animation) {
        element.addClass(animation);
        
        // Can't call clearAnimation here as browser caches styling changes until the js has finished executing and then performs them in one go. 
        // So we end up seeing no animation. Instead we can check once the animation has finished and then remove the animation classes.
        element.on("webkitAnimationEnd", function() {
            // Note this is only for webkit (Not that we are worried about anything but webkit, other browsers use different names e.g. oanimationend for Opera)
            clearAnimation(element, animation);
        });
    }
    
    var gradient_array = ["bglightblue", "bglightblue2", "bggold", "bgpink", "bgbronze", "bgorangey"];
});

