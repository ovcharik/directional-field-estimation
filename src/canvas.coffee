Base = require './lib/base'

class Canvas extends Base
  @property 'width' , get: -> @el.width
  @property 'height', get: -> @el.height

  @property 'imageWidth' , get: -> @image?.naturalWidth  ? 0
  @property 'imageHeight', get: -> @image?.naturalHeight ? 0

  @property 'offsetX', get: -> (@width  - @imageWidth)  / 2
  @property 'offsetY', get: -> (@height - @imageHeight) / 2

  defaultOptions:
    cellW: 10
    cellH: 10

  workers:
    conv : new Listener './conv.js'
    calc : new Listener './calc.js'

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
      @ctx.lineTo(x + Math.cos(v) * rw, y + Math.sin(v) * rh)
      @ctx.moveTo(x, y)
      @ctx.lineTo(x + Math.cos(Math.PI + v) * rw, y + Math.sin(Math.PI + v) * rh)
      @ctx.stroke()

  _drawLength: ->
    return unless @_calculatedData?.length
    data = @_calculatedData.length
    @_eachCells data, (ox, oy, w, h, v) =>
      c = 255 * v | 1
      @ctx.fillStyle = "rgb(#{c},#{c},#{c})"
      @ctx.fillRect @offsetX + ox, @offsetY + oy, w + 1, h + 1

  _drawCoh: ->
    return unless @_calculatedData?.coh
    data = @_calculatedData.coh
    @_eachCells data, (ox, oy, w, h, v) =>
      c = 255 * v | 1
      @ctx.fillStyle = "rgb(#{c},#{c},#{c})"
      @ctx.fillRect @offsetX + ox, @offsetY + oy, w + 1, h + 1

  _eachCells: (data, cb) ->
    return unless cb
    h = @imageHeight / @options.cellH | 1
    w = @imageWidth  / @options.cellW | 1
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
    @clear()
    ox = (@width - imageData.width)   / 2
    oy = (@height - imageData.height) / 2
    @ctx.putImageData imageData, ox, oy


  # workers
  _conv: (imageData, kernel, cb) ->
    data =
      kernel: kernel
      imageData: imageData
    @workers.conv.apply data, (error, data) => cb?(null, data)
    return

  _sobel: (imageData, cb) ->
    async.parallel [
      _.bind @_conv, @, imageData, [[-1,0,1],[-2,0,2],[-1,0,1]]
      _.bind @_conv, @, imageData, [[-1,-2,-1],[0,0,0],[1,2,1]]
    ], (error, data) ->
      cb? null, 
        x: data[0].imageData
        y: data[1].imageData
    return

  _calc: (imageData, cb) ->
    @_sobel imageData, (error, data) =>
      data.cellW = @options.cellW
      data.cellH = @options.cellH
      @workers.calc.apply data, (error, data) => cb?(null, data)

module.exports = Canvas
