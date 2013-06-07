define(["jquery", "mustache", "text!../templates/box_template.html"], function($, mustache, template) {
    var content = $("#content");
    
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
        var gradient = gradient_array[Math.floor(Math.random() * gradient_array.length)];
        var amount = Math.floor(Math.random() * 100);
        var bet_type = bet_type_array[Math.floor(Math.random() * bet_type_array.length)];
        var bet_description = bet_descriptions_array[Math.floor(Math.random() * bet_descriptions_array.length)];
        
        var result = mustache.render(template, { 
            "background_gradient" : gradient,
            "left_content" : "£" + amount + ".00", 
            "left_sub_label" : bet_type, 
            "account_description" : "Tim Seed", 
            "account_username" : "seedt",
            "account_number" : "7428910",
            "description" : "GBP "  + amount + ".00 " + bet_type + bet_description,
            "right_footer_left" : "Potential Win £" + (amount * 3) + ".00",
            "right_footer_middle" : "Total Stake £" + amount + ".00",
            "right_footer_right" : "45s ago"
        });
        
        content.prepend(result);
    };
    
    $("#html_populate").click(function() {
        var i = 0;
        
        if (running_html) {
            running_html = false;
            $("#html_populate").text("Start HTML Populate");
            i = 0;
        } else {
            content.empty();
            running_html = true;
            runnning_mustache = false;
            $("#html_populate").text("Stop HTML Populate");
            
            setTimeout(function() {
                i++;
                if (running_html) {
                    html_add_box();
                    setTimeout(arguments.callee, Math.random() * 1500);
                }
            }, 500);
        }
    });
    
    var html_add_box = function() {
        content.prepend('<section class="box"><section class="left bglightblue2"><section class="left_content">&pound;5.00</section><section class="left_label">Single</section></section><section class="right"><section class="account_details"><section class="account_description">Timothy Seed</section><section class="account_username">seedt</section><section class="account_number">7428910</section></section><section class="description">GBP 5.00 Single: ARSENAL @ 2.00 [Win/Draw/Win - 90 Mins] - Arsenal vs Wigan Athletic Premier League</section><section class="right_footer"><section class="right_footer_left">Potential Win &pound;10.00</section><section class="right_footer_middle">Total Stake &pound;5.00</section><section class="right_footer_right">9m ago</section></section></section></section>');
    };
    
    var gradient_array = ["bglightblue", "bglightblue2", "bggreen", "bgred", "bggold", "bgpink", "bgbronze", "bgorangey"];
    var bet_type_array = ["Single", "Double", "Treble", "4-Fold", "Yankee", "10-Fold", "Patent", "System", "Scooby-Doo", "5-Fold", "6-Fold"];
    var bet_descriptions_array = [
        ": DRAW @ 3.00 [Win/Draw/Win - 90 Mins] - Everton vs Chelsea Premier League; LIVERPOOL @ 4.00 [Win/Draw/Win - 90 Mins] - Liverpool vs Arsenal Premier League",
        ": WIGAN ATHLETIC @ 4.00 [Win/Draw/Win - 90 Mins] - Arsenal vs Wigan Athletic Premier League",
        ": MANCHESTER UNITED @ 2.00 [Win/Draw/Win - 90 Mins] - Manchester United vs Sunderland Premier League",
        ": ARSENAL @ 2.00 [Win/Draw/Win - 90 Mins] - Arsenal vs Wigan Athletic Premier League; WIGAN ATHLETIC @ 4.00 [Win/Draw/Win - 90 Mins] - Arsenal vs Wigan Athletic Premier League; MANCHESTER UNITED @ 2.00 [Win/Draw/Win - 90 Mins] - Manchester United vs Sunderland Premier League"
    ];
});

