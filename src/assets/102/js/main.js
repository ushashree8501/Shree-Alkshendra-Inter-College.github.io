'use strict';
$.fn.headlinesTicker = function () {
    let thisTicker = $(this), intervalID, timeoutID, isPause = false;
    thisTicker.wrap("<div class='headlinesticker-wrap'></div>");
    thisTicker.parent().css({
        position: 'relative'
    });
    thisTicker.children("li").not(":first").hide();

    var ticker = function () {
        thisTicker.find('li:first').detach().appendTo(thisTicker);
        thisTicker.children("li").not(":first").removeClass("animated flash").hide();
        thisTicker.children("li:first").addClass("animated flash").show();
    };
    var tickerTimer = setInterval(ticker, 10000);
    $(this).hover(function () { clearInterval(tickerTimer) }, function () { tickerTimer = setInterval(ticker, 10000); });
};
$("#headlines ul").headlinesTicker();