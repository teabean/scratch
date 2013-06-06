$("div[id^='omg']").click(function() {  
  $(this).removeClass("unflexy");
  $(this).addClass("flexy");
  
  $(this).siblings("div[id^='omg']").each(function() {
     $(this).removeClass("flexy");
    $(this).addClass("unflexy");
  });
});