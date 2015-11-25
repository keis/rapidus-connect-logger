# rapidus-connect-logger

[![NPM Version][npm-image]](https://npmjs.org/package/rapidus-connect-logger)
[![Build Status][travis-image]](https://travis-ci.org/keis/rapidus-connect-logger)
[![Coverage Status][coveralls-image]](https://coveralls.io/r/keis/rapidus-connect-logger?branch=master)

access logs for connect in rapidus

## Installation

```bash
npm install --save rapidus-connect-logger
```

## Usage

Wrapping an existing logger object

```javascript
var accessLog = require('rapidus-connect-logger')
var logger = require('rapidus').getLogger('access')

app.use(accessLog(logger))
```

Creating a new logger and adding it to the hierarchy

```javascript
var logger = require('rapidus-connect-logger').createLogger('access')
app.use(logger.middleware)
require('rapidus').manageLogger(logger)
```

## Changes

### 2.0.0

Starting with version 2.0 no attempt to add loggers created by this module to
rapidus is made. A Logger instance is still created using the `mlogy` module
but needs to be explicitly added to the hierarchy.

> As I cuddled the porcupine


[npm-image]: https://img.shields.io/npm/v/rapidus-connect-logger.svg?style=flat
[travis-image]: https://img.shields.io/travis/keis/rapidus-connect-logger.svg?style=flat
[coveralls-image]: https://img.shields.io/coveralls/keis/rapidus-connect-logger.svg?style=flat
