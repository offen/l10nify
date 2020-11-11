#!/usr/bin/env node

/**
 * Copyright 2020 - Frederik Ring <frederik.ring@gmail.com>
 * SPDX-License-Identifier: MIT
 */

var arg = require('arg')

var extractStrings = require('./../extract.js')

var args = arg({
  '--help': Boolean,
  '--global': String,
  '-h': '--help',
  '-g': '--global'
})

if (args['--help']) {
  console.log(`Usage: extract-strings [options] files...

files defines the files to extract strings from. Usually this will
be a glob pattern like "**/*.js" or similar.

Options:
  -g, --global [IDENTIFIER]     Specify the global identifier used as l10n
                                function in code, Defaults to "__"
  -h, --help                    Display this help message.
`)
  process.exit(0)
}

args = Object.assign({
  '--global': '__'
}, args)

var stream = extractStrings(args._, args['--global'])

stream.on('data', function (line) {
  process.stdout.write(line)
})

stream.on('error', function (err) {
  console.error('Error extracting strings: %s', err.message)
  console.error(err)
  process.exit(1)
})

stream.on('end', function () {
  process.exit(0)
})
