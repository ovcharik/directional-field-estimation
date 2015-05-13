Base = require './lib/base'

class Canvas extends Base
  @property 'width' , get: -> @el.width
  @property 'height', get: -> @el.height

  @property 'imageWidth' , get: -> @image?.naturalWidth  ? 0
  @property 'imageHeight', get: -> @image?.naturalHeight ? 0

  @property 'offsetX', get: -> (@width  - @imageWidth)  / 2
  @property 'offsetY', get: -> (@height - @imageHeight) / 2

  defaultOptions:
    cellW: 15
    cellH: 15

  workers:
    sobel : new Listener './sobel.js'
    calc  : new Listener './calc.js'
    conv  : new Listener './conv.js'

  constructor: (@el, options = {}) ->
    @_calculatedData = null
    @_view = null
    @options = {}

    @ctx = @el.getContext("2d")
    @image = null
    @updateOptions options

  updateOptions: (options = {}) ->
    _.extend @options, options, @defaultOptions
    @loadImage(@image)

  loadImage: (@image) ->
    @_calculatedData = null
    @_clear()
    return unless @image
    @trigger 'loading'
    @_drawImage()
    @_calc @_getPixels(), (error, data) =>
      @_calculatedData = data
      @draw()
      @trigger 'loaded'

  setView: (view) ->
    @_view = view
    @draw()

  draw: ->
    @_clear()
    @_drawImage()
    switch @_view
      when 'angle'  then @_drawAngles()
      when 'length' then @_drawLength()
      when 'coh'    then @_drawCoh()

  _clear: ->
    @ctx.clearRect 0, 0, @width, @height

  # draw
  _drawImage: ->
    return unless @image
    @ctx.drawImage @image, @offsetX, @offsetY
    return

  _drawAngles: ->
    return unless @_calculatedData?.angle
    data = @_calculatedData.angle
    @ctx.lineWidth = 1
    @ctx.strokeStyle = "red"
    @_eachCells data, (ox, oy, w, h, v) =>
      rw = w / 2
      rh = h / 2
      x = @offsetX + ox + rw
      y = @offsetY + oy + rh
      @ctx.beginPath()
      @ctx.moveTo(x, y)
      @ctx.lineTo(x + Math.cos(v) * rw, y - Math.sin(v) * rh)
      @ctx.moveTo(x, y)
      @ctx.lineTo(x - Math.cos(v) * rw, y + Math.sin(v) * rh)
      @ctx.stroke()

  _drawLength: ->
    return unless @_calculatedData?.length
    @_clear()
    data = @_calculatedData.length
    @_eachCells data, (ox, oy, w, h, v) =>
      c = 255 * v | 1
      @ctx.fillStyle = "rgb(#{c},#{c},#{c})"
      @ctx.fillRect @offsetX + ox, @offsetY + oy, w + 1, h + 1

  _drawCoh: ->
    return unless @_calculatedData?.coh
    @_clear()
    data = @_calculatedData.coh
    @_eachCells data, (ox, oy, w, h, v) =>
      c = 255 * v | 1
      @ctx.fillStyle = "rgb(#{c},#{c},#{c})"
      @ctx.fillRect @offsetX + ox, @offsetY + oy, w + 1, h + 1

  _eachCells: (data, cb) ->
    return unless cb
    h = Math.floor(@imageHeight / @options.cellH)
    w = Math.floor(@imageWidth  / @options.cellW)
    for y in [0 ... h]
      for x in [0 ... w]
        p = y * w + x
        cb?(
          x * @options.cellW,
          y * @options.cellH,
          @options.cellW,
          @options.cellH,
          data[p]
        )


  # other
  _getPixels: ->
    return unless @image
    imageData = @ctx.getImageData @offsetX, @offsetY, @imageWidth, @imageHeight
    return imageData

  _putPixels: (imageData) ->
    @_clear()
    ox = (@width - imageData.width)   / 2
    oy = (@height - imageData.height) / 2
    @ctx.putImageData imageData, ox, oy


  # workers
  _conv: (imageData, kernel, cb) ->
    @workers.conv.apply {kernel: kernel, imageData: imageData}, cb
    return

  _sobel: (imageData, cb) ->
    @workers.sobel.apply {imageData: imageData}, cb
    return

  _calc: (imageData, cb) ->
    @_sobel imageData, (error, data) =>
      data.cellW = @options.cellW
      data.cellH = @options.cellH
      @workers.calc.apply data, cb

module.exports = Canvas
