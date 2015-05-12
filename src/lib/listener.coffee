UUID = require './uuid'

class Listener extends Base

  constructor: (@name) ->
    @_worker = new Worker(@name)
    @_stack  = {}

    @_worker.addEventListener 'message', (event) =>
      data = event.data
      uuid = data.__uuid
      delete data.__uuid
      @_stack[uuid]?(null, data)
      delete @_stack[uuid]

  apply: (data = {}, cb) ->
    unless _.isObject data
      throw new Error 'Data should be object'

    data.__uuid = UUID()
    transfer = []
    for t in (data.__transfer || [])
      transfer.push t
    delete data.__transfer
    @_stack[data.__uuid] = cb
    @_worker.postMessage data, transfer

module.exports = Listener
