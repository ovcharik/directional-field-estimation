class Producer extends Base

  constructor: (@worker, @apply) ->
    unless _.isFunction @apply
      throw new Error 'Apply should be function'

    @worker.addEventListener 'message', (event) =>
      data = event.data
      uuid = data.__uuid
      delete data.__uuid

      if @apply?.length == 2
        @apply? _data, transfer, (error, data) =>
          throw Error if error
          @send uuid, data
      else
        data = @apply(data)
        @send uuid, data

  send: (uuid, data = {}) ->
    unless _.isObject data
      throw new Error 'Data should be object'

    data.__uuid = uuid
    transfer = []
    for t in (data.__transfer || [])
      transfer.push t
    delete data.__transfer
    @worker.postMessage data, transfer

module.exports = Producer
