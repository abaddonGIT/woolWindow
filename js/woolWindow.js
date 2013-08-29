/******************************************************
 * Copyright 2013 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * @description всплывающее окно
 * @version 1.0.0
 * ***************************************************/
/*global window, $, jQuery, document */
(function($) {
    "use strict";
    var H = $('html'),
            d = document,
            D = $(d),
            w = window,
            W = $(w),
            img;

    function woolWindow(el, def) {
        this.el = el;
        this.con = def;
        this.sizes = this.getWindowSize();

        console.log(this.sizes);
        //строим каркас
        this.buildWindow();
        //подключаем нужные события
        this.addEvent();

    }
    ;

    woolWindow.prototype.addEvent = function() {
        var F = this;

        W.bind('resize.w', function() {
            //перестраиваем каркас
            F.rebuild();
        });
    };

    /*
     * Перестройка каркаса под новые размеры браузера
     */
    woolWindow.prototype.rebuild = function() {
        var sizes = this.getWindowSize(), def = this.con, bg = this.bg, wr = this.wr, wl = this.wl, wc = this.wc, cw = sizes.xS - 100;

        bg.style.height = sizes.wH + 'px';
        wr.style.cssText = 'width:' + sizes.wW + 'px; height:' + sizes.wH + 'px;';
        wl.style.width = sizes.xS + 'px';
        //проверка минмальной ширины
        if (cw < def.minWidth) {
            wc.style.width = def.minWidth + 'px';
        } else {
            if (cw > def.maxWidth) {
                wc.style.width = def.maxWidth + 'px';
            } else {
                wc.style.width = cw + 'px';
            }
        }

//        switch (def.type) {
//            case 'image':
//                if (img === undefined) {
//                    img = wc.querySelector('img.woolImg');
//                }
//
//                var newSize = [], Ih = 1080, Iw = 1920, newH = sizes.wH - def.padding - def.indentBot, //новая высота картинки
//                        newW = cw - def.inPadding * 2;//новая ширина картинки
//
//                //проверка на минимальные значения
//
//                if (newH < def.minHeight) {
//                    newH = def.minHeight;
//                }
//
//                if (newH > Ih) {
//                    newH = Ih;
//                }
//
//                if (Iw / newW > Ih / newH) {
//                    newSize[0] = newW;
//                    newSize[1] = Math.ceil(Ih * newW / Iw);
//                } else {
//                    newSize[0] = Math.ceil(Iw * newH / Ih);
//                    newSize[1] = newH;
//                }
//
//                img.style.width = newSize[0] + 'px';
//                img.style.height = newSize[1] + 'px';
//
//                break;
//        }
    };

    /*
     * Преобразует полученный html в объект dom и возвращает его
     * @param {String} html строка
     */
    woolWindow.prototype.createEl = function(html) {
        var bl = document.createElement('div');
        bl.innerHTML = html;
        var el = bl.childNodes[0];
        bl.removeChild(el);
        return el;
    };

    woolWindow.prototype.buildWindow = function() {
        var def = this.con, img, el = this.el, sizes = this.sizes, bg, wr, wl, wc, wb, ch, cw, ww, wh, content, k, newH, newW, newSize = [];

        //добавляем задний фон
        bg = this.createEl(def.tpl.bgWool);
        bg.style.height = sizes.wH + 'px';
        this.bg = bg;
        //добавляем обертку для окна
        wr = this.createEl(def.tpl.wrapWool);
        wr.style.cssText = 'width:' + sizes.wW + 'px; height:' + sizes.wH + 'px;';
        this.wr = wr;
        //вставляем внутрь блок с учетом возможного скрола
        wl = this.createEl(def.tpl.woolLayer);
        wl.style.width = sizes.xS + 'px';
        this.wl = wl;

        //определяем ширину поля контента
        this.wc = wl.querySelector('div.wool-content');

        var cw = sizes.xS - 100;
        //проверка на минимальный и максимальный размер
        if (cw < def.minWidth) {
            cw = def.minWidth;
        } else {
            if (cw > def.maxWidth) {
                cw = def.maxWidth;
            }
        }

        this.wc.style.width = cw + 'px';

        this.wb = wl.querySelector('div.woolBox');
        this.wt = wl.querySelector('div.woolTop');

        this.wb.style.padding = def.inPadding + 'px';

        //добавляем контент в блок

        switch (def.type) {
            case 'image':
                //подгоняем размер картинки под окно
                img = new Image();
                img.src = el.href;
                //это настоящие размеры
                var Ih = img.height;
                var Iw = img.width;

                newH = sizes.wH - def.padding - def.indentBot;//новая высота картинки
                newW = cw - def.inPadding * 2;//новая ширина картинки

                //проверка на минимальные значения

                if (newH < def.minHeight) {
                    newH = def.minHeight;
                }

                if (newH > Ih) {
                    newH = Ih;
                }

                if (Iw / newW > Ih / newH) {
                    newSize[0] = newW;
                    newSize[1] = Math.ceil(Ih * newW / Iw);
                } else {
                    newSize[0] = Math.ceil(Iw * newH / Ih);
                    newSize[1] = newH;
                }



                //надо сделать так чтобы картинка попадала в область экрана
                content = this.createEl('<img src=' + el.href + ' class="woolImg" style="width: ' + newSize[0] + 'px; height: ' + newSize[1] + 'px;" alt="" />');
                //console.log(k + '_' + k2);
                console.log(newSize);

                break;
        }

        //Добавляем контент в окно
        this.wb.appendChild(content);

        wr.appendChild(wl);

        $('body').append(bg).append(wr);

    };
    /*
     * Ф-я определяет размеры окна и страницы и возвращает их в виде объект
     * @param {Object} объект содержит размеры окна
     */
    woolWindow.prototype.getWindowSize = function() {
        var xScroll, yScroll, pageWidth, pageHeight, windowWidth, windowHeight, sizes = {}, doc = d.documentElement;

        //ширина и высота с учетом скролла
        if (w.innerHeight && w.scrollMaxY) {
            xScroll = d.body.scrollWidth;
            yScroll = w.innerHeight + w.scrollMaxY;
        } else if (d.body.scrollHeight > d.body.offsetHeight) { // all but Explorer Mac
            xScroll = d.body.scrollWidth;
            yScroll = d.body.scrollHeight;
        } else if (doc && doc.scrollHeight > doc.offsetHeight) { // Explorer 6 strict mode
            xScroll = doc.scrollWidth;
            yScroll = doc.scrollHeight;
        } else { // Explorer Mac...would also work in Mozilla and Safari
            xScroll = d.body.offsetWidth;
            yScroll = d.body.offsetHeight;
        }

        if (self.innerHeight) { // all except Explorer
            windowWidth = self.innerWidth;
            windowHeight = self.innerHeight;
        } else if (doc && doc.clientHeight) { // Explorer 6 Strict Mode
            windowWidth = doc.clientWidth;
            windowHeight = doc.clientHeight;
        } else if (d.body) { // other Explorers
            windowWidth = d.body.clientWidth;
            windowHeight = d.body.clientHeight;
        }

        // for small pages with total height less then height of the viewport
        if (yScroll < windowHeight) {
            pageHeight = windowHeight;
        } else {
            pageHeight = yScroll;
        }

        // for small pages with total width less then width of the viewport
        if (xScroll < windowWidth) {
            pageWidth = windowWidth;
        } else {
            pageWidth = xScroll;
        }

        return sizes = {
            'pW': pageWidth,
            'pH': pageHeight,
            'wW': windowWidth,
            'wH': windowHeight,
            'xS': xScroll,
            'yS': yScroll
        };
    };

    $.fn.woolWindow = function(options) {
        var def = {
            'minHeight': 550,
            'minWidth': 550,
            'maxWidth': 1024,
            'maxHeight': 9999,
            'marginTop': 10,
            'padding': 10,
            'inPadding': 15,
            'indentBot': 200,
            'indentHor': 100,
            'type': 'image',
            'tpl': {
                'bgWool': '<div class="wool-bg"></div>',
                'wrapWool': '<div class="wool-wrap"></div>',
                'woolLayer': '<div class="wool-layer">' +
                        '<div class="wool-content">' +
                        '<table cellspacing="0" cellpadding="0">' +
                        '<tbody>' +
                        '<tr>' +
                        '<td>' +
                        '<div class="woolBox">' +
                        '</div>' +
                        '</td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '</div>' +
                        '</div>',
                'woolContent': '',
                'imgTpl': '<img src="{src}" class="woolImage" />'
            }
        }, w;

        $.extend(def, options);

        return this.each(function() {

            w = new woolWindow(this, def);
        });
    };
}(jQuery));