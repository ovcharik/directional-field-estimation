importScripts './libs.js'

calcAngle = (x, y) ->
  a  = (-0.5 * Math.atan2(x, y)) % (2 * Math.PI) + Math.PI / 2
  # a += Math.PI if a < 0
  a

new Producer self, (data) ->

  sobelx = data.x
  sobely = data.y

  w = sobelx.width
  h = sobelx.height

  cellW = data.cellW
  cellH = data.cellH

  rW = Math.floor(w / cellW)
  rH = Math.floor(h / cellH)

  length = new Array(rW * rH)
  angle  = new Array(rW * rH)
  coh    = new Array(rW * rH)

  minL = Infinity
  maxL = -Infinity

  minC = Infinity
  maxC = -Infinity

  for y in [0 ... rH]
    for x in [0 ... rW]
      rp = y * rW + x
      [gxx, gyy, gxy, gsx, gsy] = [0, 0, 0, 0, 0]

      for i in [ y * cellH ... (y + 1) * cellH ]
        for j in [ x * cellW ... (x + 1) * cellW ]
          py = _.max ([0, _.min([h-1, i])])
          px = _.max ([0, _.min([w-1, j])])
          pp = py * w + px

          gx = sobelx.data[pp]
          gy = sobely.data[pp]

          gxx += gx * gx
          gyy += gy * gy
          gxy += gx * gy
          gsx += gx * gx - gy * gy
          gsy += 2 * gx * gy

      angle[rp] = calcAngle(gsy, gsx)

      length[rp] = Math.sqrt(gsx * gsx + gsy * gsy)
      minL  = length[rp] if length[rp] < minL
      maxL  = length[rp] if length[rp] > maxL

      diff = gxx - gyy
      coh[rp] = Math.sqrt( diff * diff + 4 * gxy * gxy ) / (gxx + gyy)
      minC  = coh[rp] if coh[rp] < minC
      maxC  = coh[rp] if coh[rp] > maxC

  # length normalization
  maxL -= minL
  length[i] = (v - minL) / maxL for v, i in length

  # coherency normalization
  maxC -= minC
  coh[i] = (v - minC) / maxC for v, i in coh

  return {
    length: length
    angle: angle
    coh: coh
  }





