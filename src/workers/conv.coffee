importScripts './libs.js'

new Producer self, (data) ->
  kernel = data.kernel
  img  = data.imageData

  h = img.height
  w = img.width

  kh = kernel.length ? 0
  kw = kernel[0]?.length ? 0

  src = img.data
  out = new Uint8ClampedArray(src.length)

  for y in [0 ... h]
    for x in [0 ... w]
      [r, g, b, a, sum] = [0, 0, 0, 0, 0]

      for i in [0 ... kh]
        for j in [0 ... kw]
          px = x + (j - (kw >> 1))
          py = y + (i - (kh >> 1))

          continue if px < 0 || px >= w || py < 0 || py >= h

          v = kernel[i][j]
          r += src[4 * (w * py + px) + 0] * v
          g += src[4 * (w * py + px) + 1] * v
          b += src[4 * (w * py + px) + 2] * v
          sum += v

      sum = 1 if sum <= 0

      r /= sum | 1
      r  = 0   if r < 0
      r  = 255 if r > 255

      g /= sum | 1
      g  = 0   if g < 0
      g  = 255 if g > 255

      b /= sum | 1
      b  = 0   if b < 0
      b  = 255 if b > 255

      out[4 * (w * y + x) + 0] = r
      out[4 * (w * y + x) + 1] = g
      out[4 * (w * y + x) + 2] = b
      out[4 * (w * y + x) + 3] = 255

  return imageData: new ImageData(out, w, h)
