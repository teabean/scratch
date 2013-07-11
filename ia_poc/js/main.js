define(["jquery", "mustache", "text!../templates/box_template.html", "abpify"], function(jQuery, mustache, template, abpify) {
    ABPIFY.init("CHNXh3w4uNTWiSVZdHTEQTCvpdHPvXC6NK2DlWKgH2CyqC3v6N4f-9vMvFUMPc_1MF9C7RhlFZF14GUP5SuJ2A==");
    $("#abp_toolbar").abpify({showDebug: true});
    
    var content = $("#content");
    var hideBets = false;
    var betsFromKey = -1;
    var accountsFromKey = -1;
    var failedBetsFromKey = -1;
    var payrecsFromKey = -1;
    var betSlipsFromKey = -1;
    
    var isAutoFetching = false;
    var autoFetchMillis = 5000;
    var fetchInterval = null;
    
    $("#auto_fetch").click(function() {
        if (isAutoFetching) {
            isAutoFetching = false;
            $("#auto_fetch").text("Start Auto Fetch");
            window.clearInterval(fetchInterval);
        } else {
            isAutoFetching = true;
            $("#auto_fetch").text("Stop Auto Fetch");
            
            fetchInterval = window.setInterval(function () {
                ABPIFY.ajax("GET", "/rest/instantaction?fromKey=" + -1 + "&type=ALL&betsFromKey=" + betsFromKey + "&accountsFromKey=" + accountsFromKey + "&failedBetsFromKey=" + failedBetsFromKey + "&transactionsFromKey=" + payrecsFromKey + "&betSlipsFromKey=" + betSlipsFromKey, null, function(data) {
    			if (data) {
                    betsFromKey = data.lastBetsKey;
                    accountsFromKey = data.lastAccountsKey;
                    failedBetsFromKey = data.lastFailedBetsKey;
                    payrecsFromKey = data.lastTransactionsKey;
                    betSlipsFromKey = data.lastBetSlipsKey;
                    
                    for (var i = 0; i < data.betList.length; i++) {
                        add_box(data.betList[i], "bet");
                    }
                    
                    for (var i = 0; i < data.accountList.length; i++) {
                        add_box(data.accountList[i], "new_account");
                    }
                    
                    for (var i = 0; i < data.failedBetsList.length; i++) {
                        add_box(data.failedBetsList[i], "failed_bet");
                    }
    			    
                    for (var i = 0; i < data.transactionList.length; i++) {
                        add_box(data.transactionList[i], "payrec");
                    }
    			}
    			})
            }, autoFetchMillis);
        }
    });
    
    $("#fetch_all").click(function() {
        ABPIFY.ajax("GET", "/rest/instantaction?fromKey=" + -1 + "&type=ALL&betsFromKey=" + betsFromKey + "&accountsFromKey=" + accountsFromKey + "&failedBetsFromKey=" + failedBetsFromKey + "&transactionsFromKey=" + payrecsFromKey + "&betSlipsFromKey=" + betSlipsFromKey, null, function(data) {
			if (data) {
			    console.log(data);
                betsFromKey = data.lastBetsKey;
                accountsFromKey = data.lastAccountsKey;
                failedBetsFromKey = data.lastFailedBetsKey;
                payrecsFromKey = data.lastTransactionsKey;
                betSlipsFromKey = data.lastBetSlipsKey;
                
                for (var i = 0; i < data.betList.length; i++) {
                    add_box(data.betList[i], "bet");
                }
                
                for (var i = 0; i < data.accountList.length; i++) {
                    add_box(data.accountList[i], "new_account");
                }
                
                for (var i = 0; i < data.failedBetsList.length; i++) {
                    add_box(data.failedBetsList[i], "failed_bet");
                }
			    
                for (var i = 0; i < data.transactionList.length; i++) {
                    add_box(data.transactionList[i], "payrec");
                }
			}
		});
    });
    
    $("#fetch_bets").click(function() {
		ABPIFY.ajax("GET", "/rest/instantaction?fromKey=" + betsFromKey + "&type=BETS", null, function(data) {
			if (data) {
			    betsFromKey = data.lastBetsKey;
			    for (var i = 0; i < data.betList.length; i++) {
    			    console.log(data.betList[i]);
    			    add_box(data.betList[i], "bet");
			    }
			}
		});
	});
	
	$("#fetch_accounts").click(function() {
		ABPIFY.ajax("GET", "/rest/instantaction?fromKey=" + accountsFromKey + "&type=ACCOUNTS", null, function(data) {
			if (data) {
			    accountsFromKey = data.lastAccountsKey;
			    for (var i = 0; i < data.accountList.length; i++) {
    			    console.log(data.accountList[i]);
    			    add_box(data.accountList[i], "new_account");
			    }
			}
		});
	});
	
	$("#fetch_failed_bets").click(function() {
		ABPIFY.ajax("GET", "/rest/instantaction?fromKey=" + failedBetsFromKey + "&type=FAILED_BETS", null, function(data) {
			if (data) {
			    failedBetsFromKey = data.lastFailedBetsKey;
			    for (var i = 0; i < data.failedBetsList.length; i++) {
    			    console.log(data.failedBetsList[i]);
    			    add_box(data.failedBetsList[i], "failed_bet");
			    }
			}
		});
	});
	
	$("#fetch_payrecs").click(function() {
		ABPIFY.ajax("GET", "/rest/instantaction?fromKey=" + payrecsFromKey + "&type=TRANSACTIONS", null, function(data) {
			if (data) {
			    payrecsFromKey = data.lastTransactionsKey;
			    for (var i = 0; i < data.transactionList.length; i++) {
    			    console.log(data.transactionList[i]);
    			    add_box(data.transactionList[i], "payrec");
			    }
			}
		});
	});
	
	var add_box = function(data, type) {
    	// Store the type for later use
        data.type = type;
        

        // Get the colour for the left hand box and the label descriptions
        var gradient = null;
        
        // Data differs based on type
        var amount = null;
        var contentLabel = null;
        var contentSubLabel = null;
        var accountDescription = null;
        var description = null;
        
        switch (type) {
            case "bet":
                amount = data.unitStake;
                if (amount < 5.01) {
                    gradient = "bgpink";
                } else if (amount < 15.01) {
                    gradient = "bglightblue2";
                } else if (amount < 25.01) {
                    gradient = "bgorangey";
                } else {
                    gradient = "bggold";
                }
                contentLabel = "£" + amount;
                contentSubLabel = data.transactionSubTypeDescription;
                accountDescription = data.accountDescription;
                description = data.description;
                break;
            case "new_account":
                gradient = "bggreen";
                contentLabel = "New";
                contentSubLabel = "Account";
                accountDescription = data.lastName + ", " + data.firstName;
                description = data.email;
                break;
            case "failed_bet":
                gradient = "bgred";
                amount = data.unitStake;
                contentLabel = "Failed";
                contentSubLabel = "Bet";
                break;
            case "payrec" :
                gradient = "bgbronze";
                amount = data.credit > 0 ? data.credit : data.debit;
                contentLabel = "£" + amount;
                contentSubLabel = "Payrec";
                accountDescription = data.account.lastName + ", " + data.account.firstName;
                description = data.description;
                break;
        }

        
        // Use Mustache to populate the template
        var result = mustache.render(template, { 
            "background_gradient" : gradient,
            "left_content" : contentLabel, 
            "left_sub_label" : contentSubLabel,
            "account_description" : accountDescription, 
            "account_username" : data.userName ? data.userName.toLowerCase() : data.account.userName.toLowerCase(),
            "account_number" : data.accountNumber,
            "description" : description,
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

