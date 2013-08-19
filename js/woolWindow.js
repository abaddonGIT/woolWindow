/******************************************************
 * Copyright 2013 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * @version 1.0.0
 * ***************************************************/
/*global window, $, jQuery, document */
(function ($) {
    "use strict";

    $.fn.woolWindow = function (options) {
        var def = {

        }, w;

        $.extend(def, options);

        return this.each(function () {

            w = new woolWondow(this, def);
        });
    };
} (jQuery));