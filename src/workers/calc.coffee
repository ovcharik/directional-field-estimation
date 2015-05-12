importScripts './libs.js'

calcAngle = (x, y) ->
  a  = (-0.5 * Math.atan2(x, y)) % (2 * Math.PI)
  a += Math.PI if a < 0
  a / 2

new Producer self, (data) ->

  gx = data.x
  gy = data.y

  w = gx.width
  h = gx.height

  cellW = data.cellW
  cellH = data.cellH

  rW = w / cellW | 1
  rH = h / cellH | 1

  length = new Array(rW * rH)
  angle  = new Array(rW * rH)
  coh    = new Array(rW * rH)

  maxL = 0

  for y in [0 ... rH]
    for x in [0 ... rW]
      rp = y * rW + x
      xx = 0
      yy = 0
      xy = 0

      for i in [ y * cellH ... (y + 1) * cellH ]
        for j in [ x * cellW ... (x + 1) * cellW ]
          continue if i < 0 || i >= h || j < 0 || j >= w
          pp = i * w + j
          vx = gx.data[4 * pp + 0]
          vy = gy.data[4 * pp + 0]
          xx += vx * vx
          yy += vy * vy
          xy += vx * vy

      xx = xx / cellH / cellW
      yy = yy / cellH / cellW
      xy = xy / cellH / cellW

      length[rp] = Math.sqrt(Math.pow(xx - yy, 2) + Math.pow(2 * xy, 2))
      maxL = length[rp] if length[rp] > maxL

      angle[rp] = calcAngle(xx - yy, 2 * xy)

      coh[rp] = Math.sqrt( Math.pow(xx - yy, 2) + 4*xy*xy ) / (xx + yy)
      coh[rp] = 1 if isNaN(coh[rp])

  for v, i in length
    length[i] = v / maxL

  return {
    length: length
    angle: angle
    coh: coh
  }





