// A access log middleware that is more or less directly yanked from morgan the
// connect logger

var onFinished = require('on-finished');

// A method attached to the log records that provide the total running time
// for the request
function responseTime(req, res) {
    if (!res._header || !req._startAt) {
        return '';
    }

    var tdiff = process.hrtime(req._startAt),
        ms = tdiff[0] * 1e3 + tdiff[1] * 1e-6;

    return ms.toFixed(3);
}

// A bit of a funky processor that pops the req object that was stored as
// `msg` and populates the record with details of the request
function attachAccessData(record) {
    var req = record.msg,
        res = req.res,
        url = req.originalUrl || req.url;

    record.msg = record.url = url;
    record.timestamp = req._startTime;
    record.remoteAddress = req.connection && req.connection.remoteAddress;
    record.method = req.method;
    record.status = res._header ? res.statusCode : null;
    record.responseTime = responseTime(req, res);

    if (record.status >= 400) {
        record.level = 40;
    }
}

// Select the logger to use based on the options hash
function getLogger(options) {
    // A logger instance may be given in the options hash
    if (options.logger) {
        return options.logger;
    }

    // Or as the only argument
    if (options instanceof Object && options.constructor !== Object) {
        return options;
    }

    // Or simply a name to use for the logger and if you're really lazy just go
    // with the default name `access`
    return require('rapidus').getLogger(options.name || options || 'access');
}

// Initialise a logger and attach a connect middleware that issues log records
// to that logger
function createAccessLogger(options) {
    var logger = getLogger(options);

    // Attach processor that extracts information from request
    logger.addProcessor(attachAccessData);

    // The middleware
    function loggerMiddleware(req, res, next) {
        req._startAt = process.hrtime();
        req._startTime = new Date();

        onFinished(res, function () {
            if (req.res === void 0) {
                req.res = res;
            }

            // This abuses the fact that msg is not forced to be a string when
            // being created and relies on the processor to fix this.
            logger.info(req);
        });

        next();
    }

    // Export middleware as property on logger and return the logger
    logger.middleware = loggerMiddleware;
    return logger;
}

function connectLogger(options) {
    return createAccessLogger(options).middleware;
}

module.exports = connectLogger;
module.exports.createLogger = createAccessLogger;
