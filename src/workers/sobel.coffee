importScripts './libs.js'

xKernel = [
  [-1, 0, 1]
  [-2, 0, 2]
  [-1, 0, 1]
]

yKernel = [
  [-1, -2, -1]
  [ 0,  0,  0]
  [ 1,  2,  1]
]

new Producer self, (data) ->

  min = (v1, v2) -> if (v1 < v2) then v1 else v2
  max = (v1, v2) -> if (v1 > v2) then v1 else v2

  img = data.imageData

  d = img.data
  w = img.width
  h = img.height

  rx  = new Float32Array(w * h)
  ry  = new Float32Array(w * h)
  rxy = new Float32Array(w * h)

  # xmax = -Infinity
  # xmin =  Infinity
  # ymax = -Infinity
  # ymin =  Infinity

  for y in [0 ... h]
    for x in [0 ... w]
      p = y * w + x
      gx = 0
      gy = 0

      for i in [-1 .. 1]
        for j in [-1 .. 1]
          py = max(0, min(h-1, y+i))
          px = max(0, min(w-1, x+j))

          v  = d[ 4 * (py * w + px) ] / 255

          gx += v * xKernel[i + 1][j + 1]
          gy += v * yKernel[i + 1][j + 1]

          # xmax = max(gx, xmax)
          # xmin = min(gx, xmin)
          # ymax = max(gy, ymax)
          # ymin = min(gy, ymin)

      rx[p] = gx
      ry[p] = gy

  # x = new Uint8ClampedArray(4 * w * h)
  # f = xmax - xmin
  # for v, i in rx
  #   v = Math.floor(255 * (v - xmin) / f)
  #   x[4 * i + 0] = v
  #   x[4 * i + 1] = v
  #   x[4 * i + 2] = v
  #   x[4 * i + 3] = 255

  # y = new Uint8ClampedArray(4 * w * h)
  # f = ymax - ymin
  # for v, i in ry
  #   v = Math.floor(255 * (v - ymin) / f)
  #   y[4 * i + 0] = v
  #   y[4 * i + 1] = v
  #   y[4 * i + 2] = v
  #   y[4 * i + 3] = 255

  {
    x:
      width: w
      height: h
      data: rx
    y:
      width: w
      height: h
      data: ry
    # imgX: new ImageData(x, w, h)
    # imgY: new ImageData(y, w, h)
  }
