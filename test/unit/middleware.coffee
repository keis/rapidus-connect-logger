sinon = require 'sinon'
request = require 'supertest'
connect = require 'connect'

describe "middleware", ->
    accessLog = require '../../lib/'

    logger = null
    app = null

    beforeEach ->
        app = connect()

        logger =
            addProcessor: sinon.stub()
            info: sinon.stub()

        accessLog
            logger: logger

    it "is exposed as a property on the logger", ->
        assert.isFunction logger.middleware

    it "calls the logger with the request", (done) ->
        app.use logger.middleware
        app.use (req, res) ->
            res.end 'message'

        verify = ->
            assert.calledOnce logger.info
            assert.calledWith logger.info, sinon.match.has 'url', '/zoidberg'
            done()

        request app
            .get '/zoidberg'
            .expect 200, 'message', ->
                setImmediate verify

    it "works with asynchronous handlers", (done) ->
        app.use logger.middleware
        app.use (req, res) ->
            setTimeout (->
                res.end 'message'), 100

        verify = ->
            assert.calledOnce logger.info
            assert.calledWith logger.info, sinon.match.has 'url', '/bob'
            done()

        request app
            .get '/bob'
            .expect 200, 'message', ->
                setImmediate verify
