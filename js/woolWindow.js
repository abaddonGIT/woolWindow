/******************************************************
 * Copyright 2013 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * @version 1.0.0
 * ***************************************************/
/*global window, $, jQuery, document */
(function ($) {
    "use strict";
    
    var H = $('html'),
        W = $(window),
        D = $(document);
        
    

    $.fn.woolWindow = function (options) {
        var def = {
            'minWidth': 500,
            'minHeight': 500,
            'padding': 10,
            'marginTop': 10,
            'tpl': {
                'wrap': '<div class="wool-wrap"></div>'
            }
        }, w;

        $.extend(def, options);

        return this.each(function () {

            w = new woolWindow(this, def);
        });
    };
} (jQuery));