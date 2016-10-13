'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

var _assign = require('lodash/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 参考 https://www.npmjs.com/package/webpack-manifest-plugin 实现
 * 原来的实现，对于 extract-text-webpack-plugin 定义的文件有点问题，改进了一下
 */
var MappingPlugin = function () {
  function MappingPlugin() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, MappingPlugin);

    var defaultOpts = {
      basePath: '',
      fileName: 'mapping.json',
      stripSrc: null,
      transformExtensions: /^(gz|map)$/i,
      cache: null
    };

    this.opts = (0, _assign2.default)({}, defaultOpts, opts);
  }

  _createClass(MappingPlugin, [{
    key: 'getFileType',
    value: function getFileType(str) {
      var _str = str.replace(/\?.*/, '');
      var split = _str.split('.');
      var ext = split.pop();
      if (this.opts.transformExtensions.test(ext)) {
        ext = split.pop() + '.' + ext;
      }
      return ext;
    }
  }, {
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      var outputName = this.opts.fileName;
      var cache = this.opts.cache || {};
      var moduleAssets = {};

      compiler.plugin('compilation', function (compilation) {
        compilation.plugin('module-asset', function (module, file) {
          moduleAssets[file] = _path2.default.join(_path2.default.dirname(file), _path2.default.basename(module.userRequest));
        });
      });

      compiler.plugin('emit', function (compilation, compileCallback) {
        var stats = compilation.getStats().toJson();
        var manifest = {};

        (0, _merge2.default)(cache, compilation.chunks.reduce(function (memo, chunk) {
          var chunkName = chunk.name ? chunk.name.replace(_this.opts.stripSrc, '') : null;
          // Map original chunk name to output files.
          // For nameless chunks, just map the files directly.
          /*eslint-disable prefer-template*/
          return chunk.files.reduce(function (memo, file) {
            var fileType = _this.getFileType(file);
            if (memo[chunkName + '.' + fileType]) {
              var fileName = file;
              fileName = fileName.split('/');
              fileName = fileName[fileName.length - 1]; //取最后一个
              fileName = fileName.replace(fileType, '').replace(chunk.renderedHash, '');
              fileName = fileName.replace(/\.+$/, '');
              memo[fileName + '.' + fileType] = file;
            } else if (chunkName) {
              memo[chunkName + '.' + fileType] = file;
            } else {
              memo[file] = file;
            }
            return memo;
          }, memo);
        }, {}));

        // module assets don't show up in assetsByChunkName.
        // we're getting them this way;
        (0, _merge2.default)(cache, stats.assets.reduce(function (memo, asset) {
          var name = moduleAssets[asset.name];
          if (name) {
            memo[name] = asset.name;
          }
          return memo;
        }, {}));

        // Append optional basepath onto all references.
        // This allows output path to be reflected in the manifest.
        if (_this.opts.basePath) {
          cache = (0, _reduce2.default)(cache, function (memo, value, key) {
            memo[_this.opts.basePath + key] = _this.opts.basePath + value;
            return memo;
          }, {});
        }

        Object.keys(cache).sort().forEach(function (key) {
          manifest[key] = cache[key];
        });

        var json = JSON.stringify(manifest, null, 2);

        compilation.assets[outputName] = {
          source: function source() {
            return json;
          },
          size: function size() {
            return json.length;
          }
        };

        compileCallback();
      });
    }
  }]);

  return MappingPlugin;
}();

exports.default = MappingPlugin;