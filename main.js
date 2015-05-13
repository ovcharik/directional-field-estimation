(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Base, Canvas,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Base = require('./lib/base');

Canvas = (function(superClass) {
  extend(Canvas, superClass);

  Canvas.property('width', {
    get: function() {
      return this.el.width;
    }
  });

  Canvas.property('height', {
    get: function() {
      return this.el.height;
    }
  });

  Canvas.property('imageWidth', {
    get: function() {
      var ref, ref1;
      return (ref = (ref1 = this.image) != null ? ref1.naturalWidth : void 0) != null ? ref : 0;
    }
  });

  Canvas.property('imageHeight', {
    get: function() {
      var ref, ref1;
      return (ref = (ref1 = this.image) != null ? ref1.naturalHeight : void 0) != null ? ref : 0;
    }
  });

  Canvas.property('offsetX', {
    get: function() {
      return (this.width - this.imageWidth) / 2;
    }
  });

  Canvas.property('offsetY', {
    get: function() {
      return (this.height - this.imageHeight) / 2;
    }
  });

  Canvas.prototype.defaultOptions = {
    cellW: 15,
    cellH: 15
  };

  Canvas.prototype.workers = {
    sobel: new Listener('./sobel.js'),
    calc: new Listener('./calc.js'),
    conv: new Listener('./conv.js')
  };

  function Canvas(el, options) {
    this.el = el;
    if (options == null) {
      options = {};
    }
    this._calculatedData = null;
    this._view = null;
    this.options = {};
    this.ctx = this.el.getContext("2d");
    this.image = null;
    this.updateOptions(options);
  }

  Canvas.prototype.updateOptions = function(options) {
    if (options == null) {
      options = {};
    }
    _.extend(this.options, options, this.defaultOptions);
    return this.loadImage(this.image);
  };

  Canvas.prototype.loadImage = function(image) {
    this.image = image;
    this._calculatedData = null;
    this._clear();
    if (!this.image) {
      return;
    }
    this.trigger('loading');
    this._drawImage();
    return this._calc(this._getPixels(), (function(_this) {
      return function(error, data) {
        _this._calculatedData = data;
        _this.draw();
        return _this.trigger('loaded');
      };
    })(this));
  };

  Canvas.prototype.setView = function(view) {
    this._view = view;
    return this.draw();
  };

  Canvas.prototype.draw = function() {
    this._clear();
    this._drawImage();
    switch (this._view) {
      case 'angle':
        return this._drawAngles();
      case 'length':
        return this._drawLength();
      case 'coh':
        return this._drawCoh();
    }
  };

  Canvas.prototype._clear = function() {
    return this.ctx.clearRect(0, 0, this.width, this.height);
  };

  Canvas.prototype._drawImage = function() {
    if (!this.image) {
      return;
    }
    this.ctx.drawImage(this.image, this.offsetX, this.offsetY);
  };

  Canvas.prototype._drawAngles = function() {
    var data, ref;
    if (!((ref = this._calculatedData) != null ? ref.angle : void 0)) {
      return;
    }
    data = this._calculatedData.angle;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "red";
    return this._eachCells(data, (function(_this) {
      return function(ox, oy, w, h, v) {
        var rh, rw, x, y;
        rw = w / 2;
        rh = h / 2;
        x = _this.offsetX + ox + rw;
        y = _this.offsetY + oy + rh;
        _this.ctx.beginPath();
        _this.ctx.moveTo(x, y);
        _this.ctx.lineTo(x + Math.cos(v) * rw, y - Math.sin(v) * rh);
        _this.ctx.moveTo(x, y);
        _this.ctx.lineTo(x - Math.cos(v) * rw, y + Math.sin(v) * rh);
        return _this.ctx.stroke();
      };
    })(this));
  };

  Canvas.prototype._drawLength = function() {
    var data, ref;
    if (!((ref = this._calculatedData) != null ? ref.length : void 0)) {
      return;
    }
    this._clear();
    data = this._calculatedData.length;
    return this._eachCells(data, (function(_this) {
      return function(ox, oy, w, h, v) {
        var c;
        c = 255 * v | 1;
        _this.ctx.fillStyle = "rgb(" + c + "," + c + "," + c + ")";
        return _this.ctx.fillRect(_this.offsetX + ox, _this.offsetY + oy, w + 1, h + 1);
      };
    })(this));
  };

  Canvas.prototype._drawCoh = function() {
    var data, ref;
    if (!((ref = this._calculatedData) != null ? ref.coh : void 0)) {
      return;
    }
    this._clear();
    data = this._calculatedData.coh;
    return this._eachCells(data, (function(_this) {
      return function(ox, oy, w, h, v) {
        var c;
        c = 255 * v | 1;
        _this.ctx.fillStyle = "rgb(" + c + "," + c + "," + c + ")";
        return _this.ctx.fillRect(_this.offsetX + ox, _this.offsetY + oy, w + 1, h + 1);
      };
    })(this));
  };

  Canvas.prototype._eachCells = function(data, cb) {
    var h, i, p, ref, results, w, x, y;
    if (!cb) {
      return;
    }
    h = Math.floor(this.imageHeight / this.options.cellH);
    w = Math.floor(this.imageWidth / this.options.cellW);
    results = [];
    for (y = i = 0, ref = h; 0 <= ref ? i < ref : i > ref; y = 0 <= ref ? ++i : --i) {
      results.push((function() {
        var j, ref1, results1;
        results1 = [];
        for (x = j = 0, ref1 = w; 0 <= ref1 ? j < ref1 : j > ref1; x = 0 <= ref1 ? ++j : --j) {
          p = y * w + x;
          results1.push(typeof cb === "function" ? cb(x * this.options.cellW, y * this.options.cellH, this.options.cellW, this.options.cellH, data[p]) : void 0);
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  Canvas.prototype._getPixels = function() {
    var imageData;
    if (!this.image) {
      return;
    }
    imageData = this.ctx.getImageData(this.offsetX, this.offsetY, this.imageWidth, this.imageHeight);
    return imageData;
  };

  Canvas.prototype._putPixels = function(imageData) {
    var ox, oy;
    this._clear();
    ox = (this.width - imageData.width) / 2;
    oy = (this.height - imageData.height) / 2;
    return this.ctx.putImageData(imageData, ox, oy);
  };

  Canvas.prototype._conv = function(imageData, kernel, cb) {
    this.workers.conv.apply({
      kernel: kernel,
      imageData: imageData
    }, cb);
  };

  Canvas.prototype._sobel = function(imageData, cb) {
    this.workers.sobel.apply({
      imageData: imageData
    }, cb);
  };

  Canvas.prototype._calc = function(imageData, cb) {
    return this._sobel(imageData, (function(_this) {
      return function(error, data) {
        data.cellW = _this.options.cellW;
        data.cellH = _this.options.cellH;
        return _this.workers.calc.apply(data, cb);
      };
    })(this));
  };

  return Canvas;

})(Base);

module.exports = Canvas;



},{"./lib/base":3}],2:[function(require,module,exports){
module.exports=[
  "./images/06_2_113_1.bmp",
  "./images/06_2_113_2.bmp",
  "./images/06_2_113_3.bmp",
  "./images/06_2_113_4.bmp",
  "./images/06_2_113_5.bmp",
  "./images/06_2_113_6.bmp",
  "./images/06_2_113_7.bmp",
  "./images/06_2_113_8.bmp",
  "./images/06_2_113_9.bmp",
  "./images/06_2_112_11.bmp",
  "./images/06_2_112_12.bmp",
  "./images/06_2_113_10.bmp",
  "./images/06_2_113_11.bmp",
  "./images/06_2_113_12.bmp",

  "./images/06_2_114_1.bmp",
  "./images/06_2_114_2.bmp",
  "./images/06_2_114_3.bmp",
  "./images/06_2_114_4.bmp",
  "./images/06_2_114_5.bmp",
  "./images/06_2_114_6.bmp",
  "./images/06_2_114_7.bmp",
  "./images/06_2_114_8.bmp",
  "./images/06_2_114_9.bmp",
  "./images/06_2_114_10.bmp",
  "./images/06_2_114_11.bmp",
  "./images/06_2_114_12.bmp"
]

},{}],3:[function(require,module,exports){
var Base, Module, em, pm,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Module = require('./module');

pm = require('./property_mixin');

em = require('./event_mixin');

Base = (function(superClass) {
  extend(Base, superClass);

  function Base() {
    return Base.__super__.constructor.apply(this, arguments);
  }

  Base.extend(pm);

  Base.include(em);

  return Base;

})(Module);

module.exports = Base;



},{"./event_mixin":4,"./module":5,"./property_mixin":6}],4:[function(require,module,exports){
var slice = [].slice;

module.exports = {
  _eventHandlers: function() {
    return this.__eventHandlers || (this.__eventHandlers = {});
  },
  _getHandlers: function(name) {
    var base;
    (base = this._eventHandlers())[name] || (base[name] = []);
    return this._eventHandlers()[name];
  },
  _setHandlers: function(name, value) {
    var base;
    (base = this._eventHandlers())[name] || (base[name] = value);
  },
  on: function(name, callback) {
    if (!callback) {
      return;
    }
    return this._getHandlers(name).push(callback);
  },
  off: function(name, callback) {
    if (!callback) {
      this._setHandlers(name, []);
    } else {
      this._setHandlers(name, this._getHandlers(name).filter(function(c) {
        return c === callback;
      }));
    }
  },
  trigger: function() {
    var args, cb, i, len, name, ref;
    name = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    ref = this._getHandlers(name);
    for (i = 0, len = ref.length; i < len; i++) {
      cb = ref[i];
      if (cb.apply(this, args) === false) {
        return;
      }
    }
  }
};



},{}],5:[function(require,module,exports){
var Module, moduleKeywords,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

moduleKeywords = ['extended', 'included'];

Module = (function() {
  function Module() {}

  Module.extend = function(obj) {
    var key, ref, value;
    for (key in obj) {
      value = obj[key];
      if (indexOf.call(moduleKeywords, key) < 0) {
        this[key] = value;
      }
    }
    if ((ref = obj.extended) != null) {
      ref.apply(this);
    }
    return this;
  };

  Module.include = function(obj) {
    var key, ref, value;
    for (key in obj) {
      value = obj[key];
      if (indexOf.call(moduleKeywords, key) < 0) {
        this.prototype[key] = value;
      }
    }
    if ((ref = obj.included) != null) {
      ref.apply(this);
    }
    return this;
  };

  return Module;

})();

module.exports = Module;



},{}],6:[function(require,module,exports){
var slice = [].slice;

module.exports = {
  property: function(prop, options) {
    return Object.defineProperty(this.prototype, prop, options);
  },
  addProperty: function() {
    var cbs, name;
    name = arguments[0], cbs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return this.property(name, {
      get: function() {
        return this["_" + name];
      },
      set: function(value) {
        var cb, i, len, n, r;
        n = "set" + (name.capitalize());
        if (this[n] != null) {
          r = this[n](value);
        } else {
          r = this.setProp(name, value);
        }
        for (i = 0, len = cbs.length; i < len; i++) {
          cb = cbs[i];
          if (typeof this[cb] === "function") {
            this[cb]();
          }
        }
        return r;
      }
    });
  },
  extended: function() {
    return this.prototype.setProp = function(name, value) {
      if (this["_" + name] !== value) {
        this["_" + name] = value;
        if (typeof this.trigger === "function") {
          this.trigger("change:" + name, this["_" + name]);
        }
      }
      return this["_" + name];
    };
  }
};



},{}],7:[function(require,module,exports){
var $canvas, $canvasContainer, $imagesContainer, $loading, $window, Canvas, canvas, imagesSrc, loadImages, resizeCanvas, selectImage, translate, translates;

imagesSrc = require('./images');

Canvas = require('./canvas');

$window = $(window);

$canvas = null;

canvas = null;

$canvasContainer = null;

$imagesContainer = null;

$loading = null;

resizeCanvas = function() {
  var h;
  h = $window.height() - $canvasContainer.offset().top - 60;
  $canvasContainer.height(h > 300 && h || 300);
  $canvas.attr({
    width: $canvasContainer.width() | 1,
    height: $canvasContainer.height() | 1
  });
  h = $window.height() - $imagesContainer.offset().top - 45;
  $imagesContainer.height(h > 300 && h || 300);
  return canvas.draw();
};

loadImages = function() {
  var f, fn, i, image, len;
  f = null;
  fn = function(image) {
    var $el, file, img, name;
    file = image;
    name = image.replace(/.*?([^\/\.]+)\.bmp$/, "$1");
    img = new Image;
    img.src = file;
    if (f == null) {
      f = img;
    }
    $el = $("<div class='col-sm-6 image-item ImageItem'> <div class='Image'></div> <a href='javascript:;'>" + name + "</a> </div>");
    $('.Image', $el).append(img);
    $el.on('click', function() {
      return selectImage(img);
    });
    return $imagesContainer.append($el);
  };
  for (i = 0, len = imagesSrc.length; i < len; i++) {
    image = imagesSrc[i];
    fn(image);
  }
  return f.addEventListener('load', function() {
    return selectImage(f);
  });
};

selectImage = function(image) {
  return canvas.loadImage(image);
};

translates = require('./translate');

translate = function(lang) {
  var key, ref, results, value;
  if (lang == null) {
    lang = "en";
  }
  ref = translates[lang];
  results = [];
  for (key in ref) {
    value = ref[key];
    results.push($(".Text[data-key='" + key + "']").text(value));
  }
  return results;
};

$window.on('resize', resizeCanvas);

$window.on('load', function() {
  var $button, $inputs, view;
  translate();
  $canvas = $('.Canvas');
  $canvasContainer = $('.CanvasContainer');
  $imagesContainer = $('.ImagesContainer');
  $loading = $('.Loading');
  $button = $('.BtnView');
  $inputs = $('.OptionsInput');
  canvas = new Canvas($canvas[0]);
  canvas.on('loading', function() {
    return $loading.show();
  });
  canvas.on('loaded', function() {
    return $loading.hide();
  });
  $button.on('click', function() {
    var view;
    $button.removeClass('active');
    $(this).addClass('active');
    view = $(this).data('view');
    canvas.setView(view);
    return localStorage.view = view;
  });
  view = localStorage.view || 'image';
  $(".BtnView[data-view='" + view + "']").trigger('click');
  $inputs.on('change', function() {
    var name, o, value;
    name = this.name;
    value = Number(this.value);
    o = {};
    o[name] = value;
    return canvas.updateOptions(o);
  });
  $window.on('keydown', function(event) {
    if (event.altKey && event.keyCode === 84) {
      event.preventDefault();
      translate('ru');
    }
    if (event.altKey && event.keyCode === 85) {
      event.preventDefault();
      return translate('en');
    }
  });
  resizeCanvas();
  return loadImages();
});



},{"./canvas":1,"./images":2,"./translate":8}],8:[function(require,module,exports){
module.exports={
  "en": {
    "title": "Directional Field Estimation",
    "result": "Result",
    "loading": "Calculating...",
    "config": "Config",
    "source": "Source image",
    "angle": "Angles",
    "length": "Length",
    "coherency": "Coherency",
    "images": "Images",
    "width": "Width",
    "height": "Height"
  },
  "ru": {
    "title": "Тут расчитывают поле направлений, братишка.",
    "result": "Видишь как круто считается?",
    "loading": "Погоди, браток, вычисляем сейчас...",
    "config": "Думаю тут все понятно",
    "source": "Исходник",
    "angle": "Углы",
    "length": "Длина",
    "coherency": "Когерентность",
    "images": "Выбери понравившуюся",
    "width": "Ширина",
    "height": "Высота"
  }
}

},{}]},{},[7])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9tb3YvZGV2L2RmZS9zcmMvY2FudmFzLmNvZmZlZSIsInNyYy9pbWFnZXMuanNvbiIsIi9ob21lL21vdi9kZXYvZGZlL3NyYy9saWIvYmFzZS5jb2ZmZWUiLCIvaG9tZS9tb3YvZGV2L2RmZS9zcmMvbGliL2V2ZW50X21peGluLmNvZmZlZSIsIi9ob21lL21vdi9kZXYvZGZlL3NyYy9saWIvbW9kdWxlLmNvZmZlZSIsIi9ob21lL21vdi9kZXYvZGZlL3NyYy9saWIvcHJvcGVydHlfbWl4aW4uY29mZmVlIiwiL2hvbWUvbW92L2Rldi9kZmUvc3JjL21haW4uY29mZmVlIiwic3JjL3RyYW5zbGF0ZS5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxZQUFBO0VBQUE7NkJBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxZQUFSLENBQVAsQ0FBQTs7QUFBQTtBQUdFLDRCQUFBLENBQUE7O0FBQUEsRUFBQSxNQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBb0I7QUFBQSxJQUFBLEdBQUEsRUFBSyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsRUFBRSxDQUFDLE1BQVA7SUFBQSxDQUFMO0dBQXBCLENBQUEsQ0FBQTs7QUFBQSxFQUNBLE1BQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUFvQjtBQUFBLElBQUEsR0FBQSxFQUFLLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxFQUFFLENBQUMsT0FBUDtJQUFBLENBQUw7R0FBcEIsQ0FEQSxDQUFBOztBQUFBLEVBR0EsTUFBQyxDQUFBLFFBQUQsQ0FBVSxZQUFWLEVBQXlCO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBO0FBQUcsVUFBQSxTQUFBOzhGQUF3QixFQUEzQjtJQUFBLENBQUw7R0FBekIs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RUFBckM7QUFDRSxNQUFBLEtBQUssQ0FBQyxjQUFOLENBQUEsQ0FBQSxDQUFBO2FBQ0EsU0FBQSxDQUFVLElBQVYsRUFGRjtLQUpvQjtFQUFBLENBQXRCLENBOUJBLENBQUE7QUFBQSxFQXNDQSxZQUFBLENBQUEsQ0F0Q0EsQ0FBQTtTQXVDQSxVQUFBLENBQUEsRUF4Q2lCO0FBQUEsQ0FBbkIsQ0E3REEsQ0FBQTs7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIkJhc2UgPSByZXF1aXJlICcuL2xpYi9iYXNlJ1xuXG5jbGFzcyBDYW52YXMgZXh0ZW5kcyBCYXNlXG4gIEBwcm9wZXJ0eSAnd2lkdGgnICwgZ2V0OiAtPiBAZWwud2lkdGhcbiAgQHByb3BlcnR5ICdoZWlnaHQnLCBnZXQ6IC0+IEBlbC5oZWlnaHRcblxuICBAcHJvcGVydHkgJ2ltYWdlV2lkdGgnICwgZ2V0OiAtPiBAaW1hZ2U/Lm5hdHVyYWxXaWR0aCAgPyAwXG4gIEBwcm9wZXJ0eSAnaW1hZ2VIZWlnaHQnLCBnZXQ6IC0+IEBpbWFnZT8ubmF0dXJhbEhlaWdodCA/IDBcblxuICBAcHJvcGVydHkgJ29mZnNldFgnLCBnZXQ6IC0+IChAd2lkdGggIC0gQGltYWdlV2lkdGgpICAvIDJcbiAgQHByb3BlcnR5ICdvZmZzZXRZJywgZ2V0OiAtPiAoQGhlaWdodCAtIEBpbWFnZUhlaWdodCkgLyAyXG5cbiAgZGVmYXVsdE9wdGlvbnM6XG4gICAgY2VsbFc6IDE1XG4gICAgY2VsbEg6IDE1XG5cbiAgd29ya2VyczpcbiAgICBzb2JlbCA6IG5ldyBMaXN0ZW5lciAnLi9zb2JlbC5qcydcbiAgICBjYWxjICA6IG5ldyBMaXN0ZW5lciAnLi9jYWxjLmpzJ1xuICAgIGNvbnYgIDogbmV3IExpc3RlbmVyICcuL2NvbnYuanMnXG5cbiAgY29uc3RydWN0b3I6IChAZWwsIG9wdGlvbnMgPSB7fSkgLT5cbiAgICBAX2NhbGN1bGF0ZWREYXRhID0gbnVsbFxuICAgIEBfdmlldyA9IG51bGxcbiAgICBAb3B0aW9ucyA9IHt9XG5cbiAgICBAY3R4ID0gQGVsLmdldENvbnRleHQoXCIyZFwiKVxuICAgIEBpbWFnZSA9IG51bGxcbiAgICBAdXBkYXRlT3B0aW9ucyBvcHRpb25zXG5cbiAgdXBkYXRlT3B0aW9uczogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICBfLmV4dGVuZCBAb3B0aW9ucywgb3B0aW9ucywgQGRlZmF1bHRPcHRpb25zXG4gICAgQGxvYWRJbWFnZShAaW1hZ2UpXG5cbiAgbG9hZEltYWdlOiAoQGltYWdlKSAtPlxuICAgIEBfY2FsY3VsYXRlZERhdGEgPSBudWxsXG4gICAgQF9jbGVhcigpXG4gICAgcmV0dXJuIHVubGVzcyBAaW1hZ2VcbiAgICBAdHJpZ2dlciAnbG9hZGluZydcbiAgICBAX2RyYXdJbWFnZSgpXG4gICAgQF9jYWxjIEBfZ2V0UGl4ZWxzKCksIChlcnJvciwgZGF0YSkgPT5cbiAgICAgIEBfY2FsY3VsYXRlZERhdGEgPSBkYXRhXG4gICAgICBAZHJhdygpXG4gICAgICBAdHJpZ2dlciAnbG9hZGVkJ1xuXG4gIHNldFZpZXc6ICh2aWV3KSAtPlxuICAgIEBfdmlldyA9IHZpZXdcbiAgICBAZHJhdygpXG5cbiAgZHJhdzogLT5cbiAgICBAX2NsZWFyKClcbiAgICBAX2RyYXdJbWFnZSgpXG4gICAgc3dpdGNoIEBfdmlld1xuICAgICAgd2hlbiAnYW5nbGUnICB0aGVuIEBfZHJhd0FuZ2xlcygpXG4gICAgICB3aGVuICdsZW5ndGgnIHRoZW4gQF9kcmF3TGVuZ3RoKClcbiAgICAgIHdoZW4gJ2NvaCcgICAgdGhlbiBAX2RyYXdDb2goKVxuXG4gIF9jbGVhcjogLT5cbiAgICBAY3R4LmNsZWFyUmVjdCAwLCAwLCBAd2lkdGgsIEBoZWlnaHRcblxuICAjIGRyYXdcbiAgX2RyYXdJbWFnZTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpbWFnZVxuICAgIEBjdHguZHJhd0ltYWdlIEBpbWFnZSwgQG9mZnNldFgsIEBvZmZzZXRZXG4gICAgcmV0dXJuXG5cbiAgX2RyYXdBbmdsZXM6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAX2NhbGN1bGF0ZWREYXRhPy5hbmdsZVxuICAgIGRhdGEgPSBAX2NhbGN1bGF0ZWREYXRhLmFuZ2xlXG4gICAgQGN0eC5saW5lV2lkdGggPSAxXG4gICAgQGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCJcbiAgICBAX2VhY2hDZWxscyBkYXRhLCAob3gsIG95LCB3LCBoLCB2KSA9PlxuICAgICAgcncgPSB3IC8gMlxuICAgICAgcmggPSBoIC8gMlxuICAgICAgeCA9IEBvZmZzZXRYICsgb3ggKyByd1xuICAgICAgeSA9IEBvZmZzZXRZICsgb3kgKyByaFxuICAgICAgQGN0eC5iZWdpblBhdGgoKVxuICAgICAgQGN0eC5tb3ZlVG8oeCwgeSlcbiAgICAgIEBjdHgubGluZVRvKHggKyBNYXRoLmNvcyh2KSAqIHJ3LCB5IC0gTWF0aC5zaW4odikgKiByaClcbiAgICAgIEBjdHgubW92ZVRvKHgsIHkpXG4gICAgICBAY3R4LmxpbmVUbyh4IC0gTWF0aC5jb3ModikgKiBydywgeSArIE1hdGguc2luKHYpICogcmgpXG4gICAgICBAY3R4LnN0cm9rZSgpXG5cbiAgX2RyYXdMZW5ndGg6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAX2NhbGN1bGF0ZWREYXRhPy5sZW5ndGhcbiAgICBAX2NsZWFyKClcbiAgICBkYXRhID0gQF9jYWxjdWxhdGVkRGF0YS5sZW5ndGhcbiAgICBAX2VhY2hDZWxscyBkYXRhLCAob3gsIG95LCB3LCBoLCB2KSA9PlxuICAgICAgYyA9IDI1NSAqIHYgfCAxXG4gICAgICBAY3R4LmZpbGxTdHlsZSA9IFwicmdiKCN7Y30sI3tjfSwje2N9KVwiXG4gICAgICBAY3R4LmZpbGxSZWN0IEBvZmZzZXRYICsgb3gsIEBvZmZzZXRZICsgb3ksIHcgKyAxLCBoICsgMVxuXG4gIF9kcmF3Q29oOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQF9jYWxjdWxhdGVkRGF0YT8uY29oXG4gICAgQF9jbGVhcigpXG4gICAgZGF0YSA9IEBfY2FsY3VsYXRlZERhdGEuY29oXG4gICAgQF9lYWNoQ2VsbHMgZGF0YSwgKG94LCBveSwgdywgaCwgdikgPT5cbiAgICAgIGMgPSAyNTUgKiB2IHwgMVxuICAgICAgQGN0eC5maWxsU3R5bGUgPSBcInJnYigje2N9LCN7Y30sI3tjfSlcIlxuICAgICAgQGN0eC5maWxsUmVjdCBAb2Zmc2V0WCArIG94LCBAb2Zmc2V0WSArIG95LCB3ICsgMSwgaCArIDFcblxuICBfZWFjaENlbGxzOiAoZGF0YSwgY2IpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBjYlxuICAgIGggPSBNYXRoLmZsb29yKEBpbWFnZUhlaWdodCAvIEBvcHRpb25zLmNlbGxIKVxuICAgIHcgPSBNYXRoLmZsb29yKEBpbWFnZVdpZHRoICAvIEBvcHRpb25zLmNlbGxXKVxuICAgIGZvciB5IGluIFswIC4uLiBoXVxuICAgICAgZm9yIHggaW4gWzAgLi4uIHddXG4gICAgICAgIHAgPSB5ICogdyArIHhcbiAgICAgICAgY2I/KFxuICAgICAgICAgIHggKiBAb3B0aW9ucy5jZWxsVyxcbiAgICAgICAgICB5ICogQG9wdGlvbnMuY2VsbEgsXG4gICAgICAgICAgQG9wdGlvbnMuY2VsbFcsXG4gICAgICAgICAgQG9wdGlvbnMuY2VsbEgsXG4gICAgICAgICAgZGF0YVtwXVxuICAgICAgICApXG5cblxuICAjIG90aGVyXG4gIF9nZXRQaXhlbHM6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaW1hZ2VcbiAgICBpbWFnZURhdGEgPSBAY3R4LmdldEltYWdlRGF0YSBAb2Zmc2V0WCwgQG9mZnNldFksIEBpbWFnZVdpZHRoLCBAaW1hZ2VIZWlnaHRcbiAgICByZXR1cm4gaW1hZ2VEYXRhXG5cbiAgX3B1dFBpeGVsczogKGltYWdlRGF0YSkgLT5cbiAgICBAX2NsZWFyKClcbiAgICBveCA9IChAd2lkdGggLSBpbWFnZURhdGEud2lkdGgpICAgLyAyXG4gICAgb3kgPSAoQGhlaWdodCAtIGltYWdlRGF0YS5oZWlnaHQpIC8gMlxuICAgIEBjdHgucHV0SW1hZ2VEYXRhIGltYWdlRGF0YSwgb3gsIG95XG5cblxuICAjIHdvcmtlcnNcbiAgX2NvbnY6IChpbWFnZURhdGEsIGtlcm5lbCwgY2IpIC0+XG4gICAgQHdvcmtlcnMuY29udi5hcHBseSB7a2VybmVsOiBrZXJuZWwsIGltYWdlRGF0YTogaW1hZ2VEYXRhfSwgY2JcbiAgICByZXR1cm5cblxuICBfc29iZWw6IChpbWFnZURhdGEsIGNiKSAtPlxuICAgIEB3b3JrZXJzLnNvYmVsLmFwcGx5IHtpbWFnZURhdGE6IGltYWdlRGF0YX0sIGNiXG4gICAgcmV0dXJuXG5cbiAgX2NhbGM6IChpbWFnZURhdGEsIGNiKSAtPlxuICAgIEBfc29iZWwgaW1hZ2VEYXRhLCAoZXJyb3IsIGRhdGEpID0+XG4gICAgICBkYXRhLmNlbGxXID0gQG9wdGlvbnMuY2VsbFdcbiAgICAgIGRhdGEuY2VsbEggPSBAb3B0aW9ucy5jZWxsSFxuICAgICAgQHdvcmtlcnMuY2FsYy5hcHBseSBkYXRhLCBjYlxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1xuIiwibW9kdWxlLmV4cG9ydHM9W1xuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzEuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfMi5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM18zLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzQuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfNS5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM182LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzcuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfOC5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM185LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEyXzExLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEyXzEyLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzEwLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzExLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzEyLmJtcFwiLFxuXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfMS5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF8yLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzMuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfNC5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF81LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzYuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfNy5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF84LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzkuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfMTAuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfMTEuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfMTIuYm1wXCJcbl1cbiIsIk1vZHVsZSA9IHJlcXVpcmUgJy4vbW9kdWxlJ1xuXG5wbSA9IHJlcXVpcmUgJy4vcHJvcGVydHlfbWl4aW4nXG5lbSA9IHJlcXVpcmUgJy4vZXZlbnRfbWl4aW4nXG5cbmNsYXNzIEJhc2UgZXh0ZW5kcyBNb2R1bGVcbiAgQGV4dGVuZCAgcG1cbiAgQGluY2x1ZGUgZW1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIF9ldmVudEhhbmRsZXJzOiAtPlxuICAgIEBfX2V2ZW50SGFuZGxlcnMgfHw9IHt9XG4gXG4gIF9nZXRIYW5kbGVyczogKG5hbWUpIC0+XG4gICAgQF9ldmVudEhhbmRsZXJzKClbbmFtZV0gfHw9IFtdXG4gICAgcmV0dXJuIEBfZXZlbnRIYW5kbGVycygpW25hbWVdXG4gXG4gIF9zZXRIYW5kbGVyczogKG5hbWUsIHZhbHVlKSAtPlxuICAgIEBfZXZlbnRIYW5kbGVycygpW25hbWVdIHx8PSB2YWx1ZVxuICAgIHJldHVyblxuIFxuICBvbjogKG5hbWUsIGNhbGxiYWNrKSAtPlxuICAgIHJldHVybiB1bmxlc3MgY2FsbGJhY2tcbiAgICBAX2dldEhhbmRsZXJzKG5hbWUpLnB1c2ggY2FsbGJhY2tcbiBcbiAgb2ZmOiAobmFtZSwgY2FsbGJhY2spIC0+XG4gICAgdW5sZXNzIGNhbGxiYWNrXG4gICAgICBAX3NldEhhbmRsZXJzKG5hbWUsIFtdKVxuICAgIGVsc2VcbiAgICAgIEBfc2V0SGFuZGxlcnMgbmFtZSwgQF9nZXRIYW5kbGVycyhuYW1lKS5maWx0ZXIgKGMpIC0+XG4gICAgICAgIGMgPT0gY2FsbGJhY2tcbiAgICByZXR1cm5cbiBcbiAgdHJpZ2dlcjogKG5hbWUsIGFyZ3MuLi4pIC0+XG4gICAgZm9yIGNiIGluIEBfZ2V0SGFuZGxlcnMobmFtZSlcbiAgICAgIHJldHVybiBpZiBjYi5hcHBseShALCBhcmdzKSA9PSBmYWxzZVxuICAgIHJldHVyblxuIiwibW9kdWxlS2V5d29yZHMgPSBbJ2V4dGVuZGVkJywgJ2luY2x1ZGVkJ11cbiBcbmNsYXNzIE1vZHVsZVxuICBAZXh0ZW5kOiAob2JqKSAtPlxuICAgIGZvciBrZXksIHZhbHVlIG9mIG9iaiB3aGVuIGtleSBub3QgaW4gbW9kdWxlS2V5d29yZHNcbiAgICAgIEBba2V5XSA9IHZhbHVlXG4gXG4gICAgb2JqLmV4dGVuZGVkPy5hcHBseShAKVxuICAgIEBcbiBcbiAgQGluY2x1ZGU6IChvYmopIC0+XG4gICAgZm9yIGtleSwgdmFsdWUgb2Ygb2JqIHdoZW4ga2V5IG5vdCBpbiBtb2R1bGVLZXl3b3Jkc1xuICAgICAgIyBBc3NpZ24gcHJvcGVydGllcyB0byB0aGUgcHJvdG90eXBlXG4gICAgICBAOjpba2V5XSA9IHZhbHVlXG4gXG4gICAgb2JqLmluY2x1ZGVkPy5hcHBseShAKVxuICAgIEBcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGVcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgcHJvcGVydHk6IChwcm9wLCBvcHRpb25zKSAtPlxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBwcm9wLCBvcHRpb25zXG4gXG4gIGFkZFByb3BlcnR5OiAobmFtZSwgY2JzLi4uKSAtPlxuICAgIEBwcm9wZXJ0eSBuYW1lLFxuICAgICAgZ2V0OiAtPiBAW1wiXyN7bmFtZX1cIl1cbiAgICAgIHNldDogKHZhbHVlKSAtPlxuICAgICAgICBuID0gXCJzZXQje25hbWUuY2FwaXRhbGl6ZSgpfVwiXG4gICAgICAgIGlmIEBbbl0/XG4gICAgICAgICAgciA9IEBbbl0odmFsdWUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByID0gQHNldFByb3AobmFtZSwgdmFsdWUpXG4gICAgICAgIGZvciBjYiBpbiBjYnNcbiAgICAgICAgICBAW2NiXT8oKVxuICAgICAgICByXG4gXG4gIGV4dGVuZGVkOiAtPlxuICAgIEA6OnNldFByb3AgPSAobmFtZSwgdmFsdWUpIC0+XG4gICAgICBpZiBAW1wiXyN7bmFtZX1cIl0gIT0gdmFsdWVcbiAgICAgICAgQFtcIl8je25hbWV9XCJdID0gdmFsdWVcbiAgICAgICAgQHRyaWdnZXI/IFwiY2hhbmdlOiN7bmFtZX1cIiwgQFtcIl8je25hbWV9XCJdXG4gICAgICBAW1wiXyN7bmFtZX1cIl1cbiIsIiMgaW1wb3J0XG5pbWFnZXNTcmMgPSByZXF1aXJlICcuL2ltYWdlcydcbkNhbnZhcyA9IHJlcXVpcmUgJy4vY2FudmFzJ1xuXG4jIHZhcnNcbiR3aW5kb3cgPSAkKHdpbmRvdylcbiRjYW52YXMgPSBudWxsXG5jYW52YXMgPSBudWxsXG4kY2FudmFzQ29udGFpbmVyID0gbnVsbFxuJGltYWdlc0NvbnRhaW5lciA9IG51bGxcbiRsb2FkaW5nID0gbnVsbFxuXG4jIGZ1bmN0aW9uc1xucmVzaXplQ2FudmFzID0gLT5cbiAgaCA9ICR3aW5kb3cuaGVpZ2h0KCkgLSAkY2FudmFzQ29udGFpbmVyLm9mZnNldCgpLnRvcCAtIDYwXG4gICRjYW52YXNDb250YWluZXIuaGVpZ2h0IGggPiAzMDAgJiYgaCB8fCAzMDBcbiAgJGNhbnZhcy5hdHRyXG4gICAgd2lkdGggOiAkY2FudmFzQ29udGFpbmVyLndpZHRoKCkgIHwgMVxuICAgIGhlaWdodDogJGNhbnZhc0NvbnRhaW5lci5oZWlnaHQoKSB8IDFcblxuICBoID0gJHdpbmRvdy5oZWlnaHQoKSAtICRpbWFnZXNDb250YWluZXIub2Zmc2V0KCkudG9wIC0gNDVcbiAgJGltYWdlc0NvbnRhaW5lci5oZWlnaHQgaCA+IDMwMCAmJiBoIHx8IDMwMFxuXG4gIGNhbnZhcy5kcmF3KClcblxubG9hZEltYWdlcyA9IC0+XG4gIGYgPSBudWxsXG4gIGZvciBpbWFnZSBpbiBpbWFnZXNTcmNcbiAgICBkbyAoaW1hZ2UpIC0+XG4gICAgICAjIGxvYWRpbmdcbiAgICAgIGZpbGUgPSBpbWFnZVxuICAgICAgbmFtZSA9IGltYWdlLnJlcGxhY2UoLy4qPyhbXlxcL1xcLl0rKVxcLmJtcCQvLCBcIiQxXCIpXG5cbiAgICAgIGltZyA9IG5ldyBJbWFnZVxuICAgICAgaW1nLnNyYyA9IGZpbGVcbiAgICAgIGYgPz0gaW1nXG5cbiAgICAgICMgcmVuZGVyXG4gICAgICAkZWwgPSAkIFwiXG4gICAgICAgIDxkaXYgY2xhc3M9J2NvbC1zbS02IGltYWdlLWl0ZW0gSW1hZ2VJdGVtJz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdJbWFnZSc+PC9kaXY+XG4gICAgICAgICAgPGEgaHJlZj0namF2YXNjcmlwdDo7Jz4je25hbWV9PC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXG4gICAgICAkKCcuSW1hZ2UnLCAkZWwpLmFwcGVuZCBpbWdcbiAgICAgICRlbC5vbiAnY2xpY2snLCAtPiBzZWxlY3RJbWFnZShpbWcpXG4gICAgICAkaW1hZ2VzQ29udGFpbmVyLmFwcGVuZCAkZWxcblxuICAjIHNlbGVjdCBmaXJzdCBpbWFnZVxuICBmLmFkZEV2ZW50TGlzdGVuZXIgJ2xvYWQnLCAtPiBzZWxlY3RJbWFnZSBmXG5cbnNlbGVjdEltYWdlID0gKGltYWdlKSAtPlxuICBjYW52YXMubG9hZEltYWdlIGltYWdlXG5cbnRyYW5zbGF0ZXMgPSByZXF1aXJlICcuL3RyYW5zbGF0ZSdcbnRyYW5zbGF0ZSA9IChsYW5nID0gXCJlblwiKSAtPlxuICBmb3Iga2V5LCB2YWx1ZSBvZiB0cmFuc2xhdGVzW2xhbmddXG4gICAgJChcIi5UZXh0W2RhdGEta2V5PScje2tleX0nXVwiKS50ZXh0IHZhbHVlXG5cbiMgZXZlbnRzXG4kd2luZG93Lm9uICdyZXNpemUnLCByZXNpemVDYW52YXNcblxuJHdpbmRvdy5vbiAnbG9hZCcsIC0+XG4gIHRyYW5zbGF0ZSgpXG5cbiAgJGNhbnZhcyA9ICQoJy5DYW52YXMnKVxuICAkY2FudmFzQ29udGFpbmVyID0gJCgnLkNhbnZhc0NvbnRhaW5lcicpXG4gICRpbWFnZXNDb250YWluZXIgPSAkKCcuSW1hZ2VzQ29udGFpbmVyJylcbiAgJGxvYWRpbmcgPSAkKCcuTG9hZGluZycpXG4gICRidXR0b24gPSAkKCcuQnRuVmlldycpXG4gICRpbnB1dHMgPSAkKCcuT3B0aW9uc0lucHV0JylcblxuICBjYW52YXMgPSBuZXcgQ2FudmFzICRjYW52YXNbMF1cbiAgY2FudmFzLm9uICdsb2FkaW5nJywgLT4gJGxvYWRpbmcuc2hvdygpXG4gIGNhbnZhcy5vbiAnbG9hZGVkJywgLT4gJGxvYWRpbmcuaGlkZSgpXG5cbiAgJGJ1dHRvbi5vbiAnY2xpY2snLCAtPlxuICAgICRidXR0b24ucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgJChAKS5hZGRDbGFzcygnYWN0aXZlJylcbiAgICB2aWV3ID0gJChAKS5kYXRhKCd2aWV3JylcbiAgICBjYW52YXMuc2V0VmlldyB2aWV3XG4gICAgbG9jYWxTdG9yYWdlLnZpZXcgPSB2aWV3XG5cbiAgdmlldyA9IGxvY2FsU3RvcmFnZS52aWV3IHx8ICdpbWFnZSdcbiAgJChcIi5CdG5WaWV3W2RhdGEtdmlldz0nI3t2aWV3fSddXCIpLnRyaWdnZXIgJ2NsaWNrJ1xuXG4gICRpbnB1dHMub24gJ2NoYW5nZScsIC0+XG4gICAgbmFtZSA9IEBuYW1lXG4gICAgdmFsdWUgPSBOdW1iZXIgQHZhbHVlXG4gICAgbyA9IHt9XG4gICAgb1tuYW1lXSA9IHZhbHVlXG4gICAgY2FudmFzLnVwZGF0ZU9wdGlvbnMgb1xuXG4gICR3aW5kb3cub24gJ2tleWRvd24nLCAoZXZlbnQpIC0+XG4gICAgaWYgZXZlbnQuYWx0S2V5IGFuZCBldmVudC5rZXlDb2RlID09IDg0XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0cmFuc2xhdGUoJ3J1JylcbiAgICBpZiBldmVudC5hbHRLZXkgYW5kIGV2ZW50LmtleUNvZGUgPT0gODVcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRyYW5zbGF0ZSgnZW4nKVxuXG4gIHJlc2l6ZUNhbnZhcygpXG4gIGxvYWRJbWFnZXMoKVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcImVuXCI6IHtcbiAgICBcInRpdGxlXCI6IFwiRGlyZWN0aW9uYWwgRmllbGQgRXN0aW1hdGlvblwiLFxuICAgIFwicmVzdWx0XCI6IFwiUmVzdWx0XCIsXG4gICAgXCJsb2FkaW5nXCI6IFwiQ2FsY3VsYXRpbmcuLi5cIixcbiAgICBcImNvbmZpZ1wiOiBcIkNvbmZpZ1wiLFxuICAgIFwic291cmNlXCI6IFwiU291cmNlIGltYWdlXCIsXG4gICAgXCJhbmdsZVwiOiBcIkFuZ2xlc1wiLFxuICAgIFwibGVuZ3RoXCI6IFwiTGVuZ3RoXCIsXG4gICAgXCJjb2hlcmVuY3lcIjogXCJDb2hlcmVuY3lcIixcbiAgICBcImltYWdlc1wiOiBcIkltYWdlc1wiLFxuICAgIFwid2lkdGhcIjogXCJXaWR0aFwiLFxuICAgIFwiaGVpZ2h0XCI6IFwiSGVpZ2h0XCJcbiAgfSxcbiAgXCJydVwiOiB7XG4gICAgXCJ0aXRsZVwiOiBcItCi0YPRgiDRgNCw0YHRh9C40YLRi9Cy0LDRjtGCINC/0L7Qu9C1INC90LDQv9GA0LDQstC70LXQvdC40LksINCx0YDQsNGC0LjRiNC60LAuXCIsXG4gICAgXCJyZXN1bHRcIjogXCLQktC40LTQuNGI0Ywg0LrQsNC6INC60YDRg9GC0L4g0YHRh9C40YLQsNC10YLRgdGPP1wiLFxuICAgIFwibG9hZGluZ1wiOiBcItCf0L7Qs9C+0LTQuCwg0LHRgNCw0YLQvtC6LCDQstGL0YfQuNGB0LvRj9C10Lwg0YHQtdC50YfQsNGBLi4uXCIsXG4gICAgXCJjb25maWdcIjogXCLQlNGD0LzQsNGOINGC0YPRgiDQstGB0LUg0L/QvtC90Y/RgtC90L5cIixcbiAgICBcInNvdXJjZVwiOiBcItCY0YHRhdC+0LTQvdC40LpcIixcbiAgICBcImFuZ2xlXCI6IFwi0KPQs9C70YtcIixcbiAgICBcImxlbmd0aFwiOiBcItCU0LvQuNC90LBcIixcbiAgICBcImNvaGVyZW5jeVwiOiBcItCa0L7Qs9C10YDQtdC90YLQvdC+0YHRgtGMXCIsXG4gICAgXCJpbWFnZXNcIjogXCLQktGL0LHQtdGA0Lgg0L/QvtC90YDQsNCy0LjQstGI0YPRjtGB0Y9cIixcbiAgICBcIndpZHRoXCI6IFwi0KjQuNGA0LjQvdCwXCIsXG4gICAgXCJoZWlnaHRcIjogXCLQktGL0YHQvtGC0LBcIlxuICB9XG59XG4iXX0=
