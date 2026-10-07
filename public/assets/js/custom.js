/**
 * ======================================
 * template settings
 * ======================================
 */

(function($) {
    "use strict";

    // color switcher
    $(".color-trigger").on("click", function() {
        $(this).parent().toggleClass("visible-palate");
        $(this).hide();
        $(".close-color-trigger").show();
    });

    $(".close-color-trigger").on("click", function() {
        $(this).parent().toggleClass("visible-palate");
        $(this).hide();
        $(".color-trigger").show();
    });


    // dark version
    var layoutChangerBtn = $(".color-palate .dark-version li");
    var body = $("body");
    layoutChangerBtn.on("click", function(e) {
        var $this = $(this);
        if ($this.hasClass("box")) {
            body.addClass("dark-body");
        } else {
            body.removeClass("dark-body");
        }
    });

    

})(jQuery);