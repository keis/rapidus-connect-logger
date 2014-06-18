// A access log middleware that is more or less directly yanked from morgan the
// connect logger
var rapidus = require('rapidus');

// Initialise a logger and return a connect middleware that issues log records
// to that logger
function createAccessLogger(options) {
    var logger;

    // A logger instance may be given to be reused
    if (options.logger || options instanceof rapidus.Logger) {
        logger = options.logger;
    // Or simply a name to use for the logger and if you're really lazy just go
    // with the default name `access`
    } else {
        logger = rapidus.getLogger(options.name || options || 'access');
    }

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
    logger.addProcessor(function (record) {
        var req = record.msg,
            res = req.res,
            url = req.originalUrl || req.url;

        record.msg = record.url = url;
        record.time = req._startTime;
        record.remoteAddress = req.connection && req.connection.remoteAddress;
        record.method = req.method;
        record.status = res._header ? res.statusCode : null;
        record.responseTime = responseTime(req, res);
    });

    // The middleware
    return function (req, res, next) {
        req._startAt = process.hrtime();
        req._startTime = new Date();

        function log() {
            res.removeListener('finish', log);
            res.removeListener('close', log);
            // This abuses the fact that msg is not forced to be a string when
            // being created and relies on the processor to fix this.
            // util.format happens to do something pretty useful with objects
            // passed so this should be a blessed usage.
            logger.info(req);
        }

        res.on('finish', log);
        res.on('close', log);

        next();
    }
}

module.exports = createAccessLogger;