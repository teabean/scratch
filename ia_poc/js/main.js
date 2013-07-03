define(["jquery", "mustache", "text!../templates/box_template.html", "abpify"], function(jQuery, mustache, template, abpify) {
    ABPIFY.init("CHNXh3w4uNTWiSVZdHTEQTCvpdHPvXC6NK2DlWKgH2CyqC3v6N4f-9vMvFUMPc_1MF9C7RhlFZF14GUP5SuJ2A==");
    $("#abp_toolbar").abpify({showDebug: true});
    
    var content = $("#content");
    var hideBets = false;
    var running_mustache = false;
    var fromKey = -1;
    
    $("#fetch_bets").click(function() {
		ABPIFY.ajax("GET", "/rest/instantaction?fromKey=" + fromKey + "&type=BETS", null, function(data) {
			if (data) {
			    fromKey = data.lastKey;
			    for (var i = 0; i < data.betList.length; i++) {
    			    console.log(data.betList[i]);
    			    add_box(data.betList[i]);
			    }
			}
		});
	});
	
	var add_box = function(data) {
        var type = "bet";
        data.type = type;
        var amount = data.unitStake;

        // Get the colour for the left hand box
        var gradient = null;
        switch (type) {
            case "bet":
                if (amount < 5.01) {
                    gradient = "bgpink";
                } else if (amount < 15.01) {
                    gradient = "bglightblue2";
                } else if (amount < 25.01) {
                    gradient = "bgorangey";
                } else {
                    gradient = "bggold";
                }
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

        
        // Use Mustache to populate the template
        var result = mustache.render(template, { 
            "background_gradient" : gradient,
            "left_content" : type !== "new_account" ? "£" + amount : "New", 
            "left_sub_label" : type === "bet" ? data.transactionSubTypeId : type === "new_account" ? "Account" : test_data.type_description, 
            "account_description" : data.accountDescription, 
            "account_username" : data.account.userName,
            "account_number" : data.accountNumber,
            "description" : data.description,
            "right_footer_left" : type === "bet" ? "Potential Win £" + data.potentialWin : "",
            "right_footer_middle" : type === "bet" ? "Total Stake £" + data.betTotalCost : "",
            "right_footer_right" : ""          
        });
        
        // Add the result to the page
        content.prepend(result);
        
        // Now start calculating the time since the item was created
        var justAdded = $("#content .box").first();
        var timeSection = justAdded.find(".right_footer_right");
        var bet_create_date = data.createDate;

        justAdded.data("data", data);
            
        window.setTimeout(function() {
            var date = new Date();
            var seconds = Math.round((date.getTime() - new Date(bet_create_date).getTime()) / 1000);
            // If date is from json --> new Date(bet_create_date).getTime()
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
        
        // Example of reading back data at a later stage
        justAdded.click(function() {
            console.log(justAdded.data("data").account.userName); 
        });

        // If it's a bet, should we be displaying it?
        if (hideBets && type === "bet") {
            justAdded.hide();
        }

	}
	
    $("#hide_bets").click(function() {
        if (hideBets) {
            hideBets = false;
            $("#hide_bets").text("Hide Bets");
        } else {
            hideBets = true;
            $("#hide_bets").text("Show Bets");
        }

        $("#content .box").each(function() {
            var type = $(this).data("data").type;
            
            if (type === "bet") {
                if (hideBets) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            } 
        });
    });
});

