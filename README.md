# JSPM-Sass-Mouth: Death to bower.

*jspm-sass-mouth* finds jspm dependencies you wish to include and dynamically generates a scss file containing `@import` statements that point to those dependencies.

## Installation

```
$ npm install jspm-sass-mouth --save-dev
```

## Configuration

Create a file in the root directory of your project called `sass-mouth.json` and use the following syntax to generate .scss files:

```javascript
{
  "sassfilename1": {
    "dir": "path/to/your/scss/directory", // optional - defaults to cwd.
    "output": "generated-sass-file.scss", // optional - defaults to parent object key.scss
    "import": [
      {
        "package": "foo@0.1.0", // semver optional
        "filepath": "path/in/repo/of/some.scss"
      },
      {
        "package": "bar", // no semver = references most recent version in jspm
        "filepath": "path/in/repo/of/some.scss"
      },
      {
        "local": true,
        "filepath": "path/to/local.scss"
      }
    ]
  }
  "sassfilename2": {
    "dir": ...
  }
}
```

## Usage

```
jspm-sass-mouth --config [your-config.json]
```
