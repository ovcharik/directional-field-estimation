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
    calc: new Listener('./calc.js')
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
    var data, l, ref;
    if (!((ref = this._calculatedData) != null ? ref.angle : void 0)) {
      return;
    }
    data = this._calculatedData.angle;
    l = this._calculatedData.length;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "red";
    return this._eachCells(data, (function(_this) {
      return function(ox, oy, w, h, v, i) {
        var rh, rw, x, y;
        if (l[i] < 0.01) {
          return;
        }
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
    var h, j, p, ref, results, w, x, y;
    if (!cb) {
      return;
    }
    h = Math.floor(this.imageHeight / this.options.cellH);
    w = Math.floor(this.imageWidth / this.options.cellW);
    results = [];
    for (y = j = 0, ref = h; 0 <= ref ? j < ref : j > ref; y = 0 <= ref ? ++j : --j) {
      results.push((function() {
        var k, ref1, results1;
        results1 = [];
        for (x = k = 0, ref1 = w; 0 <= ref1 ? k < ref1 : k > ref1; x = 0 <= ref1 ? ++k : --k) {
          p = y * w + x;
          results1.push(typeof cb === "function" ? cb(x * this.options.cellW, y * this.options.cellH, this.options.cellW, this.options.cellH, data[p], p) : void 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9tb3YvZGV2L2RmZS9zcmMvY2FudmFzLmNvZmZlZSIsInNyYy9pbWFnZXMuanNvbiIsIi9ob21lL21vdi9kZXYvZGZlL3NyYy9saWIvYmFzZS5jb2ZmZWUiLCIvaG9tZS9tb3YvZGV2L2RmZS9zcmMvbGliL2V2ZW50X21peGluLmNvZmZlZSIsIi9ob21lL21vdi9kZXYvZGZlL3NyYy9saWIvbW9kdWxlLmNvZmZlZSIsIi9ob21lL21vdi9kZXYvZGZlL3NyYy9saWIvcHJvcGVydHlfbWl4aW4uY29mZmVlIiwiL2hvbWUvbW92L2Rldi9kZmUvc3JjL21haW4uY29mZmVlIiwic3JjL3RyYW5zbGF0ZS5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxZQUFBO0VBQUE7NkJBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxZQUFSLENBQVAsQ0FBQTs7QUFBQTtBQUdFLDRCQUFBLENBQUE7O0FBQUEsRUFBQSxNQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBb0I7QUFBQSxJQUFBLEdBQUEsRUFBSyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsRUFBRSxDQUFDLE1BQVA7SUFBQSxDQUFMO0dBQXBCLENBQUEsQ0FBQTs7QUFBQSxFQUNBLE1BQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUFvQjtBQUFBLElBQUEsR0FBQSxFQUFLLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxFQUFFLENBQUMsT0FBUDtJQUFBLENBQUw7R0FBcEIsQ0FEQSxDQUFBOztBQUFBLEVBR0EsTUFBQyxDQUFBLFFBQUQsQ0FBVSxZQUFWLEVBQXlCO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBO0FBQUcsVUFBQSxTQUFBOzhGQUF3QixFQUEzQjtJQUFBLENBQUw7R0FBekIs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Q0EsU0FBQSxDQUFVLElBQVYsQ0FEQSxDQURGO0tBQUE7QUFHQSxJQUFBLElBQUcsS0FBSyxDQUFDLE1BQU4sSUFBaUIsS0FBSyxDQUFDLE9BQU4sS0FBaUIsRUFBckM7QUFDRSxNQUFBLEtBQUssQ0FBQyxjQUFOLENBQUEsQ0FBQSxDQUFBO2FBQ0EsU0FBQSxDQUFVLElBQVYsRUFGRjtLQUpvQjtFQUFBLENBQXRCLENBOUJBLENBQUE7QUFBQSxFQXNDQSxZQUFBLENBQUEsQ0F0Q0EsQ0FBQTtTQXVDQSxVQUFBLENBQUEsRUF4Q2lCO0FBQUEsQ0FBbkIsQ0E3REEsQ0FBQTs7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIkJhc2UgPSByZXF1aXJlICcuL2xpYi9iYXNlJ1xuXG5jbGFzcyBDYW52YXMgZXh0ZW5kcyBCYXNlXG4gIEBwcm9wZXJ0eSAnd2lkdGgnICwgZ2V0OiAtPiBAZWwud2lkdGhcbiAgQHByb3BlcnR5ICdoZWlnaHQnLCBnZXQ6IC0+IEBlbC5oZWlnaHRcblxuICBAcHJvcGVydHkgJ2ltYWdlV2lkdGgnICwgZ2V0OiAtPiBAaW1hZ2U/Lm5hdHVyYWxXaWR0aCAgPyAwXG4gIEBwcm9wZXJ0eSAnaW1hZ2VIZWlnaHQnLCBnZXQ6IC0+IEBpbWFnZT8ubmF0dXJhbEhlaWdodCA/IDBcblxuICBAcHJvcGVydHkgJ29mZnNldFgnLCBnZXQ6IC0+IChAd2lkdGggIC0gQGltYWdlV2lkdGgpICAvIDJcbiAgQHByb3BlcnR5ICdvZmZzZXRZJywgZ2V0OiAtPiAoQGhlaWdodCAtIEBpbWFnZUhlaWdodCkgLyAyXG5cbiAgZGVmYXVsdE9wdGlvbnM6XG4gICAgY2VsbFc6IDE1XG4gICAgY2VsbEg6IDE1XG5cbiAgd29ya2VyczpcbiAgICBzb2JlbCA6IG5ldyBMaXN0ZW5lciAnLi9zb2JlbC5qcydcbiAgICBjYWxjICA6IG5ldyBMaXN0ZW5lciAnLi9jYWxjLmpzJ1xuXG4gIGNvbnN0cnVjdG9yOiAoQGVsLCBvcHRpb25zID0ge30pIC0+XG4gICAgQF9jYWxjdWxhdGVkRGF0YSA9IG51bGxcbiAgICBAX3ZpZXcgPSBudWxsXG4gICAgQG9wdGlvbnMgPSB7fVxuXG4gICAgQGN0eCA9IEBlbC5nZXRDb250ZXh0KFwiMmRcIilcbiAgICBAaW1hZ2UgPSBudWxsXG4gICAgQHVwZGF0ZU9wdGlvbnMgb3B0aW9uc1xuXG4gIHVwZGF0ZU9wdGlvbnM6IChvcHRpb25zID0ge30pIC0+XG4gICAgXy5leHRlbmQgQG9wdGlvbnMsIG9wdGlvbnMsIEBkZWZhdWx0T3B0aW9uc1xuICAgIEBsb2FkSW1hZ2UoQGltYWdlKVxuXG4gIGxvYWRJbWFnZTogKEBpbWFnZSkgLT5cbiAgICBAX2NhbGN1bGF0ZWREYXRhID0gbnVsbFxuICAgIEBfY2xlYXIoKVxuICAgIHJldHVybiB1bmxlc3MgQGltYWdlXG4gICAgQHRyaWdnZXIgJ2xvYWRpbmcnXG4gICAgQF9kcmF3SW1hZ2UoKVxuICAgIEBfY2FsYyBAX2dldFBpeGVscygpLCAoZXJyb3IsIGRhdGEpID0+XG4gICAgICBAX2NhbGN1bGF0ZWREYXRhID0gZGF0YVxuICAgICAgQGRyYXcoKVxuICAgICAgQHRyaWdnZXIgJ2xvYWRlZCdcblxuICBzZXRWaWV3OiAodmlldykgLT5cbiAgICBAX3ZpZXcgPSB2aWV3XG4gICAgQGRyYXcoKVxuXG4gIGRyYXc6IC0+XG4gICAgQF9jbGVhcigpXG4gICAgQF9kcmF3SW1hZ2UoKVxuICAgIHN3aXRjaCBAX3ZpZXdcbiAgICAgIHdoZW4gJ2FuZ2xlJyAgdGhlbiBAX2RyYXdBbmdsZXMoKVxuICAgICAgd2hlbiAnbGVuZ3RoJyB0aGVuIEBfZHJhd0xlbmd0aCgpXG4gICAgICB3aGVuICdjb2gnICAgIHRoZW4gQF9kcmF3Q29oKClcblxuICBfY2xlYXI6IC0+XG4gICAgQGN0eC5jbGVhclJlY3QgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0XG5cbiAgIyBkcmF3XG4gIF9kcmF3SW1hZ2U6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaW1hZ2VcbiAgICBAY3R4LmRyYXdJbWFnZSBAaW1hZ2UsIEBvZmZzZXRYLCBAb2Zmc2V0WVxuICAgIHJldHVyblxuXG4gIF9kcmF3QW5nbGVzOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQF9jYWxjdWxhdGVkRGF0YT8uYW5nbGVcbiAgICBkYXRhID0gQF9jYWxjdWxhdGVkRGF0YS5hbmdsZVxuICAgIGwgPSBAX2NhbGN1bGF0ZWREYXRhLmxlbmd0aFxuICAgIEBjdHgubGluZVdpZHRoID0gMVxuICAgIEBjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiXG4gICAgQF9lYWNoQ2VsbHMgZGF0YSwgKG94LCBveSwgdywgaCwgdiwgaSkgPT5cbiAgICAgIHJldHVybiBpZiBsW2ldIDwgMC4wMVxuICAgICAgcncgPSB3IC8gMlxuICAgICAgcmggPSBoIC8gMlxuICAgICAgeCA9IEBvZmZzZXRYICsgb3ggKyByd1xuICAgICAgeSA9IEBvZmZzZXRZICsgb3kgKyByaFxuICAgICAgQGN0eC5iZWdpblBhdGgoKVxuICAgICAgQGN0eC5tb3ZlVG8oeCwgeSlcbiAgICAgIEBjdHgubGluZVRvKHggKyBNYXRoLmNvcyh2KSAqIHJ3LCB5IC0gTWF0aC5zaW4odikgKiByaClcbiAgICAgIEBjdHgubW92ZVRvKHgsIHkpXG4gICAgICBAY3R4LmxpbmVUbyh4IC0gTWF0aC5jb3ModikgKiBydywgeSArIE1hdGguc2luKHYpICogcmgpXG4gICAgICBAY3R4LnN0cm9rZSgpXG5cbiAgX2RyYXdMZW5ndGg6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAX2NhbGN1bGF0ZWREYXRhPy5sZW5ndGhcbiAgICBAX2NsZWFyKClcbiAgICBkYXRhID0gQF9jYWxjdWxhdGVkRGF0YS5sZW5ndGhcbiAgICBAX2VhY2hDZWxscyBkYXRhLCAob3gsIG95LCB3LCBoLCB2KSA9PlxuICAgICAgYyA9IDI1NSAqIHYgfCAxXG4gICAgICBAY3R4LmZpbGxTdHlsZSA9IFwicmdiKCN7Y30sI3tjfSwje2N9KVwiXG4gICAgICBAY3R4LmZpbGxSZWN0IEBvZmZzZXRYICsgb3gsIEBvZmZzZXRZICsgb3ksIHcgKyAxLCBoICsgMVxuXG4gIF9kcmF3Q29oOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQF9jYWxjdWxhdGVkRGF0YT8uY29oXG4gICAgQF9jbGVhcigpXG4gICAgZGF0YSA9IEBfY2FsY3VsYXRlZERhdGEuY29oXG4gICAgQF9lYWNoQ2VsbHMgZGF0YSwgKG94LCBveSwgdywgaCwgdikgPT5cbiAgICAgIGMgPSAyNTUgKiB2IHwgMVxuICAgICAgQGN0eC5maWxsU3R5bGUgPSBcInJnYigje2N9LCN7Y30sI3tjfSlcIlxuICAgICAgQGN0eC5maWxsUmVjdCBAb2Zmc2V0WCArIG94LCBAb2Zmc2V0WSArIG95LCB3ICsgMSwgaCArIDFcblxuICBfZWFjaENlbGxzOiAoZGF0YSwgY2IpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBjYlxuICAgIGggPSBNYXRoLmZsb29yKEBpbWFnZUhlaWdodCAvIEBvcHRpb25zLmNlbGxIKVxuICAgIHcgPSBNYXRoLmZsb29yKEBpbWFnZVdpZHRoICAvIEBvcHRpb25zLmNlbGxXKVxuICAgIGZvciB5IGluIFswIC4uLiBoXVxuICAgICAgZm9yIHggaW4gWzAgLi4uIHddXG4gICAgICAgIHAgPSB5ICogdyArIHhcbiAgICAgICAgY2I/KFxuICAgICAgICAgIHggKiBAb3B0aW9ucy5jZWxsVyxcbiAgICAgICAgICB5ICogQG9wdGlvbnMuY2VsbEgsXG4gICAgICAgICAgQG9wdGlvbnMuY2VsbFcsXG4gICAgICAgICAgQG9wdGlvbnMuY2VsbEgsXG4gICAgICAgICAgZGF0YVtwXSxcbiAgICAgICAgICBwXG4gICAgICAgIClcblxuXG4gICMgb3RoZXJcbiAgX2dldFBpeGVsczogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpbWFnZVxuICAgIGltYWdlRGF0YSA9IEBjdHguZ2V0SW1hZ2VEYXRhIEBvZmZzZXRYLCBAb2Zmc2V0WSwgQGltYWdlV2lkdGgsIEBpbWFnZUhlaWdodFxuICAgIHJldHVybiBpbWFnZURhdGFcblxuICBfcHV0UGl4ZWxzOiAoaW1hZ2VEYXRhKSAtPlxuICAgIEBfY2xlYXIoKVxuICAgIG94ID0gKEB3aWR0aCAtIGltYWdlRGF0YS53aWR0aCkgICAvIDJcbiAgICBveSA9IChAaGVpZ2h0IC0gaW1hZ2VEYXRhLmhlaWdodCkgLyAyXG4gICAgQGN0eC5wdXRJbWFnZURhdGEgaW1hZ2VEYXRhLCBveCwgb3lcblxuXG4gICMgd29ya2Vyc1xuICBfY29udjogKGltYWdlRGF0YSwga2VybmVsLCBjYikgLT5cbiAgICBAd29ya2Vycy5jb252LmFwcGx5IHtrZXJuZWw6IGtlcm5lbCwgaW1hZ2VEYXRhOiBpbWFnZURhdGF9LCBjYlxuICAgIHJldHVyblxuXG4gIF9zb2JlbDogKGltYWdlRGF0YSwgY2IpIC0+XG4gICAgQHdvcmtlcnMuc29iZWwuYXBwbHkge2ltYWdlRGF0YTogaW1hZ2VEYXRhfSwgY2JcbiAgICByZXR1cm5cblxuICBfY2FsYzogKGltYWdlRGF0YSwgY2IpIC0+XG4gICAgQF9zb2JlbCBpbWFnZURhdGEsIChlcnJvciwgZGF0YSkgPT5cbiAgICAgIGRhdGEuY2VsbFcgPSBAb3B0aW9ucy5jZWxsV1xuICAgICAgZGF0YS5jZWxsSCA9IEBvcHRpb25zLmNlbGxIXG4gICAgICBAd29ya2Vycy5jYWxjLmFwcGx5IGRhdGEsIGNiXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzXG4iLCJtb2R1bGUuZXhwb3J0cz1bXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfMS5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM18yLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzMuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfNC5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM181LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzYuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfNy5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM184LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzkuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTJfMTEuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTJfMTIuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfMTAuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfMTEuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfMTIuYm1wXCIsXG5cbiAgXCIuL2ltYWdlcy8wNl8yXzExNF8xLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzIuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfMy5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF80LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzUuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfNi5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF83LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzguYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfOS5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF8xMC5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF8xMS5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF8xMi5ibXBcIlxuXVxuIiwiTW9kdWxlID0gcmVxdWlyZSAnLi9tb2R1bGUnXG5cbnBtID0gcmVxdWlyZSAnLi9wcm9wZXJ0eV9taXhpbidcbmVtID0gcmVxdWlyZSAnLi9ldmVudF9taXhpbidcblxuY2xhc3MgQmFzZSBleHRlbmRzIE1vZHVsZVxuICBAZXh0ZW5kICBwbVxuICBAaW5jbHVkZSBlbVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgX2V2ZW50SGFuZGxlcnM6IC0+XG4gICAgQF9fZXZlbnRIYW5kbGVycyB8fD0ge31cbiBcbiAgX2dldEhhbmRsZXJzOiAobmFtZSkgLT5cbiAgICBAX2V2ZW50SGFuZGxlcnMoKVtuYW1lXSB8fD0gW11cbiAgICByZXR1cm4gQF9ldmVudEhhbmRsZXJzKClbbmFtZV1cbiBcbiAgX3NldEhhbmRsZXJzOiAobmFtZSwgdmFsdWUpIC0+XG4gICAgQF9ldmVudEhhbmRsZXJzKClbbmFtZV0gfHw9IHZhbHVlXG4gICAgcmV0dXJuXG4gXG4gIG9uOiAobmFtZSwgY2FsbGJhY2spIC0+XG4gICAgcmV0dXJuIHVubGVzcyBjYWxsYmFja1xuICAgIEBfZ2V0SGFuZGxlcnMobmFtZSkucHVzaCBjYWxsYmFja1xuIFxuICBvZmY6IChuYW1lLCBjYWxsYmFjaykgLT5cbiAgICB1bmxlc3MgY2FsbGJhY2tcbiAgICAgIEBfc2V0SGFuZGxlcnMobmFtZSwgW10pXG4gICAgZWxzZVxuICAgICAgQF9zZXRIYW5kbGVycyBuYW1lLCBAX2dldEhhbmRsZXJzKG5hbWUpLmZpbHRlciAoYykgLT5cbiAgICAgICAgYyA9PSBjYWxsYmFja1xuICAgIHJldHVyblxuIFxuICB0cmlnZ2VyOiAobmFtZSwgYXJncy4uLikgLT5cbiAgICBmb3IgY2IgaW4gQF9nZXRIYW5kbGVycyhuYW1lKVxuICAgICAgcmV0dXJuIGlmIGNiLmFwcGx5KEAsIGFyZ3MpID09IGZhbHNlXG4gICAgcmV0dXJuXG4iLCJtb2R1bGVLZXl3b3JkcyA9IFsnZXh0ZW5kZWQnLCAnaW5jbHVkZWQnXVxuIFxuY2xhc3MgTW9kdWxlXG4gIEBleHRlbmQ6IChvYmopIC0+XG4gICAgZm9yIGtleSwgdmFsdWUgb2Ygb2JqIHdoZW4ga2V5IG5vdCBpbiBtb2R1bGVLZXl3b3Jkc1xuICAgICAgQFtrZXldID0gdmFsdWVcbiBcbiAgICBvYmouZXh0ZW5kZWQ/LmFwcGx5KEApXG4gICAgQFxuIFxuICBAaW5jbHVkZTogKG9iaikgLT5cbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBvYmogd2hlbiBrZXkgbm90IGluIG1vZHVsZUtleXdvcmRzXG4gICAgICAjIEFzc2lnbiBwcm9wZXJ0aWVzIHRvIHRoZSBwcm90b3R5cGVcbiAgICAgIEA6OltrZXldID0gdmFsdWVcbiBcbiAgICBvYmouaW5jbHVkZWQ/LmFwcGx5KEApXG4gICAgQFxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZVxuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBwcm9wZXJ0eTogKHByb3AsIG9wdGlvbnMpIC0+XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIHByb3AsIG9wdGlvbnNcbiBcbiAgYWRkUHJvcGVydHk6IChuYW1lLCBjYnMuLi4pIC0+XG4gICAgQHByb3BlcnR5IG5hbWUsXG4gICAgICBnZXQ6IC0+IEBbXCJfI3tuYW1lfVwiXVxuICAgICAgc2V0OiAodmFsdWUpIC0+XG4gICAgICAgIG4gPSBcInNldCN7bmFtZS5jYXBpdGFsaXplKCl9XCJcbiAgICAgICAgaWYgQFtuXT9cbiAgICAgICAgICByID0gQFtuXSh2YWx1ZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHIgPSBAc2V0UHJvcChuYW1lLCB2YWx1ZSlcbiAgICAgICAgZm9yIGNiIGluIGNic1xuICAgICAgICAgIEBbY2JdPygpXG4gICAgICAgIHJcbiBcbiAgZXh0ZW5kZWQ6IC0+XG4gICAgQDo6c2V0UHJvcCA9IChuYW1lLCB2YWx1ZSkgLT5cbiAgICAgIGlmIEBbXCJfI3tuYW1lfVwiXSAhPSB2YWx1ZVxuICAgICAgICBAW1wiXyN7bmFtZX1cIl0gPSB2YWx1ZVxuICAgICAgICBAdHJpZ2dlcj8gXCJjaGFuZ2U6I3tuYW1lfVwiLCBAW1wiXyN7bmFtZX1cIl1cbiAgICAgIEBbXCJfI3tuYW1lfVwiXVxuIiwiIyBpbXBvcnRcbmltYWdlc1NyYyA9IHJlcXVpcmUgJy4vaW1hZ2VzJ1xuQ2FudmFzID0gcmVxdWlyZSAnLi9jYW52YXMnXG5cbiMgdmFyc1xuJHdpbmRvdyA9ICQod2luZG93KVxuJGNhbnZhcyA9IG51bGxcbmNhbnZhcyA9IG51bGxcbiRjYW52YXNDb250YWluZXIgPSBudWxsXG4kaW1hZ2VzQ29udGFpbmVyID0gbnVsbFxuJGxvYWRpbmcgPSBudWxsXG5cbiMgZnVuY3Rpb25zXG5yZXNpemVDYW52YXMgPSAtPlxuICBoID0gJHdpbmRvdy5oZWlnaHQoKSAtICRjYW52YXNDb250YWluZXIub2Zmc2V0KCkudG9wIC0gNjBcbiAgJGNhbnZhc0NvbnRhaW5lci5oZWlnaHQgaCA+IDMwMCAmJiBoIHx8IDMwMFxuICAkY2FudmFzLmF0dHJcbiAgICB3aWR0aCA6ICRjYW52YXNDb250YWluZXIud2lkdGgoKSAgfCAxXG4gICAgaGVpZ2h0OiAkY2FudmFzQ29udGFpbmVyLmhlaWdodCgpIHwgMVxuXG4gIGggPSAkd2luZG93LmhlaWdodCgpIC0gJGltYWdlc0NvbnRhaW5lci5vZmZzZXQoKS50b3AgLSA0NVxuICAkaW1hZ2VzQ29udGFpbmVyLmhlaWdodCBoID4gMzAwICYmIGggfHwgMzAwXG5cbiAgY2FudmFzLmRyYXcoKVxuXG5sb2FkSW1hZ2VzID0gLT5cbiAgZiA9IG51bGxcbiAgZm9yIGltYWdlIGluIGltYWdlc1NyY1xuICAgIGRvIChpbWFnZSkgLT5cbiAgICAgICMgbG9hZGluZ1xuICAgICAgZmlsZSA9IGltYWdlXG4gICAgICBuYW1lID0gaW1hZ2UucmVwbGFjZSgvLio/KFteXFwvXFwuXSspXFwuYm1wJC8sIFwiJDFcIilcblxuICAgICAgaW1nID0gbmV3IEltYWdlXG4gICAgICBpbWcuc3JjID0gZmlsZVxuICAgICAgZiA/PSBpbWdcblxuICAgICAgIyByZW5kZXJcbiAgICAgICRlbCA9ICQgXCJcbiAgICAgICAgPGRpdiBjbGFzcz0nY29sLXNtLTYgaW1hZ2UtaXRlbSBJbWFnZUl0ZW0nPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J0ltYWdlJz48L2Rpdj5cbiAgICAgICAgICA8YSBocmVmPSdqYXZhc2NyaXB0OjsnPiN7bmFtZX08L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgXCJcbiAgICAgICQoJy5JbWFnZScsICRlbCkuYXBwZW5kIGltZ1xuICAgICAgJGVsLm9uICdjbGljaycsIC0+IHNlbGVjdEltYWdlKGltZylcbiAgICAgICRpbWFnZXNDb250YWluZXIuYXBwZW5kICRlbFxuXG4gICMgc2VsZWN0IGZpcnN0IGltYWdlXG4gIGYuYWRkRXZlbnRMaXN0ZW5lciAnbG9hZCcsIC0+IHNlbGVjdEltYWdlIGZcblxuc2VsZWN0SW1hZ2UgPSAoaW1hZ2UpIC0+XG4gIGNhbnZhcy5sb2FkSW1hZ2UgaW1hZ2VcblxudHJhbnNsYXRlcyA9IHJlcXVpcmUgJy4vdHJhbnNsYXRlJ1xudHJhbnNsYXRlID0gKGxhbmcgPSBcImVuXCIpIC0+XG4gIGZvciBrZXksIHZhbHVlIG9mIHRyYW5zbGF0ZXNbbGFuZ11cbiAgICAkKFwiLlRleHRbZGF0YS1rZXk9JyN7a2V5fSddXCIpLnRleHQgdmFsdWVcblxuIyBldmVudHNcbiR3aW5kb3cub24gJ3Jlc2l6ZScsIHJlc2l6ZUNhbnZhc1xuXG4kd2luZG93Lm9uICdsb2FkJywgLT5cbiAgdHJhbnNsYXRlKClcblxuICAkY2FudmFzID0gJCgnLkNhbnZhcycpXG4gICRjYW52YXNDb250YWluZXIgPSAkKCcuQ2FudmFzQ29udGFpbmVyJylcbiAgJGltYWdlc0NvbnRhaW5lciA9ICQoJy5JbWFnZXNDb250YWluZXInKVxuICAkbG9hZGluZyA9ICQoJy5Mb2FkaW5nJylcbiAgJGJ1dHRvbiA9ICQoJy5CdG5WaWV3JylcbiAgJGlucHV0cyA9ICQoJy5PcHRpb25zSW5wdXQnKVxuXG4gIGNhbnZhcyA9IG5ldyBDYW52YXMgJGNhbnZhc1swXVxuICBjYW52YXMub24gJ2xvYWRpbmcnLCAtPiAkbG9hZGluZy5zaG93KClcbiAgY2FudmFzLm9uICdsb2FkZWQnLCAtPiAkbG9hZGluZy5oaWRlKClcblxuICAkYnV0dG9uLm9uICdjbGljaycsIC0+XG4gICAgJGJ1dHRvbi5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAkKEApLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgIHZpZXcgPSAkKEApLmRhdGEoJ3ZpZXcnKVxuICAgIGNhbnZhcy5zZXRWaWV3IHZpZXdcbiAgICBsb2NhbFN0b3JhZ2UudmlldyA9IHZpZXdcblxuICB2aWV3ID0gbG9jYWxTdG9yYWdlLnZpZXcgfHwgJ2ltYWdlJ1xuICAkKFwiLkJ0blZpZXdbZGF0YS12aWV3PScje3ZpZXd9J11cIikudHJpZ2dlciAnY2xpY2snXG5cbiAgJGlucHV0cy5vbiAnY2hhbmdlJywgLT5cbiAgICBuYW1lID0gQG5hbWVcbiAgICB2YWx1ZSA9IE51bWJlciBAdmFsdWVcbiAgICBvID0ge31cbiAgICBvW25hbWVdID0gdmFsdWVcbiAgICBjYW52YXMudXBkYXRlT3B0aW9ucyBvXG5cbiAgJHdpbmRvdy5vbiAna2V5ZG93bicsIChldmVudCkgLT5cbiAgICBpZiBldmVudC5hbHRLZXkgYW5kIGV2ZW50LmtleUNvZGUgPT0gODRcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRyYW5zbGF0ZSgncnUnKVxuICAgIGlmIGV2ZW50LmFsdEtleSBhbmQgZXZlbnQua2V5Q29kZSA9PSA4NVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgdHJhbnNsYXRlKCdlbicpXG5cbiAgcmVzaXplQ2FudmFzKClcbiAgbG9hZEltYWdlcygpXG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiZW5cIjoge1xuICAgIFwidGl0bGVcIjogXCJEaXJlY3Rpb25hbCBGaWVsZCBFc3RpbWF0aW9uXCIsXG4gICAgXCJyZXN1bHRcIjogXCJSZXN1bHRcIixcbiAgICBcImxvYWRpbmdcIjogXCJDYWxjdWxhdGluZy4uLlwiLFxuICAgIFwiY29uZmlnXCI6IFwiQ29uZmlnXCIsXG4gICAgXCJzb3VyY2VcIjogXCJTb3VyY2UgaW1hZ2VcIixcbiAgICBcImFuZ2xlXCI6IFwiQW5nbGVzXCIsXG4gICAgXCJsZW5ndGhcIjogXCJMZW5ndGhcIixcbiAgICBcImNvaGVyZW5jeVwiOiBcIkNvaGVyZW5jeVwiLFxuICAgIFwiaW1hZ2VzXCI6IFwiSW1hZ2VzXCIsXG4gICAgXCJ3aWR0aFwiOiBcIldpZHRoXCIsXG4gICAgXCJoZWlnaHRcIjogXCJIZWlnaHRcIlxuICB9LFxuICBcInJ1XCI6IHtcbiAgICBcInRpdGxlXCI6IFwi0KLRg9GCINGA0LDRgdGH0LjRgtGL0LLQsNGO0YIg0L/QvtC70LUg0L3QsNC/0YDQsNCy0LvQtdC90LjQuSwg0LHRgNCw0YLQuNGI0LrQsC5cIixcbiAgICBcInJlc3VsdFwiOiBcItCS0LjQtNC40YjRjCDQutCw0Log0LrRgNGD0YLQviDRgdGH0LjRgtCw0LXRgtGB0Y8/XCIsXG4gICAgXCJsb2FkaW5nXCI6IFwi0J/QvtCz0L7QtNC4LCDQsdGA0LDRgtC+0LosINCy0YvRh9C40YHQu9GP0LXQvCDRgdC10LnRh9Cw0YEuLi5cIixcbiAgICBcImNvbmZpZ1wiOiBcItCU0YPQvNCw0Y4g0YLRg9GCINCy0YHQtSDQv9C+0L3Rj9GC0L3QvlwiLFxuICAgIFwic291cmNlXCI6IFwi0JjRgdGF0L7QtNC90LjQulwiLFxuICAgIFwiYW5nbGVcIjogXCLQo9Cz0LvRi1wiLFxuICAgIFwibGVuZ3RoXCI6IFwi0JTQu9C40L3QsFwiLFxuICAgIFwiY29oZXJlbmN5XCI6IFwi0JrQvtCz0LXRgNC10L3RgtC90L7RgdGC0YxcIixcbiAgICBcImltYWdlc1wiOiBcItCS0YvQsdC10YDQuCDQv9C+0L3RgNCw0LLQuNCy0YjRg9GO0YHRj1wiLFxuICAgIFwid2lkdGhcIjogXCLQqNC40YDQuNC90LBcIixcbiAgICBcImhlaWdodFwiOiBcItCS0YvRgdC+0YLQsFwiXG4gIH1cbn1cbiJdfQ==
