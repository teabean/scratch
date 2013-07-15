define(["jquery", "mustache", "text!../templates/box_template.html", "abpify"], function(jQuery, mustache, template, abpify) {
    ABPIFY.init("CHNXh3w4uNTWiSVZdHTEQTCvpdHPvXC6NK2DlWKgH2CyqC3v6N4f-9vMvFUMPc_1MF9C7RhlFZF14GUP5SuJ2A==");
    $("#abp_toolbar").abpify({showDebug: true});

    var query_params = getQueryParams(document.location.search);
    setupFilters(query_params);
    
    function getQueryParams(qs) {
        qs = qs.split("+").join(" ");
        var params = {},
                    tokens,
                    re = /[?&]?([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;
    }
    
    function setupFilters(params) {
        // Default to true if the param has not been specified
        $("#bets-check").prop("checked", params.bets === undefined ? true : params.bets === "true");
        $("#accounts-check").prop("checked", params.new_accounts === undefined ? true : params.new_accounts === "true");
        $("#payrecs-check").prop("checked", params.payrecs === undefined ? true : params.payrecs === "true");
        $("#failed-bets-check").prop("checked", params.failed_bets === undefined ? true : params.failed_bets === "true");
        
        // Get Sports for sport filter
        ABPIFY.ajax("GET", "/rest/sports", null, function(data) {
            if (data) {
                var sportsDiv = $("#sports");
                
                for (var i = 0; i < data.length; i++) {
                    var sport = data[i];
                    sportsDiv.append("<section class='double-column'><div class='checkboxMini'><input type='checkbox' value='1' id='" + sport.code + "' name='' /><label for='" + sport.code + "'></label></div><label class='nav-label'>" + sport.description + "</label></section>");
                    
                    // Store sport code in the data
                    $("#" + sport.code).data("sport", sport);
                    
                    // If the sport is selected update the url
                    $("#" + sport.code).click(function() {
                        var checked = $(this).prop("checked");
                        updateHistory($(this).data("sport").code, checked);
                        boxFilter();
                    });
                    
                    // See if this sport was already selected via the params
                    $("#" + sport.code).prop("checked", params[sport.code] === undefined ? true : params[sport.code] === "true");
                }
            }
        });
    }
    
        
    // Show/Hide specified types from the content section    
    function boxFilter(singleBox) {
        var showBets = $("#bets-check").prop("checked");
        var showNewAccounts = $("#accounts-check").prop("checked");
        var showPayrecs = $("#payrecs-check").prop("checked");
        var showFailedBets = $("#failed-bets-check").prop("checked");

        // If we specify a specific box then just check filter against that box. Otherwise filter them all.
        if (singleBox == null) {
            $("#content .box").each(function() {filter($(this))});
        } else {
            filter(singleBox);
        }
        
        function filter(box) {
            var show = true;
            var data = box.data("data");
            var data_type = data.type;
            
            if (data_type === "bet") {
                show = showBets;
                
                // Check bet sport
                var sportChecked = $("#" + data.sportCode).prop("checked");
                show &= sportChecked;
                
                if (show) {
                    // Check the unit stake
                    var minStake = $("#min-stake").val();
                    var maxStake = $("#max-stake").val(); 
                    
                    if (minStake.length > 0 && maxStake.length > 0) {
                        show = minStake <= data.unitStake && maxStake >= data.unitStake;
                    }
                }
            } else if (data_type === "new_account") {
                show = showNewAccounts;
            } else if (data_type === "payrec") {
                show = showPayrecs;
            } else if (data_type === "failed_bet") {
                show = showFailedBets;
            }
            
            if (show) {
                box.show();
            } else {
                box.hide();
            }
        }
    }
    
    // Push history state, puts it in the url bar
    function updateHistory(key, value) {
        var params = getQueryParams(location.search);
        params[key] = value;
        history.pushState(null, null, location.href.substring(0, location.href.indexOf("?")) + buildQueryParamsString(params));
    }
    
    // Turns the given params into a query string (E.g. '?bets=true')
    function buildQueryParamsString(params) {
        var result = "?";
        
        $.each(params, function(key, value) {
            result += key + "=" + value + "&";
        });
        
        if (result.length === 1) {
            // Reset it to empty, don't want just the question mark
            result = "";
        } else {
            // Remove trailing &
            result = result.substring(0, result.lastIndexOf("&"));
        }
        
        return result;
    }

    // Look up content section to save having to search through the html everytime
    var content = $("#content");
    
    // Fetch keys
    var betsFromKey = -1;
    var accountsFromKey = -1;
    var failedBetsFromKey = -1;
    var payrecsFromKey = -1;
    var betSlipsFromKey = -1;
    
    // Fetch Instant Action Data
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
                        addBox(data.betList[i], "bet");
                    }
                    
                    for (var i = 0; i < data.accountList.length; i++) {
                        addBox(data.accountList[i], "new_account");
                    }
                    
                    for (var i = 0; i < data.failedBetsList.length; i++) {
                        addBox(data.failedBetsList[i], "failed_bet");
                    }
    			    
                    for (var i = 0; i < data.transactionList.length; i++) {
                        addBox(data.transactionList[i], "payrec");
                    }
    			}
    			})
            }, autoFetchMillis);
        }
    });
    
    // Add a box to the content section for the appropriate type (E.g. Bet, New account etc)
	function addBox(data, type) {
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
        
        // Check to see if we should be displaying this box
        boxFilter(justAdded);

        // TODO If we have more than 500 items we need to start removing the older ones.
	}
    
    // Handlers
    $("#bets-check").click(function() {
        // Is the box selected?
        var checked = $("#bets-check").prop("checked");
        updateHistory("bets", checked);
        boxFilter();
        
        // Note that we hide some bet filter sections if bets aren't visible.
        if (checked) {
            $("#stake-range-section").show();
            $("#sports-section").show();
        } else {
            $("#stake-range-section").hide();
            $("#sports-section").hide();
        }
    });
    
    $("#accounts-check").click(function() {
        var checked = $("#accounts-check").prop("checked");
        updateHistory("new_accounts", checked);
        boxFilter();
    });

    $("#payrecs-check").click(function() {
        var checked = $("#payrecs-check").prop("checked");
        updateHistory("payrecs", checked);
        boxFilter();
    });
    
    $("#failed-bets-check").click(function() {
        var checked = $("#failed-bets-check").prop("checked");
        updateHistory("failed_bets", checked);
        boxFilter();
    });
    
    $("#min-stake").on("input", function() {
       var minStake = +$("#min-stake").val();
       var maxStake = +$("#max-stake").val(); 
       
       // Don't allow the min stake to go above the max stake
       if (minStake > maxStake) {
           $("#max-stake").val(minStake);
       }
       
       boxFilter();
    });
    
    $("#max-stake").on("input", function() {
       var minStake = +$("#min-stake").val();
       var maxStake = +$("#max-stake").val(); 
       
       // Don't allow the max stake to go below the min stake
       if (maxStake < minStake) {
          $("#min-stake").val(maxStake); 
       }
       boxFilter();
    });
    
    // When the back button is selected reload the filters to see what changed
    /*
window.addEventListener("popstate", function(e) {
        var params = getQueryParams(document.location.search);
        setupFilters(params)
    });
*/

    //ACCORDION BUTTON ACTION	
	$('.accordionButton').click(function() {
		$('.accordionContent').slideUp('normal');	
		if ($(this).next().is(":hidden")) {
    		$(this).next().slideDown('normal');
        } 
	});
 
	//HIDE THE DIVS ON PAGE LOAD	
	$(".accordionContent").hide();
  
/*     $("#main-nav .accordionContent:first").slideDown('normal'); */
});

