var path    = require('path'),
    colors  = require('colors'),
    Promise = require('bluebird'),
    _       = require('lodash'),
    argv    = require('minimist')(process.argv.slice(2)),
    getdir  = require('jspm-getdir');

// Promisify FS
var fs = Promise.promisifyAll(require('fs'));

// Constants
const __CONFILE = _config();
const __BASEDIR = process.cwd();
const __JSPMDIR = path.resolve(__BASEDIR, 'jspm_packages');

// Get the configuration file
function _config() {
  return (argv.config && argv.config.length) ? argv.config : 'sass-mouth.json';
};

// Check for config and return a parsed json object.
function _run() {
  var filedir = path.join(__BASEDIR, __CONFILE);

  // Open the config file and parse the contents.
  fs.readFileAsync(filedir, "utf8")
  .then(function(content) {
    content = JSON.parse(content);

    // Loop through output files.
    _.forIn(content, function(value, key) {
      if (!value.import || !value.import.length) {
        console.log(colors.red(
          "You must define an " +
          colors.red.bold("import") +
          " array for " +
          colors.red.bold(key) +
          "!"));
        process.abort();
      } else {
        var outputFile = _get_output(value, key);
        fs.writeFileSync(outputFile, '');

        var outputStr = '';
        _(value.import).forEach(function(item) {
          var uptodate_dir;

          if (item.local == true) {
            uptodate_dir = __BASEDIR;
          } else {
            uptodate_dir = getdir(item.package);
          }

          outputStr = outputStr.concat(_get_import_statement(uptodate_dir, item.filepath));
        }).value();

        _write_file(outputStr, outputFile);

        console.log(colors.green("JSPM-Sass-Mouth: ") + "Succesfully generated scss file - " + colors.bold(outputFile));
      }
    });
  })
  .catch(function(err) {
    console.log(err);
    console.log(colors.red("Error encountered while parsing config file " + colors.red.bold(filedir) + "!"));
    process.abort();
  });
};

// Returns the full-path of a .scss output file.
function _get_output(item, key) {
  var output_dir  = (!item.dir) ? "./" : item.dir,
      output_file = (!item.output) ? key + ".scss" : item.output;

  return path.join(output_dir, output_file);
};

function _get_import_statement(directory, filepath){
    var joined = path.join(directory, filepath);
    return '@import "' + joined + '";\n';
}

// Write Import
function _write_file(outputStr, outputFile) {
  fs.appendFile(outputFile, outputStr, 'utf8', function (err) {
    if (err) {
      console.log(err);
      console.log(colors.red("Unable to create scss file " + colors.red.bold(output) + "!"));
      process.abort();
    }
  });
}

// Run this junk.
exports.run = function () {
  _run();
};
