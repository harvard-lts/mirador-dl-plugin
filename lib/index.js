'use strict';

exports.__esModule = true;
exports.MiradorDownloadDialogPlugin = exports.miradorDownloadPlugin = undefined;

var _miradorDownloadPlugin = require('./miradorDownloadPlugin');

var _miradorDownloadPlugin2 = _interopRequireDefault(_miradorDownloadPlugin);

var _MiradorDownloadDialog = require('./MiradorDownloadDialog');

var _MiradorDownloadDialog2 = _interopRequireDefault(_MiradorDownloadDialog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.miradorDownloadPlugin = _miradorDownloadPlugin2.default;
exports.MiradorDownloadDialogPlugin = _MiradorDownloadDialog2.default;
exports.default = [_miradorDownloadPlugin2.default, _MiradorDownloadDialog2.default];