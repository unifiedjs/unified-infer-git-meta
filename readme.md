# unified-infer-git-meta

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[unified][]** plugin to infer file metadata from Git of a document.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(unifiedInferGitMeta, options?)`](#unifieduseunifiedinfergitmeta-options)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [unified][] plugin to infer when content was first published,
last modified, and who contributed to it, from Git.

**unified** is a project that transforms content with abstract syntax trees
(ASTs).
**vfile** is the virtual file interface used in unified.
This is a unified plugin that extracts metadata from Git and exposes it on the
vfile.

## When should I use this?

This plugin is particularly useful in combination with
[`rehype-meta`][rehype-meta].
When both are used together, output such as the following is generated:

```html
<meta name="copyright" content="© 2019 Jane">
<meta name="author" content="Jane">
<!-- … -->
<meta property="article:published_time" content="2019-12-02T10:00:00.000Z">
<meta property="article:modified_time" content="2019-12-03T19:13:00.000Z">
```

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, or 18.0+), install with [npm][]:

```sh
npm install unified-infer-git-meta
```

In Deno with [`esm.sh`][esmsh]:

```js
import unifiedInferGitMeta from 'https://esm.sh/unified-infer-git-meta@1'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import unifiedInferGitMeta from 'https://esm.sh/unified-infer-git-meta@1?bundle'
</script>
```

## Use

Say our module `example.js` looks as follows:

```js
import {read} from 'to-vfile'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import unifiedInferGitMeta from 'unified-infer-git-meta'
import remarkRehype from 'remark-rehype'
import rehypeDocument from 'rehype-document'
import rehypeMeta from 'rehype-meta'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'

const file = await unified()
  .use(remarkParse)
  .use(unifiedInferGitMeta)
  .use(remarkRehype)
  .use(rehypeDocument)
  .use(rehypeMeta, {
    // Published and modified are only added if these two are also defined:
    og: true,
    type: 'article'
  })
  .use(rehypeFormat)
  .use(rehypeStringify)
  .process(await read('readme.md'))

console.log(file.data)
console.log(String(file))
```

…now running `node example.js` yields:

```js
{
  meta: {
    published: new Date('2021-09-09T11:12:34.000Z'),
    modified: new Date('2021-09-09T11:23:45.000Z'),
    author: 'Titus Wormer'
  }
}
```

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>readme</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="author" content="Titus Wormer">
    <meta property="og:type" content="article">
    <meta property="article:published_time" content="2021-09-09T11:12:34.000Z">
    <meta property="article:modified_time" content="2021-09-09T11:23:45.000Z">
  </head>
  …
```

## API

This package exports no identifiers.
The default export is `unifiedInferGitMeta`.

### `unified().use(unifiedInferGitMeta, options?)`

Infer some metadata from a document tracked with Git.
Infer some `meta` from Git.

This plugin sets [`file.data.meta.published`][meta-published] to the date a
file was first committed, [`file.data.meta.modified`][meta-modified] to the
date a file was last committed, and [`file.data.meta.author`][meta-author] to
an abbreviated list of top authors of the file.

##### `options`

Configuration (optional).

###### `options.locales`

Locale(s) to use to join authors and sort their names (`string` or
`Array<string>`, default: `'en'`).

###### `options.limit`

Maximum number of authors to include (`number`, default: `3`).
Set to `-1` to not limit authors.

###### `options.authorRest`

Text to use to label more authors when abbreviating (`string`, default:
`'others'`).

###### `options.format`

Alternative format function to use (`(authors: Array<string>) => string`).
Is given a list of abbreviated author names.
If the list of authors had to be abbreviated, the last author is instead
replaced by `authorRest`.
Set `limit: -1` to receive all author names.

## Types

This package is fully typed with [TypeScript][].
The additional types `Format` and `Options` are exported.

It also registers the `file.data.meta` fields with `vfile`.
If you’re working with the file, make sure to import this plugin somewhere in
your types, as that registers the new fields on the file.

```js
/**
 * @typedef {import('unified-infer-git-meta')}
 */

import {VFile} from 'vfile'

const file = new VFile()

console.log(file.data.meta.published) //=> TS now knows that this is a `Date?`.
```

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Related

*   [`rehype-meta`](https://github.com/rehypejs/rehype-meta)
    — add metadata to the head of a document
*   [`rehype-infer-title-meta`](https://github.com/rehypejs/rehype-infer-title-meta)
    — infer file metadata from the title of a document
*   [`rehype-infer-description-meta`](https://github.com/rehypejs/rehype-infer-description-meta)
    — infer file metadata from the description of a document
*   [`rehype-infer-reading-time-meta`](https://github.com/rehypejs/rehype-infer-reading-time-meta)
    — infer file metadata from the reading time of a document

## Contribute

See [`contributing.md`][contributing] in [`unifiedjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/unifiedjs/unified-infer-git-meta/workflows/main/badge.svg

[build]: https://github.com/unifiedjs/unified-infer-git-meta/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/unifiedjs/unified-infer-git-meta.svg

[coverage]: https://codecov.io/github/unifiedjs/unified-infer-git-meta

[downloads-badge]: https://img.shields.io/npm/dm/unified-infer-git-meta.svg

[downloads]: https://www.npmjs.com/package/unified-infer-git-meta

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/unifiedjs/unified/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[health]: https://github.com/unifiedjs/.github

[contributing]: https://github.com/unifiedjs/.github/blob/main/contributing.md

[support]: https://github.com/unifiedjs/.github/blob/main/support.md

[coc]: https://github.com/unifiedjs/.github/blob/main/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[unified]: https://github.com/unifiedjs/unified

[rehype-meta]: https://github.com/rehypejs/rehype-meta

[meta-published]: https://github.com/rehypejs/rehype-meta#configpublished

[meta-modified]: https://github.com/rehypejs/rehype-meta#configmodified

[meta-author]: https://github.com/rehypejs/rehype-meta#configauthor
