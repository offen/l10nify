/**
 * Copyright 2020 - Frederik Ring <frederik.ring@gmail.com>
 * SPDX-License-Identifier: MIT
 */

var path = require('path')
var through = require('through2')
var jscodeshift = require('jscodeshift')
var PO = require('pofile')

module.exports = transform

function transform (file, options) {
  var locale = options.locale || process.env.LOCALE || 'en'
  var defaultLocale = options.defaultLocale || process.env.DEFAULT_LOCALE || 'en'
  var globalFunctionIdentifier = options.global || process.env.GLOBAL || '__'
  var source = options.source || process.env.SOURCE || './locales/'

  var buf = ''
  return through(function (chunk, enc, next) {
    buf += chunk.toString('utf-8')
    next()
  }, function (done) {
    var self = this
    inlineStrings(buf, locale, defaultLocale, source, globalFunctionIdentifier, function (err, result) {
      if (err) {
        return done(err)
      }
      self.push(result)
      done()
    })
  })
}

function inlineStrings (sourceString, locale, defaultLocale, source, globalFunctionIdentifier, callback) {
  getStringMap(locale, defaultLocale, source, function (err, stringMap) {
    if (err) {
      return callback(err)
    }

    var j = jscodeshift(sourceString)
    var calls = j.find(jscodeshift.CallExpression, {
      callee: {
        type: 'Identifier',
        name: globalFunctionIdentifier
      }
    })

    calls.replaceWith(function (node) {
      if (node.value.arguments.length === 0) {
        return node
      }

      var formatStr = locale === defaultLocale
        ? node.value.arguments[0].value
        : stringMap[node.value.arguments[0].value] || node.value.arguments[0].value
      // one arguments means the call can just be replaced by its
      // string counterpart
      if (node.value.arguments.length === 1) {
        return jscodeshift.stringLiteral(formatStr)
      }

      // more than one argument means we want to do string interpolation
      var args = node.value.arguments.slice(1)

      return jscodeshift.callExpression(
        jscodeshift.memberExpression(
          jscodeshift.callExpression(
            jscodeshift.identifier('require'),
            [
              jscodeshift.stringLiteral('util')
            ]
          ),
          jscodeshift.identifier('format')
        ),
        [jscodeshift.stringLiteral(formatStr)].concat(args)
      )
    })
    callback(null, j.toSource())
  })
}

function getStringMap (locale, defaultLocale, source, callback) {
  if (locale === defaultLocale) {
    return callback(null, {})
  }
  var sourceFile = path.join(process.cwd(), source, locale + '.po')
  PO.load(sourceFile, function (err, data) {
    if (err) {
      return callback(err)
    }
    var stringMap = data.items.reduce(function (acc, next) {
      acc[next.msgid] = next.msgstr[0]
      return acc
    }, {})
    callback(null, stringMap)
  })
}
