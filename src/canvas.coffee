Base = require './lib/base'

class Canvas extends Base
  @property 'width' , get: -> @el.width
  @property 'height', get: -> @el.height

  @property 'imageWidth' , get: -> @image?.naturalWidth  ? 0
  @property 'imageHeight', get: -> @image?.naturalHeight ? 0

  @property 'offsetX', get: -> (@width  - @imageWidth)  / 2
  @property 'offsetY', get: -> (@height - @imageHeight) / 2

  defaultOptions:
    cell: 15

  workers:
    sobel : new Listener './sobel.js'
    calc  : new Listener './calc.js'

  constructor: (@el, options = {}) ->
    @_calculatedData = null
    @_view = null
    @options = {}

    @ctx = @el.getContext("2d")
    @image = null
    @updateOptions options

  updateOptions: (options = {}) ->
    _.extend @options, @defaultOptions, options
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
    l = @_calculatedData.length
    @ctx.lineWidth = 1
    @ctx.strokeStyle = "red"
    @_eachCells data, (ox, oy, size, v, i) =>
      return if l[i] < 0.01
      half = size / 2
      x = @offsetX + ox + half
      y = @offsetY + oy + half
      @ctx.beginPath()
      @ctx.moveTo(x, y)
      @ctx.lineTo(x + Math.cos(v) * half, y - Math.sin(v) * half)
      @ctx.moveTo(x, y)
      @ctx.lineTo(x - Math.cos(v) * half, y + Math.sin(v) * half)
      @ctx.stroke()

  _drawLength: ->
    return unless @_calculatedData?.length
    @_clear()
    data = @_calculatedData.length
    @_eachCells data, (ox, oy, size, v) =>
      c = Math.floor(255 * v)
      @ctx.fillStyle = "rgb(#{c},#{c},#{c})"
      @ctx.fillRect @offsetX + ox, @offsetY + oy, size + 1, size + 1

  _drawCoh: ->
    return unless @_calculatedData?.coh
    @_clear()
    data = @_calculatedData.coh
    l = @_calculatedData.length
    @_eachCells data, (ox, oy, size, v, i) =>
      return if l[i] < 0.01
      c = Math.floor(255 * v)
      @ctx.fillStyle = "rgb(#{c},#{c},#{c})"
      @ctx.fillRect @offsetX + ox, @offsetY + oy, size + 1, size + 1

  _eachCells: (data, cb) ->
    return unless cb
    h = Math.floor(@imageHeight / @options.cell)
    w = Math.floor(@imageWidth  / @options.cell)
    for y in [0 ... h]
      for x in [0 ... w]
        p = y * w + x
        cb?(
          x * @options.cell,
          y * @options.cell,
          @options.cell,
          data[p],
          p
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
      data.cell = @options.cell
      @workers.calc.apply data, cb

module.exports = Canvas
