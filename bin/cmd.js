#!/usr/bin/env node

/**
 * Copyright 2020 - Frederik Ring <frederik.ring@gmail.com>
 * SPDX-License-Identifier: MIT
 */

var path = require('path')
var arg = require('arg')

var extractStrings = require('./../extract.js')

var args = arg({
  '--help': Boolean,
  '--default-locale': String,
  '--locale': [String],
  '--target': String,
  '-h': '--help',
  '-d': '--default-locale',
  '-l': '--locale',
  '-t': '--target'
})

if (args['--help']) {
  console.log(`Usage: extract-strings [options] glob-pattern

glob-pattern defines in which files to look for strings. Usually this will
be "**/*.js" or similar.

Options:
  -l, --locale [LOCALE]         Specify the locales to extract. Pass multiple
                                locales by passing multiple flags.
  -d, --default-locale [LOCALE] Specify the default locale that is used in code.
                                Defaults to "en".
  -t, --target [DIRECTORY]      Specify the target directory for saving .po
                                files. Defaults to "./locales".
  -g, --global [IDENTIFIER]     Specify the global identifier used as l10n
                                function in code, Defaults to "__"
  -h, --help                    Display this help message.
`)
  process.exit(0)
}

args = Object.assign({
  '--default-locale': 'en',
  '--locale': [],
  '--target': './locales/',
  '--global': '__'
}, args)

var eligible = args['--locale']
  .filter(function (locale) {
    return locale !== args['--default-locale']
  })

if (eligible.length === 0) {
  console.log('No non-default locales were configured. Nothing to do.')
  console.log('If this is unintended, check the locales passed to this task.')
  process.exit(0)
}

Promise.all(eligible.map(function (locale) {
  return extractStrings(
    path.join(process.cwd(), args['--target'], locale + '.po'),
    args._[0],
    args['--global']
  )
}))
  .then(() => {
    console.log('Successfully extracted %d locales.', eligible.length)
  })
  .catch(function (err) {
    console.error('Error extracting strings: %s', err.message)
    console.error(err)
    process.exit(1)
  })
