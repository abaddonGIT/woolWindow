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
            img, imgH, imgW, wool;

    $.woolWindow = function () {
        woolWindow.prototype[arguments[0]]();
    }        

    function woolWindow(el, def) {
        this.el = el;
        this.con = def;
        this.sizes = this.getWindowSize();

        console.log(this.sizes);
        //строим каркас
        this.buildWindow();
        //подключаем нужные события
        this.addEvent();

    };

    woolWindow.prototype.addEvent = function() {
        var F = this, def = this.con;

        W.bind('resize.w', function() {
            //перестраиваем каркас
            F.rebuild();
        });
        //закрытие окна
        $(d).on('click', '.wool-close', function () {
            F.close();
            return false;
        });
    };

    /*
     * Перестройка каркаса под новые размеры браузера
     */
    woolWindow.prototype.rebuild = function() {
        var sizes = this.getWindowSize(), def = this.con, bg = this.bg, wr = this.wr, wl = this.wl, wc = this.wc, cw = sizes.xS - 100, ch = sizes.wH, newSize = [];

        bg.style.height = sizes.wH + 'px';
        wr.style.cssText = 'width:' + sizes.wW + 'px; height:' + sizes.wH + 'px;';
        wl.style.width = sizes.xS + 'px';
        //проверка минмальной ширины
        if (!def.fixSize) {//если включен фиксированный размер, то обновля ются только размеры контейнеров
            if (cw < def.minWidth) {
                cw = def.minWidth;
            } else {
                if (cw > def.maxWidth) {
                    cw = def.maxWidth;
                } 
            }

            switch (def.type) {
                case 'image':
                case 'content':
                    if (img !== null) {
                        //находим картинку внутри блока
                        newSize = this.changeSize(sizes, imgH, imgW, cw);
                        
                        img.style.cssText = 'width: ' + newSize[0] + 'px; height: ' + newSize[1] + 'px'; 
                        cw = newSize[0] + def.inPadding*2;

                        if (cw < def.minWidth) {
                            cw = def.minWidth;
                        } else {
                            if (cw > def.maxWidth) {
                                cw = def.maxWidth;
                            }
                        }
                    }

                    break;
            };

            wc.style.width = cw + 'px';
        }
    };

    /*
    * Закрывает окно просмотра
    */

    woolWindow.prototype.close = function () {
        img = imgH = imgW = 0;
        if (this.wb === undefined || this.wr === undefined) {
            H.find('div.wool-bg').remove();
            H.find('div.wool-wrap').remove();
        } else {
            $(this.bg).remove();
            $(this.wr).remove();
        }

        W.unbind('resize.w');
        $('body').css('overflow', 'auto');
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
        var def = this.con, el = this.el, sizes = this.sizes, bg, wr, wl, wc, wb, ch, cw, ww, wh, content, k, newH, newW, newSize = [], wb_h, wb_m, contentHTML;

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

        this.wb = wl.querySelector('div.woolBox');
        this.wt = wl.querySelector('div.woolTop');

        this.wb.style.padding = def.inPadding + 'px';

        //добавляем контент в блок

        switch (def.type) {
            case 'image':
                //создаем изображение
                img = new Image();
                img.src = el.href;
                //это настоящие размеры
                imgH = img.height;
                imgW = img.width;
                //вычисляем новые размеры
                newSize = this.changeSize(sizes, imgH, imgW, cw);

                img.style.cssText = 'width: ' + newSize[0] + 'px; height:' + newSize[1] + 'px;';
                img.className = 'woolImg';

                if (newSize[0] + def.inPadding * 2 < def.minWidth) {
                    cw = def.minWidth;
                }

                contentHTML = img;

                break;
            case 'content':
                var contentHTML = this.createEl(def.content);
                img = contentHTML.querySelector('img.woolImg');
                
                if (img !== null) {
                    //это настоящие размеры
                    imgH = img.height;
                    imgW = img.width;

                    //вычисляем новые размеры
                    newSize = this.changeSize(sizes, imgH, imgW, cw);

                    console.log(sizes +'_'+ imgH +'_'+ imgW +'_'+ cw);

                    img.style.cssText += 'width: ' + newSize[0] + 'px; height:' + newSize[1] + 'px;';
                    
                    if (newSize[0] + def.inPadding * 2 < def.minWidth) {
                        cw = def.minWidth;
                    }
                }

                break;
        }

        content = contentHTML;

        //Добавляем контент в окно
        wb_h = this.wb.querySelector('div.wool-head');
        wb_m = this.wb.querySelector('div.wool-mid');

        if (content !== undefined) {
            wb_m.appendChild(content);
        }

        wr.appendChild(wl);

        //console.log(newSize[0] + '||' + cw);

        this.wc.style.width = cw + 'px';
       //this.wb_h.style.width = cw - def.inPadding*2 + 'px';

        $('body').css('overflow', 'hidden').append(bg).append(wr);

    };

    /*
    * Ф-я изменения размера блока 
    * @param {Int} imgH - оригинальная высота
    * @param {Int} imgW - оригинальная ширина
    * @param {Int} cw - ширана блока контейнера
    */

    woolWindow.prototype.changeSize = function (sizes, imgH, imgW, cw) {
        var newSize = [], newH, newW, def = this.con;

        newH = sizes.wH - def.padding - def.indentBot;//новая высота картинки
        newW = cw - def.inPadding * 2;//новая ширина картинки

        console.log(newH + '||' + newW);

        //проверка на минимальные значения

        if (newH < def.minHeight) {
            newH = def.minHeight;
        }

        if (newH > imgH) {
            newH = imgH;
        }

        if (imgW / newW > imgH / newH) {
            newSize[0] = newW;
            newSize[1] = Math.ceil(imgH * newW / imgW);
        } else {
            newSize[0] = Math.ceil(imgW * newH / imgH);
            newSize[1] = newH;
        } 

        return newSize;
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

    /*
    * Выводит ошибки скрипта
    */
    woolWindow.prototype.errors = function (text) {
        alert(text);
    };

    $.fn.woolWindow = function(options) {
        var def = {
            'minHeight': 400,
            'minWidth': 550,
            'maxWidth': 1024,
            'maxHeight': 9999,
            'padding': 10,
            'inPadding': 15,
            'indentBot': 100,
            'indentHor': 100,
            'fixSize': false,
            'type': 'content',
            'content': '<div><img src="img/001.jpg" class="woolImg" alt="" /><div>Curabitur egestas fermentum pulvinar. Pellentesque accumsan pulvinar orci a blandit. Suspendisse dapibus consectetur ultrices. Phasellus sed felis tortor. Morbi feugiat congue interdum. Proin fringilla scelerisque turpis, a ornare magna vehicula a. Duis consectetur felis in augue imperdiet varius. Donec vitae bibendum magna. Vivamus laoreet sed elit eu adipiscing. Integer blandit laoreet molestie. Nulla eget ante a purus commodo adipiscing a eget sapien. Ut sit amet accumsan nibh. Sed pretium neque quam, vel convallis leo molestie et. Aenean dictum tempor ligula, sit amet placerat enim malesuada ac. Quisque et nulla venenatis, placerat lorem quis, ornare sapien.'+
'Vestibulum tincidunt quam turpis, sit amet imperdiet sem pulvinar id. Duis sodales sagittis sagittis. Vivamus ligula dolor, adipiscing ut nisl non, pellentesque aliquet sapien. Integer lobortis eleifend consectetur. Suspendisse potenti. In hac habitasse platea dictumst. Ut neque libero, dapibus in malesuada in, consequat tempus ipsum. Sed id vulputate erat, id convallis nunc. Phasellus eu mattis metus. Mauris nec eros pretium, accumsan risus ut, tempus quam. Fusce ut magna ut ligula ullamcorper vehicula id eget enim. Suspendisse potenti. Morbi lobortis lobortis semper. Vestibulum quis ligula enim.' +
'Nullam pellentesque feugiat turpis sit amet laoreet. Nulla tempus ipsum sed nisl mattis congue. Duis rhoncus tellus vel auctor rutrum. Nunc luctus arcu at cursus gravida. Sed condimentum elit eget neque elementum fringilla. Morbi facilisis metus ipsum, suscipit iaculis dolor iaculis in. Etiam semper, urna at mollis feugiat, mi tellus egestas libero, a lobortis risus velit vitae risus. Donec eu nulla sem. Nulla varius metus eget nunc lacinia tristique. Etiam lobortis pulvinar aliquam. Praesent auctor ante quam, eu vestibulum ipsum posuere id.</div></div>',
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
                            '<a href="#" style="float: right;" class="wool-close">закрыть</a>' +
                            '<div class="wool-head">' +
                            '</div>' +
                            '<div class="wool-mid">' +

                            '</div>' +
                        '</tr>' +
                        '</div>' +
                        '</td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '</div>' +
                        '</div>'
            }
        }, w;

        $.extend(def, options);

        return this.each(function() {
            w = new woolWindow(this, def);
        });
    };
}(jQuery));