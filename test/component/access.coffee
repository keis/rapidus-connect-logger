sinon = require 'sinon'
rapidus = require 'rapidus'
request = require 'supertest'
connect = require 'connect'

describe "access-logger", ->
    accessLog = require '../../lib/'

    logger = null
    app = null

    beforeEach ->
        app = connect()

        hier = rapidus.createHierarchy()
        logger = hier.getLogger()

        accessLog
            logger: logger

    it "ensures attached sink is called with a populated record", (done) ->
        app.use logger.middleware
        app.use (req, res) ->
            res.end 'message'

        record = null

        logger.addSink (r) ->
            record = r

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
