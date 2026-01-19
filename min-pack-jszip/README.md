# @min-pack/jszip

Latest [`JSZip`](https://github.com/Stuk/jszip/) bundled as ES module for Node.js/Browser usage

Edit:
- reduce dual-license to only `MIT`
- compile to single ES module .mjs file, target ES6
  - bundle pkg "pako@1.0"
  - drop pkg "readable-stream", this is node-specific, only for `generateNodeStream|nodeStream` API
  - drop pkg "lie", ES6 patch
  - drop pkg "setimmediate", JS global patch
