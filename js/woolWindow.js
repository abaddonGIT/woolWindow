/******************************************************
 * Copyright 2013 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * @description всплывающее окно
 * @version 1.0.0
 * ***************************************************/
/*global window, $, jQuery, document */
(function ($) {
    "use strict";
    var H = $('html'),
            d = document,
            D = $(d),
            w = window,
            colFlag = 0,
            W = $(w),
            img, imgH, imgW, content, wool, imageCollection, index, fragments,
            Content = function (contentStrategy) {
                this.contentStrategy = contentStrategy;
            };

    $.woolWindow = function () {
        woolWindow.prototype[arguments[0]](arguments[1]);
    };

    Content.prototype.render = function (Wool, cw, data) {
        return this.contentStrategy(Wool, cw, data);
    };

    /*
    *Стратегии рендеринга контента
    */

    //Для контента
    var contentRenderStrategy = function (Wool, cw, data) {
        var def = Wool.con, contentHTML, locImg, src, sizes = Wool.sizes, newSize = [];
        //проверяем нет ли в контенте изображения
        if (def.type === 'ajax') {
            contentHTML = Wool.createEl(data);
        } else {
            contentHTML = Wool.createEl(def.content);
        }

        locImg = contentHTML.querySelector('img.woolImg');
        if (locImg !== null) {
            src = locImg.src;
            Wool.getNewImage(src, function () {
                //вычисляем новые размеры
                newSize = Wool.changeSize(sizes, imgH, imgW, cw);
                locImg.style.cssText += 'width: ' + newSize[0] + 'px; height:' + newSize[1] + 'px;';
                if (newSize[0] + def.inPadding * 2 < def.minWidth) {
                    cw = def.minWidth;
                }
                img = locImg;
                locImg = null;
                Wool.show(sizes, contentHTML, cw);
            });
        } else {
            Wool.show(sizes, contentHTML, cw);
        }
    };
    //Для картинок
    var imageRenderStrategy = function (Wool, cw) {
        var def = Wool.con, contentHTML, description, locImg, src, sizes = Wool.sizes, el = Wool.el, newSize = [];
        
        description = el.querySelector('img').getAttribute('title');
        //добавляем описание в окно
        Wool.wb_f.innerHTML = description;
                
        Wool.getNewImage(el.href, function () {
            //вычисляем новые размеры
            newSize = Wool.changeSize(sizes, imgH, imgW, cw);
            img.style.cssText = 'width: ' + newSize[0] + 'px; height:' + newSize[1] + 'px;';
            img.className = 'woolImg';
            if (newSize[0] + def.inPadding * 2 < def.minWidth) {
                cw = def.minWidth;
            }
                contentHTML = img;
                Wool.show(sizes, contentHTML, cw);
        });
    };

    function woolWindow(el, def) {
        this.el = el;
        this.con = def;
        this.sizes = this.getWindowSize();
        //если тип image и не стоит флаг одиночного выбора тогда даем добро на создание коллекции
        if (def.type === "image" && !def.justOne) {
            colFlag = 1;
        }
        //строим каркас
        this.buildWindow();

        wool = this;
    };

    /*
    * Получает настаящие размеры изображения
    */

    woolWindow.prototype.getNewImage = function (src, callback) {
        var Wool = this;
        img = new Image();
        img.src = src;
        img.onerror = function () {
            Wool.errors('Такого изображения не существует. Или был передан не правильный адрес.');
        };
        img.onload = function () {
            imgH = img.height;
            imgW = img.width;
            content = img;
            callback();
        };
    };

    /*
    * Вешает обработчики событий
    */
    woolWindow.prototype.addEvent = function() {
        var F = this, def = this.con, nextB = this.nextB, prevB = this.prevB, count = this.count, Wool = this, wb_m = this.wb_m, wb_f = this.wb_f;

        W.bind('resize.w', function() {
            //перестраиваем каркас
            F.rebuild();
        });
        //закрытие окна
        D.on('click.w', '.wool-close', function () {
            F.close();
            return false;
        });
        //навигация
        D.on('click.w', '.woolNext', function () {
            var next = imageCollection[index + 1], nextImg;

            if (next !== undefined) {
                nextImg = next.href;
                var description = next.querySelector('img').getAttribute('title');
                Wool.getNewImage(nextImg, function () {
                    //перестраиваем окно
                    Wool.rebuild();
                    //подменяем изображение
                    wb_f.innerHTML = description;
                    $(wb_m).html(content);

                    def.nextFunction(fragments, next);
                });
                index++;
                
                if (imageCollection[index + 1] === undefined) {
                    nextB.style.display = 'none';
                }
                prevB.style.display = 'block';
            }
            return false;
        });

        D.on('click.w', '.woolPrev', function () {
            var prev = imageCollection[index - 1], prevImg;

            if (prev !== undefined) {
                prevImg = prev.href;
                var description = prev.querySelector('img').getAttribute('title');
                Wool.getNewImage(prevImg, function () {
                    //перестраиваем окно
                    Wool.rebuild();
                    //подменяем изображение
                    wb_f.innerHTML = description;
                    $(wb_m).html(content);

                    def.prevFunction(fragments, prev);
                });
                index--;
                
                if (imageCollection[index - 1] === undefined) {
                    prevB.style.display = 'none';
                }
                nextB.style.display = 'block';
            }
            return false;
        });
    };

    /*
     * Перестройка каркаса под новые размеры
     */
    woolWindow.prototype.rebuild = function() {
        var sizes = this.getWindowSize(), def = this.con, bg = this.bg, wr = this.wr, wl = this.wl, wc = this.wc, cw = sizes.xS - 100, ch = sizes.wH, newSize = [];

        bg.style.height = sizes.wH + 'px';
        wr.style.cssText = 'width:' + sizes.wW + 'px; height:' + sizes.wH + 'px;';
        wl.style.width = sizes.xS + 'px';
        //проверка минимальной ширины
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
                case 'ajax':
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

                        def.afterUpdate(fragments, img, newSize[1], newSize[0]);
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
        img = imgH = imgW = content = imageCollection = index = null;

        wool.con.beforeClose(img);
        $(wool.bg).remove();
        $(wool.wr).remove();
        
        //Удаляем событие для ресайза
        W.unbind('resize.w');
        //адляем события переходов
        $(d).off('click.w');
        $('body').css('overflow', 'auto');
        wool = null;
    };
    /*
    * Подстраивает под новое изображение
    * param {String} адрес картинки на которую надо заменить
    */
    woolWindow.prototype.update = function (newImg) {
        var def = wool.con, newSize, sizes = wool.sizes, cw;

        cw = sizes.xS - 100;
        //проверка на минимальный и максимальный размер
        if (cw < def.minWidth) {
            cw = def.minWidth;
        } else {
            if (cw > def.maxWidth) {
                cw = def.maxWidth;
            }
        }

        wool.getNewImage(newImg, function () {
            //вычисляем новые размеры
            newSize = wool.changeSize(sizes, imgH, imgW, cw);
            img.style.cssText += 'width: ' + newSize[0] + 'px; height:' + newSize[1] + 'px;';
            $(img).addClass('woolImg');
            if (newSize[0] + def.inPadding * 2 < def.minWidth) {
                cw = def.minWidth;
            }
            
            wool.wc.style.width = cw + 'px';
            $(wool.wb_m).find('img.woolImg').replaceWith(img);
        });
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
        var def = this.con, Wool = this, el = this.el, sizes = this.sizes, bg, wr, wl, wc, wb, ch, cw, ww, wh, k, newH, newW, newSize = [], wb_h, wb_m, contentHTML;

        //добавляем задний фон
        bg = this.createEl(def.tpl.bgWool);
        bg.style.height = sizes.wH + 'px';
        bg.style.opacity = def.opacity;
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

        this.wb.style.padding = def.inPadding + 'px';

        //Добавляем контент в окно
        this.wb_h = this.wb.querySelector('div.wool-head');//шапка окна
        this.wb_m = this.wb.querySelector('div.wool-mid');//центральная часть окна
        this.wb_f = this.wb.querySelector('div.wool-footer');//подвал окна

        //добавляем контент в блок

        switch (def.type) {
            case 'ajax':
                var ajaxStrategy = new Content(contentRenderStrategy);
                this.getAjaxContent(function (data) {
                    //смотрим в каком формате передан ответ
                    if (data instanceof Object) {
                        console.log('json');
                    } else {
                        ajaxStrategy.render(Wool, cw, data);
                    }
                },cw);
                this.wb_f.innerHTML = def.title;
                break;
            case 'image':
                console.log('rebuild');
                var imageStrategy = new Content(imageRenderStrategy);
                imageStrategy.render(Wool, cw);
                break;
            case 'content':
                var contentStrategy = new Content(contentRenderStrategy);
                contentStrategy.render(Wool, cw);
                break;
                default:
        }
    };

    /*
    * Делает ajax запрос для получения контента
    * param {Object} ф-я после успешного запроса,
    * param {Int} ширина блока контента
    */

    woolWindow.prototype.getAjaxContent = function (callback, cw) {
        var def = this.con, aj = def.ajax;

        if (aj === undefined) {
            this.errors('параметер ajax не передан!');
        } else {
            //выполняем запрос
            $.ajax({
                'type': 'POST',
                'dataType': aj.dataType || 'html',
                'processData': aj.processData || false,
                'url': aj.url,
                'data': aj.data || null,
                'cache': aj.processData || false,
                'success': function (data) {
                    callback(data);
                }
            });
        }
    };

    /* 
    * Создает коллекцию изображений для листалки
    */
    woolWindow.prototype.createCollection = function () {
        //читае фттрибут rel или data-wool для находждения подобный элементов
        var el = this.el, def = this.con, imgMark = el.rel || el.getAttribute('data-wool'), count, prevB, nextB;

        if (imgMark !== undefined) {
            imageCollection = d.querySelectorAll('a[rel=' + imgMark + ']') || d.querySelectorAll('a[data-wool=' + imgMark + ']');
            imageCollection = $(imageCollection).toArray();
            //кол-во элементов в коллекции
            count = this.count = imageCollection.length;
            //определяем индек элемента на котором произошел вызов
            index = imageCollection.indexOf(el);
            //если разрешена навигация и в наборе больше одного элемента
            if (count > 1 && def.nav) {
                prevB = this.prevB = this.createEl(def.tpl.prevTpl);
                nextB = this.nextB = this.createEl(def.tpl.nextTpl); 

                if (imageCollection[index - 1] !== undefined) {//если есть предыдущий
                    this.prevB.style.display = 'block';
                }

                if (imageCollection[index + 1] !== undefined) {//если есть последуюший
                    this.nextB.style.display = 'block';
                } 

                this.wc.appendChild(this.prevB);
                this.wc.appendChild(this.nextB);

                setTimeout (function () {
                    if (nextB !== undefined) {
                        nextB.className += ' navShow';
                    }

                    if (prevB !== undefined) {
                        prevB.className += ' navShow';
                    }
                }, 700);
            }
        }
    };

    /*
    * Выводит окно с контентом
    */
    woolWindow.prototype.show = function (sizes, contentHTML, cw) {
        var  def = this.con, wb;
        content = contentHTML;

        if (content !== undefined) {
            this.wb_m.appendChild(content);
        }

        this.wr.appendChild(this.wl);
        this.wc.style.width = cw + 'px';

        $('body').css('overflow', 'hidden').append(this.bg).append(this.wr);
        //добавляем навигацию
        if (colFlag) {
            this.createCollection();
        }
        //добавляем обработчики событий
        this.addEvent();

        //тут добавляем эффекты при открытии
        switch (def.effect) {
            case 1:
                this.wb.className += ' wool-effect-1';
                break;
            case 2:
                this.wb.className += ' wool-effect-2';
                break;
            case 3: 
                this.wb.className += ' wool-effect-3';
                break;
            case 4: 
                this.wb.className += ' wool-effect-4';
                break;
            case 5: 
                this.wc.className += ' perspective';
                this.wb.className += ' wool-effect-5';
                break;
            case 6: 
                this.wc.className += ' perspective';
                this.wb.className += ' wool-effect-6';
                break;
            case 7: 
                this.wc.className += ' perspective';
                this.wb.className += ' wool-effect-7';
                break;
            case 8: 
                this.wc.className += ' perspective';
                this.wb.className += ' wool-effect-8';
                break;
            case 9: 
                this.wb.className += ' wool-effect-9';
                break;
            case 10: 
                this.wc.className += ' perspective';
                this.wb.className += ' wool-effect-10';
                break;
        };

        wb = this.wb;
        setTimeout(function () {
            $(wb).addClass('wool-show');
        }, 200);
        //ф-я после прогрузки окна
        fragments = {
            'wr': this.wr,
            'head': this.wb_h,
            'mid': this.wb_m,
            'footer': this.wb_f,
            'next': this.nextB,
            'prev': this.prevB
        };

        def.afterLoad(fragments, imageCollection, img, imgH, imgW);
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
            'opacity': 0.7,
            'effect': 9,
            'type': 'image',
            'ajax': {
                //'dataType': 'json',
                'processData': true,
                'url': 'test.php',
                'data': {"name":"миня"},
                'cache': false
            },
            'justOne': false,//пытается найти все подобные этому изображению и создать листалку
            'nav': true,
            'title': 'Тут какой-то заголовок',
            'content': '<div><img src="img/002.jpg" alt="" class="woolImg" /><div>Curabitur egestas fermentum pulvinar. Pellentesque accumsan pulvinar orci a blandit. Suspendisse dapibus consectetur ultrices. Phasellus sed felis tortor. Morbi feugiat congue interdum. Proin fringilla scelerisque turpis, a ornare magna vehicula a. Duis consectetur felis in augue imperdiet varius. Donec vitae bibendum magna. Vivamus laoreet sed elit eu adipiscing. Integer blandit laoreet molestie. Nulla eget ante a purus commodo adipiscing a eget sapien. Ut sit amet accumsan nibh. Sed pretium neque quam, vel convallis leo molestie et. Aenean dictum tempor ligula, sit amet placerat enim malesuada ac. Quisque et nulla venenatis, placerat lorem quis, ornare sapien.'+
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
                            '<div class="wool-footer">' +

                            '</div>' +
                        '</tr>' +
                        '</div>' +
                        '</td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '</div>' +
                        '</div>',
                'nextTpl': '<a href="#" class="woolNext">Вперед</a>',
                'prevTpl': '<a href="#" class="woolPrev">Назад</a>'
            },
            'afterLoad': function (fragments, collection, img, imgH, imgW) {},
            'beforeClose': function () {},
            'nextFunction': function(fragments, next){},
            'prevFunction': function(fragments, prev){},
            'afterUpdate': function (fragments, img, imgH, imgW){}
        }, w;

        $.extend(def, options);

        return this.each(function() {
            w = new woolWindow(this, def);
        });
    };
}(jQuery));