importScripts './libs.js'

new Producer self, (data) ->

  min = (v1, v2) -> if (v1 < v2) then v1 else v2
  max = (v1, v2) -> if (v1 > v2) then v1 else v2

  sobelx = data.x
  sobely = data.y

  w = sobelx.width
  h = sobelx.height

  dx = sobelx.data
  dy = sobely.data

  cellW = data.cellW
  cellH = data.cellH

  rW = Math.floor(w / cellW)
  rH = Math.floor(h / cellH)

  length = new Float32Array(rW * rH)
  angle  = new Float32Array(rW * rH)
  coh    = new Float32Array(rW * rH)

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
          py = max(0, min(h-1, i))
          px = max(0, min(w-1, j))
          pp = py * w + px

          gx = dx[pp]
          gy = dy[pp]

          gxx += gx * gx
          gyy += gy * gy
          gxy += gx * gy
          gsx += gx * gx - gy * gy
          gsy += 2 * gx * gy

      angle[rp] = (-0.5 * Math.atan2(gsy, gsx)) % (2 * Math.PI) + Math.PI / 2

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

  {
    length: length
    angle: angle
    coh: coh
  }





