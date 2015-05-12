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
    cellW: 10,
    cellH: 10
  };

  Canvas.prototype.workers = {
    conv: new Listener('./conv.js'),
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
        _this.ctx.lineTo(x + Math.cos(v) * rw, y + Math.sin(v) * rh);
        _this.ctx.moveTo(x, y);
        _this.ctx.lineTo(x + Math.cos(Math.PI + v) * rw, y + Math.sin(Math.PI + v) * rh);
        return _this.ctx.stroke();
      };
    })(this));
  };

  Canvas.prototype._drawLength = function() {
    var data, ref;
    if (!((ref = this._calculatedData) != null ? ref.length : void 0)) {
      return;
    }
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
    h = this.imageHeight / this.options.cellH | 1;
    w = this.imageWidth / this.options.cellW | 1;
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
    this.clear();
    ox = (this.width - imageData.width) / 2;
    oy = (this.height - imageData.height) / 2;
    return this.ctx.putImageData(imageData, ox, oy);
  };

  Canvas.prototype._conv = function(imageData, kernel, cb) {
    var data;
    data = {
      kernel: kernel,
      imageData: imageData
    };
    this.workers.conv.apply(data, (function(_this) {
      return function(error, data) {
        return typeof cb === "function" ? cb(null, data) : void 0;
      };
    })(this));
  };

  Canvas.prototype._sobel = function(imageData, cb) {
    async.parallel([_.bind(this._conv, this, imageData, [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]), _.bind(this._conv, this, imageData, [[-1, -2, -1], [0, 0, 0], [1, 2, 1]])], function(error, data) {
      return typeof cb === "function" ? cb(null, {
        x: data[0].imageData,
        y: data[1].imageData
      }) : void 0;
    });
  };

  Canvas.prototype._calc = function(imageData, cb) {
    return this._sobel(imageData, (function(_this) {
      return function(error, data) {
        data.cellW = _this.options.cellW;
        data.cellH = _this.options.cellH;
        return _this.workers.calc.apply(data, function(error, data) {
          return typeof cb === "function" ? cb(null, data) : void 0;
        });
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
  var $button, $inputs;
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
    view = $(this).data('view');
    return canvas.setView(view);
  });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9tb3YvZGV2L2RmZS9zcmMvY2FudmFzLmNvZmZlZSIsInNyYy9pbWFnZXMuanNvbiIsIi9ob21lL21vdi9kZXYvZGZlL3NyYy9saWIvYmFzZS5jb2ZmZWUiLCIvaG9tZS9tb3YvZGV2L2RmZS9zcmMvbGliL2V2ZW50X21peGluLmNvZmZlZSIsIi9ob21lL21vdi9kZXYvZGZlL3NyYy9saWIvbW9kdWxlLmNvZmZlZSIsIi9ob21lL21vdi9kZXYvZGZlL3NyYy9saWIvcHJvcGVydHlfbWl4aW4uY29mZmVlIiwiL2hvbWUvbW92L2Rldi9kZmUvc3JjL21haW4uY29mZmVlIiwic3JjL3RyYW5zbGF0ZS5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxZQUFBO0VBQUE7NkJBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxZQUFSLENBQVAsQ0FBQTs7QUFBQTtBQUdFLDRCQUFBLENBQUE7O0FBQUEsRUFBQSxNQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBb0I7QUFBQSxJQUFBLEdBQUEsRUFBSyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsRUFBRSxDQUFDLE1BQVA7SUFBQSxDQUFMO0dBQXBCLENBQUEsQ0FBQTs7QUFBQSxFQUNBLE1BQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUFvQjtBQUFBLElBQUEsR0FBQSxFQUFLLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxFQUFFLENBQUMsT0FBUDtJQUFBLENBQUw7R0FBcEIsQ0FEQSxDQUFBOztBQUFBLEVBR0EsTUFBQyxDQUFBLFFBQUQsQ0FBVSxZQUFWLEVBQXlCO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBO0FBQUcsVUFBQSxTQUFBOzhGQUF3QixFQUEzQjtJQUFBLENBQUw7R0FBekIsQ0FIQSxDQUFBOztBQUFBLEVBSUEsTUFBQyxDQUFBLFFBQUQsQ0FBVSxhQUFWLEVBQXlCO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBO0FBQUcsVUFBQSxTQUFBOytGQUF3QixFQUEzQjtJQUFBLENBQUw7R0FBekIsQ0FKQSxDQUFBOztBQUFBLEVBTUEsTUFBQyxDQUFBLFFBQUQsQ0FBVSxTQUFWLEVBQXFCO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBO2FBQUcsQ0FBQyxJQUFDLENBQUEsS0FBRCxHQUFVLElBQUMsQ0FBQSxVQUFaLENBQUEsR0FBMkIsRUFBOUI7SUFBQSxDQUFMO0dBQXJCLENBTkEsQ0FBQTs7QUFBQSxFQU9BLE1BQUMsQ0FBQSxRQUFELENBQVUsU0FBVixFQUFxQjtBQUFBLElBQUEsR0FBQSxFQUFLLFNBQUEsR0FBQTthQUFHLENBQUMsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsV0FBWixDQUFBLEdBQTJCLEVBQTlCO0lBQUEsQ0FBTDtHQUFyQixDQVBBLENBQUE7O0FBQUEsbUJBU0EsY0FBQSxHQUNFO0FBQUEsSUFBQSxLQUFBLEVBQU8sRUFBUDtBQUFBLElBQ0EsS0FBQSxFQUFPLEVBRFA7R0FWRixDQUFBOztBQUFBLG1CQWFBLE9BQUEsR0FDRTtBQUFBLElBQUEsSUFBQSxFQUFXLElBQUEsUUFBQSxDQUFTLFdBQVQsQ0FBWDtBQUFBLElBQ0EsSUFBQSxFQUFXLElBQUEsUUFBQSxDQUFTLFdBQVQsQ0FEWDtHQWRGLENBQUE7O0FBaUJhLEVBQUEsZ0JBQUMsRUFBRCxFQUFNLE9BQU4sR0FBQTtBQUNYLElBRFksSUFBQyxDQUFBLEtBQUQsRUFDWixDQUFBOztNQURpQixVQUFVO0tBQzNCO0FBQUEsSUFBQSxJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFuQixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBRFQsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUZYLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxHQUFELEdBQU8sSUFBQyxDQUFBLEVBQUUsQ0FBQyxVQUFKLENBQWUsSUFBZixDQUpQLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFMVCxDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsYUFBRCxDQUFlLE9BQWYsQ0FOQSxDQURXO0VBQUEsQ0FqQmI7O0FBQUEsbUJBMEJBLGFBQUEsR0FBZSxTQUFDLE9BQUQsR0FBQTs7TUFBQyxVQUFVO0tBQ3hCO0FBQUEsSUFBQSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxPQUFWLEVBQW1CLE9BQW5CLEVBQTRCLElBQUMsQ0FBQSxjQUE3QixDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxLQUFaLEVBRmE7RUFBQSxDQTFCZixDQUFBOztBQUFBLG1CQThCQSxTQUFBLEdBQVcsU0FBQyxLQUFELEdBQUE7QUFDVCxJQURVLElBQUMsQ0FBQSxRQUFELEtBQ1YsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBbkIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQURBLENBQUE7QUFFQSxJQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsS0FBZjtBQUFBLFlBQUEsQ0FBQTtLQUZBO0FBQUEsSUFHQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQVQsQ0FIQSxDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBSkEsQ0FBQTtXQUtBLElBQUMsQ0FBQSxLQUFELENBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFQLEVBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7QUFDcEIsUUFBQSxLQUFDLENBQUEsZUFBRCxHQUFtQixJQUFuQixDQUFBO0FBQUEsUUFDQSxLQUFDLENBQUEsSUFBRCxDQUFBLENBREEsQ0FBQTtlQUVBLEtBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUhvQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCLEVBTlM7RUFBQSxDQTlCWCxDQUFBOztBQUFBLG1CQXlDQSxPQUFBLEdBQVMsU0FBQyxJQUFELEdBQUE7QUFDUCxJQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBVCxDQUFBO1dBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQUZPO0VBQUEsQ0F6Q1QsQ0FBQTs7QUFBQSxtQkE2Q0EsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLElBQUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FEQSxDQUFBO0FBRUEsWUFBTyxJQUFDLENBQUEsS0FBUjtBQUFBLFdBQ08sT0FEUDtlQUNxQixJQUFDLENBQUEsV0FBRCxDQUFBLEVBRHJCO0FBQUEsV0FFTyxRQUZQO2VBRXFCLElBQUMsQ0FBQSxXQUFELENBQUEsRUFGckI7QUFBQSxXQUdPLEtBSFA7ZUFHcUIsSUFBQyxDQUFBLFFBQUQsQ0FBQSxFQUhyQjtBQUFBLEtBSEk7RUFBQSxDQTdDTixDQUFBOztBQUFBLG1CQXFEQSxNQUFBLEdBQVEsU0FBQSxHQUFBO1dBQ04sSUFBQyxDQUFBLEdBQUcsQ0FBQyxTQUFMLENBQWUsQ0FBZixFQUFrQixDQUFsQixFQUFxQixJQUFDLENBQUEsS0FBdEIsRUFBNkIsSUFBQyxDQUFBLE1BQTlCLEVBRE07RUFBQSxDQXJEUixDQUFBOztBQUFBLG1CQXlEQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsSUFBQSxJQUFBLENBQUEsSUFBZSxDQUFBLEtBQWY7QUFBQSxZQUFBLENBQUE7S0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxTQUFMLENBQWUsSUFBQyxDQUFBLEtBQWhCLEVBQXVCLElBQUMsQ0FBQSxPQUF4QixFQUFpQyxJQUFDLENBQUEsT0FBbEMsQ0FEQSxDQURVO0VBQUEsQ0F6RFosQ0FBQTs7QUFBQSxtQkE4REEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLFFBQUEsU0FBQTtBQUFBLElBQUEsSUFBQSxDQUFBLDJDQUE4QixDQUFFLGVBQWhDO0FBQUEsWUFBQSxDQUFBO0tBQUE7QUFBQSxJQUNBLElBQUEsR0FBTyxJQUFDLENBQUEsZUFBZSxDQUFDLEtBRHhCLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxHQUFHLENBQUMsU0FBTCxHQUFpQixDQUZqQixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsR0FBRyxDQUFDLFdBQUwsR0FBbUIsS0FIbkIsQ0FBQTtXQUlBLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixFQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsQ0FBZixHQUFBO0FBQ2hCLFlBQUEsWUFBQTtBQUFBLFFBQUEsRUFBQSxHQUFLLENBQUEsR0FBSSxDQUFULENBQUE7QUFBQSxRQUNBLEVBQUEsR0FBSyxDQUFBLEdBQUksQ0FEVCxDQUFBO0FBQUEsUUFFQSxDQUFBLEdBQUksS0FBQyxDQUFBLE9BQUQsR0FBVyxFQUFYLEdBQWdCLEVBRnBCLENBQUE7QUFBQSxRQUdBLENBQUEsR0FBSSxLQUFDLENBQUEsT0FBRCxHQUFXLEVBQVgsR0FBZ0IsRUFIcEIsQ0FBQTtBQUFBLFFBSUEsS0FBQyxDQUFBLEdBQUcsQ0FBQyxTQUFMLENBQUEsQ0FKQSxDQUFBO0FBQUEsUUFLQSxLQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBWSxDQUFaLEVBQWUsQ0FBZixDQUxBLENBQUE7QUFBQSxRQU1BLEtBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFZLENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsQ0FBQSxHQUFjLEVBQTlCLEVBQWtDLENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsQ0FBQSxHQUFjLEVBQXBELENBTkEsQ0FBQTtBQUFBLFFBT0EsS0FBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksQ0FBWixFQUFlLENBQWYsQ0FQQSxDQUFBO0FBQUEsUUFRQSxLQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBWSxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsRUFBTCxHQUFVLENBQW5CLENBQUEsR0FBd0IsRUFBeEMsRUFBNEMsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBSSxDQUFDLEVBQUwsR0FBVSxDQUFuQixDQUFBLEdBQXdCLEVBQXhFLENBUkEsQ0FBQTtlQVNBLEtBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFBLEVBVmdCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsRUFMVztFQUFBLENBOURiLENBQUE7O0FBQUEsbUJBK0VBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxRQUFBLFNBQUE7QUFBQSxJQUFBLElBQUEsQ0FBQSwyQ0FBOEIsQ0FBRSxnQkFBaEM7QUFBQSxZQUFBLENBQUE7S0FBQTtBQUFBLElBQ0EsSUFBQSxHQUFPLElBQUMsQ0FBQSxlQUFlLENBQUMsTUFEeEIsQ0FBQTtXQUVBLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixFQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsQ0FBZixHQUFBO0FBQ2hCLFlBQUEsQ0FBQTtBQUFBLFFBQUEsQ0FBQSxHQUFJLEdBQUEsR0FBTSxDQUFOLEdBQVUsQ0FBZCxDQUFBO0FBQUEsUUFDQSxLQUFDLENBQUEsR0FBRyxDQUFDLFNBQUwsR0FBaUIsTUFBQSxHQUFPLENBQVAsR0FBUyxHQUFULEdBQVksQ0FBWixHQUFjLEdBQWQsR0FBaUIsQ0FBakIsR0FBbUIsR0FEcEMsQ0FBQTtlQUVBLEtBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLEtBQUMsQ0FBQSxPQUFELEdBQVcsRUFBekIsRUFBNkIsS0FBQyxDQUFBLE9BQUQsR0FBVyxFQUF4QyxFQUE0QyxDQUFBLEdBQUksQ0FBaEQsRUFBbUQsQ0FBQSxHQUFJLENBQXZELEVBSGdCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsRUFIVztFQUFBLENBL0ViLENBQUE7O0FBQUEsbUJBdUZBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDUixRQUFBLFNBQUE7QUFBQSxJQUFBLElBQUEsQ0FBQSwyQ0FBOEIsQ0FBRSxhQUFoQztBQUFBLFlBQUEsQ0FBQTtLQUFBO0FBQUEsSUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLGVBQWUsQ0FBQyxHQUR4QixDQUFBO1dBRUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaLEVBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsQ0FBVCxFQUFZLENBQVosRUFBZSxDQUFmLEdBQUE7QUFDaEIsWUFBQSxDQUFBO0FBQUEsUUFBQSxDQUFBLEdBQUksR0FBQSxHQUFNLENBQU4sR0FBVSxDQUFkLENBQUE7QUFBQSxRQUNBLEtBQUMsQ0FBQSxHQUFHLENBQUMsU0FBTCxHQUFpQixNQUFBLEdBQU8sQ0FBUCxHQUFTLEdBQVQsR0FBWSxDQUFaLEdBQWMsR0FBZCxHQUFpQixDQUFqQixHQUFtQixHQURwQyxDQUFBO2VBRUEsS0FBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWMsS0FBQyxDQUFBLE9BQUQsR0FBVyxFQUF6QixFQUE2QixLQUFDLENBQUEsT0FBRCxHQUFXLEVBQXhDLEVBQTRDLENBQUEsR0FBSSxDQUFoRCxFQUFtRCxDQUFBLEdBQUksQ0FBdkQsRUFIZ0I7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQixFQUhRO0VBQUEsQ0F2RlYsQ0FBQTs7QUFBQSxtQkErRkEsVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLEVBQVAsR0FBQTtBQUNWLFFBQUEsOEJBQUE7QUFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBO0FBQUEsWUFBQSxDQUFBO0tBQUE7QUFBQSxJQUNBLENBQUEsR0FBSSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBeEIsR0FBZ0MsQ0FEcEMsQ0FBQTtBQUFBLElBRUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxVQUFELEdBQWUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUF4QixHQUFnQyxDQUZwQyxDQUFBO0FBR0E7U0FBUywwRUFBVCxHQUFBO0FBQ0U7O0FBQUE7YUFBUywrRUFBVCxHQUFBO0FBQ0UsVUFBQSxDQUFBLEdBQUksQ0FBQSxHQUFJLENBQUosR0FBUSxDQUFaLENBQUE7QUFBQSxtREFDQSxHQUNFLENBQUEsR0FBSSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQ2IsQ0FBQSxHQUFJLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FDYixJQUFDLENBQUEsT0FBTyxDQUFDLE9BQ1QsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUNULElBQUssQ0FBQSxDQUFBLFlBTlAsQ0FERjtBQUFBOztvQkFBQSxDQURGO0FBQUE7bUJBSlU7RUFBQSxDQS9GWixDQUFBOztBQUFBLG1CQWdIQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsUUFBQSxTQUFBO0FBQUEsSUFBQSxJQUFBLENBQUEsSUFBZSxDQUFBLEtBQWY7QUFBQSxZQUFBLENBQUE7S0FBQTtBQUFBLElBQ0EsU0FBQSxHQUFZLElBQUMsQ0FBQSxHQUFHLENBQUMsWUFBTCxDQUFrQixJQUFDLENBQUEsT0FBbkIsRUFBNEIsSUFBQyxDQUFBLE9BQTdCLEVBQXNDLElBQUMsQ0FBQSxVQUF2QyxFQUFtRCxJQUFDLENBQUEsV0FBcEQsQ0FEWixDQUFBO0FBRUEsV0FBTyxTQUFQLENBSFU7RUFBQSxDQWhIWixDQUFBOztBQUFBLG1CQXFIQSxVQUFBLEdBQVksU0FBQyxTQUFELEdBQUE7QUFDVixRQUFBLE1BQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxFQUFBLEdBQUssQ0FBQyxJQUFDLENBQUEsS0FBRCxHQUFTLFNBQVMsQ0FBQyxLQUFwQixDQUFBLEdBQStCLENBRHBDLENBQUE7QUFBQSxJQUVBLEVBQUEsR0FBSyxDQUFDLElBQUMsQ0FBQSxNQUFELEdBQVUsU0FBUyxDQUFDLE1BQXJCLENBQUEsR0FBK0IsQ0FGcEMsQ0FBQTtXQUdBLElBQUMsQ0FBQSxHQUFHLENBQUMsWUFBTCxDQUFrQixTQUFsQixFQUE2QixFQUE3QixFQUFpQyxFQUFqQyxFQUpVO0VBQUEsQ0FySFosQ0FBQTs7QUFBQSxtQkE2SEEsS0FBQSxHQUFPLFNBQUMsU0FBRCxFQUFZLE1BQVosRUFBb0IsRUFBcEIsR0FBQTtBQUNMLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBQSxHQUNFO0FBQUEsTUFBQSxNQUFBLEVBQVEsTUFBUjtBQUFBLE1BQ0EsU0FBQSxFQUFXLFNBRFg7S0FERixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFkLENBQW9CLElBQXBCLEVBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7MENBQWlCLEdBQUksTUFBTSxlQUEzQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLENBSEEsQ0FESztFQUFBLENBN0hQLENBQUE7O0FBQUEsbUJBb0lBLE1BQUEsR0FBUSxTQUFDLFNBQUQsRUFBWSxFQUFaLEdBQUE7QUFDTixJQUFBLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FDYixDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxLQUFSLEVBQWUsSUFBZixFQUFrQixTQUFsQixFQUE2QixDQUFDLENBQUMsQ0FBQSxDQUFELEVBQUksQ0FBSixFQUFNLENBQU4sQ0FBRCxFQUFVLENBQUMsQ0FBQSxDQUFELEVBQUksQ0FBSixFQUFNLENBQU4sQ0FBVixFQUFtQixDQUFDLENBQUEsQ0FBRCxFQUFJLENBQUosRUFBTSxDQUFOLENBQW5CLENBQTdCLENBRGEsRUFFYixDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxLQUFSLEVBQWUsSUFBZixFQUFrQixTQUFsQixFQUE2QixDQUFDLENBQUMsQ0FBQSxDQUFELEVBQUksQ0FBQSxDQUFKLEVBQU8sQ0FBQSxDQUFQLENBQUQsRUFBWSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxDQUFaLEVBQW9CLENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMLENBQXBCLENBQTdCLENBRmEsQ0FBZixFQUdHLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTt3Q0FDRCxHQUFJLE1BQ0Y7QUFBQSxRQUFBLENBQUEsRUFBRyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBWDtBQUFBLFFBQ0EsQ0FBQSxFQUFHLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQURYO2tCQUZEO0lBQUEsQ0FISCxDQUFBLENBRE07RUFBQSxDQXBJUixDQUFBOztBQUFBLG1CQThJQSxLQUFBLEdBQU8sU0FBQyxTQUFELEVBQVksRUFBWixHQUFBO1dBQ0wsSUFBQyxDQUFBLE1BQUQsQ0FBUSxTQUFSLEVBQW1CLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7QUFDakIsUUFBQSxJQUFJLENBQUMsS0FBTCxHQUFhLEtBQUMsQ0FBQSxPQUFPLENBQUMsS0FBdEIsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLEtBQUwsR0FBYSxLQUFDLENBQUEsT0FBTyxDQUFDLEtBRHRCLENBQUE7ZUFFQSxLQUFDLENBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFkLENBQW9CLElBQXBCLEVBQTBCLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTs0Q0FBaUIsR0FBSSxNQUFNLGVBQTNCO1FBQUEsQ0FBMUIsRUFIaUI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixFQURLO0VBQUEsQ0E5SVAsQ0FBQTs7Z0JBQUE7O0dBRG1CLEtBRnJCLENBQUE7O0FBQUEsTUF1Sk0sQ0FBQyxPQUFQLEdBQWlCLE1BdkpqQixDQUFBOzs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkEsSUFBQSxvQkFBQTtFQUFBOzZCQUFBOztBQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUFULENBQUE7O0FBQUEsRUFFQSxHQUFLLE9BQUEsQ0FBUSxrQkFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxHQUFLLE9BQUEsQ0FBUSxlQUFSLENBSEwsQ0FBQTs7QUFBQTtBQU1FLDBCQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSxFQUFBLElBQUMsQ0FBQSxNQUFELENBQVMsRUFBVCxDQUFBLENBQUE7O0FBQUEsRUFDQSxJQUFDLENBQUEsT0FBRCxDQUFTLEVBQVQsQ0FEQSxDQUFBOztjQUFBOztHQURpQixPQUxuQixDQUFBOztBQUFBLE1BU00sQ0FBQyxPQUFQLEdBQWlCLElBVGpCLENBQUE7Ozs7O0FDQUEsSUFBQSxnQkFBQTs7QUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsRUFBQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTtXQUNkLElBQUMsQ0FBQSxvQkFBRCxJQUFDLENBQUEsa0JBQW9CLElBRFA7RUFBQSxDQUFoQjtBQUFBLEVBR0EsWUFBQSxFQUFjLFNBQUMsSUFBRCxHQUFBO0FBQ1osUUFBQSxJQUFBO0FBQUEsWUFBQSxJQUFDLENBQUEsY0FBRCxDQUFBLEVBQWtCLENBQUEsSUFBQSxVQUFBLENBQUEsSUFBQSxJQUFVLEdBQTVCLENBQUE7QUFDQSxXQUFPLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBa0IsQ0FBQSxJQUFBLENBQXpCLENBRlk7RUFBQSxDQUhkO0FBQUEsRUFPQSxZQUFBLEVBQWMsU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBO0FBQ1osUUFBQSxJQUFBO0FBQUEsWUFBQSxJQUFDLENBQUEsY0FBRCxDQUFBLEVBQWtCLENBQUEsSUFBQSxVQUFBLENBQUEsSUFBQSxJQUFVLE1BQTVCLENBRFk7RUFBQSxDQVBkO0FBQUEsRUFXQSxFQUFBLEVBQUksU0FBQyxJQUFELEVBQU8sUUFBUCxHQUFBO0FBQ0YsSUFBQSxJQUFBLENBQUEsUUFBQTtBQUFBLFlBQUEsQ0FBQTtLQUFBO1dBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsUUFBekIsRUFGRTtFQUFBLENBWEo7QUFBQSxFQWVBLEdBQUEsRUFBSyxTQUFDLElBQUQsRUFBTyxRQUFQLEdBQUE7QUFDSCxJQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0UsTUFBQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQWQsRUFBb0IsRUFBcEIsQ0FBQSxDQURGO0tBQUEsTUFBQTtBQUdFLE1BQUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLEVBQW9CLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBZCxDQUFtQixDQUFDLE1BQXBCLENBQTJCLFNBQUMsQ0FBRCxHQUFBO2VBQzdDLENBQUEsS0FBSyxTQUR3QztNQUFBLENBQTNCLENBQXBCLENBQUEsQ0FIRjtLQURHO0VBQUEsQ0FmTDtBQUFBLEVBdUJBLE9BQUEsRUFBUyxTQUFBLEdBQUE7QUFDUCxRQUFBLDJCQUFBO0FBQUEsSUFEUSxxQkFBTSw0REFDZCxDQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBO2tCQUFBO0FBQ0UsTUFBQSxJQUFVLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBVCxFQUFZLElBQVosQ0FBQSxLQUFxQixLQUEvQjtBQUFBLGNBQUEsQ0FBQTtPQURGO0FBQUEsS0FETztFQUFBLENBdkJUO0NBREYsQ0FBQTs7Ozs7QUNBQSxJQUFBLHNCQUFBO0VBQUEsbUpBQUE7O0FBQUEsY0FBQSxHQUFpQixDQUFDLFVBQUQsRUFBYSxVQUFiLENBQWpCLENBQUE7O0FBQUE7c0JBR0U7O0FBQUEsRUFBQSxNQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsR0FBRCxHQUFBO0FBQ1AsUUFBQSxlQUFBO0FBQUEsU0FBQSxVQUFBO3VCQUFBO1VBQTJCLGFBQVcsY0FBWCxFQUFBLEdBQUE7QUFDekIsUUFBQSxJQUFFLENBQUEsR0FBQSxDQUFGLEdBQVMsS0FBVDtPQURGO0FBQUEsS0FBQTs7U0FHWSxDQUFFLEtBQWQsQ0FBb0IsSUFBcEI7S0FIQTtXQUlBLEtBTE87RUFBQSxDQUFULENBQUE7O0FBQUEsRUFPQSxNQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsR0FBRCxHQUFBO0FBQ1IsUUFBQSxlQUFBO0FBQUEsU0FBQSxVQUFBO3VCQUFBO1VBQTJCLGFBQVcsY0FBWCxFQUFBLEdBQUE7QUFFekIsUUFBQSxJQUFDLENBQUEsU0FBRyxDQUFBLEdBQUEsQ0FBSixHQUFXLEtBQVg7T0FGRjtBQUFBLEtBQUE7O1NBSVksQ0FBRSxLQUFkLENBQW9CLElBQXBCO0tBSkE7V0FLQSxLQU5RO0VBQUEsQ0FQVixDQUFBOztnQkFBQTs7SUFIRixDQUFBOztBQUFBLE1Ba0JNLENBQUMsT0FBUCxHQUFpQixNQWxCakIsQ0FBQTs7Ozs7QUNBQSxJQUFBLGdCQUFBOztBQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxFQUFBLFFBQUEsRUFBVSxTQUFDLElBQUQsRUFBTyxPQUFQLEdBQUE7V0FDUixNQUFNLENBQUMsY0FBUCxDQUFzQixJQUFDLENBQUEsU0FBdkIsRUFBa0MsSUFBbEMsRUFBd0MsT0FBeEMsRUFEUTtFQUFBLENBQVY7QUFBQSxFQUdBLFdBQUEsRUFBYSxTQUFBLEdBQUE7QUFDWCxRQUFBLFNBQUE7QUFBQSxJQURZLHFCQUFNLDJEQUNsQixDQUFBO1dBQUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWLEVBQ0U7QUFBQSxNQUFBLEdBQUEsRUFBSyxTQUFBLEdBQUE7ZUFBRyxJQUFFLENBQUEsR0FBQSxHQUFJLElBQUosRUFBTDtNQUFBLENBQUw7QUFBQSxNQUNBLEdBQUEsRUFBSyxTQUFDLEtBQUQsR0FBQTtBQUNILFlBQUEsZ0JBQUE7QUFBQSxRQUFBLENBQUEsR0FBSSxLQUFBLEdBQUssQ0FBQyxJQUFJLENBQUMsVUFBTCxDQUFBLENBQUQsQ0FBVCxDQUFBO0FBQ0EsUUFBQSxJQUFHLGVBQUg7QUFDRSxVQUFBLENBQUEsR0FBSSxJQUFFLENBQUEsQ0FBQSxDQUFGLENBQUssS0FBTCxDQUFKLENBREY7U0FBQSxNQUFBO0FBR0UsVUFBQSxDQUFBLEdBQUksSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBQWUsS0FBZixDQUFKLENBSEY7U0FEQTtBQUtBLGFBQUEscUNBQUE7c0JBQUE7O1lBQ0UsSUFBRSxDQUFBLEVBQUE7V0FESjtBQUFBLFNBTEE7ZUFPQSxFQVJHO01BQUEsQ0FETDtLQURGLEVBRFc7RUFBQSxDQUhiO0FBQUEsRUFnQkEsUUFBQSxFQUFVLFNBQUEsR0FBQTtXQUNSLElBQUMsQ0FBQSxTQUFFLENBQUEsT0FBSCxHQUFhLFNBQUMsSUFBRCxFQUFPLEtBQVAsR0FBQTtBQUNYLE1BQUEsSUFBRyxJQUFFLENBQUEsR0FBQSxHQUFJLElBQUosQ0FBRixLQUFpQixLQUFwQjtBQUNFLFFBQUEsSUFBRSxDQUFBLEdBQUEsR0FBSSxJQUFKLENBQUYsR0FBZ0IsS0FBaEIsQ0FBQTs7VUFDQSxJQUFDLENBQUEsUUFBUyxTQUFBLEdBQVUsTUFBUSxJQUFFLENBQUEsR0FBQSxHQUFJLElBQUo7U0FGaEM7T0FBQTthQUdBLElBQUUsQ0FBQSxHQUFBLEdBQUksSUFBSixFQUpTO0lBQUEsRUFETDtFQUFBLENBaEJWO0NBREYsQ0FBQTs7Ozs7QUNDQSxJQUFBLHVKQUFBOztBQUFBLFNBQUEsR0FBWSxPQUFBLENBQVEsVUFBUixDQUFaLENBQUE7O0FBQUEsTUFDQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBRFQsQ0FBQTs7QUFBQSxPQUlBLEdBQVUsQ0FBQSxDQUFFLE1BQUYsQ0FKVixDQUFBOztBQUFBLE9BS0EsR0FBVSxJQUxWLENBQUE7O0FBQUEsTUFNQSxHQUFTLElBTlQsQ0FBQTs7QUFBQSxnQkFPQSxHQUFtQixJQVBuQixDQUFBOztBQUFBLGdCQVFBLEdBQW1CLElBUm5CLENBQUE7O0FBQUEsUUFTQSxHQUFXLElBVFgsQ0FBQTs7QUFBQSxZQVlBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsTUFBQSxDQUFBO0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBTyxDQUFDLE1BQVIsQ0FBQSxDQUFBLEdBQW1CLGdCQUFnQixDQUFDLE1BQWpCLENBQUEsQ0FBeUIsQ0FBQyxHQUE3QyxHQUFtRCxFQUF2RCxDQUFBO0FBQUEsRUFDQSxnQkFBZ0IsQ0FBQyxNQUFqQixDQUF3QixDQUFBLEdBQUksR0FBSixJQUFXLENBQVgsSUFBZ0IsR0FBeEMsQ0FEQSxDQUFBO0FBQUEsRUFFQSxPQUFPLENBQUMsSUFBUixDQUNFO0FBQUEsSUFBQSxLQUFBLEVBQVEsZ0JBQWdCLENBQUMsS0FBakIsQ0FBQSxDQUFBLEdBQTRCLENBQXBDO0FBQUEsSUFDQSxNQUFBLEVBQVEsZ0JBQWdCLENBQUMsTUFBakIsQ0FBQSxDQUFBLEdBQTRCLENBRHBDO0dBREYsQ0FGQSxDQUFBO0FBQUEsRUFNQSxDQUFBLEdBQUksT0FBTyxDQUFDLE1BQVIsQ0FBQSxDQUFBLEdBQW1CLGdCQUFnQixDQUFDLE1BQWpCLENBQUEsQ0FBeUIsQ0FBQyxHQUE3QyxHQUFtRCxFQU52RCxDQUFBO0FBQUEsRUFPQSxnQkFBZ0IsQ0FBQyxNQUFqQixDQUF3QixDQUFBLEdBQUksR0FBSixJQUFXLENBQVgsSUFBZ0IsR0FBeEMsQ0FQQSxDQUFBO1NBU0EsTUFBTSxDQUFDLElBQVAsQ0FBQSxFQVZhO0FBQUEsQ0FaZixDQUFBOztBQUFBLFVBd0JBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsTUFBQSxvQkFBQTtBQUFBLEVBQUEsQ0FBQSxHQUFJLElBQUosQ0FBQTtBQUNBLE9BQ0ssU0FBQyxLQUFELEdBQUE7QUFFRCxRQUFBLG9CQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU8sS0FBUCxDQUFBO0FBQUEsSUFDQSxJQUFBLEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxxQkFBZCxFQUFxQyxJQUFyQyxDQURQLENBQUE7QUFBQSxJQUdBLEdBQUEsR0FBTSxHQUFBLENBQUEsS0FITixDQUFBO0FBQUEsSUFJQSxHQUFHLENBQUMsR0FBSixHQUFVLElBSlYsQ0FBQTs7TUFLQSxJQUFLO0tBTEw7QUFBQSxJQVFBLEdBQUEsR0FBTSxDQUFBLENBQUUsK0ZBQUEsR0FHcUIsSUFIckIsR0FHMEIsYUFINUIsQ0FSTixDQUFBO0FBQUEsSUFjQSxDQUFBLENBQUUsUUFBRixFQUFZLEdBQVosQ0FBZ0IsQ0FBQyxNQUFqQixDQUF3QixHQUF4QixDQWRBLENBQUE7QUFBQSxJQWVBLEdBQUcsQ0FBQyxFQUFKLENBQU8sT0FBUCxFQUFnQixTQUFBLEdBQUE7YUFBRyxXQUFBLENBQVksR0FBWixFQUFIO0lBQUEsQ0FBaEIsQ0FmQSxDQUFBO1dBZ0JBLGdCQUFnQixDQUFDLE1BQWpCLENBQXdCLEdBQXhCLEVBbEJDO0VBQUEsQ0FETDtBQUFBLE9BQUEsMkNBQUE7eUJBQUE7QUFDRSxPQUFJLE1BQUosQ0FERjtBQUFBLEdBREE7U0F1QkEsQ0FBQyxDQUFDLGdCQUFGLENBQW1CLE1BQW5CLEVBQTJCLFNBQUEsR0FBQTtXQUFHLFdBQUEsQ0FBWSxDQUFaLEVBQUg7RUFBQSxDQUEzQixFQXhCVztBQUFBLENBeEJiLENBQUE7O0FBQUEsV0FrREEsR0FBYyxTQUFDLEtBQUQsR0FBQTtTQUNaLE1BQU0sQ0FBQyxTQUFQLENBQWlCLEtBQWpCLEVBRFk7QUFBQSxDQWxEZCxDQUFBOztBQUFBLFVBcURBLEdBQWEsT0FBQSxDQUFRLGFBQVIsQ0FyRGIsQ0FBQTs7QUFBQSxTQXNEQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsTUFBQSx3QkFBQTs7SUFEVyxPQUFPO0dBQ2xCO0FBQUE7QUFBQTtPQUFBLFVBQUE7cUJBQUE7QUFDRSxpQkFBQSxDQUFBLENBQUUsa0JBQUEsR0FBbUIsR0FBbkIsR0FBdUIsSUFBekIsQ0FBNkIsQ0FBQyxJQUE5QixDQUFtQyxLQUFuQyxFQUFBLENBREY7QUFBQTtpQkFEVTtBQUFBLENBdERaLENBQUE7O0FBQUEsT0EyRE8sQ0FBQyxFQUFSLENBQVcsUUFBWCxFQUFxQixZQUFyQixDQTNEQSxDQUFBOztBQUFBLE9BNkRPLENBQUMsRUFBUixDQUFXLE1BQVgsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLE1BQUEsZ0JBQUE7QUFBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7QUFBQSxFQUVBLE9BQUEsR0FBVSxDQUFBLENBQUUsU0FBRixDQUZWLENBQUE7QUFBQSxFQUdBLGdCQUFBLEdBQW1CLENBQUEsQ0FBRSxrQkFBRixDQUhuQixDQUFBO0FBQUEsRUFJQSxnQkFBQSxHQUFtQixDQUFBLENBQUUsa0JBQUYsQ0FKbkIsQ0FBQTtBQUFBLEVBS0EsUUFBQSxHQUFXLENBQUEsQ0FBRSxVQUFGLENBTFgsQ0FBQTtBQUFBLEVBTUEsT0FBQSxHQUFVLENBQUEsQ0FBRSxVQUFGLENBTlYsQ0FBQTtBQUFBLEVBT0EsT0FBQSxHQUFVLENBQUEsQ0FBRSxlQUFGLENBUFYsQ0FBQTtBQUFBLEVBU0EsTUFBQSxHQUFhLElBQUEsTUFBQSxDQUFPLE9BQVEsQ0FBQSxDQUFBLENBQWYsQ0FUYixDQUFBO0FBQUEsRUFVQSxNQUFNLENBQUMsRUFBUCxDQUFVLFNBQVYsRUFBcUIsU0FBQSxHQUFBO1dBQUcsUUFBUSxDQUFDLElBQVQsQ0FBQSxFQUFIO0VBQUEsQ0FBckIsQ0FWQSxDQUFBO0FBQUEsRUFXQSxNQUFNLENBQUMsRUFBUCxDQUFVLFFBQVYsRUFBb0IsU0FBQSxHQUFBO1dBQUcsUUFBUSxDQUFDLElBQVQsQ0FBQSxFQUFIO0VBQUEsQ0FBcEIsQ0FYQSxDQUFBO0FBQUEsRUFhQSxPQUFPLENBQUMsRUFBUixDQUFXLE9BQVgsRUFBb0IsU0FBQSxHQUFBO0FBQ2xCLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBQSxHQUFPLENBQUEsQ0FBRSxJQUFGLENBQUksQ0FBQyxJQUFMLENBQVUsTUFBVixDQUFQLENBQUE7V0FDQSxNQUFNLENBQUMsT0FBUCxDQUFlLElBQWYsRUFGa0I7RUFBQSxDQUFwQixDQWJBLENBQUE7QUFBQSxFQWlCQSxPQUFPLENBQUMsRUFBUixDQUFXLFFBQVgsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFFBQUEsY0FBQTtBQUFBLElBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxJQUFSLENBQUE7QUFBQSxJQUNBLEtBQUEsR0FBUSxNQUFBLENBQU8sSUFBQyxDQUFBLEtBQVIsQ0FEUixDQUFBO0FBQUEsSUFFQSxDQUFBLEdBQUksRUFGSixDQUFBO0FBQUEsSUFHQSxDQUFFLENBQUEsSUFBQSxDQUFGLEdBQVUsS0FIVixDQUFBO1dBSUEsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsQ0FBckIsRUFMbUI7RUFBQSxDQUFyQixDQWpCQSxDQUFBO0FBQUEsRUF3QkEsT0FBTyxDQUFDLEVBQVIsQ0FBVyxTQUFYLEVBQXNCLFNBQUMsS0FBRCxHQUFBO0FBQ3BCLElBQUEsSUFBRyxLQUFLLENBQUMsTUFBTixJQUFpQixLQUFLLENBQUMsT0FBTixLQUFpQixFQUFyQztBQUNFLE1BQUEsS0FBSyxDQUFDLGNBQU4sQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLFNBQUEsQ0FBVSxJQUFWLENBREEsQ0FERjtLQUFBO0FBR0EsSUFBQSxJQUFHLEtBQUssQ0FBQyxNQUFOLElBQWlCLEtBQUssQ0FBQyxPQUFOLEtBQWlCLEVBQXJDO0FBQ0UsTUFBQSxLQUFLLENBQUMsY0FBTixDQUFBLENBQUEsQ0FBQTthQUNBLFNBQUEsQ0FBVSxJQUFWLEVBRkY7S0FKb0I7RUFBQSxDQUF0QixDQXhCQSxDQUFBO0FBQUEsRUFnQ0EsWUFBQSxDQUFBLENBaENBLENBQUE7U0FpQ0EsVUFBQSxDQUFBLEVBbENpQjtBQUFBLENBQW5CLENBN0RBLENBQUE7Ozs7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJCYXNlID0gcmVxdWlyZSAnLi9saWIvYmFzZSdcblxuY2xhc3MgQ2FudmFzIGV4dGVuZHMgQmFzZVxuICBAcHJvcGVydHkgJ3dpZHRoJyAsIGdldDogLT4gQGVsLndpZHRoXG4gIEBwcm9wZXJ0eSAnaGVpZ2h0JywgZ2V0OiAtPiBAZWwuaGVpZ2h0XG5cbiAgQHByb3BlcnR5ICdpbWFnZVdpZHRoJyAsIGdldDogLT4gQGltYWdlPy5uYXR1cmFsV2lkdGggID8gMFxuICBAcHJvcGVydHkgJ2ltYWdlSGVpZ2h0JywgZ2V0OiAtPiBAaW1hZ2U/Lm5hdHVyYWxIZWlnaHQgPyAwXG5cbiAgQHByb3BlcnR5ICdvZmZzZXRYJywgZ2V0OiAtPiAoQHdpZHRoICAtIEBpbWFnZVdpZHRoKSAgLyAyXG4gIEBwcm9wZXJ0eSAnb2Zmc2V0WScsIGdldDogLT4gKEBoZWlnaHQgLSBAaW1hZ2VIZWlnaHQpIC8gMlxuXG4gIGRlZmF1bHRPcHRpb25zOlxuICAgIGNlbGxXOiAxMFxuICAgIGNlbGxIOiAxMFxuXG4gIHdvcmtlcnM6XG4gICAgY29udiA6IG5ldyBMaXN0ZW5lciAnLi9jb252LmpzJ1xuICAgIGNhbGMgOiBuZXcgTGlzdGVuZXIgJy4vY2FsYy5qcydcblxuICBjb25zdHJ1Y3RvcjogKEBlbCwgb3B0aW9ucyA9IHt9KSAtPlxuICAgIEBfY2FsY3VsYXRlZERhdGEgPSBudWxsXG4gICAgQF92aWV3ID0gbnVsbFxuICAgIEBvcHRpb25zID0ge31cblxuICAgIEBjdHggPSBAZWwuZ2V0Q29udGV4dChcIjJkXCIpXG4gICAgQGltYWdlID0gbnVsbFxuICAgIEB1cGRhdGVPcHRpb25zIG9wdGlvbnNcblxuICB1cGRhdGVPcHRpb25zOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgIF8uZXh0ZW5kIEBvcHRpb25zLCBvcHRpb25zLCBAZGVmYXVsdE9wdGlvbnNcbiAgICBAbG9hZEltYWdlKEBpbWFnZSlcblxuICBsb2FkSW1hZ2U6IChAaW1hZ2UpIC0+XG4gICAgQF9jYWxjdWxhdGVkRGF0YSA9IG51bGxcbiAgICBAX2NsZWFyKClcbiAgICByZXR1cm4gdW5sZXNzIEBpbWFnZVxuICAgIEB0cmlnZ2VyICdsb2FkaW5nJ1xuICAgIEBfZHJhd0ltYWdlKClcbiAgICBAX2NhbGMgQF9nZXRQaXhlbHMoKSwgKGVycm9yLCBkYXRhKSA9PlxuICAgICAgQF9jYWxjdWxhdGVkRGF0YSA9IGRhdGFcbiAgICAgIEBkcmF3KClcbiAgICAgIEB0cmlnZ2VyICdsb2FkZWQnXG5cbiAgc2V0VmlldzogKHZpZXcpIC0+XG4gICAgQF92aWV3ID0gdmlld1xuICAgIEBkcmF3KClcblxuICBkcmF3OiAtPlxuICAgIEBfY2xlYXIoKVxuICAgIEBfZHJhd0ltYWdlKClcbiAgICBzd2l0Y2ggQF92aWV3XG4gICAgICB3aGVuICdhbmdsZScgIHRoZW4gQF9kcmF3QW5nbGVzKClcbiAgICAgIHdoZW4gJ2xlbmd0aCcgdGhlbiBAX2RyYXdMZW5ndGgoKVxuICAgICAgd2hlbiAnY29oJyAgICB0aGVuIEBfZHJhd0NvaCgpXG5cbiAgX2NsZWFyOiAtPlxuICAgIEBjdHguY2xlYXJSZWN0IDAsIDAsIEB3aWR0aCwgQGhlaWdodFxuXG4gICMgZHJhd1xuICBfZHJhd0ltYWdlOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGltYWdlXG4gICAgQGN0eC5kcmF3SW1hZ2UgQGltYWdlLCBAb2Zmc2V0WCwgQG9mZnNldFlcbiAgICByZXR1cm5cblxuICBfZHJhd0FuZ2xlczogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBfY2FsY3VsYXRlZERhdGE/LmFuZ2xlXG4gICAgZGF0YSA9IEBfY2FsY3VsYXRlZERhdGEuYW5nbGVcbiAgICBAY3R4LmxpbmVXaWR0aCA9IDFcbiAgICBAY3R4LnN0cm9rZVN0eWxlID0gXCJyZWRcIlxuICAgIEBfZWFjaENlbGxzIGRhdGEsIChveCwgb3ksIHcsIGgsIHYpID0+XG4gICAgICBydyA9IHcgLyAyXG4gICAgICByaCA9IGggLyAyXG4gICAgICB4ID0gQG9mZnNldFggKyBveCArIHJ3XG4gICAgICB5ID0gQG9mZnNldFkgKyBveSArIHJoXG4gICAgICBAY3R4LmJlZ2luUGF0aCgpXG4gICAgICBAY3R4Lm1vdmVUbyh4LCB5KVxuICAgICAgQGN0eC5saW5lVG8oeCArIE1hdGguY29zKHYpICogcncsIHkgKyBNYXRoLnNpbih2KSAqIHJoKVxuICAgICAgQGN0eC5tb3ZlVG8oeCwgeSlcbiAgICAgIEBjdHgubGluZVRvKHggKyBNYXRoLmNvcyhNYXRoLlBJICsgdikgKiBydywgeSArIE1hdGguc2luKE1hdGguUEkgKyB2KSAqIHJoKVxuICAgICAgQGN0eC5zdHJva2UoKVxuXG4gIF9kcmF3TGVuZ3RoOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQF9jYWxjdWxhdGVkRGF0YT8ubGVuZ3RoXG4gICAgZGF0YSA9IEBfY2FsY3VsYXRlZERhdGEubGVuZ3RoXG4gICAgQF9lYWNoQ2VsbHMgZGF0YSwgKG94LCBveSwgdywgaCwgdikgPT5cbiAgICAgIGMgPSAyNTUgKiB2IHwgMVxuICAgICAgQGN0eC5maWxsU3R5bGUgPSBcInJnYigje2N9LCN7Y30sI3tjfSlcIlxuICAgICAgQGN0eC5maWxsUmVjdCBAb2Zmc2V0WCArIG94LCBAb2Zmc2V0WSArIG95LCB3ICsgMSwgaCArIDFcblxuICBfZHJhd0NvaDogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBfY2FsY3VsYXRlZERhdGE/LmNvaFxuICAgIGRhdGEgPSBAX2NhbGN1bGF0ZWREYXRhLmNvaFxuICAgIEBfZWFjaENlbGxzIGRhdGEsIChveCwgb3ksIHcsIGgsIHYpID0+XG4gICAgICBjID0gMjU1ICogdiB8IDFcbiAgICAgIEBjdHguZmlsbFN0eWxlID0gXCJyZ2IoI3tjfSwje2N9LCN7Y30pXCJcbiAgICAgIEBjdHguZmlsbFJlY3QgQG9mZnNldFggKyBveCwgQG9mZnNldFkgKyBveSwgdyArIDEsIGggKyAxXG5cbiAgX2VhY2hDZWxsczogKGRhdGEsIGNiKSAtPlxuICAgIHJldHVybiB1bmxlc3MgY2JcbiAgICBoID0gQGltYWdlSGVpZ2h0IC8gQG9wdGlvbnMuY2VsbEggfCAxXG4gICAgdyA9IEBpbWFnZVdpZHRoICAvIEBvcHRpb25zLmNlbGxXIHwgMVxuICAgIGZvciB5IGluIFswIC4uLiBoXVxuICAgICAgZm9yIHggaW4gWzAgLi4uIHddXG4gICAgICAgIHAgPSB5ICogdyArIHhcbiAgICAgICAgY2I/KFxuICAgICAgICAgIHggKiBAb3B0aW9ucy5jZWxsVyxcbiAgICAgICAgICB5ICogQG9wdGlvbnMuY2VsbEgsXG4gICAgICAgICAgQG9wdGlvbnMuY2VsbFcsXG4gICAgICAgICAgQG9wdGlvbnMuY2VsbEgsXG4gICAgICAgICAgZGF0YVtwXVxuICAgICAgICApXG5cblxuICAjIG90aGVyXG4gIF9nZXRQaXhlbHM6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaW1hZ2VcbiAgICBpbWFnZURhdGEgPSBAY3R4LmdldEltYWdlRGF0YSBAb2Zmc2V0WCwgQG9mZnNldFksIEBpbWFnZVdpZHRoLCBAaW1hZ2VIZWlnaHRcbiAgICByZXR1cm4gaW1hZ2VEYXRhXG5cbiAgX3B1dFBpeGVsczogKGltYWdlRGF0YSkgLT5cbiAgICBAY2xlYXIoKVxuICAgIG94ID0gKEB3aWR0aCAtIGltYWdlRGF0YS53aWR0aCkgICAvIDJcbiAgICBveSA9IChAaGVpZ2h0IC0gaW1hZ2VEYXRhLmhlaWdodCkgLyAyXG4gICAgQGN0eC5wdXRJbWFnZURhdGEgaW1hZ2VEYXRhLCBveCwgb3lcblxuXG4gICMgd29ya2Vyc1xuICBfY29udjogKGltYWdlRGF0YSwga2VybmVsLCBjYikgLT5cbiAgICBkYXRhID1cbiAgICAgIGtlcm5lbDoga2VybmVsXG4gICAgICBpbWFnZURhdGE6IGltYWdlRGF0YVxuICAgIEB3b3JrZXJzLmNvbnYuYXBwbHkgZGF0YSwgKGVycm9yLCBkYXRhKSA9PiBjYj8obnVsbCwgZGF0YSlcbiAgICByZXR1cm5cblxuICBfc29iZWw6IChpbWFnZURhdGEsIGNiKSAtPlxuICAgIGFzeW5jLnBhcmFsbGVsIFtcbiAgICAgIF8uYmluZCBAX2NvbnYsIEAsIGltYWdlRGF0YSwgW1stMSwwLDFdLFstMiwwLDJdLFstMSwwLDFdXVxuICAgICAgXy5iaW5kIEBfY29udiwgQCwgaW1hZ2VEYXRhLCBbWy0xLC0yLC0xXSxbMCwwLDBdLFsxLDIsMV1dXG4gICAgXSwgKGVycm9yLCBkYXRhKSAtPlxuICAgICAgY2I/IG51bGwsIFxuICAgICAgICB4OiBkYXRhWzBdLmltYWdlRGF0YVxuICAgICAgICB5OiBkYXRhWzFdLmltYWdlRGF0YVxuICAgIHJldHVyblxuXG4gIF9jYWxjOiAoaW1hZ2VEYXRhLCBjYikgLT5cbiAgICBAX3NvYmVsIGltYWdlRGF0YSwgKGVycm9yLCBkYXRhKSA9PlxuICAgICAgZGF0YS5jZWxsVyA9IEBvcHRpb25zLmNlbGxXXG4gICAgICBkYXRhLmNlbGxIID0gQG9wdGlvbnMuY2VsbEhcbiAgICAgIEB3b3JrZXJzLmNhbGMuYXBwbHkgZGF0YSwgKGVycm9yLCBkYXRhKSA9PiBjYj8obnVsbCwgZGF0YSlcblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNcbiIsIm1vZHVsZS5leHBvcnRzPVtcbiAgXCIuL2ltYWdlcy8wNl8yXzExM18xLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzIuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfMy5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM180LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzUuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfNi5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM183LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzguYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfOS5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExMl8xMS5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExMl8xMi5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM18xMC5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM18xMS5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM18xMi5ibXBcIixcblxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzEuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfMi5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF8zLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzQuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfNS5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF82LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzcuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfOC5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF85LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzEwLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzExLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzEyLmJtcFwiXG5dXG4iLCJNb2R1bGUgPSByZXF1aXJlICcuL21vZHVsZSdcblxucG0gPSByZXF1aXJlICcuL3Byb3BlcnR5X21peGluJ1xuZW0gPSByZXF1aXJlICcuL2V2ZW50X21peGluJ1xuXG5jbGFzcyBCYXNlIGV4dGVuZHMgTW9kdWxlXG4gIEBleHRlbmQgIHBtXG4gIEBpbmNsdWRlIGVtXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBfZXZlbnRIYW5kbGVyczogLT5cbiAgICBAX19ldmVudEhhbmRsZXJzIHx8PSB7fVxuIFxuICBfZ2V0SGFuZGxlcnM6IChuYW1lKSAtPlxuICAgIEBfZXZlbnRIYW5kbGVycygpW25hbWVdIHx8PSBbXVxuICAgIHJldHVybiBAX2V2ZW50SGFuZGxlcnMoKVtuYW1lXVxuIFxuICBfc2V0SGFuZGxlcnM6IChuYW1lLCB2YWx1ZSkgLT5cbiAgICBAX2V2ZW50SGFuZGxlcnMoKVtuYW1lXSB8fD0gdmFsdWVcbiAgICByZXR1cm5cbiBcbiAgb246IChuYW1lLCBjYWxsYmFjaykgLT5cbiAgICByZXR1cm4gdW5sZXNzIGNhbGxiYWNrXG4gICAgQF9nZXRIYW5kbGVycyhuYW1lKS5wdXNoIGNhbGxiYWNrXG4gXG4gIG9mZjogKG5hbWUsIGNhbGxiYWNrKSAtPlxuICAgIHVubGVzcyBjYWxsYmFja1xuICAgICAgQF9zZXRIYW5kbGVycyhuYW1lLCBbXSlcbiAgICBlbHNlXG4gICAgICBAX3NldEhhbmRsZXJzIG5hbWUsIEBfZ2V0SGFuZGxlcnMobmFtZSkuZmlsdGVyIChjKSAtPlxuICAgICAgICBjID09IGNhbGxiYWNrXG4gICAgcmV0dXJuXG4gXG4gIHRyaWdnZXI6IChuYW1lLCBhcmdzLi4uKSAtPlxuICAgIGZvciBjYiBpbiBAX2dldEhhbmRsZXJzKG5hbWUpXG4gICAgICByZXR1cm4gaWYgY2IuYXBwbHkoQCwgYXJncykgPT0gZmFsc2VcbiAgICByZXR1cm5cbiIsIm1vZHVsZUtleXdvcmRzID0gWydleHRlbmRlZCcsICdpbmNsdWRlZCddXG4gXG5jbGFzcyBNb2R1bGVcbiAgQGV4dGVuZDogKG9iaikgLT5cbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBvYmogd2hlbiBrZXkgbm90IGluIG1vZHVsZUtleXdvcmRzXG4gICAgICBAW2tleV0gPSB2YWx1ZVxuIFxuICAgIG9iai5leHRlbmRlZD8uYXBwbHkoQClcbiAgICBAXG4gXG4gIEBpbmNsdWRlOiAob2JqKSAtPlxuICAgIGZvciBrZXksIHZhbHVlIG9mIG9iaiB3aGVuIGtleSBub3QgaW4gbW9kdWxlS2V5d29yZHNcbiAgICAgICMgQXNzaWduIHByb3BlcnRpZXMgdG8gdGhlIHByb3RvdHlwZVxuICAgICAgQDo6W2tleV0gPSB2YWx1ZVxuIFxuICAgIG9iai5pbmNsdWRlZD8uYXBwbHkoQClcbiAgICBAXG5cbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIHByb3BlcnR5OiAocHJvcCwgb3B0aW9ucykgLT5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgb3B0aW9uc1xuIFxuICBhZGRQcm9wZXJ0eTogKG5hbWUsIGNicy4uLikgLT5cbiAgICBAcHJvcGVydHkgbmFtZSxcbiAgICAgIGdldDogLT4gQFtcIl8je25hbWV9XCJdXG4gICAgICBzZXQ6ICh2YWx1ZSkgLT5cbiAgICAgICAgbiA9IFwic2V0I3tuYW1lLmNhcGl0YWxpemUoKX1cIlxuICAgICAgICBpZiBAW25dP1xuICAgICAgICAgIHIgPSBAW25dKHZhbHVlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgciA9IEBzZXRQcm9wKG5hbWUsIHZhbHVlKVxuICAgICAgICBmb3IgY2IgaW4gY2JzXG4gICAgICAgICAgQFtjYl0/KClcbiAgICAgICAgclxuIFxuICBleHRlbmRlZDogLT5cbiAgICBAOjpzZXRQcm9wID0gKG5hbWUsIHZhbHVlKSAtPlxuICAgICAgaWYgQFtcIl8je25hbWV9XCJdICE9IHZhbHVlXG4gICAgICAgIEBbXCJfI3tuYW1lfVwiXSA9IHZhbHVlXG4gICAgICAgIEB0cmlnZ2VyPyBcImNoYW5nZToje25hbWV9XCIsIEBbXCJfI3tuYW1lfVwiXVxuICAgICAgQFtcIl8je25hbWV9XCJdXG4iLCIjIGltcG9ydFxuaW1hZ2VzU3JjID0gcmVxdWlyZSAnLi9pbWFnZXMnXG5DYW52YXMgPSByZXF1aXJlICcuL2NhbnZhcydcblxuIyB2YXJzXG4kd2luZG93ID0gJCh3aW5kb3cpXG4kY2FudmFzID0gbnVsbFxuY2FudmFzID0gbnVsbFxuJGNhbnZhc0NvbnRhaW5lciA9IG51bGxcbiRpbWFnZXNDb250YWluZXIgPSBudWxsXG4kbG9hZGluZyA9IG51bGxcblxuIyBmdW5jdGlvbnNcbnJlc2l6ZUNhbnZhcyA9IC0+XG4gIGggPSAkd2luZG93LmhlaWdodCgpIC0gJGNhbnZhc0NvbnRhaW5lci5vZmZzZXQoKS50b3AgLSA2MFxuICAkY2FudmFzQ29udGFpbmVyLmhlaWdodCBoID4gMzAwICYmIGggfHwgMzAwXG4gICRjYW52YXMuYXR0clxuICAgIHdpZHRoIDogJGNhbnZhc0NvbnRhaW5lci53aWR0aCgpICB8IDFcbiAgICBoZWlnaHQ6ICRjYW52YXNDb250YWluZXIuaGVpZ2h0KCkgfCAxXG5cbiAgaCA9ICR3aW5kb3cuaGVpZ2h0KCkgLSAkaW1hZ2VzQ29udGFpbmVyLm9mZnNldCgpLnRvcCAtIDQ1XG4gICRpbWFnZXNDb250YWluZXIuaGVpZ2h0IGggPiAzMDAgJiYgaCB8fCAzMDBcblxuICBjYW52YXMuZHJhdygpXG5cbmxvYWRJbWFnZXMgPSAtPlxuICBmID0gbnVsbFxuICBmb3IgaW1hZ2UgaW4gaW1hZ2VzU3JjXG4gICAgZG8gKGltYWdlKSAtPlxuICAgICAgIyBsb2FkaW5nXG4gICAgICBmaWxlID0gaW1hZ2VcbiAgICAgIG5hbWUgPSBpbWFnZS5yZXBsYWNlKC8uKj8oW15cXC9cXC5dKylcXC5ibXAkLywgXCIkMVwiKVxuXG4gICAgICBpbWcgPSBuZXcgSW1hZ2VcbiAgICAgIGltZy5zcmMgPSBmaWxlXG4gICAgICBmID89IGltZ1xuXG4gICAgICAjIHJlbmRlclxuICAgICAgJGVsID0gJCBcIlxuICAgICAgICA8ZGl2IGNsYXNzPSdjb2wtc20tNiBpbWFnZS1pdGVtIEltYWdlSXRlbSc+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nSW1hZ2UnPjwvZGl2PlxuICAgICAgICAgIDxhIGhyZWY9J2phdmFzY3JpcHQ6Oyc+I3tuYW1lfTwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlxuICAgICAgJCgnLkltYWdlJywgJGVsKS5hcHBlbmQgaW1nXG4gICAgICAkZWwub24gJ2NsaWNrJywgLT4gc2VsZWN0SW1hZ2UoaW1nKVxuICAgICAgJGltYWdlc0NvbnRhaW5lci5hcHBlbmQgJGVsXG5cbiAgIyBzZWxlY3QgZmlyc3QgaW1hZ2VcbiAgZi5hZGRFdmVudExpc3RlbmVyICdsb2FkJywgLT4gc2VsZWN0SW1hZ2UgZlxuXG5zZWxlY3RJbWFnZSA9IChpbWFnZSkgLT5cbiAgY2FudmFzLmxvYWRJbWFnZSBpbWFnZVxuXG50cmFuc2xhdGVzID0gcmVxdWlyZSAnLi90cmFuc2xhdGUnXG50cmFuc2xhdGUgPSAobGFuZyA9IFwiZW5cIikgLT5cbiAgZm9yIGtleSwgdmFsdWUgb2YgdHJhbnNsYXRlc1tsYW5nXVxuICAgICQoXCIuVGV4dFtkYXRhLWtleT0nI3trZXl9J11cIikudGV4dCB2YWx1ZVxuXG4jIGV2ZW50c1xuJHdpbmRvdy5vbiAncmVzaXplJywgcmVzaXplQ2FudmFzXG5cbiR3aW5kb3cub24gJ2xvYWQnLCAtPlxuICB0cmFuc2xhdGUoKVxuXG4gICRjYW52YXMgPSAkKCcuQ2FudmFzJylcbiAgJGNhbnZhc0NvbnRhaW5lciA9ICQoJy5DYW52YXNDb250YWluZXInKVxuICAkaW1hZ2VzQ29udGFpbmVyID0gJCgnLkltYWdlc0NvbnRhaW5lcicpXG4gICRsb2FkaW5nID0gJCgnLkxvYWRpbmcnKVxuICAkYnV0dG9uID0gJCgnLkJ0blZpZXcnKVxuICAkaW5wdXRzID0gJCgnLk9wdGlvbnNJbnB1dCcpXG5cbiAgY2FudmFzID0gbmV3IENhbnZhcyAkY2FudmFzWzBdXG4gIGNhbnZhcy5vbiAnbG9hZGluZycsIC0+ICRsb2FkaW5nLnNob3coKVxuICBjYW52YXMub24gJ2xvYWRlZCcsIC0+ICRsb2FkaW5nLmhpZGUoKVxuXG4gICRidXR0b24ub24gJ2NsaWNrJywgLT5cbiAgICB2aWV3ID0gJChAKS5kYXRhKCd2aWV3JylcbiAgICBjYW52YXMuc2V0VmlldyB2aWV3XG5cbiAgJGlucHV0cy5vbiAnY2hhbmdlJywgLT5cbiAgICBuYW1lID0gQG5hbWVcbiAgICB2YWx1ZSA9IE51bWJlciBAdmFsdWVcbiAgICBvID0ge31cbiAgICBvW25hbWVdID0gdmFsdWVcbiAgICBjYW52YXMudXBkYXRlT3B0aW9ucyBvXG5cbiAgJHdpbmRvdy5vbiAna2V5ZG93bicsIChldmVudCkgLT5cbiAgICBpZiBldmVudC5hbHRLZXkgYW5kIGV2ZW50LmtleUNvZGUgPT0gODRcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRyYW5zbGF0ZSgncnUnKVxuICAgIGlmIGV2ZW50LmFsdEtleSBhbmQgZXZlbnQua2V5Q29kZSA9PSA4NVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgdHJhbnNsYXRlKCdlbicpXG5cbiAgcmVzaXplQ2FudmFzKClcbiAgbG9hZEltYWdlcygpXG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiZW5cIjoge1xuICAgIFwidGl0bGVcIjogXCJEaXJlY3Rpb25hbCBGaWVsZCBFc3RpbWF0aW9uXCIsXG4gICAgXCJyZXN1bHRcIjogXCJSZXN1bHRcIixcbiAgICBcImxvYWRpbmdcIjogXCJDYWxjdWxhdGluZy4uLlwiLFxuICAgIFwiY29uZmlnXCI6IFwiQ29uZmlnXCIsXG4gICAgXCJzb3VyY2VcIjogXCJTb3VyY2UgaW1hZ2VcIixcbiAgICBcImFuZ2xlXCI6IFwiQW5nbGVzXCIsXG4gICAgXCJsZW5ndGhcIjogXCJMZW5ndGhcIixcbiAgICBcImNvaGVyZW5jeVwiOiBcIkNvaGVyZW5jeVwiLFxuICAgIFwiaW1hZ2VzXCI6IFwiSW1hZ2VzXCIsXG4gICAgXCJ3aWR0aFwiOiBcIldpZHRoXCIsXG4gICAgXCJoZWlnaHRcIjogXCJIZWlnaHRcIlxuICB9LFxuICBcInJ1XCI6IHtcbiAgICBcInRpdGxlXCI6IFwi0KLRg9GCINGA0LDRgdGH0LjRgtGL0LLQsNGO0YIg0L/QvtC70LUg0L3QsNC/0YDQsNCy0LvQtdC90LjQuSwg0LHRgNCw0YLQuNGI0LrQsC5cIixcbiAgICBcInJlc3VsdFwiOiBcItCS0LjQtNC40YjRjCDQutCw0Log0LrRgNGD0YLQviDRgdGH0LjRgtCw0LXRgtGB0Y8/XCIsXG4gICAgXCJsb2FkaW5nXCI6IFwi0J/QvtCz0L7QtNC4LCDQsdGA0LDRgtC+0LosINCy0YvRh9C40YHQu9GP0LXQvCDRgdC10LnRh9Cw0YEuLi5cIixcbiAgICBcImNvbmZpZ1wiOiBcItCU0YPQvNCw0Y4g0YLRg9GCINCy0YHQtSDQv9C+0L3Rj9GC0L3QvlwiLFxuICAgIFwic291cmNlXCI6IFwi0JjRgdGF0L7QtNC90LjQulwiLFxuICAgIFwiYW5nbGVcIjogXCLQo9Cz0LvRi1wiLFxuICAgIFwibGVuZ3RoXCI6IFwi0JTQu9C40L3QsFwiLFxuICAgIFwiY29oZXJlbmN5XCI6IFwi0JrQvtCz0LXRgNC10L3RgtC90L7RgdGC0YxcIixcbiAgICBcImltYWdlc1wiOiBcItCS0YvQsdC10YDQuCDQv9C+0L3RgNCw0LLQuNCy0YjRg9GO0YHRj1wiLFxuICAgIFwid2lkdGhcIjogXCLQqNC40YDQuNC90LBcIixcbiAgICBcImhlaWdodFwiOiBcItCS0YvRgdC+0YLQsFwiXG4gIH1cbn1cbiJdfQ==
