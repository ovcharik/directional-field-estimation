(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
importScripts('./libs.js');

new Producer(self, function(data) {
  var a, b, g, h, i, img, j, k, kernel, kh, kw, l, m, n, out, px, py, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, src, sum, v, w, x, y;
  kernel = data.kernel;
  img = data.imageData;
  h = img.height;
  w = img.width;
  kh = (ref = kernel.length) != null ? ref : 0;
  kw = (ref1 = (ref2 = kernel[0]) != null ? ref2.length : void 0) != null ? ref1 : 0;
  src = img.data;
  out = new Uint8ClampedArray(src.length);
  for (y = k = 0, ref3 = h; 0 <= ref3 ? k < ref3 : k > ref3; y = 0 <= ref3 ? ++k : --k) {
    for (x = l = 0, ref4 = w; 0 <= ref4 ? l < ref4 : l > ref4; x = 0 <= ref4 ? ++l : --l) {
      ref5 = [0, 0, 0, 0, 0], r = ref5[0], g = ref5[1], b = ref5[2], a = ref5[3], sum = ref5[4];
      for (i = m = 0, ref6 = kh; 0 <= ref6 ? m < ref6 : m > ref6; i = 0 <= ref6 ? ++m : --m) {
        for (j = n = 0, ref7 = kw; 0 <= ref7 ? n < ref7 : n > ref7; j = 0 <= ref7 ? ++n : --n) {
          px = x + (j - (kw >> 1));
          py = y + (i - (kh >> 1));
          if (px < 0 || px >= w || py < 0 || py >= h) {
            continue;
          }
          v = kernel[i][j];
          r += src[4 * (w * py + px) + 0] * v;
          sum += v;
        }
      }
      if (sum <= 0) {
        sum = 1;
      }
      r /= sum | 1;
      if (r < 0) {
        r = 0;
      }
      if (r > 255) {
        r = 255;
      }
      out[4 * (w * y + x) + 0] = r;
      out[4 * (w * y + x) + 1] = r;
      out[4 * (w * y + x) + 2] = r;
      out[4 * (w * y + x) + 3] = 255;
    }
  }
  return {
    imageData: new ImageData(out, w, h)
  };
});



},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9tb3YvZGV2L2RmZS9zcmMvd29ya2Vycy9jb252LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLGFBQUEsQ0FBYyxXQUFkLENBQUEsQ0FBQTs7QUFBQSxJQUVJLFFBQUEsQ0FBUyxJQUFULEVBQWUsU0FBQyxJQUFELEdBQUE7QUFDakIsTUFBQSxzSUFBQTtBQUFBLEVBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxNQUFkLENBQUE7QUFBQSxFQUNBLEdBQUEsR0FBTyxJQUFJLENBQUMsU0FEWixDQUFBO0FBQUEsRUFHQSxDQUFBLEdBQUksR0FBRyxDQUFDLE1BSFIsQ0FBQTtBQUFBLEVBSUEsQ0FBQSxHQUFJLEdBQUcsQ0FBQyxLQUpSLENBQUE7QUFBQSxFQU1BLEVBQUEseUNBQXFCLENBTnJCLENBQUE7QUFBQSxFQU9BLEVBQUEsK0VBQXlCLENBUHpCLENBQUE7QUFBQSxFQVNBLEdBQUEsR0FBTSxHQUFHLENBQUMsSUFUVixDQUFBO0FBQUEsRUFVQSxHQUFBLEdBQVUsSUFBQSxpQkFBQSxDQUFrQixHQUFHLENBQUMsTUFBdEIsQ0FWVixDQUFBO0FBWUEsT0FBUywrRUFBVCxHQUFBO0FBQ0UsU0FBUywrRUFBVCxHQUFBO0FBQ0UsTUFBQSxPQUFvQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLENBQXBCLEVBQUMsV0FBRCxFQUFJLFdBQUosRUFBTyxXQUFQLEVBQVUsV0FBVixFQUFhLGFBQWIsQ0FBQTtBQUVBLFdBQVMsZ0ZBQVQsR0FBQTtBQUNFLGFBQVMsZ0ZBQVQsR0FBQTtBQUNFLFVBQUEsRUFBQSxHQUFLLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBSSxDQUFDLEVBQUEsSUFBTSxDQUFQLENBQUwsQ0FBVCxDQUFBO0FBQUEsVUFDQSxFQUFBLEdBQUssQ0FBQSxHQUFJLENBQUMsQ0FBQSxHQUFJLENBQUMsRUFBQSxJQUFNLENBQVAsQ0FBTCxDQURULENBQUE7QUFHQSxVQUFBLElBQVksRUFBQSxHQUFLLENBQUwsSUFBVSxFQUFBLElBQU0sQ0FBaEIsSUFBcUIsRUFBQSxHQUFLLENBQTFCLElBQStCLEVBQUEsSUFBTSxDQUFqRDtBQUFBLHFCQUFBO1dBSEE7QUFBQSxVQUtBLENBQUEsR0FBSSxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUxkLENBQUE7QUFBQSxVQU1BLENBQUEsSUFBSyxHQUFJLENBQUEsQ0FBQSxHQUFJLENBQUMsQ0FBQSxHQUFJLEVBQUosR0FBUyxFQUFWLENBQUosR0FBb0IsQ0FBcEIsQ0FBSixHQUE2QixDQU5sQyxDQUFBO0FBQUEsVUFVQSxHQUFBLElBQU8sQ0FWUCxDQURGO0FBQUEsU0FERjtBQUFBLE9BRkE7QUFnQkEsTUFBQSxJQUFXLEdBQUEsSUFBTyxDQUFsQjtBQUFBLFFBQUEsR0FBQSxHQUFNLENBQU4sQ0FBQTtPQWhCQTtBQUFBLE1Ba0JBLENBQUEsSUFBSyxHQUFBLEdBQU0sQ0FsQlgsQ0FBQTtBQW1CQSxNQUFBLElBQVksQ0FBQSxHQUFJLENBQWhCO0FBQUEsUUFBQSxDQUFBLEdBQUssQ0FBTCxDQUFBO09BbkJBO0FBb0JBLE1BQUEsSUFBWSxDQUFBLEdBQUksR0FBaEI7QUFBQSxRQUFBLENBQUEsR0FBSyxHQUFMLENBQUE7T0FwQkE7QUFBQSxNQWtDQSxHQUFJLENBQUEsQ0FBQSxHQUFJLENBQUMsQ0FBQSxHQUFJLENBQUosR0FBUSxDQUFULENBQUosR0FBa0IsQ0FBbEIsQ0FBSixHQUEyQixDQWxDM0IsQ0FBQTtBQUFBLE1BbUNBLEdBQUksQ0FBQSxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBSixHQUFRLENBQVQsQ0FBSixHQUFrQixDQUFsQixDQUFKLEdBQTJCLENBbkMzQixDQUFBO0FBQUEsTUFvQ0EsR0FBSSxDQUFBLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBSSxDQUFKLEdBQVEsQ0FBVCxDQUFKLEdBQWtCLENBQWxCLENBQUosR0FBMkIsQ0FwQzNCLENBQUE7QUFBQSxNQXFDQSxHQUFJLENBQUEsQ0FBQSxHQUFJLENBQUMsQ0FBQSxHQUFJLENBQUosR0FBUSxDQUFULENBQUosR0FBa0IsQ0FBbEIsQ0FBSixHQUEyQixHQXJDM0IsQ0FERjtBQUFBLEtBREY7QUFBQSxHQVpBO0FBcURBLFNBQU87QUFBQSxJQUFBLFNBQUEsRUFBZSxJQUFBLFNBQUEsQ0FBVSxHQUFWLEVBQWUsQ0FBZixFQUFrQixDQUFsQixDQUFmO0dBQVAsQ0F0RGlCO0FBQUEsQ0FBZixDQUZKLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0U2NyaXB0cyAnLi9saWJzLmpzJ1xuXG5uZXcgUHJvZHVjZXIgc2VsZiwgKGRhdGEpIC0+XG4gIGtlcm5lbCA9IGRhdGEua2VybmVsXG4gIGltZyAgPSBkYXRhLmltYWdlRGF0YVxuXG4gIGggPSBpbWcuaGVpZ2h0XG4gIHcgPSBpbWcud2lkdGhcblxuICBraCA9IGtlcm5lbC5sZW5ndGggPyAwXG4gIGt3ID0ga2VybmVsWzBdPy5sZW5ndGggPyAwXG5cbiAgc3JjID0gaW1nLmRhdGFcbiAgb3V0ID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHNyYy5sZW5ndGgpXG5cbiAgZm9yIHkgaW4gWzAgLi4uIGhdXG4gICAgZm9yIHggaW4gWzAgLi4uIHddXG4gICAgICBbciwgZywgYiwgYSwgc3VtXSA9IFswLCAwLCAwLCAwLCAwXVxuXG4gICAgICBmb3IgaSBpbiBbMCAuLi4ga2hdXG4gICAgICAgIGZvciBqIGluIFswIC4uLiBrd11cbiAgICAgICAgICBweCA9IHggKyAoaiAtIChrdyA+PiAxKSlcbiAgICAgICAgICBweSA9IHkgKyAoaSAtIChraCA+PiAxKSlcblxuICAgICAgICAgIGNvbnRpbnVlIGlmIHB4IDwgMCB8fCBweCA+PSB3IHx8IHB5IDwgMCB8fCBweSA+PSBoXG5cbiAgICAgICAgICB2ID0ga2VybmVsW2ldW2pdXG4gICAgICAgICAgciArPSBzcmNbNCAqICh3ICogcHkgKyBweCkgKyAwXSAqIHZcbiAgICAgICAgICAjIGcgKz0gc3JjWzQgKiAodyAqIHB5ICsgcHgpICsgMV0gKiB2XG4gICAgICAgICAgIyBiICs9IHNyY1s0ICogKHcgKiBweSArIHB4KSArIDJdICogdlxuICAgICAgICAgICMgYSArPSBzcmNbNCAqICh3ICogcHkgKyBweCkgKyAzXSAqIHZcbiAgICAgICAgICBzdW0gKz0gdlxuXG4gICAgICBzdW0gPSAxIGlmIHN1bSA8PSAwXG5cbiAgICAgIHIgLz0gc3VtIHwgMVxuICAgICAgciAgPSAwICAgaWYgciA8IDBcbiAgICAgIHIgID0gMjU1IGlmIHIgPiAyNTVcblxuICAgICAgIyBnIC89IHN1bSB8IDFcbiAgICAgICMgZyAgPSAwICAgaWYgZyA8IDBcbiAgICAgICMgZyAgPSAyNTUgaWYgZyA+IDI1NVxuXG4gICAgICAjIGIgLz0gc3VtIHwgMVxuICAgICAgIyBiICA9IDAgICBpZiBiIDwgMFxuICAgICAgIyBiICA9IDI1NSBpZiBiID4gMjU1XG5cbiAgICAgICMgYSAvPSBzdW0gfCAxXG4gICAgICAjIGEgID0gMCAgIGlmIGEgPCAwXG4gICAgICAjIGEgID0gMjU1IGlmIGEgPiAyNTVcblxuICAgICAgb3V0WzQgKiAodyAqIHkgKyB4KSArIDBdID0gclxuICAgICAgb3V0WzQgKiAodyAqIHkgKyB4KSArIDFdID0gclxuICAgICAgb3V0WzQgKiAodyAqIHkgKyB4KSArIDJdID0gclxuICAgICAgb3V0WzQgKiAodyAqIHkgKyB4KSArIDNdID0gMjU1XG5cbiAgcmV0dXJuIGltYWdlRGF0YTogbmV3IEltYWdlRGF0YShvdXQsIHcsIGgpXG4iXX0=
