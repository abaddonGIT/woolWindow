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
    	W = $(w);

    function woolWindow (el, def) {
    	this.el = el;
    	this.con = def;
    	this.sizes = this.getWindowSize();

    	console.log(this.sizes);
    	//строим каркас
    	this.buildWindow();
    	//подключаем нужные события
    	this.addEvent();

    };

    woolWindow.prototype.addEvent = function () {
    	var F = this;

    	W.bind('resize.w', function () {
    		//перестраиваем каркас
    		F.rebuild();
    	});
    };

    /*
    * Перестройка каркаса под новые размеры браузера
    */
    woolWindow.prototype.rebuild = function () {
    	var sizes = this.getWindowSize(), bg = this.bg, wr = this.wr, wl = this.wl;

    	bg.style.height = sizes.wH + 'px';
    	wr.style.cssText = 'width:' + sizes.wW + 'px; height:' + sizes.wH + 'px;';
    	wl.style.width = sizes.xS + 'px';
    };

    /*
    * Преобразует полученный html в объект dom и возвращает его
    * @param {String} html строка
    */
    woolWindow.prototype.createEl = function (html) {
    	var bl = document.createElement('div');
    	bl.innerHTML = html;
    	var el = bl.childNodes[0];
    	bl.removeChild(el);
        return el;
    };

    woolWindow.prototype.buildWindow = function () {
    	var def = this.con, img, el = this.el, sizes = this.sizes, bg, wr, wl, wc, wb, ch, cw, ww, wh, content;

    	//тут еще надо выдернуть то, что потом вставим в окно
    	switch (def.type) {
    		case 'image':
    			//надо определить размеры картинки
    			img = new Image();
    			img.src = el.href;
    			//это настоящие размеры
    			ch = img.height;
    			cw = img.width;

    			var newH = sizes.wH - def.padding - 200;

    			//надо сделать так чтобы картинка попадала в область экрана


    			//content = this.createEl('<img src=' + el.href + ' alt="" />');
    			//content.style.width = cw + 'px';
    			//content.style.height = ch + 'px';

    			console.log(newH);

    			break;
    	}
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

    	this.wc = wl.querySelector('div.wool-content');
    	this.wc.style.width = ww + 'px';

    	this.wb = wl.querySelector('div.woolBox');
    	this.wb.style.padding = def.inPadding + 'px';
    	//this.wb.appendChild(content);

    	wr.appendChild(wl);

    	$('body').append(bg).append(wr);

    };
    /*
    * Ф-я определяет размеры окна и страницы и возвращает их в виде объект
    * @param {Object} объект содержит размеры окна
    */
    woolWindow.prototype.getWindowSize = function () {
    	var xScroll, yScroll, pageWidth, pageHeight, windowWidth, windowHeight, sizes = {}, doc = d.documentElement;
 
    	//ширина и высота с учетом скролла
		if (w.innerHeight && w.scrollMaxY) {
			xScroll = d.body.scrollWidth;
			yScroll = w.innerHeight + w.scrollMaxY;
		} else if (d.body.scrollHeight > d.body.offsetHeight){ // all but Explorer Mac
			xScroll = d.body.scrollWidth;
			yScroll = d.body.scrollHeight;
		} else if (doc && doc.scrollHeight > doc.offsetHeight){ // Explorer 6 strict mode
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
		if(yScroll < windowHeight){
			pageHeight = windowHeight;
		} else {
			pageHeight = yScroll;
		}
	 
		// for small pages with total width less then width of the viewport
		if(xScroll < windowWidth){
			pageWidth = windowWidth;
		} else {
			pageWidth = xScroll;
		}
	 
		return sizes = {
			'pW':pageWidth,
			'pH':pageHeight,
			'wW':windowWidth,
			'wH':windowHeight,
			'xS':xScroll,
			'yS':yScroll
		};
	};

    $.fn.woolWindow = function (options) {
        var def = {
        	'minHeight': 500,
        	'minWidth': 750,
        	'maxWidth': 1280,
        	'maxHeight': 9999,
        	'marginTop': 10,
        	'padding': 10,
        	'inPadding': 15,
        	'type': 'image',
        	'tpl': {
        		'bgWool': '<div class="wool-bg"></div>',
        		'wrapWool': '<div class="wool-wrap"></div>',
        		'woolLayer': '<div class="wool-layer">' + 
        						'<div class="wool-content">' +
        							'<table cellspacing="0" cellpadding="0">' +
        								'<tbody>' +
        									'<tr>' +
        										'<td></td>' +
        										'<td>' +
        											'<div class="woolBox">' +

        											'</div>' +
        										'</td>' +
        										'<td></td>' +
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

        return this.each(function () {

            w = new woolWindow(this, def);
        });
    };
} (jQuery));