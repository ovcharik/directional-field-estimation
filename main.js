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
    cell: 15
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
    _.extend(this.options, this.defaultOptions, options);
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
      return function(ox, oy, size, v, i) {
        var half, x, y;
        if (l[i] < 0.01) {
          return;
        }
        half = size / 2;
        x = _this.offsetX + ox + half;
        y = _this.offsetY + oy + half;
        _this.ctx.beginPath();
        _this.ctx.moveTo(x, y);
        _this.ctx.lineTo(x + Math.cos(v) * half, y - Math.sin(v) * half);
        _this.ctx.moveTo(x, y);
        _this.ctx.lineTo(x - Math.cos(v) * half, y + Math.sin(v) * half);
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
      return function(ox, oy, size, v) {
        var c;
        c = Math.floor(255 * v);
        _this.ctx.fillStyle = "rgb(" + c + "," + c + "," + c + ")";
        return _this.ctx.fillRect(_this.offsetX + ox, _this.offsetY + oy, size + 1, size + 1);
      };
    })(this));
  };

  Canvas.prototype._drawCoh = function() {
    var data, l, ref;
    if (!((ref = this._calculatedData) != null ? ref.coh : void 0)) {
      return;
    }
    this._clear();
    data = this._calculatedData.coh;
    l = this._calculatedData.length;
    return this._eachCells(data, (function(_this) {
      return function(ox, oy, size, v, i) {
        var c;
        if (l[i] < 0.01) {
          return;
        }
        c = Math.floor(255 * v);
        _this.ctx.fillStyle = "rgb(" + c + "," + c + "," + c + ")";
        return _this.ctx.fillRect(_this.offsetX + ox, _this.offsetY + oy, size + 1, size + 1);
      };
    })(this));
  };

  Canvas.prototype._eachCells = function(data, cb) {
    var h, j, p, ref, results, w, x, y;
    if (!cb) {
      return;
    }
    h = Math.floor(this.imageHeight / this.options.cell);
    w = Math.floor(this.imageWidth / this.options.cell);
    results = [];
    for (y = j = 0, ref = h; 0 <= ref ? j < ref : j > ref; y = 0 <= ref ? ++j : --j) {
      results.push((function() {
        var k, ref1, results1;
        results1 = [];
        for (x = k = 0, ref1 = w; 0 <= ref1 ? k < ref1 : k > ref1; x = 0 <= ref1 ? ++k : --k) {
          p = y * w + x;
          results1.push(typeof cb === "function" ? cb(x * this.options.cell, y * this.options.cell, this.options.cell, data[p], p) : void 0);
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
        data.cell = _this.options.cell;
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
  var $button, $inputs, key, options, value, view;
  translate();
  $canvas = $('.Canvas');
  $canvasContainer = $('.CanvasContainer');
  $imagesContainer = $('.ImagesContainer');
  $loading = $('.Loading');
  $button = $('.BtnView');
  $inputs = $('.OptionsInput');
  try {
    options = JSON.parse(localStorage.options);
  } catch (_error) {
    options = {};
  }
  for (key in options) {
    value = options[key];
    $(".OptionsInput[name=" + key + "]").val(value);
  }
  canvas = new Canvas($canvas[0], options);
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
    var name;
    name = this.name;
    value = Number(this.value);
    options = {};
    options[name] = value;
    localStorage.options = JSON.stringify(options);
    return canvas.updateOptions(options);
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
    "cellSize": "Cell size",
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
    "cellSize": "Размер ячейки",
  }
}

},{}]},{},[7])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9tb3YvZGV2L2RmZS9zcmMvY2FudmFzLmNvZmZlZSIsInNyYy9pbWFnZXMuanNvbiIsIi9ob21lL21vdi9kZXYvZGZlL3NyYy9saWIvYmFzZS5jb2ZmZWUiLCIvaG9tZS9tb3YvZGV2L2RmZS9zcmMvbGliL2V2ZW50X21peGluLmNvZmZlZSIsIi9ob21lL21vdi9kZXYvZGZlL3NyYy9saWIvbW9kdWxlLmNvZmZlZSIsIi9ob21lL21vdi9kZXYvZGZlL3NyYy9saWIvcHJvcGVydHlfbWl4aW4uY29mZmVlIiwiL2hvbWUvbW92L2Rldi9kZmUvc3JjL21haW4uY29mZmVlIiwic3JjL3RyYW5zbGF0ZS5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxZQUFBO0VBQUE7NkJBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxZQUFSLENBQVAsQ0FBQTs7QUFBQTtBQUdFLDRCQUFBLENBQUE7O0FBQUEsRUFBQSxNQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBb0I7QUFBQSxJQUFBLEdBQUEsRUFBSyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsRUFBRSxDQUFDLE1BQVA7SUFBQSxDQUFMO0dBQXBCLENBQUEsQ0FBQTs7QUFBQSxFQUNBLE1BQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUFvQjtBQUFBLElBQUEsR0FBQSxFQUFLLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxFQUFFLENBQUMsT0FBUDtJQUFBLENBQUw7R0FBcEIsQ0FEQSxDQUFBOztBQUFBLEVBR0EsTUFBQyxDQUFBLFFBQUQsQ0FBVSxZQUFWLEVBQXlCO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBO0FBQUcsVUFBQSxTQUFBOzhGQUF3QixFQUEzQjtJQUFBLENBQUw7R0FBekIsQ0FIQSxDQUFBOztBQUFBLEVBSUEsTUFBQyxDQUFBLFFBQUQsQ0FBVSxhQUFWLEVBQXlCO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBO0FBQUcsVUFBQSxTQUFBOytGQUF3QixFQUEzQjtJQUFBLENBQUw7R0FBekIsQ0FKQSxDQUFBOztBQUFBLEVBTUEsTUFBQyxDQUFBLFFBQUQsQ0FBVSxTQUFWLEVBQXFCO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBO2FBQUcsQ0FBQyxJQUFDLENBQUEsS0FBRCxHQUFVLElBQUMsQ0FBQSxVQUFaLENBQUEsR0FBMkIsRUFBOUI7SUFBQSxDQUFMO0dBQXJCLENBTkEsQ0FBQTs7QUFBQSxFQU9BLE1BQUMsQ0FBQSxRQUFELENBQVUsU0FBVixFQUFxQjtBQUFBLElBQUEsR0FBQSxFQUFLLFNBQUEsR0FBQTthQUFHLENBQUMsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsV0FBWixDQUFBLEdBQTJCLEVBQTlCO0lBQUEsQ0FBTDtHQUFyQixDQVBBLENBQUE7O0FBQUEsbUJBU0EsY0FBQSxHQUNFO0FBQUEsSUFBQSxJQUFBLEVBQU0sRUFBTjtHQVZGLENBQUE7O0FBQUEsbUJBWUEsT0FBQSxHQUNFO0FBQUEsSUFBQSxLQUFBLEVBQVksSUFBQSxRQUFBLENBQVMsWUFBVCxDQUFaO0FBQUEsSUFDQSxJQUFBLEVBQVksSUFBQSxRQUFBLENBQVMsV0FBVCxDQURaO0dBYkYsQ0FBQTs7QUFnQmEsRUFBQSxnQkFBQyxFQUFELEVBQU0sT0FBTixHQUFBO0FBQ1gsSUFEWSxJQUFDLENBQUEsS0FBRCxFQUNaLENBQUE7O01BRGlCLFVBQVU7S0FDM0I7QUFBQSxJQUFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLElBQW5CLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFEVCxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBRlgsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLEdBQUQsR0FBTyxJQUFDLENBQUEsRUFBRSxDQUFDLFVBQUosQ0FBZSxJQUFmLENBSlAsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUxULENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxhQUFELENBQWUsT0FBZixDQU5BLENBRFc7RUFBQSxDQWhCYjs7QUFBQSxtQkF5QkEsYUFBQSxHQUFlLFNBQUMsT0FBRCxHQUFBOztNQUFDLFVBQVU7S0FDeEI7QUFBQSxJQUFBLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLE9BQVYsRUFBbUIsSUFBQyxDQUFBLGNBQXBCLEVBQW9DLE9BQXBDLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLEtBQVosRUFGYTtFQUFBLENBekJmLENBQUE7O0FBQUEsbUJBNkJBLFNBQUEsR0FBVyxTQUFDLEtBQUQsR0FBQTtBQUNULElBRFUsSUFBQyxDQUFBLFFBQUQsS0FDVixDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFuQixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBREEsQ0FBQTtBQUVBLElBQUEsSUFBQSxDQUFBLElBQWUsQ0FBQSxLQUFmO0FBQUEsWUFBQSxDQUFBO0tBRkE7QUFBQSxJQUdBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBVCxDQUhBLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FKQSxDQUFBO1dBS0EsSUFBQyxDQUFBLEtBQUQsQ0FBTyxJQUFDLENBQUEsVUFBRCxDQUFBLENBQVAsRUFBc0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNwQixRQUFBLEtBQUMsQ0FBQSxlQUFELEdBQW1CLElBQW5CLENBQUE7QUFBQSxRQUNBLEtBQUMsQ0FBQSxJQUFELENBQUEsQ0FEQSxDQUFBO2VBRUEsS0FBQyxDQUFBLE9BQUQsQ0FBUyxRQUFULEVBSG9CO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEIsRUFOUztFQUFBLENBN0JYLENBQUE7O0FBQUEsbUJBd0NBLE9BQUEsR0FBUyxTQUFDLElBQUQsR0FBQTtBQUNQLElBQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFULENBQUE7V0FDQSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBRk87RUFBQSxDQXhDVCxDQUFBOztBQUFBLG1CQTRDQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osSUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQURBLENBQUE7QUFFQSxZQUFPLElBQUMsQ0FBQSxLQUFSO0FBQUEsV0FDTyxPQURQO2VBQ3FCLElBQUMsQ0FBQSxXQUFELENBQUEsRUFEckI7QUFBQSxXQUVPLFFBRlA7ZUFFcUIsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQUZyQjtBQUFBLFdBR08sS0FIUDtlQUdxQixJQUFDLENBQUEsUUFBRCxDQUFBLEVBSHJCO0FBQUEsS0FISTtFQUFBLENBNUNOLENBQUE7O0FBQUEsbUJBb0RBLE1BQUEsR0FBUSxTQUFBLEdBQUE7V0FDTixJQUFDLENBQUEsR0FBRyxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBQWtCLENBQWxCLEVBQXFCLElBQUMsQ0FBQSxLQUF0QixFQUE2QixJQUFDLENBQUEsTUFBOUIsRUFETTtFQUFBLENBcERSLENBQUE7O0FBQUEsbUJBd0RBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixJQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsS0FBZjtBQUFBLFlBQUEsQ0FBQTtLQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsS0FBaEIsRUFBdUIsSUFBQyxDQUFBLE9BQXhCLEVBQWlDLElBQUMsQ0FBQSxPQUFsQyxDQURBLENBRFU7RUFBQSxDQXhEWixDQUFBOztBQUFBLG1CQTZEQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsUUFBQSxZQUFBO0FBQUEsSUFBQSxJQUFBLENBQUEsMkNBQThCLENBQUUsZUFBaEM7QUFBQSxZQUFBLENBQUE7S0FBQTtBQUFBLElBQ0EsSUFBQSxHQUFPLElBQUMsQ0FBQSxlQUFlLENBQUMsS0FEeEIsQ0FBQTtBQUFBLElBRUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxlQUFlLENBQUMsTUFGckIsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxTQUFMLEdBQWlCLENBSGpCLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxHQUFHLENBQUMsV0FBTCxHQUFtQixLQUpuQixDQUFBO1dBS0EsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaLEVBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsSUFBVCxFQUFlLENBQWYsRUFBa0IsQ0FBbEIsR0FBQTtBQUNoQixZQUFBLFVBQUE7QUFBQSxRQUFBLElBQVUsQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLElBQWpCO0FBQUEsZ0JBQUEsQ0FBQTtTQUFBO0FBQUEsUUFDQSxJQUFBLEdBQU8sSUFBQSxHQUFPLENBRGQsQ0FBQTtBQUFBLFFBRUEsQ0FBQSxHQUFJLEtBQUMsQ0FBQSxPQUFELEdBQVcsRUFBWCxHQUFnQixJQUZwQixDQUFBO0FBQUEsUUFHQSxDQUFBLEdBQUksS0FBQyxDQUFBLE9BQUQsR0FBVyxFQUFYLEdBQWdCLElBSHBCLENBQUE7QUFBQSxRQUlBLEtBQUMsQ0FBQSxHQUFHLENBQUMsU0FBTCxDQUFBLENBSkEsQ0FBQTtBQUFBLFFBS0EsS0FBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksQ0FBWixFQUFlLENBQWYsQ0FMQSxDQUFBO0FBQUEsUUFNQSxLQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBWSxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULENBQUEsR0FBYyxJQUE5QixFQUFvQyxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULENBQUEsR0FBYyxJQUF0RCxDQU5BLENBQUE7QUFBQSxRQU9BLEtBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFZLENBQVosRUFBZSxDQUFmLENBUEEsQ0FBQTtBQUFBLFFBUUEsS0FBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxDQUFBLEdBQWMsSUFBOUIsRUFBb0MsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxDQUFBLEdBQWMsSUFBdEQsQ0FSQSxDQUFBO2VBU0EsS0FBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQUEsRUFWZ0I7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQixFQU5XO0VBQUEsQ0E3RGIsQ0FBQTs7QUFBQSxtQkErRUEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLFFBQUEsU0FBQTtBQUFBLElBQUEsSUFBQSxDQUFBLDJDQUE4QixDQUFFLGdCQUFoQztBQUFBLFlBQUEsQ0FBQTtLQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBREEsQ0FBQTtBQUFBLElBRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxlQUFlLENBQUMsTUFGeEIsQ0FBQTtXQUdBLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixFQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLElBQVQsRUFBZSxDQUFmLEdBQUE7QUFDaEIsWUFBQSxDQUFBO0FBQUEsUUFBQSxDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFBLEdBQU0sQ0FBakIsQ0FBSixDQUFBO0FBQUEsUUFDQSxLQUFDLENBQUEsR0FBRyxDQUFDLFNBQUwsR0FBaUIsTUFBQSxHQUFPLENBQVAsR0FBUyxHQUFULEdBQVksQ0FBWixHQUFjLEdBQWQsR0FBaUIsQ0FBakIsR0FBbUIsR0FEcEMsQ0FBQTtlQUVBLEtBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLEtBQUMsQ0FBQSxPQUFELEdBQVcsRUFBekIsRUFBNkIsS0FBQyxDQUFBLE9BQUQsR0FBVyxFQUF4QyxFQUE0QyxJQUFBLEdBQU8sQ0FBbkQsRUFBc0QsSUFBQSxHQUFPLENBQTdELEVBSGdCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsRUFKVztFQUFBLENBL0ViLENBQUE7O0FBQUEsbUJBd0ZBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDUixRQUFBLFlBQUE7QUFBQSxJQUFBLElBQUEsQ0FBQSwyQ0FBOEIsQ0FBRSxhQUFoQztBQUFBLFlBQUEsQ0FBQTtLQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBREEsQ0FBQTtBQUFBLElBRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxlQUFlLENBQUMsR0FGeEIsQ0FBQTtBQUFBLElBR0EsQ0FBQSxHQUFJLElBQUMsQ0FBQSxlQUFlLENBQUMsTUFIckIsQ0FBQTtXQUlBLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixFQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLElBQVQsRUFBZSxDQUFmLEVBQWtCLENBQWxCLEdBQUE7QUFDaEIsWUFBQSxDQUFBO0FBQUEsUUFBQSxJQUFVLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxJQUFqQjtBQUFBLGdCQUFBLENBQUE7U0FBQTtBQUFBLFFBQ0EsQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBQSxHQUFNLENBQWpCLENBREosQ0FBQTtBQUFBLFFBRUEsS0FBQyxDQUFBLEdBQUcsQ0FBQyxTQUFMLEdBQWlCLE1BQUEsR0FBTyxDQUFQLEdBQVMsR0FBVCxHQUFZLENBQVosR0FBYyxHQUFkLEdBQWlCLENBQWpCLEdBQW1CLEdBRnBDLENBQUE7ZUFHQSxLQUFDLENBQUEsR0FBRyxDQUFDLFFBQUwsQ0FBYyxLQUFDLENBQUEsT0FBRCxHQUFXLEVBQXpCLEVBQTZCLEtBQUMsQ0FBQSxPQUFELEdBQVcsRUFBeEMsRUFBNEMsSUFBQSxHQUFPLENBQW5ELEVBQXNELElBQUEsR0FBTyxDQUE3RCxFQUpnQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCLEVBTFE7RUFBQSxDQXhGVixDQUFBOztBQUFBLG1CQW1HQSxVQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sRUFBUCxHQUFBO0FBQ1YsUUFBQSw4QkFBQTtBQUFBLElBQUEsSUFBQSxDQUFBLEVBQUE7QUFBQSxZQUFBLENBQUE7S0FBQTtBQUFBLElBQ0EsQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQW5DLENBREosQ0FBQTtBQUFBLElBRUEsQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLFVBQUQsR0FBZSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQW5DLENBRkosQ0FBQTtBQUdBO1NBQVMsMEVBQVQsR0FBQTtBQUNFOztBQUFBO2FBQVMsK0VBQVQsR0FBQTtBQUNFLFVBQUEsQ0FBQSxHQUFJLENBQUEsR0FBSSxDQUFKLEdBQVEsQ0FBWixDQUFBO0FBQUEsbURBQ0EsR0FDRSxDQUFBLEdBQUksSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUNiLENBQUEsR0FBSSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQ2IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUNULElBQUssQ0FBQSxDQUFBLEdBQ0wsWUFORixDQURGO0FBQUE7O29CQUFBLENBREY7QUFBQTttQkFKVTtFQUFBLENBbkdaLENBQUE7O0FBQUEsbUJBb0hBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixRQUFBLFNBQUE7QUFBQSxJQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsS0FBZjtBQUFBLFlBQUEsQ0FBQTtLQUFBO0FBQUEsSUFDQSxTQUFBLEdBQVksSUFBQyxDQUFBLEdBQUcsQ0FBQyxZQUFMLENBQWtCLElBQUMsQ0FBQSxPQUFuQixFQUE0QixJQUFDLENBQUEsT0FBN0IsRUFBc0MsSUFBQyxDQUFBLFVBQXZDLEVBQW1ELElBQUMsQ0FBQSxXQUFwRCxDQURaLENBQUE7QUFFQSxXQUFPLFNBQVAsQ0FIVTtFQUFBLENBcEhaLENBQUE7O0FBQUEsbUJBeUhBLFVBQUEsR0FBWSxTQUFDLFNBQUQsR0FBQTtBQUNWLFFBQUEsTUFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLEVBQUEsR0FBSyxDQUFDLElBQUMsQ0FBQSxLQUFELEdBQVMsU0FBUyxDQUFDLEtBQXBCLENBQUEsR0FBK0IsQ0FEcEMsQ0FBQTtBQUFBLElBRUEsRUFBQSxHQUFLLENBQUMsSUFBQyxDQUFBLE1BQUQsR0FBVSxTQUFTLENBQUMsTUFBckIsQ0FBQSxHQUErQixDQUZwQyxDQUFBO1dBR0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxZQUFMLENBQWtCLFNBQWxCLEVBQTZCLEVBQTdCLEVBQWlDLEVBQWpDLEVBSlU7RUFBQSxDQXpIWixDQUFBOztBQUFBLG1CQWlJQSxLQUFBLEdBQU8sU0FBQyxTQUFELEVBQVksTUFBWixFQUFvQixFQUFwQixHQUFBO0FBQ0wsSUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFkLENBQW9CO0FBQUEsTUFBQyxNQUFBLEVBQVEsTUFBVDtBQUFBLE1BQWlCLFNBQUEsRUFBVyxTQUE1QjtLQUFwQixFQUE0RCxFQUE1RCxDQUFBLENBREs7RUFBQSxDQWpJUCxDQUFBOztBQUFBLG1CQXFJQSxNQUFBLEdBQVEsU0FBQyxTQUFELEVBQVksRUFBWixHQUFBO0FBQ04sSUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFmLENBQXFCO0FBQUEsTUFBQyxTQUFBLEVBQVcsU0FBWjtLQUFyQixFQUE2QyxFQUE3QyxDQUFBLENBRE07RUFBQSxDQXJJUixDQUFBOztBQUFBLG1CQXlJQSxLQUFBLEdBQU8sU0FBQyxTQUFELEVBQVksRUFBWixHQUFBO1dBQ0wsSUFBQyxDQUFBLE1BQUQsQ0FBUSxTQUFSLEVBQW1CLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7QUFDakIsUUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBckIsQ0FBQTtlQUNBLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQWQsQ0FBb0IsSUFBcEIsRUFBMEIsRUFBMUIsRUFGaUI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixFQURLO0VBQUEsQ0F6SVAsQ0FBQTs7Z0JBQUE7O0dBRG1CLEtBRnJCLENBQUE7O0FBQUEsTUFpSk0sQ0FBQyxPQUFQLEdBQWlCLE1BakpqQixDQUFBOzs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkEsSUFBQSxvQkFBQTtFQUFBOzZCQUFBOztBQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUFULENBQUE7O0FBQUEsRUFFQSxHQUFLLE9BQUEsQ0FBUSxrQkFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxHQUFLLE9BQUEsQ0FBUSxlQUFSLENBSEwsQ0FBQTs7QUFBQTtBQU1FLDBCQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSxFQUFBLElBQUMsQ0FBQSxNQUFELENBQVMsRUFBVCxDQUFBLENBQUE7O0FBQUEsRUFDQSxJQUFDLENBQUEsT0FBRCxDQUFTLEVBQVQsQ0FEQSxDQUFBOztjQUFBOztHQURpQixPQUxuQixDQUFBOztBQUFBLE1BU00sQ0FBQyxPQUFQLEdBQWlCLElBVGpCLENBQUE7Ozs7O0FDQUEsSUFBQSxnQkFBQTs7QUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsRUFBQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTtXQUNkLElBQUMsQ0FBQSxvQkFBRCxJQUFDLENBQUEsa0JBQW9CLElBRFA7RUFBQSxDQUFoQjtBQUFBLEVBR0EsWUFBQSxFQUFjLFNBQUMsSUFBRCxHQUFBO0FBQ1osUUFBQSxJQUFBO0FBQUEsWUFBQSxJQUFDLENBQUEsY0FBRCxDQUFBLEVBQWtCLENBQUEsSUFBQSxVQUFBLENBQUEsSUFBQSxJQUFVLEdBQTVCLENBQUE7QUFDQSxXQUFPLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBa0IsQ0FBQSxJQUFBLENBQXpCLENBRlk7RUFBQSxDQUhkO0FBQUEsRUFPQSxZQUFBLEVBQWMsU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBO0FBQ1osUUFBQSxJQUFBO0FBQUEsWUFBQSxJQUFDLENBQUEsY0FBRCxDQUFBLEVBQWtCLENBQUEsSUFBQSxVQUFBLENBQUEsSUFBQSxJQUFVLE1BQTVCLENBRFk7RUFBQSxDQVBkO0FBQUEsRUFXQSxFQUFBLEVBQUksU0FBQyxJQUFELEVBQU8sUUFBUCxHQUFBO0FBQ0YsSUFBQSxJQUFBLENBQUEsUUFBQTtBQUFBLFlBQUEsQ0FBQTtLQUFBO1dBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsUUFBekIsRUFGRTtFQUFBLENBWEo7QUFBQSxFQWVBLEdBQUEsRUFBSyxTQUFDLElBQUQsRUFBTyxRQUFQLEdBQUE7QUFDSCxJQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0UsTUFBQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQWQsRUFBb0IsRUFBcEIsQ0FBQSxDQURGO0tBQUEsTUFBQTtBQUdFLE1BQUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLEVBQW9CLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBZCxDQUFtQixDQUFDLE1BQXBCLENBQTJCLFNBQUMsQ0FBRCxHQUFBO2VBQzdDLENBQUEsS0FBSyxTQUR3QztNQUFBLENBQTNCLENBQXBCLENBQUEsQ0FIRjtLQURHO0VBQUEsQ0FmTDtBQUFBLEVBdUJBLE9BQUEsRUFBUyxTQUFBLEdBQUE7QUFDUCxRQUFBLDJCQUFBO0FBQUEsSUFEUSxxQkFBTSw0REFDZCxDQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBO2tCQUFBO0FBQ0UsTUFBQSxJQUFVLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBVCxFQUFZLElBQVosQ0FBQSxLQUFxQixLQUEvQjtBQUFBLGNBQUEsQ0FBQTtPQURGO0FBQUEsS0FETztFQUFBLENBdkJUO0NBREYsQ0FBQTs7Ozs7QUNBQSxJQUFBLHNCQUFBO0VBQUEsbUpBQUE7O0FBQUEsY0FBQSxHQUFpQixDQUFDLFVBQUQsRUFBYSxVQUFiLENBQWpCLENBQUE7O0FBQUE7c0JBR0U7O0FBQUEsRUFBQSxNQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsR0FBRCxHQUFBO0FBQ1AsUUFBQSxlQUFBO0FBQUEsU0FBQSxVQUFBO3VCQUFBO1VBQTJCLGFBQVcsY0FBWCxFQUFBLEdBQUE7QUFDekIsUUFBQSxJQUFFLENBQUEsR0FBQSxDQUFGLEdBQVMsS0FBVDtPQURGO0FBQUEsS0FBQTs7U0FHWSxDQUFFLEtBQWQsQ0FBb0IsSUFBcEI7S0FIQTtXQUlBLEtBTE87RUFBQSxDQUFULENBQUE7O0FBQUEsRUFPQSxNQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsR0FBRCxHQUFBO0FBQ1IsUUFBQSxlQUFBO0FBQUEsU0FBQSxVQUFBO3VCQUFBO1VBQTJCLGFBQVcsY0FBWCxFQUFBLEdBQUE7QUFFekIsUUFBQSxJQUFDLENBQUEsU0FBRyxDQUFBLEdBQUEsQ0FBSixHQUFXLEtBQVg7T0FGRjtBQUFBLEtBQUE7O1NBSVksQ0FBRSxLQUFkLENBQW9CLElBQXBCO0tBSkE7V0FLQSxLQU5RO0VBQUEsQ0FQVixDQUFBOztnQkFBQTs7SUFIRixDQUFBOztBQUFBLE1Ba0JNLENBQUMsT0FBUCxHQUFpQixNQWxCakIsQ0FBQTs7Ozs7QUNBQSxJQUFBLGdCQUFBOztBQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxFQUFBLFFBQUEsRUFBVSxTQUFDLElBQUQsRUFBTyxPQUFQLEdBQUE7V0FDUixNQUFNLENBQUMsY0FBUCxDQUFzQixJQUFDLENBQUEsU0FBdkIsRUFBa0MsSUFBbEMsRUFBd0MsT0FBeEMsRUFEUTtFQUFBLENBQVY7QUFBQSxFQUdBLFdBQUEsRUFBYSxTQUFBLEdBQUE7QUFDWCxRQUFBLFNBQUE7QUFBQSxJQURZLHFCQUFNLDJEQUNsQixDQUFBO1dBQUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWLEVBQ0U7QUFBQSxNQUFBLEdBQUEsRUFBSyxTQUFBLEdBQUE7ZUFBRyxJQUFFLENBQUEsR0FBQSxHQUFJLElBQUosRUFBTDtNQUFBLENBQUw7QUFBQSxNQUNBLEdBQUEsRUFBSyxTQUFDLEtBQUQsR0FBQTtBQUNILFlBQUEsZ0JBQUE7QUFBQSxRQUFBLENBQUEsR0FBSSxLQUFBLEdBQUssQ0FBQyxJQUFJLENBQUMsVUFBTCxDQUFBLENBQUQsQ0FBVCxDQUFBO0FBQ0EsUUFBQSxJQUFHLGVBQUg7QUFDRSxVQUFBLENBQUEsR0FBSSxJQUFFLENBQUEsQ0FBQSxDQUFGLENBQUssS0FBTCxDQUFKLENBREY7U0FBQSxNQUFBO0FBR0UsVUFBQSxDQUFBLEdBQUksSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBQWUsS0FBZixDQUFKLENBSEY7U0FEQTtBQUtBLGFBQUEscUNBQUE7c0JBQUE7O1lBQ0UsSUFBRSxDQUFBLEVBQUE7V0FESjtBQUFBLFNBTEE7ZUFPQSxFQVJHO01BQUEsQ0FETDtLQURGLEVBRFc7RUFBQSxDQUhiO0FBQUEsRUFnQkEsUUFBQSxFQUFVLFNBQUEsR0FBQTtXQUNSLElBQUMsQ0FBQSxTQUFFLENBQUEsT0FBSCxHQUFhLFNBQUMsSUFBRCxFQUFPLEtBQVAsR0FBQTtBQUNYLE1BQUEsSUFBRyxJQUFFLENBQUEsR0FBQSxHQUFJLElBQUosQ0FBRixLQUFpQixLQUFwQjtBQUNFLFFBQUEsSUFBRSxDQUFBLEdBQUEsR0FBSSxJQUFKLENBQUYsR0FBZ0IsS0FBaEIsQ0FBQTs7VUFDQSxJQUFDLENBQUEsUUFBUyxTQUFBLEdBQVUsTUFBUSxJQUFFLENBQUEsR0FBQSxHQUFJLElBQUo7U0FGaEM7T0FBQTthQUdBLElBQUUsQ0FBQSxHQUFBLEdBQUksSUFBSixFQUpTO0lBQUEsRUFETDtFQUFBLENBaEJWO0NBREYsQ0FBQTs7Ozs7QUNDQSxJQUFBLHVKQUFBOztBQUFBLFNBQUEsR0FBWSxPQUFBLENBQVEsVUFBUixDQUFaLENBQUE7O0FBQUEsTUFDQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBRFQsQ0FBQTs7QUFBQSxPQUlBLEdBQVUsQ0FBQSxDQUFFLE1BQUYsQ0FKVixDQUFBOztBQUFBLE9BS0EsR0FBVSxJQUxWLENBQUE7O0FBQUEsTUFNQSxHQUFTLElBTlQsQ0FBQTs7QUFBQSxnQkFPQSxHQUFtQixJQVBuQixDQUFBOztBQUFBLGdCQVFBLEdBQW1CLElBUm5CLENBQUE7O0FBQUEsUUFTQSxHQUFXLElBVFgsQ0FBQTs7QUFBQSxZQVlBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsTUFBQSxDQUFBO0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBTyxDQUFDLE1BQVIsQ0FBQSxDQUFBLEdBQW1CLGdCQUFnQixDQUFDLE1BQWpCLENBQUEsQ0FBeUIsQ0FBQyxHQUE3QyxHQUFtRCxFQUF2RCxDQUFBO0FBQUEsRUFDQSxnQkFBZ0IsQ0FBQyxNQUFqQixDQUF3QixDQUFBLEdBQUksR0FBSixJQUFXLENBQVgsSUFBZ0IsR0FBeEMsQ0FEQSxDQUFBO0FBQUEsRUFFQSxPQUFPLENBQUMsSUFBUixDQUNFO0FBQUEsSUFBQSxLQUFBLEVBQVEsZ0JBQWdCLENBQUMsS0FBakIsQ0FBQSxDQUFBLEdBQTRCLENBQXBDO0FBQUEsSUFDQSxNQUFBLEVBQVEsZ0JBQWdCLENBQUMsTUFBakIsQ0FBQSxDQUFBLEdBQTRCLENBRHBDO0dBREYsQ0FGQSxDQUFBO0FBQUEsRUFNQSxDQUFBLEdBQUksT0FBTyxDQUFDLE1BQVIsQ0FBQSxDQUFBLEdBQW1CLGdCQUFnQixDQUFDLE1BQWpCLENBQUEsQ0FBeUIsQ0FBQyxHQUE3QyxHQUFtRCxFQU52RCxDQUFBO0FBQUEsRUFPQSxnQkFBZ0IsQ0FBQyxNQUFqQixDQUF3QixDQUFBLEdBQUksR0FBSixJQUFXLENBQVgsSUFBZ0IsR0FBeEMsQ0FQQSxDQUFBO1NBU0EsTUFBTSxDQUFDLElBQVAsQ0FBQSxFQVZhO0FBQUEsQ0FaZixDQUFBOztBQUFBLFVBd0JBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsTUFBQSxvQkFBQTtBQUFBLEVBQUEsQ0FBQSxHQUFJLElBQUosQ0FBQTtBQUNBLE9BQ0ssU0FBQyxLQUFELEdBQUE7QUFFRCxRQUFBLG9CQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU8sS0FBUCxDQUFBO0FBQUEsSUFDQSxJQUFBLEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxxQkFBZCxFQUFxQyxJQUFyQyxDQURQLENBQUE7QUFBQSxJQUdBLEdBQUEsR0FBTSxHQUFBLENBQUEsS0FITixDQUFBO0FBQUEsSUFJQSxHQUFHLENBQUMsR0FBSixHQUFVLElBSlYsQ0FBQTs7TUFLQSxJQUFLO0tBTEw7QUFBQSxJQVFBLEdBQUEsR0FBTSxDQUFBLENBQUUsK0ZBQUEsR0FHcUIsSUFIckIsR0FHMEIsYUFINUIsQ0FSTixDQUFBO0FBQUEsSUFjQSxDQUFBLENBQUUsUUFBRixFQUFZLEdBQVosQ0FBZ0IsQ0FBQyxNQUFqQixDQUF3QixHQUF4QixDQWRBLENBQUE7QUFBQSxJQWVBLEdBQUcsQ0FBQyxFQUFKLENBQU8sT0FBUCxFQUFnQixTQUFBLEdBQUE7YUFBRyxXQUFBLENBQVksR0FBWixFQUFIO0lBQUEsQ0FBaEIsQ0FmQSxDQUFBO1dBZ0JBLGdCQUFnQixDQUFDLE1BQWpCLENBQXdCLEdBQXhCLEVBbEJDO0VBQUEsQ0FETDtBQUFBLE9BQUEsMkNBQUE7eUJBQUE7QUFDRSxPQUFJLE1BQUosQ0FERjtBQUFBLEdBREE7U0F1QkEsQ0FBQyxDQUFDLGdCQUFGLENBQW1CLE1BQW5CLEVBQTJCLFNBQUEsR0FBQTtXQUFHLFdBQUEsQ0FBWSxDQUFaLEVBQUg7RUFBQSxDQUEzQixFQXhCVztBQUFBLENBeEJiLENBQUE7O0FBQUEsV0FrREEsR0FBYyxTQUFDLEtBQUQsR0FBQTtTQUNaLE1BQU0sQ0FBQyxTQUFQLENBQWlCLEtBQWpCLEVBRFk7QUFBQSxDQWxEZCxDQUFBOztBQUFBLFVBcURBLEdBQWEsT0FBQSxDQUFRLGFBQVIsQ0FyRGIsQ0FBQTs7QUFBQSxTQXNEQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsTUFBQSx3QkFBQTs7SUFEVyxPQUFPO0dBQ2xCO0FBQUE7QUFBQTtPQUFBLFVBQUE7cUJBQUE7QUFDRSxpQkFBQSxDQUFBLENBQUUsa0JBQUEsR0FBbUIsR0FBbkIsR0FBdUIsSUFBekIsQ0FBNkIsQ0FBQyxJQUE5QixDQUFtQyxLQUFuQyxFQUFBLENBREY7QUFBQTtpQkFEVTtBQUFBLENBdERaLENBQUE7O0FBQUEsT0EyRE8sQ0FBQyxFQUFSLENBQVcsUUFBWCxFQUFxQixZQUFyQixDQTNEQSxDQUFBOztBQUFBLE9BNkRPLENBQUMsRUFBUixDQUFXLE1BQVgsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLE1BQUEsMkNBQUE7QUFBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7QUFBQSxFQUVBLE9BQUEsR0FBVSxDQUFBLENBQUUsU0FBRixDQUZWLENBQUE7QUFBQSxFQUdBLGdCQUFBLEdBQW1CLENBQUEsQ0FBRSxrQkFBRixDQUhuQixDQUFBO0FBQUEsRUFJQSxnQkFBQSxHQUFtQixDQUFBLENBQUUsa0JBQUYsQ0FKbkIsQ0FBQTtBQUFBLEVBS0EsUUFBQSxHQUFXLENBQUEsQ0FBRSxVQUFGLENBTFgsQ0FBQTtBQUFBLEVBTUEsT0FBQSxHQUFVLENBQUEsQ0FBRSxVQUFGLENBTlYsQ0FBQTtBQUFBLEVBT0EsT0FBQSxHQUFVLENBQUEsQ0FBRSxlQUFGLENBUFYsQ0FBQTtBQVNBO0FBQ0UsSUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxZQUFZLENBQUMsT0FBeEIsQ0FBVixDQURGO0dBQUEsY0FBQTtBQUdFLElBQUEsT0FBQSxHQUFVLEVBQVYsQ0FIRjtHQVRBO0FBY0EsT0FBQSxjQUFBO3lCQUFBO0FBQ0UsSUFBQSxDQUFBLENBQUUscUJBQUEsR0FBc0IsR0FBdEIsR0FBMEIsR0FBNUIsQ0FBK0IsQ0FBQyxHQUFoQyxDQUFvQyxLQUFwQyxDQUFBLENBREY7QUFBQSxHQWRBO0FBQUEsRUFpQkEsTUFBQSxHQUFhLElBQUEsTUFBQSxDQUFPLE9BQVEsQ0FBQSxDQUFBLENBQWYsRUFBbUIsT0FBbkIsQ0FqQmIsQ0FBQTtBQUFBLEVBa0JBLE1BQU0sQ0FBQyxFQUFQLENBQVUsU0FBVixFQUFxQixTQUFBLEdBQUE7V0FBRyxRQUFRLENBQUMsSUFBVCxDQUFBLEVBQUg7RUFBQSxDQUFyQixDQWxCQSxDQUFBO0FBQUEsRUFtQkEsTUFBTSxDQUFDLEVBQVAsQ0FBVSxRQUFWLEVBQW9CLFNBQUEsR0FBQTtXQUFHLFFBQVEsQ0FBQyxJQUFULENBQUEsRUFBSDtFQUFBLENBQXBCLENBbkJBLENBQUE7QUFBQSxFQXFCQSxPQUFPLENBQUMsRUFBUixDQUFXLE9BQVgsRUFBb0IsU0FBQSxHQUFBO0FBQ2xCLFFBQUEsSUFBQTtBQUFBLElBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsUUFBcEIsQ0FBQSxDQUFBO0FBQUEsSUFDQSxDQUFBLENBQUUsSUFBRixDQUFJLENBQUMsUUFBTCxDQUFjLFFBQWQsQ0FEQSxDQUFBO0FBQUEsSUFFQSxJQUFBLEdBQU8sQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLENBRlAsQ0FBQTtBQUFBLElBR0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSxJQUFmLENBSEEsQ0FBQTtXQUlBLFlBQVksQ0FBQyxJQUFiLEdBQW9CLEtBTEY7RUFBQSxDQUFwQixDQXJCQSxDQUFBO0FBQUEsRUE0QkEsSUFBQSxHQUFPLFlBQVksQ0FBQyxJQUFiLElBQXFCLE9BNUI1QixDQUFBO0FBQUEsRUE2QkEsQ0FBQSxDQUFFLHNCQUFBLEdBQXVCLElBQXZCLEdBQTRCLElBQTlCLENBQWtDLENBQUMsT0FBbkMsQ0FBMkMsT0FBM0MsQ0E3QkEsQ0FBQTtBQUFBLEVBK0JBLE9BQU8sQ0FBQyxFQUFSLENBQVcsUUFBWCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsUUFBQSxJQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLElBQVIsQ0FBQTtBQUFBLElBQ0EsS0FBQSxHQUFRLE1BQUEsQ0FBTyxJQUFDLENBQUEsS0FBUixDQURSLENBQUE7QUFBQSxJQUVBLE9BQUEsR0FBVSxFQUZWLENBQUE7QUFBQSxJQUdBLE9BQVEsQ0FBQSxJQUFBLENBQVIsR0FBZ0IsS0FIaEIsQ0FBQTtBQUFBLElBSUEsWUFBWSxDQUFDLE9BQWIsR0FBdUIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxPQUFmLENBSnZCLENBQUE7V0FLQSxNQUFNLENBQUMsYUFBUCxDQUFxQixPQUFyQixFQU5tQjtFQUFBLENBQXJCLENBL0JBLENBQUE7QUFBQSxFQXVDQSxPQUFPLENBQUMsRUFBUixDQUFXLFNBQVgsRUFBc0IsU0FBQyxLQUFELEdBQUE7QUFDcEIsSUFBQSxJQUFHLEtBQUssQ0FBQyxNQUFOLElBQWlCLEtBQUssQ0FBQyxPQUFOLEtBQWlCLEVBQXJDO0FBQ0UsTUFBQSxLQUFLLENBQUMsY0FBTixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsU0FBQSxDQUFVLElBQVYsQ0FEQSxDQURGO0tBQUE7QUFHQSxJQUFBLElBQUcsS0FBSyxDQUFDLE1BQU4sSUFBaUIsS0FBSyxDQUFDLE9BQU4sS0FBaUIsRUFBckM7QUFDRSxNQUFBLEtBQUssQ0FBQyxjQUFOLENBQUEsQ0FBQSxDQUFBO2FBQ0EsU0FBQSxDQUFVLElBQVYsRUFGRjtLQUpvQjtFQUFBLENBQXRCLENBdkNBLENBQUE7QUFBQSxFQStDQSxZQUFBLENBQUEsQ0EvQ0EsQ0FBQTtTQWdEQSxVQUFBLENBQUEsRUFqRGlCO0FBQUEsQ0FBbkIsQ0E3REEsQ0FBQTs7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiQmFzZSA9IHJlcXVpcmUgJy4vbGliL2Jhc2UnXG5cbmNsYXNzIENhbnZhcyBleHRlbmRzIEJhc2VcbiAgQHByb3BlcnR5ICd3aWR0aCcgLCBnZXQ6IC0+IEBlbC53aWR0aFxuICBAcHJvcGVydHkgJ2hlaWdodCcsIGdldDogLT4gQGVsLmhlaWdodFxuXG4gIEBwcm9wZXJ0eSAnaW1hZ2VXaWR0aCcgLCBnZXQ6IC0+IEBpbWFnZT8ubmF0dXJhbFdpZHRoICA/IDBcbiAgQHByb3BlcnR5ICdpbWFnZUhlaWdodCcsIGdldDogLT4gQGltYWdlPy5uYXR1cmFsSGVpZ2h0ID8gMFxuXG4gIEBwcm9wZXJ0eSAnb2Zmc2V0WCcsIGdldDogLT4gKEB3aWR0aCAgLSBAaW1hZ2VXaWR0aCkgIC8gMlxuICBAcHJvcGVydHkgJ29mZnNldFknLCBnZXQ6IC0+IChAaGVpZ2h0IC0gQGltYWdlSGVpZ2h0KSAvIDJcblxuICBkZWZhdWx0T3B0aW9uczpcbiAgICBjZWxsOiAxNVxuXG4gIHdvcmtlcnM6XG4gICAgc29iZWwgOiBuZXcgTGlzdGVuZXIgJy4vc29iZWwuanMnXG4gICAgY2FsYyAgOiBuZXcgTGlzdGVuZXIgJy4vY2FsYy5qcydcblxuICBjb25zdHJ1Y3RvcjogKEBlbCwgb3B0aW9ucyA9IHt9KSAtPlxuICAgIEBfY2FsY3VsYXRlZERhdGEgPSBudWxsXG4gICAgQF92aWV3ID0gbnVsbFxuICAgIEBvcHRpb25zID0ge31cblxuICAgIEBjdHggPSBAZWwuZ2V0Q29udGV4dChcIjJkXCIpXG4gICAgQGltYWdlID0gbnVsbFxuICAgIEB1cGRhdGVPcHRpb25zIG9wdGlvbnNcblxuICB1cGRhdGVPcHRpb25zOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgIF8uZXh0ZW5kIEBvcHRpb25zLCBAZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnNcbiAgICBAbG9hZEltYWdlKEBpbWFnZSlcblxuICBsb2FkSW1hZ2U6IChAaW1hZ2UpIC0+XG4gICAgQF9jYWxjdWxhdGVkRGF0YSA9IG51bGxcbiAgICBAX2NsZWFyKClcbiAgICByZXR1cm4gdW5sZXNzIEBpbWFnZVxuICAgIEB0cmlnZ2VyICdsb2FkaW5nJ1xuICAgIEBfZHJhd0ltYWdlKClcbiAgICBAX2NhbGMgQF9nZXRQaXhlbHMoKSwgKGVycm9yLCBkYXRhKSA9PlxuICAgICAgQF9jYWxjdWxhdGVkRGF0YSA9IGRhdGFcbiAgICAgIEBkcmF3KClcbiAgICAgIEB0cmlnZ2VyICdsb2FkZWQnXG5cbiAgc2V0VmlldzogKHZpZXcpIC0+XG4gICAgQF92aWV3ID0gdmlld1xuICAgIEBkcmF3KClcblxuICBkcmF3OiAtPlxuICAgIEBfY2xlYXIoKVxuICAgIEBfZHJhd0ltYWdlKClcbiAgICBzd2l0Y2ggQF92aWV3XG4gICAgICB3aGVuICdhbmdsZScgIHRoZW4gQF9kcmF3QW5nbGVzKClcbiAgICAgIHdoZW4gJ2xlbmd0aCcgdGhlbiBAX2RyYXdMZW5ndGgoKVxuICAgICAgd2hlbiAnY29oJyAgICB0aGVuIEBfZHJhd0NvaCgpXG5cbiAgX2NsZWFyOiAtPlxuICAgIEBjdHguY2xlYXJSZWN0IDAsIDAsIEB3aWR0aCwgQGhlaWdodFxuXG4gICMgZHJhd1xuICBfZHJhd0ltYWdlOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGltYWdlXG4gICAgQGN0eC5kcmF3SW1hZ2UgQGltYWdlLCBAb2Zmc2V0WCwgQG9mZnNldFlcbiAgICByZXR1cm5cblxuICBfZHJhd0FuZ2xlczogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBfY2FsY3VsYXRlZERhdGE/LmFuZ2xlXG4gICAgZGF0YSA9IEBfY2FsY3VsYXRlZERhdGEuYW5nbGVcbiAgICBsID0gQF9jYWxjdWxhdGVkRGF0YS5sZW5ndGhcbiAgICBAY3R4LmxpbmVXaWR0aCA9IDFcbiAgICBAY3R4LnN0cm9rZVN0eWxlID0gXCJyZWRcIlxuICAgIEBfZWFjaENlbGxzIGRhdGEsIChveCwgb3ksIHNpemUsIHYsIGkpID0+XG4gICAgICByZXR1cm4gaWYgbFtpXSA8IDAuMDFcbiAgICAgIGhhbGYgPSBzaXplIC8gMlxuICAgICAgeCA9IEBvZmZzZXRYICsgb3ggKyBoYWxmXG4gICAgICB5ID0gQG9mZnNldFkgKyBveSArIGhhbGZcbiAgICAgIEBjdHguYmVnaW5QYXRoKClcbiAgICAgIEBjdHgubW92ZVRvKHgsIHkpXG4gICAgICBAY3R4LmxpbmVUbyh4ICsgTWF0aC5jb3ModikgKiBoYWxmLCB5IC0gTWF0aC5zaW4odikgKiBoYWxmKVxuICAgICAgQGN0eC5tb3ZlVG8oeCwgeSlcbiAgICAgIEBjdHgubGluZVRvKHggLSBNYXRoLmNvcyh2KSAqIGhhbGYsIHkgKyBNYXRoLnNpbih2KSAqIGhhbGYpXG4gICAgICBAY3R4LnN0cm9rZSgpXG5cbiAgX2RyYXdMZW5ndGg6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAX2NhbGN1bGF0ZWREYXRhPy5sZW5ndGhcbiAgICBAX2NsZWFyKClcbiAgICBkYXRhID0gQF9jYWxjdWxhdGVkRGF0YS5sZW5ndGhcbiAgICBAX2VhY2hDZWxscyBkYXRhLCAob3gsIG95LCBzaXplLCB2KSA9PlxuICAgICAgYyA9IE1hdGguZmxvb3IoMjU1ICogdilcbiAgICAgIEBjdHguZmlsbFN0eWxlID0gXCJyZ2IoI3tjfSwje2N9LCN7Y30pXCJcbiAgICAgIEBjdHguZmlsbFJlY3QgQG9mZnNldFggKyBveCwgQG9mZnNldFkgKyBveSwgc2l6ZSArIDEsIHNpemUgKyAxXG5cbiAgX2RyYXdDb2g6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAX2NhbGN1bGF0ZWREYXRhPy5jb2hcbiAgICBAX2NsZWFyKClcbiAgICBkYXRhID0gQF9jYWxjdWxhdGVkRGF0YS5jb2hcbiAgICBsID0gQF9jYWxjdWxhdGVkRGF0YS5sZW5ndGhcbiAgICBAX2VhY2hDZWxscyBkYXRhLCAob3gsIG95LCBzaXplLCB2LCBpKSA9PlxuICAgICAgcmV0dXJuIGlmIGxbaV0gPCAwLjAxXG4gICAgICBjID0gTWF0aC5mbG9vcigyNTUgKiB2KVxuICAgICAgQGN0eC5maWxsU3R5bGUgPSBcInJnYigje2N9LCN7Y30sI3tjfSlcIlxuICAgICAgQGN0eC5maWxsUmVjdCBAb2Zmc2V0WCArIG94LCBAb2Zmc2V0WSArIG95LCBzaXplICsgMSwgc2l6ZSArIDFcblxuICBfZWFjaENlbGxzOiAoZGF0YSwgY2IpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBjYlxuICAgIGggPSBNYXRoLmZsb29yKEBpbWFnZUhlaWdodCAvIEBvcHRpb25zLmNlbGwpXG4gICAgdyA9IE1hdGguZmxvb3IoQGltYWdlV2lkdGggIC8gQG9wdGlvbnMuY2VsbClcbiAgICBmb3IgeSBpbiBbMCAuLi4gaF1cbiAgICAgIGZvciB4IGluIFswIC4uLiB3XVxuICAgICAgICBwID0geSAqIHcgKyB4XG4gICAgICAgIGNiPyhcbiAgICAgICAgICB4ICogQG9wdGlvbnMuY2VsbCxcbiAgICAgICAgICB5ICogQG9wdGlvbnMuY2VsbCxcbiAgICAgICAgICBAb3B0aW9ucy5jZWxsLFxuICAgICAgICAgIGRhdGFbcF0sXG4gICAgICAgICAgcFxuICAgICAgICApXG5cblxuICAjIG90aGVyXG4gIF9nZXRQaXhlbHM6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaW1hZ2VcbiAgICBpbWFnZURhdGEgPSBAY3R4LmdldEltYWdlRGF0YSBAb2Zmc2V0WCwgQG9mZnNldFksIEBpbWFnZVdpZHRoLCBAaW1hZ2VIZWlnaHRcbiAgICByZXR1cm4gaW1hZ2VEYXRhXG5cbiAgX3B1dFBpeGVsczogKGltYWdlRGF0YSkgLT5cbiAgICBAX2NsZWFyKClcbiAgICBveCA9IChAd2lkdGggLSBpbWFnZURhdGEud2lkdGgpICAgLyAyXG4gICAgb3kgPSAoQGhlaWdodCAtIGltYWdlRGF0YS5oZWlnaHQpIC8gMlxuICAgIEBjdHgucHV0SW1hZ2VEYXRhIGltYWdlRGF0YSwgb3gsIG95XG5cblxuICAjIHdvcmtlcnNcbiAgX2NvbnY6IChpbWFnZURhdGEsIGtlcm5lbCwgY2IpIC0+XG4gICAgQHdvcmtlcnMuY29udi5hcHBseSB7a2VybmVsOiBrZXJuZWwsIGltYWdlRGF0YTogaW1hZ2VEYXRhfSwgY2JcbiAgICByZXR1cm5cblxuICBfc29iZWw6IChpbWFnZURhdGEsIGNiKSAtPlxuICAgIEB3b3JrZXJzLnNvYmVsLmFwcGx5IHtpbWFnZURhdGE6IGltYWdlRGF0YX0sIGNiXG4gICAgcmV0dXJuXG5cbiAgX2NhbGM6IChpbWFnZURhdGEsIGNiKSAtPlxuICAgIEBfc29iZWwgaW1hZ2VEYXRhLCAoZXJyb3IsIGRhdGEpID0+XG4gICAgICBkYXRhLmNlbGwgPSBAb3B0aW9ucy5jZWxsXG4gICAgICBAd29ya2Vycy5jYWxjLmFwcGx5IGRhdGEsIGNiXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzXG4iLCJtb2R1bGUuZXhwb3J0cz1bXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfMS5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM18yLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzMuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfNC5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM181LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzYuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfNy5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExM184LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTEzXzkuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTJfMTEuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTJfMTIuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfMTAuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfMTEuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTNfMTIuYm1wXCIsXG5cbiAgXCIuL2ltYWdlcy8wNl8yXzExNF8xLmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzIuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfMy5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF80LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzUuYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfNi5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF83LmJtcFwiLFxuICBcIi4vaW1hZ2VzLzA2XzJfMTE0XzguYm1wXCIsXG4gIFwiLi9pbWFnZXMvMDZfMl8xMTRfOS5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF8xMC5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF8xMS5ibXBcIixcbiAgXCIuL2ltYWdlcy8wNl8yXzExNF8xMi5ibXBcIlxuXVxuIiwiTW9kdWxlID0gcmVxdWlyZSAnLi9tb2R1bGUnXG5cbnBtID0gcmVxdWlyZSAnLi9wcm9wZXJ0eV9taXhpbidcbmVtID0gcmVxdWlyZSAnLi9ldmVudF9taXhpbidcblxuY2xhc3MgQmFzZSBleHRlbmRzIE1vZHVsZVxuICBAZXh0ZW5kICBwbVxuICBAaW5jbHVkZSBlbVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgX2V2ZW50SGFuZGxlcnM6IC0+XG4gICAgQF9fZXZlbnRIYW5kbGVycyB8fD0ge31cbiBcbiAgX2dldEhhbmRsZXJzOiAobmFtZSkgLT5cbiAgICBAX2V2ZW50SGFuZGxlcnMoKVtuYW1lXSB8fD0gW11cbiAgICByZXR1cm4gQF9ldmVudEhhbmRsZXJzKClbbmFtZV1cbiBcbiAgX3NldEhhbmRsZXJzOiAobmFtZSwgdmFsdWUpIC0+XG4gICAgQF9ldmVudEhhbmRsZXJzKClbbmFtZV0gfHw9IHZhbHVlXG4gICAgcmV0dXJuXG4gXG4gIG9uOiAobmFtZSwgY2FsbGJhY2spIC0+XG4gICAgcmV0dXJuIHVubGVzcyBjYWxsYmFja1xuICAgIEBfZ2V0SGFuZGxlcnMobmFtZSkucHVzaCBjYWxsYmFja1xuIFxuICBvZmY6IChuYW1lLCBjYWxsYmFjaykgLT5cbiAgICB1bmxlc3MgY2FsbGJhY2tcbiAgICAgIEBfc2V0SGFuZGxlcnMobmFtZSwgW10pXG4gICAgZWxzZVxuICAgICAgQF9zZXRIYW5kbGVycyBuYW1lLCBAX2dldEhhbmRsZXJzKG5hbWUpLmZpbHRlciAoYykgLT5cbiAgICAgICAgYyA9PSBjYWxsYmFja1xuICAgIHJldHVyblxuIFxuICB0cmlnZ2VyOiAobmFtZSwgYXJncy4uLikgLT5cbiAgICBmb3IgY2IgaW4gQF9nZXRIYW5kbGVycyhuYW1lKVxuICAgICAgcmV0dXJuIGlmIGNiLmFwcGx5KEAsIGFyZ3MpID09IGZhbHNlXG4gICAgcmV0dXJuXG4iLCJtb2R1bGVLZXl3b3JkcyA9IFsnZXh0ZW5kZWQnLCAnaW5jbHVkZWQnXVxuIFxuY2xhc3MgTW9kdWxlXG4gIEBleHRlbmQ6IChvYmopIC0+XG4gICAgZm9yIGtleSwgdmFsdWUgb2Ygb2JqIHdoZW4ga2V5IG5vdCBpbiBtb2R1bGVLZXl3b3Jkc1xuICAgICAgQFtrZXldID0gdmFsdWVcbiBcbiAgICBvYmouZXh0ZW5kZWQ/LmFwcGx5KEApXG4gICAgQFxuIFxuICBAaW5jbHVkZTogKG9iaikgLT5cbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBvYmogd2hlbiBrZXkgbm90IGluIG1vZHVsZUtleXdvcmRzXG4gICAgICAjIEFzc2lnbiBwcm9wZXJ0aWVzIHRvIHRoZSBwcm90b3R5cGVcbiAgICAgIEA6OltrZXldID0gdmFsdWVcbiBcbiAgICBvYmouaW5jbHVkZWQ/LmFwcGx5KEApXG4gICAgQFxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZVxuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBwcm9wZXJ0eTogKHByb3AsIG9wdGlvbnMpIC0+XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIHByb3AsIG9wdGlvbnNcbiBcbiAgYWRkUHJvcGVydHk6IChuYW1lLCBjYnMuLi4pIC0+XG4gICAgQHByb3BlcnR5IG5hbWUsXG4gICAgICBnZXQ6IC0+IEBbXCJfI3tuYW1lfVwiXVxuICAgICAgc2V0OiAodmFsdWUpIC0+XG4gICAgICAgIG4gPSBcInNldCN7bmFtZS5jYXBpdGFsaXplKCl9XCJcbiAgICAgICAgaWYgQFtuXT9cbiAgICAgICAgICByID0gQFtuXSh2YWx1ZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHIgPSBAc2V0UHJvcChuYW1lLCB2YWx1ZSlcbiAgICAgICAgZm9yIGNiIGluIGNic1xuICAgICAgICAgIEBbY2JdPygpXG4gICAgICAgIHJcbiBcbiAgZXh0ZW5kZWQ6IC0+XG4gICAgQDo6c2V0UHJvcCA9IChuYW1lLCB2YWx1ZSkgLT5cbiAgICAgIGlmIEBbXCJfI3tuYW1lfVwiXSAhPSB2YWx1ZVxuICAgICAgICBAW1wiXyN7bmFtZX1cIl0gPSB2YWx1ZVxuICAgICAgICBAdHJpZ2dlcj8gXCJjaGFuZ2U6I3tuYW1lfVwiLCBAW1wiXyN7bmFtZX1cIl1cbiAgICAgIEBbXCJfI3tuYW1lfVwiXVxuIiwiIyBpbXBvcnRcbmltYWdlc1NyYyA9IHJlcXVpcmUgJy4vaW1hZ2VzJ1xuQ2FudmFzID0gcmVxdWlyZSAnLi9jYW52YXMnXG5cbiMgdmFyc1xuJHdpbmRvdyA9ICQod2luZG93KVxuJGNhbnZhcyA9IG51bGxcbmNhbnZhcyA9IG51bGxcbiRjYW52YXNDb250YWluZXIgPSBudWxsXG4kaW1hZ2VzQ29udGFpbmVyID0gbnVsbFxuJGxvYWRpbmcgPSBudWxsXG5cbiMgZnVuY3Rpb25zXG5yZXNpemVDYW52YXMgPSAtPlxuICBoID0gJHdpbmRvdy5oZWlnaHQoKSAtICRjYW52YXNDb250YWluZXIub2Zmc2V0KCkudG9wIC0gNjBcbiAgJGNhbnZhc0NvbnRhaW5lci5oZWlnaHQgaCA+IDMwMCAmJiBoIHx8IDMwMFxuICAkY2FudmFzLmF0dHJcbiAgICB3aWR0aCA6ICRjYW52YXNDb250YWluZXIud2lkdGgoKSAgfCAxXG4gICAgaGVpZ2h0OiAkY2FudmFzQ29udGFpbmVyLmhlaWdodCgpIHwgMVxuXG4gIGggPSAkd2luZG93LmhlaWdodCgpIC0gJGltYWdlc0NvbnRhaW5lci5vZmZzZXQoKS50b3AgLSA0NVxuICAkaW1hZ2VzQ29udGFpbmVyLmhlaWdodCBoID4gMzAwICYmIGggfHwgMzAwXG5cbiAgY2FudmFzLmRyYXcoKVxuXG5sb2FkSW1hZ2VzID0gLT5cbiAgZiA9IG51bGxcbiAgZm9yIGltYWdlIGluIGltYWdlc1NyY1xuICAgIGRvIChpbWFnZSkgLT5cbiAgICAgICMgbG9hZGluZ1xuICAgICAgZmlsZSA9IGltYWdlXG4gICAgICBuYW1lID0gaW1hZ2UucmVwbGFjZSgvLio/KFteXFwvXFwuXSspXFwuYm1wJC8sIFwiJDFcIilcblxuICAgICAgaW1nID0gbmV3IEltYWdlXG4gICAgICBpbWcuc3JjID0gZmlsZVxuICAgICAgZiA/PSBpbWdcblxuICAgICAgIyByZW5kZXJcbiAgICAgICRlbCA9ICQgXCJcbiAgICAgICAgPGRpdiBjbGFzcz0nY29sLXNtLTYgaW1hZ2UtaXRlbSBJbWFnZUl0ZW0nPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J0ltYWdlJz48L2Rpdj5cbiAgICAgICAgICA8YSBocmVmPSdqYXZhc2NyaXB0OjsnPiN7bmFtZX08L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgXCJcbiAgICAgICQoJy5JbWFnZScsICRlbCkuYXBwZW5kIGltZ1xuICAgICAgJGVsLm9uICdjbGljaycsIC0+IHNlbGVjdEltYWdlKGltZylcbiAgICAgICRpbWFnZXNDb250YWluZXIuYXBwZW5kICRlbFxuXG4gICMgc2VsZWN0IGZpcnN0IGltYWdlXG4gIGYuYWRkRXZlbnRMaXN0ZW5lciAnbG9hZCcsIC0+IHNlbGVjdEltYWdlIGZcblxuc2VsZWN0SW1hZ2UgPSAoaW1hZ2UpIC0+XG4gIGNhbnZhcy5sb2FkSW1hZ2UgaW1hZ2VcblxudHJhbnNsYXRlcyA9IHJlcXVpcmUgJy4vdHJhbnNsYXRlJ1xudHJhbnNsYXRlID0gKGxhbmcgPSBcImVuXCIpIC0+XG4gIGZvciBrZXksIHZhbHVlIG9mIHRyYW5zbGF0ZXNbbGFuZ11cbiAgICAkKFwiLlRleHRbZGF0YS1rZXk9JyN7a2V5fSddXCIpLnRleHQgdmFsdWVcblxuIyBldmVudHNcbiR3aW5kb3cub24gJ3Jlc2l6ZScsIHJlc2l6ZUNhbnZhc1xuXG4kd2luZG93Lm9uICdsb2FkJywgLT5cbiAgdHJhbnNsYXRlKClcblxuICAkY2FudmFzID0gJCgnLkNhbnZhcycpXG4gICRjYW52YXNDb250YWluZXIgPSAkKCcuQ2FudmFzQ29udGFpbmVyJylcbiAgJGltYWdlc0NvbnRhaW5lciA9ICQoJy5JbWFnZXNDb250YWluZXInKVxuICAkbG9hZGluZyA9ICQoJy5Mb2FkaW5nJylcbiAgJGJ1dHRvbiA9ICQoJy5CdG5WaWV3JylcbiAgJGlucHV0cyA9ICQoJy5PcHRpb25zSW5wdXQnKVxuXG4gIHRyeVxuICAgIG9wdGlvbnMgPSBKU09OLnBhcnNlIGxvY2FsU3RvcmFnZS5vcHRpb25zXG4gIGNhdGNoXG4gICAgb3B0aW9ucyA9IHt9XG5cbiAgZm9yIGtleSwgdmFsdWUgb2Ygb3B0aW9uc1xuICAgICQoXCIuT3B0aW9uc0lucHV0W25hbWU9I3trZXl9XVwiKS52YWwgdmFsdWVcblxuICBjYW52YXMgPSBuZXcgQ2FudmFzICRjYW52YXNbMF0sIG9wdGlvbnNcbiAgY2FudmFzLm9uICdsb2FkaW5nJywgLT4gJGxvYWRpbmcuc2hvdygpXG4gIGNhbnZhcy5vbiAnbG9hZGVkJywgLT4gJGxvYWRpbmcuaGlkZSgpXG5cbiAgJGJ1dHRvbi5vbiAnY2xpY2snLCAtPlxuICAgICRidXR0b24ucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgJChAKS5hZGRDbGFzcygnYWN0aXZlJylcbiAgICB2aWV3ID0gJChAKS5kYXRhKCd2aWV3JylcbiAgICBjYW52YXMuc2V0VmlldyB2aWV3XG4gICAgbG9jYWxTdG9yYWdlLnZpZXcgPSB2aWV3XG5cbiAgdmlldyA9IGxvY2FsU3RvcmFnZS52aWV3IHx8ICdpbWFnZSdcbiAgJChcIi5CdG5WaWV3W2RhdGEtdmlldz0nI3t2aWV3fSddXCIpLnRyaWdnZXIgJ2NsaWNrJ1xuXG4gICRpbnB1dHMub24gJ2NoYW5nZScsIC0+XG4gICAgbmFtZSA9IEBuYW1lXG4gICAgdmFsdWUgPSBOdW1iZXIgQHZhbHVlXG4gICAgb3B0aW9ucyA9IHt9XG4gICAgb3B0aW9uc1tuYW1lXSA9IHZhbHVlXG4gICAgbG9jYWxTdG9yYWdlLm9wdGlvbnMgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zKVxuICAgIGNhbnZhcy51cGRhdGVPcHRpb25zIG9wdGlvbnNcblxuICAkd2luZG93Lm9uICdrZXlkb3duJywgKGV2ZW50KSAtPlxuICAgIGlmIGV2ZW50LmFsdEtleSBhbmQgZXZlbnQua2V5Q29kZSA9PSA4NFxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgdHJhbnNsYXRlKCdydScpXG4gICAgaWYgZXZlbnQuYWx0S2V5IGFuZCBldmVudC5rZXlDb2RlID09IDg1XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0cmFuc2xhdGUoJ2VuJylcblxuICByZXNpemVDYW52YXMoKVxuICBsb2FkSW1hZ2VzKClcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJlblwiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIkRpcmVjdGlvbmFsIEZpZWxkIEVzdGltYXRpb25cIixcbiAgICBcInJlc3VsdFwiOiBcIlJlc3VsdFwiLFxuICAgIFwibG9hZGluZ1wiOiBcIkNhbGN1bGF0aW5nLi4uXCIsXG4gICAgXCJjb25maWdcIjogXCJDb25maWdcIixcbiAgICBcInNvdXJjZVwiOiBcIlNvdXJjZSBpbWFnZVwiLFxuICAgIFwiYW5nbGVcIjogXCJBbmdsZXNcIixcbiAgICBcImxlbmd0aFwiOiBcIkxlbmd0aFwiLFxuICAgIFwiY29oZXJlbmN5XCI6IFwiQ29oZXJlbmN5XCIsXG4gICAgXCJpbWFnZXNcIjogXCJJbWFnZXNcIixcbiAgICBcImNlbGxTaXplXCI6IFwiQ2VsbCBzaXplXCIsXG4gIH0sXG4gIFwicnVcIjoge1xuICAgIFwidGl0bGVcIjogXCLQotGD0YIg0YDQsNGB0YfQuNGC0YvQstCw0Y7RgiDQv9C+0LvQtSDQvdCw0L/RgNCw0LLQu9C10L3QuNC5LCDQsdGA0LDRgtC40YjQutCwLlwiLFxuICAgIFwicmVzdWx0XCI6IFwi0JLQuNC00LjRiNGMINC60LDQuiDQutGA0YPRgtC+INGB0YfQuNGC0LDQtdGC0YHRjz9cIixcbiAgICBcImxvYWRpbmdcIjogXCLQn9C+0LPQvtC00LgsINCx0YDQsNGC0L7Quiwg0LLRi9GH0LjRgdC70Y/QtdC8INGB0LXQudGH0LDRgS4uLlwiLFxuICAgIFwiY29uZmlnXCI6IFwi0JTRg9C80LDRjiDRgtGD0YIg0LLRgdC1INC/0L7QvdGP0YLQvdC+XCIsXG4gICAgXCJzb3VyY2VcIjogXCLQmNGB0YXQvtC00L3QuNC6XCIsXG4gICAgXCJhbmdsZVwiOiBcItCj0LPQu9GLXCIsXG4gICAgXCJsZW5ndGhcIjogXCLQlNC70LjQvdCwXCIsXG4gICAgXCJjb2hlcmVuY3lcIjogXCLQmtC+0LPQtdGA0LXQvdGC0L3QvtGB0YLRjFwiLFxuICAgIFwiaW1hZ2VzXCI6IFwi0JLRi9Cx0LXRgNC4INC/0L7QvdGA0LDQstC40LLRiNGD0Y7RgdGPXCIsXG4gICAgXCJjZWxsU2l6ZVwiOiBcItCg0LDQt9C80LXRgCDRj9GH0LXQudC60LhcIixcbiAgfVxufVxuIl19
