# mirador-dl-plugin

[![Node Unit Tests](https://github.com/harvard-lts/mirador-dl-plugin/actions/workflows/coverage-node.yml/badge.svg)](https://github.com/harvard-lts/mirador-dl-plugin/actions/workflows/coverage-node.yml)

<a href="https://github.com/harvard-lts/mirador-dl-plugin/actions/workflows/coverage-node.yml"><img src="https://github.com/harvard-lts/mirador-dl-plugin/raw/badges/test-coverage/coverage.svg"></a>

[![npm package][npm-badge]][npm]

`mirador-dl-plugin` is a Mirador plugin that adds manifest-provided download links (e.g. `rendering`) to the window options menu. A [live demo](https://mirador-download-plugin.netlify.app/) with several institutions' manifests is available for testing.

## Compatibility

This plugin is **Mirador 4-compatible** (React 18/19, MUI 7 + Emotion). It is **not** backwards compatible with Mirador 3 — the upgrade contains breaking changes (top-level `mirador` imports, function/hook components instead of class components, and MUI 7 + Emotion in place of Material-UI v4).

Pin precisely by version convention:

- **Mirador 4** releases are tagged `2.x`.
- **Mirador 3** releases are tagged `0.x` / `1.x` — pin one of these if you still need Mirador 3.

See [Creating a Mirador 4 Plugin](https://github.com/ProjectMirador/mirador/wiki/Creating-a-Mirador-4-Plugin) for details on the Mirador 4 plugin API.

![download option in menu](https://user-images.githubusercontent.com/5402927/87057974-5e665a80-c1bc-11ea-8f10-7b783bdc972f.png)

![mirador-download-options](https://user-images.githubusercontent.com/5402927/87057857-3d056e80-c1bc-11ea-8860-7662208c19fa.png)


[npm-badge]: https://img.shields.io/npm/v/mirador-dl-plugin.png?style=flat-square
[npm]: https://www.npmjs.org/package/mirador-dl-plugin

## Installation

`mirador-dl-plugin` requires an instance of Mirador 4. See the [Mirador wiki](https://github.com/ProjectMirador/mirador/wiki) for examples of embedding Mirador within an application and the [Creating a Mirador 4 Plugin](https://github.com/ProjectMirador/mirador/wiki/Creating-a-Mirador-4-Plugin) page for additional information about plugins. See [`demo/demoEntry.js`](demo/demoEntry.js) for an example of importing and configuring `mirador-dl-plugin`.

## Configuration

Configurations for this plugin are injected when Mirador is initialized under the `miradorDownloadPlugin` key.

```js
...
  id: 'mirador',
  miradorDownloadPlugin: {
    ...
  }
...
```

| Config Key | Type | Description |
| --- | --- | --- |
| `restrictDownloadOnSizeDefinition` | boolean (default: false) | If set to true the `Zoomed region` link will not be rendered if the image API returns a single size in the `sizes` section and the single size height/width is the same size or smaller than the reported height/width. |

## Contribute
Mirador's development, design, and maintenance is driven by community needs and ongoing feedback and discussion. Join us at our regularly scheduled community calls, on [IIIF slack #mirador](http://bit.ly/iiif-slack), or the [mirador-tech](https://groups.google.com/forum/#!forum/mirador-tech) and [iiif-discuss](https://groups.google.com/forum/#!forum/iiif-discuss) mailing lists. To suggest features, report bugs, and clarify usage, please submit a GitHub issue.
