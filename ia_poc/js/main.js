define(["jquery", "mustache", "text!../templates/box_template.html", "abpify"], function(jQuery, mustache, template, abpify) {
    ABPIFY.init("CHNXh3w4uNTWiSVZdHTEQTCvpdHPvXC6NK2DlWKgH2CyqC3v6N4f-9vMvFUMPc_1MF9C7RhlFZF14GUP5SuJ2A==");
    $("#abp_toolbar").abpify({showDebug: true});
    
    var boxCount = 0;

    var query_params = getQueryParams(document.location.search);
    setupFilters(query_params);
    setupSettings();
    
    // Get the query params from the url
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
    
    // Sets up the filters in the slide out menu
    function setupFilters(params) {
        // Default to true if the param has not been specified
        $("#bets-check").prop("checked", params.bets === undefined ? true : params.bets === "true");
        $("#accounts-check").prop("checked", params.new_accounts === undefined ? true : params.new_accounts === "true");
        $("#payrecs-check").prop("checked", params.payrecs === undefined ? true : params.payrecs === "true");
        $("#failed-bets-check").prop("checked", params.failed_bets === undefined ? true : params.failed_bets === "true");
        
        // Min/Max stake
        var minStake = params.min_stake;
        var maxStake = params.max_stake;
        
        if (+minStake > +maxStake) {
            minStake = maxStake;
            updateHistory("min_stake", minStake);
        }
        
        $("#min-stake").val(minStake);
        $("#max-stake").val(maxStake);
        
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
            // Make sure everything is shown/hidden
            $("#content .bet").each(function() {
                showBox(showBets, $(this));
                
                // If we are showing bets we also want to check them against our bet filters
                if (showBets) {
                    checkBetFilters($(this));
                }
            });
            
            $("#content .new_account").each(function() {
                showBox(showNewAccounts, $(this));
            });
            
            $("#content .payrec").each(function() {
                showBox(showPayrecs, $(this));
            });
            
            $("#content .failed_bet").each(function() {
                showBox(showFailedBets, $(this));
            });
        } else {
            var data = singleBox.data("data");
            var data_type = data.instantActionType;
            
            if (data_type === "bet") {
                showBox(showBets, singleBox);
                
                if (showBets) {
                    checkBetFilters(singleBox);
                }
            } else if (data_type === "account") {
                showBox(showNewAccounts, singleBox);
            } else if (data_type === "payrec") {
                showBox(showPayrecs, singleBox);
            } else if (data_type === "failed_bet") {
                showBox(showFailedBets, singleBox);
            }
        }
        
        function showBox(show, box) {
            if (show) {
                box.show();
            } else {
                box.hide();
            } 
        }
        
        function checkBetFilters(box) {
            // Check bet sport
            var show = true;
            var data = box.data("data");
            
            var sportChecked = $("#" + data.sportCode).prop("checked");
            show &= sportChecked;
            
            if (show) {
                // Check the unit stake
                var minStake = $("#min-stake").val();
                var maxStake = $("#max-stake").val(); 
                
                if (minStake.length == 0 && maxStake.length > 0) {
                    show = data.unitStake <= +maxStake;
                } else if (maxStake.lemgth == 0 && minStake.length > 0) {
                    show = data.unitStake >= +minStake;
                } else if (minStake.length > 0 && maxStake.length > 0) {
                    show = +minStake <= data.unitStake && +maxStake >= data.unitStake;
                }
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
    
    // Look up settings from local storage
    function setupSettings() {
        var showUsername = localStorage.getItem("showUsername");
        var showAccountNumber = localStorage.getItem("showAccountNumber");
        
        $("#showUsername").prop("checked", showUsername == null ? true : showUsername === "true");
        $("#showAccountNumber").prop("checked", showAccountNumber == null ? true : showAccountNumber === "true");
        
        var maxRows = localStorage.getItem("maxRows");
        maxRows = maxRows == null ? 500 : maxRows; // Default to 500
        $("#max-rows").val(maxRows);
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
    var autoFetchMillis = 5000;
    
    // Start listening for activity
    window.setInterval(function () {
        ABPIFY.ajax("GET", "/rest/instantaction?fromKey=" + -1 + "&type=ALL&betsFromKey=" + betsFromKey + "&accountsFromKey=" + accountsFromKey + "&failedBetsFromKey=" + failedBetsFromKey + "&transactionsFromKey=" + payrecsFromKey + "&betSlipsFromKey=" + betSlipsFromKey + "&allMaxResults=" + +$("#max-rows").val(), null, function(data) {
    		if (data) {
                betsFromKey = data.lastBetsKey;
                accountsFromKey = data.lastAccountsKey;
                failedBetsFromKey = data.lastFailedBetsKey;
                payrecsFromKey = data.lastTransactionsKey;
                betSlipsFromKey = data.lastBetSlipsKey;
                
                for (var i = 0; i < data.allItems.length; i++) {
                    if (data.allItems[i].instantActionType === "betslip") {
                        
                    } else {
                        addBox(data.allItems[i]);
                    }
                }
    		}
        })
    }, autoFetchMillis);
    
    // Add a box to the content section for the appropriate type (E.g. Bet, New account etc)
	function addBox(data) {
    	// Store the type for later use
        var type = data.instantActionType;
        
        if (type === undefined) {
            // It's an account
            type = "account";
        }

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
            case "account":
                gradient = "bggreen";
                contentLabel = "New";
                contentSubLabel = "Account";
                accountDescription = data.lastName + ", " + data.firstName;
                description = data.email;
                break;
            case "failed_bet":
                gradient = "bgred";
                amount = data.unitStake;
                contentLabel = "£" + amount;
                contentSubLabel = "Failed Bet";
                accountDescription = data.account.lastName + ", " + data.account.firstName;
                description = data.description;
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
            "account_username" : data.userName ? data.userName.toLowerCase() : (data.username ? data.username.toLowerCase() : data.account.userName.toLowerCase()),
            "account_number" : data.accountNumber,
            "description" : description,
            "right_footer_left" : type === "bet" ? "Potential Win £" + data.potentialWin : "",
            "right_footer_middle" : type === "bet" ? "Total Stake £" + data.betTotalCost : "",
            "right_footer_right" : ""          
        });
        
        // Add the result to the page
        content.prepend(result);
        boxCount++;
        
        // TODO Need to make this just one function that updates all times every X seconds or so.
        // Now start calculating the time since the item was created
        var justAdded = $("#content .box").first();
        justAdded.addClass(type);
        justAdded.data("data", data);
        
        // Update time
        updateTime(justAdded);
        
        // Check to see if we should be displaying this box
        boxFilter(justAdded);

        // Hide fields that are meant to be hidden
        if ($("#showUsername").prop("checked")) {
            justAdded.find(".account_username").show();
        } else {
            justAdded.find(".account_username").hide();
        }
        
        if ($("#showAccountNumber").prop("checked")) {
            justAdded.find(".account_number").show();
        } else {
            justAdded.find(".account_number").hide();
        }

        // If we have more than max row items we need to start removing the older ones. Note, once it's gone it's gone, if the max rows is increased it's too bad.
        if (boxCount > +$("#max-rows").val()) {
            $("#content .box").last().remove();
        }
	}
	
	// Start a timer that updates all the times 
	var timeCheck = 15000;
	window.setTimeout(function() {
	     $("#content .box").each(function() {
             updateTime($(this));
	     });
	     
	    setTimeout(arguments.callee, timeCheck);
	}, timeCheck);
	
	function updateTime(box) {
    	var created_date = box.data("data").createDate;
    	
    	if (created_date == null) {
        	// Account have createdDate instead :@
        	created_date = box.data("data").createdDate;
    	}
    	
    	if (created_date != null) {
    	     // Removing the timezone for now, not sure why it doesn't like it in when parsing?
    	     created_date = created_date.substring(0, created_date.indexOf("+"));
    /*     	     Date.parse(created_date, "yyyy-MM-dd'T'HH:mm:ss.SSS") */
    	     
            var date = new Date();
            var seconds = Math.round((date.getTime() - new Date(created_date).getTime()) / 1000);
            var minutes = 59;
            
            var prettyDate = "Less than 1m ago";
            
            if (seconds > 59) {
              minutes = Math.floor(seconds / 60);
              prettyDate = "About " + minutes + "m ago";
            }  
            
            if (minutes > 59 && seconds > 59) {
              var hours = Math.floor(minutes / 60);
              prettyDate = "About " + hours + "h ago";
            }
      
            box.find(".right_footer_right").html(prettyDate);
        } 
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
           updateHistory("max_stake", minStake);
       }
       
       updateHistory("min_stake", minStake);
       boxFilter();
    });
    
    $("#max-stake").on("input", function() {
        // Note: '+' is kind of short hand for parseInt
       var minStake = +$("#min-stake").val();
       var maxStake = +$("#max-stake").val(); 
       
       // Don't allow the max stake to go below the min stake
       if (maxStake < minStake) {
            $("#min-stake").val(maxStake); 
            updateHistory("min_stake", maxStake);
       }
       
       updateHistory("max_stake", maxStake);
       boxFilter();
    });
    
    $("#showUsername").click(function() {
        $(".account_username").toggle();
        localStorage.setItem("showUsername", $("#showUsername").prop("checked"));
    });
    
    $("#showAccountNumber").click(function() {
        $(".account_number").toggle();
        localStorage.setItem("showAccountNumber", $("#showAccountNumber").prop("checked"));
    });
    
    $("#max-rows").on("input", function() {
       var maxRows = +$("#max-rows").val(); 
       localStorage.setItem("maxRows", maxRows);
    });
    
    // When the back button is selected reload the filters to see what changed
    /*
window.addEventListener("popstate", function(e) {
        var params = getQueryParams(document.location.search);
        setupFilters(params)
    });
*/

    // Accordion buttons	
	$('.accordionButton').click(function() {
		$('.accordionContent').slideUp('normal');	
		if ($(this).next().is(":hidden")) {
    		$(this).next().slideDown('normal');
        } 
	});
 
	// Hide all accordions to start with	
	$(".accordionContent").hide();
  
/*     $("#main-nav .accordionContent:first").slideDown('normal'); */
});

