var path    = require('path'),
    colors  = require('colors'),
    Promise = require('bluebird'),
    _       = require('lodash'),
    argv    = require('minimist')(process.argv.slice(2));

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
      var output = _get_output(value, key);

      fs.writeFileSync(output, '');

      if (!value.import || !value.import.length) {
        console.log(colors.red(
          "You must define an " +
          colors.red.bold("import") +
          " array for " +
          colors.red.bold(key) +
          "!"));
        process.abort();
      } else {
        _(value.import).forEach(function(item) {
          var uptodate_dir;

          if (item.local == true) {
            uptodate_dir = __BASEDIR;
          } else if (item.package.split('@')[1]) {
            uptodate_dir = path.join(__JSPMDIR, item.package.replace(':', '/'));
          } else {
            uptodate_dir = _mcur_dir(item.package);
          }

          _write_sass(uptodate_dir, item.filepath, output);
        }).value();

        console.log(colors.green("JSPM-Sass-Mouth: ") + "Succesfully generated scss file - " + colors.bold(output));
      }
    });
  })
  .catch(function(err) {
    console.log(err);
    console.log(colors.red("Unable to open configuration file " + colors.red.bold(filedir) + "!"));
    process.abort();
  });
};

// Read through jspm_packages and return the highest version of a package
function _mcur_dir(pkg) {
  var semver    = [],
      pkg_name  = _.last(pkg.split('/')),
      pkg_root  = path.join(__JSPMDIR, pkg.split(':')[0], pkg.split(':')[1].split('/')[0]),
      pkg_path  = path.join(pkg_root, pkg_name),
      dir_names = fs.readdirSync(pkg_root);

  _(dir_names).forEach(function(dir) {
    var stat_path = path.join(pkg_root, dir),
        stat_info = fs.lstatSync(stat_path);

    if (stat_info.isDirectory() && dir[0] !== '.') {
      var c_ver  = stat_path.split('@')[1],
          c_name = _.last(stat_path.split('@')[0].split('/'));

      if (c_name == pkg_name) {
        semver.push(c_ver);
      }
    }
  }).value();

  return pkg_path + '@' + _.last(_.sortBy(semver));
}

// Returns the full-path of a .scss output file.
function _get_output(item, key) {
  var output_dir  = (!item.dir) ? "./" : item.dir,
      output_file = (!item.output) ? key + ".scss" : item.output;

  return path.join(output_dir, output_file);
};

// Write Import
function _write_sass(directory, filepath, output) {
  var joined = path.join(directory, filepath),
      string = '@import "' + joined + '";\n';

  fs.appendFile(output, string, 'utf8', function (err) {
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
