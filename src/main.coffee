# import
imagesSrc = require './images'
Canvas = require './canvas'

# vars
$window = $(window)
$canvas = null
canvas = null
$canvasContainer = null
$imagesContainer = null
$loading = null

# functions
resizeCanvas = ->
  h = $window.height() - $canvasContainer.offset().top - 60
  $canvasContainer.height h > 300 && h || 300
  $canvas.attr
    width : $canvasContainer.width()  | 1
    height: $canvasContainer.height() | 1

  h = $window.height() - $imagesContainer.offset().top - 45
  $imagesContainer.height h > 300 && h || 300

  canvas.draw()

loadImages = ->
  f = null
  for image in imagesSrc
    do (image) ->
      # loading
      file = image
      name = image.replace(/.*?([^\/\.]+)\.bmp$/, "$1")

      img = new Image
      img.src = file
      f ?= img

      # render
      $el = $ "
        <div class='col-sm-6 image-item ImageItem'>
          <div class='Image'></div>
          <a href='javascript:;'>#{name}</a>
        </div>
      "
      $('.Image', $el).append img
      $el.on 'click', -> selectImage(img)
      $imagesContainer.append $el

  # select first image
  f.addEventListener 'load', -> selectImage f

selectImage = (image) ->
  canvas.loadImage image

translates = require './translate'
translate = (lang = "en") ->
  for key, value of translates[lang]
    $(".Text[data-key='#{key}']").text value

# events
$window.on 'resize', resizeCanvas

$window.on 'load', ->
  translate()

  $canvas = $('.Canvas')
  $canvasContainer = $('.CanvasContainer')
  $imagesContainer = $('.ImagesContainer')
  $loading = $('.Loading')
  $button = $('.BtnView')
  $inputs = $('.OptionsInput')

  canvas = new Canvas $canvas[0]
  canvas.on 'loading', -> $loading.show()
  canvas.on 'loaded', -> $loading.hide()

  $button.on 'click', ->
    $button.removeClass('active')
    $(@).addClass('active')
    view = $(@).data('view')
    canvas.setView view
    localStorage.view = view

  view = localStorage.view || 'image'
  $(".BtnView[data-view='#{view}']").trigger 'click'

  $inputs.on 'change', ->
    name = @name
    value = Number @value
    o = {}
    o[name] = value
    canvas.updateOptions o

  $window.on 'keydown', (event) ->
    if event.altKey and event.keyCode == 84
      event.preventDefault()
      translate('ru')
    if event.altKey and event.keyCode == 85
      event.preventDefault()
      translate('en')

  resizeCanvas()
  loadImages()
