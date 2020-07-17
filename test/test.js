var path = require('path')
var tape = require('tape')
var browserify = require('browserify')
var vm = require('vm')

tape.test('returns the default language when no options are passed', function (t) {
  bundle('log.js', null, function (err, src) {
    if (err) {
      t.fail(err)
    }

    vm.runInNewContext(src, {
      console: { log: log }
    })

    function log (value) {
      t.equal(value, 'Happy birthday Guillermo!', 'passes')
      t.end()
    }
  })
})

tape.test('returns the given language', function (t) {
  bundle('log.js', { locale: 'de', source: './test/locales' }, function (err, src) {
    if (err) {
      t.fail(err)
    }

    vm.runInNewContext(src, {
      console: { log: log }
    })

    function log (value) {
      t.equal(value, 'Alles Gute, Guillermo!', 'passes')
      t.end()
    }
  })
})

tape.test('uses the given global identifier', function (t) {
  bundle('gettext.js', { global: 'gettext' }, function (err, src) {
    if (err) {
      t.fail(err)
    }

    vm.runInNewContext(src, {
      console: { log: log }
    })

    function log (value) {
      t.equal(value, 'Happy birthday, Linus!', 'passes')
      t.end()
    }
  })
})

function bundle (file, opts, callback) {
  var b = browserify()
  b.add(path.join(__dirname, file))
  b.transform(path.resolve(__dirname, '..'), opts || {})
  b.bundle(callback)
}
