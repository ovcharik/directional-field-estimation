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

  cell = data.cell

  rW = Math.floor(w / cell)
  rH = Math.floor(h / cell)

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

      for i in [ y * cell ... (y + 1) * cell ]
        for j in [ x * cell ... (x + 1) * cell ]
          pp = i * w + j
          gx = dx[pp]
          gy = dy[pp]

          gxx += gx * gx
          gyy += gy * gy
          gxy += gx * gy
          gsx += gx * gx - gy * gy
          gsy += 2 * gx * gy

      angle[rp] = (-0.5 * Math.atan2(gsy, gsx)) % (2 * Math.PI) + Math.PI / 2

      length[rp] = Math.sqrt(gsx * gsx + gsy * gsy)
      minL = min(minL, length[rp])
      maxL = max(maxL, length[rp])

      diff = gxx - gyy
      coh[rp] = Math.sqrt( diff * diff + 4 * gxy * gxy ) / (gxx + gyy)
      minC = min(minC, coh[rp])
      maxC = max(maxC, coh[rp])

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





