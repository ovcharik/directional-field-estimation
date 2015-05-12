Module = require './module'

pm = require './property_mixin'
em = require './event_mixin'

class Base extends Module
  @extend  pm
  @include em

module.exports = Base
