/**
 * Copyright 2020 - Frederik Ring <frederik.ring@gmail.com>
 * SPDX-License-Identifier: MIT
 */

var fs = require('fs')
var jscodeshift = require('jscodeshift')
var PO = require('pofile')
var events = require('events')

module.exports = extractStrings

function extractStrings (files, globalFunctionIdentifier) {
  if (!files || !files.length) {
    throw new Error('No files found using given pattern, exiting')
  }
  return parse(files, globalFunctionIdentifier)
}

function parse (files, globalFunctionIdentifier) {
  var stream = new events.EventEmitter()
  var all = files
    .filter(function (fileName) {
      return !(/node_modules/.test(fileName))
    })
    .map(function (fileName) {
      return new Promise(function (resolve, reject) {
        fs.readFile(fileName, 'utf-8', function (err, data) {
          if (err) {
            return reject(err)
          }
          var j = jscodeshift(data)
          var calls = j.find(jscodeshift.CallExpression, {
            callee: {
              type: 'Identifier',
              name: globalFunctionIdentifier
            }
          })
          var strings = []
          calls.forEach(function (node) {
            var dupes = strings.filter(function (string) {
              return string.msgid === node.value.arguments[0].value
            })
            if (dupes.length) {
              dupes[0].comments.push(fileName + ':' + node.node.loc.start.line)
            } else {
              var item = new PO.Item()
              item.msgid = node.value.arguments[0].value
              item.comments = [
                fileName + ':' + node.node.loc.start.line
              ]
              stream.emit('data', item.toString() + '\n\n')
            }
          })
          resolve()
        })
      })
    })
  Promise.all(all)
    .then(function (results) {
      stream.emit('end')
    })
    .catch(function (err) {
      stream.emit('error', err)
    })

  return stream
}
