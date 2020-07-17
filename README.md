# l10nify

Localization workflow for Browserify

## How does this work

This is a Browserify-based workflow for localizing client side applications. It is built for use cases where you can and want to ship one bundle per locale. Strings are defined by calling a pseudo-global function (i.e. `__(string, args..)`) in the default language in your code (similar to GNU gettext or similar). Strings are stored in `.po` files.

## Installation

Install from npm:

```
npm install @offen/l10nify
```

This installs two things:

- a Browserify transform for localizing strings at bundle time. It is references as `@offen/l10nify`
- a `extract-strings` command that you can use to generate PO files from your JavaScript code.

## Usage

### Defining strings in client side code

In your code, use the `__(string, args...)` function (`__` is the default, but you can use anything) to declare strings in your default language (which defaults to `en` but can be anything you want it to):

```js
const HappyBirthdayComponent = (props) => {
  return (
    <h1>{__('Happy birthday, %s!', props.name)}</h1>
  )
}
```

### Extract strings from your code

Next, you can extract these strings from your code into `.po` files using the `extract-strings` command:

```
$(npm bin)/extract-strings --default-locale en \
  --locale es \
  --locale fr \
  --locale de \
  **/*.js 
```

This will create a `.po` file for each non-default locale in a directory called `./locales` (pass `--target` if you want to change this).

Refer to `extract-strings --help` for a full list of options

### Apply the transform at bundle time

Apply the transform to your Browserify setup passing the target `locale`. In development, you can omit this parameter to make the transform return the default locale, i.e. the strings you defined in code.

```js
var browserify = require('browserify')

var b = browserify()
b.add('app.js')
b.transform('@offen/l10nify', { locale: 'fr' })
b.bundle(function (err, src) {
  // consume bundle
})
```

#### Options

The following options can be passed to the transform:

##### `locale`

`locale` specifies the locale which you want to return when bundling. It defaults to `en`.

##### `defaultLocale`

`defaultLocale` specifies the default locale that is used to define strings in code. It defaults to `en`.

##### `source`

`source` specifies the directory in which the `<LOCALE>.po` files are stored. It defaults to `./locales`

##### `global`

`global` defines the global function identifier that is used for defining strings in code. It defaults to `__`.

## License

Copyright 2020 Frederik Ring - `l10nify` is available under the MIT License
