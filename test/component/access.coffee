sinon = require 'sinon'
request = require 'supertest'
connect = require 'connect'
Logger = require 'mlogy'
Sink = require 'record-sink'

describe "access-logger", ->
    accessLog = require '../../lib/'

    logger = null
    app = null

    beforeEach ->
        app = connect()

        logger = new Logger

        accessLog
            logger: logger

    it "ensures attached sink is called with a populated record", (done) ->
        app.use logger.middleware
        app.use (req, res) ->
            res.end 'message'

        record = null

        sink = new Sink
        sink.write = (r) ->
            record = r

        logger.addSink sink

        verify = ->
            assert.propertyVal record, 'url', '/zoidberg'
            assert.propertyVal record, 'status', 200
            assert.propertyVal record, 'method', 'GET'
            assert.property record, 'responseTime'
            done()

        request app
            .get '/zoidberg'
            .expect 200, 'message', ->
                setImmediate verify
