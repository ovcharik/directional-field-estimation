(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var xKernel, yKernel;

importScripts('./libs.js');

xKernel = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];

yKernel = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

new Producer(self, function(data) {
  var d, gx, gy, h, i, img, j, k, l, m, max, min, n, p, px, py, ref, ref1, rx, rxy, ry, v, w, x, y;
  min = function(v1, v2) {
    if (v1 < v2) {
      return v1;
    } else {
      return v2;
    }
  };
  max = function(v1, v2) {
    if (v1 > v2) {
      return v1;
    } else {
      return v2;
    }
  };
  img = data.imageData;
  d = img.data;
  w = img.width;
  h = img.height;
  rx = new Float32Array(w * h);
  ry = new Float32Array(w * h);
  rxy = new Float32Array(w * h);
  for (y = k = 0, ref = h; 0 <= ref ? k < ref : k > ref; y = 0 <= ref ? ++k : --k) {
    for (x = l = 0, ref1 = w; 0 <= ref1 ? l < ref1 : l > ref1; x = 0 <= ref1 ? ++l : --l) {
      p = y * w + x;
      gx = 0;
      gy = 0;
      for (i = m = -1; m <= 1; i = ++m) {
        for (j = n = -1; n <= 1; j = ++n) {
          py = max(0, min(h - 1, y + i));
          px = max(0, min(w - 1, x + j));
          v = d[4 * (py * w + px)] / 255;
          gx += v * xKernel[i + 1][j + 1];
          gy += v * yKernel[i + 1][j + 1];
        }
      }
      rx[p] = gx;
      ry[p] = gy;
    }
  }
  return {
    x: {
      width: w,
      height: h,
      data: rx
    },
    y: {
      width: w,
      height: h,
      data: ry
    }
  };
});



},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9tb3YvZGV2L2RmZS9zcmMvd29ya2Vycy9zb2JlbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGdCQUFBOztBQUFBLGFBQUEsQ0FBYyxXQUFkLENBQUEsQ0FBQTs7QUFBQSxPQUVBLEdBQVUsQ0FDUixDQUFDLENBQUEsQ0FBRCxFQUFLLENBQUwsRUFBUSxDQUFSLENBRFEsRUFFUixDQUFDLENBQUEsQ0FBRCxFQUFLLENBQUwsRUFBUSxDQUFSLENBRlEsRUFHUixDQUFDLENBQUEsQ0FBRCxFQUFLLENBQUwsRUFBUSxDQUFSLENBSFEsQ0FGVixDQUFBOztBQUFBLE9BUUEsR0FBVSxDQUNSLENBQUMsQ0FBQSxDQUFELEVBQUssQ0FBQSxDQUFMLEVBQVMsQ0FBQSxDQUFULENBRFEsRUFFUixDQUFFLENBQUYsRUFBTSxDQUFOLEVBQVUsQ0FBVixDQUZRLEVBR1IsQ0FBRSxDQUFGLEVBQU0sQ0FBTixFQUFVLENBQVYsQ0FIUSxDQVJWLENBQUE7O0FBQUEsSUFjSSxRQUFBLENBQVMsSUFBVCxFQUFlLFNBQUMsSUFBRCxHQUFBO0FBRWpCLE1BQUEsNEZBQUE7QUFBQSxFQUFBLEdBQUEsR0FBTSxTQUFDLEVBQUQsRUFBSyxFQUFMLEdBQUE7QUFBWSxJQUFBLElBQUksRUFBQSxHQUFLLEVBQVQ7YUFBa0IsR0FBbEI7S0FBQSxNQUFBO2FBQTBCLEdBQTFCO0tBQVo7RUFBQSxDQUFOLENBQUE7QUFBQSxFQUNBLEdBQUEsR0FBTSxTQUFDLEVBQUQsRUFBSyxFQUFMLEdBQUE7QUFBWSxJQUFBLElBQUksRUFBQSxHQUFLLEVBQVQ7YUFBa0IsR0FBbEI7S0FBQSxNQUFBO2FBQTBCLEdBQTFCO0tBQVo7RUFBQSxDQUROLENBQUE7QUFBQSxFQUdBLEdBQUEsR0FBTSxJQUFJLENBQUMsU0FIWCxDQUFBO0FBQUEsRUFLQSxDQUFBLEdBQUksR0FBRyxDQUFDLElBTFIsQ0FBQTtBQUFBLEVBTUEsQ0FBQSxHQUFJLEdBQUcsQ0FBQyxLQU5SLENBQUE7QUFBQSxFQU9BLENBQUEsR0FBSSxHQUFHLENBQUMsTUFQUixDQUFBO0FBQUEsRUFTQSxFQUFBLEdBQVUsSUFBQSxZQUFBLENBQWEsQ0FBQSxHQUFJLENBQWpCLENBVFYsQ0FBQTtBQUFBLEVBVUEsRUFBQSxHQUFVLElBQUEsWUFBQSxDQUFhLENBQUEsR0FBSSxDQUFqQixDQVZWLENBQUE7QUFBQSxFQVdBLEdBQUEsR0FBVSxJQUFBLFlBQUEsQ0FBYSxDQUFBLEdBQUksQ0FBakIsQ0FYVixDQUFBO0FBYUEsT0FBUywwRUFBVCxHQUFBO0FBQ0UsU0FBUywrRUFBVCxHQUFBO0FBQ0UsTUFBQSxDQUFBLEdBQUksQ0FBQSxHQUFJLENBQUosR0FBUSxDQUFaLENBQUE7QUFBQSxNQUNBLEVBQUEsR0FBSyxDQURMLENBQUE7QUFBQSxNQUVBLEVBQUEsR0FBSyxDQUZMLENBQUE7QUFJQSxXQUFTLDJCQUFULEdBQUE7QUFDRSxhQUFTLDJCQUFULEdBQUE7QUFDRSxVQUFBLEVBQUEsR0FBSyxHQUFBLENBQUksQ0FBSixFQUFPLEdBQUEsQ0FBSSxDQUFBLEdBQUUsQ0FBTixFQUFTLENBQUEsR0FBRSxDQUFYLENBQVAsQ0FBTCxDQUFBO0FBQUEsVUFDQSxFQUFBLEdBQUssR0FBQSxDQUFJLENBQUosRUFBTyxHQUFBLENBQUksQ0FBQSxHQUFFLENBQU4sRUFBUyxDQUFBLEdBQUUsQ0FBWCxDQUFQLENBREwsQ0FBQTtBQUFBLFVBR0EsQ0FBQSxHQUFLLENBQUcsQ0FBQSxDQUFBLEdBQUksQ0FBQyxFQUFBLEdBQUssQ0FBTCxHQUFTLEVBQVYsQ0FBSixDQUFILEdBQXlCLEdBSDlCLENBQUE7QUFBQSxVQUtBLEVBQUEsSUFBTSxDQUFBLEdBQUksT0FBUSxDQUFBLENBQUEsR0FBSSxDQUFKLENBQU8sQ0FBQSxDQUFBLEdBQUksQ0FBSixDQUx6QixDQUFBO0FBQUEsVUFNQSxFQUFBLElBQU0sQ0FBQSxHQUFJLE9BQVEsQ0FBQSxDQUFBLEdBQUksQ0FBSixDQUFPLENBQUEsQ0FBQSxHQUFJLENBQUosQ0FOekIsQ0FERjtBQUFBLFNBREY7QUFBQSxPQUpBO0FBQUEsTUFjQSxFQUFHLENBQUEsQ0FBQSxDQUFILEdBQVEsRUFkUixDQUFBO0FBQUEsTUFlQSxFQUFHLENBQUEsQ0FBQSxDQUFILEdBQVEsRUFmUixDQURGO0FBQUEsS0FERjtBQUFBLEdBYkE7U0FnQ0E7QUFBQSxJQUNFLENBQUEsRUFDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLENBQVA7QUFBQSxNQUNBLE1BQUEsRUFBUSxDQURSO0FBQUEsTUFFQSxJQUFBLEVBQU0sRUFGTjtLQUZKO0FBQUEsSUFLRSxDQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxDQUFQO0FBQUEsTUFDQSxNQUFBLEVBQVEsQ0FEUjtBQUFBLE1BRUEsSUFBQSxFQUFNLEVBRk47S0FOSjtJQWxDaUI7QUFBQSxDQUFmLENBZEosQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnRTY3JpcHRzICcuL2xpYnMuanMnXG5cbnhLZXJuZWwgPSBbXG4gIFstMSwgMCwgMV1cbiAgWy0yLCAwLCAyXVxuICBbLTEsIDAsIDFdXG5dXG5cbnlLZXJuZWwgPSBbXG4gIFstMSwgLTIsIC0xXVxuICBbIDAsICAwLCAgMF1cbiAgWyAxLCAgMiwgIDFdXG5dXG5cbm5ldyBQcm9kdWNlciBzZWxmLCAoZGF0YSkgLT5cblxuICBtaW4gPSAodjEsIHYyKSAtPiBpZiAodjEgPCB2MikgdGhlbiB2MSBlbHNlIHYyXG4gIG1heCA9ICh2MSwgdjIpIC0+IGlmICh2MSA+IHYyKSB0aGVuIHYxIGVsc2UgdjJcblxuICBpbWcgPSBkYXRhLmltYWdlRGF0YVxuXG4gIGQgPSBpbWcuZGF0YVxuICB3ID0gaW1nLndpZHRoXG4gIGggPSBpbWcuaGVpZ2h0XG5cbiAgcnggID0gbmV3IEZsb2F0MzJBcnJheSh3ICogaClcbiAgcnkgID0gbmV3IEZsb2F0MzJBcnJheSh3ICogaClcbiAgcnh5ID0gbmV3IEZsb2F0MzJBcnJheSh3ICogaClcblxuICBmb3IgeSBpbiBbMCAuLi4gaF1cbiAgICBmb3IgeCBpbiBbMCAuLi4gd11cbiAgICAgIHAgPSB5ICogdyArIHhcbiAgICAgIGd4ID0gMFxuICAgICAgZ3kgPSAwXG5cbiAgICAgIGZvciBpIGluIFstMSAuLiAxXVxuICAgICAgICBmb3IgaiBpbiBbLTEgLi4gMV1cbiAgICAgICAgICBweSA9IG1heCgwLCBtaW4oaC0xLCB5K2kpKVxuICAgICAgICAgIHB4ID0gbWF4KDAsIG1pbih3LTEsIHgraikpXG5cbiAgICAgICAgICB2ICA9IGRbIDQgKiAocHkgKiB3ICsgcHgpIF0gLyAyNTVcblxuICAgICAgICAgIGd4ICs9IHYgKiB4S2VybmVsW2kgKyAxXVtqICsgMV1cbiAgICAgICAgICBneSArPSB2ICogeUtlcm5lbFtpICsgMV1baiArIDFdXG5cbiAgICAgIHJ4W3BdID0gZ3hcbiAgICAgIHJ5W3BdID0gZ3lcblxuICB7XG4gICAgeDpcbiAgICAgIHdpZHRoOiB3XG4gICAgICBoZWlnaHQ6IGhcbiAgICAgIGRhdGE6IHJ4XG4gICAgeTpcbiAgICAgIHdpZHRoOiB3XG4gICAgICBoZWlnaHQ6IGhcbiAgICAgIGRhdGE6IHJ5XG4gIH1cbiJdfQ==
