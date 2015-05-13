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

  img  = data.imageData

  w = img.width
  h = img.height

  # [minX , maxY ] = [Infinity, -Infinity]
  # [minY , maxY ] = [Infinity, -Infinity]
  # [minXY, maxXY] = [Infinity, -Infinity]

  rx = new Array(w * h)
  ry = new Array(w * h)
  rxy = new Array(w * h)

  for y in [0 ... h]
    for x in [0 ... w]
      p = y * w + x
      rx[p] = 0
      ry[p] = 0

      for i in [-1 .. 1]
        for j in [-1 .. 1]
          py = _.max [ 0, _.min([h-1, y+i]) ]
          px = _.max [ 0, _.min([w-1, x+j]) ]
          v = img.data[ 4 * (py * w + px) ] / 255
          rx[p] += v * xKernel[i + 1][j + 1]
          ry[p] += v * yKernel[i + 1][j + 1]

      if rx[p] != 0 and ry[p] != 0 and rx[p] == ry[p]
        rx[p] += _.random(-1, 1) * 0.1

      rxy[p] = Math.sqrt(rx[p] * rx[p] + ry[p] * ry[p])

  #     minX = rx[p] if rx[p] < minX
  #     maxX = rx[p] if rx[p] > minX

  #     minY = ry[p] if ry[p] < minY
  #     maxY = ry[p] if ry[p] > minY

  #     minXY = rxy[p] if rxy[p] < minXY
  #     maxXY = rxy[p] if rxy[p] > minXY

  # dataX  = new Uint8ClampedArray(w * h * 4)
  # dataY  = new Uint8ClampedArray(w * h * 4)
  # dataXY = new Uint8ClampedArray(w * h * 4)

  # maxX  -= minX
  # maxY  -= minY
  # maxXY -= minXY


  # for i in [0 ... w * h]
  #   x = Math.floor( (rx[i] - minX) / maxX * 255)
  #   dataX[i * 4 + 0] = x
  #   dataX[i * 4 + 1] = x
  #   dataX[i * 4 + 2] = x
  #   dataX[i * 4 + 3] = 255

  #   y = Math.floor( (ry[i] - minY) / maxY * 255)
  #   dataY[i * 4 + 0] = y
  #   dataY[i * 4 + 1] = y
  #   dataY[i * 4 + 2] = y
  #   dataY[i * 4 + 3] = 255

  #   xy = Math.floor( (rxy[i] - minXY) / maxXY * 255)
  #   dataXY[i * 4 + 0] = xy
  #   dataXY[i * 4 + 1] = xy
  #   dataXY[i * 4 + 2] = xy
  #   dataXY[i * 4 + 3] = 255


  return {
    x:
      width: w
      height: h
      data: rx
    y:
      width: w
      height: h
      data: ry

    # imageX : new ImageData(dataX , w, h)
    # imageY : new ImageData(dataY , w, h)
    # imageXY: new ImageData(dataXY, w, h)
  }
