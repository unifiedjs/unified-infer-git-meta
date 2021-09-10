# unified-infer-git-meta

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**unified**][unified] plugin to infer file metadata from Git.
This plugin sets `file.data.meta.{published,modified,author}`.
This is mostly useful with [`rehype-meta`][rehype-meta].

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install unified-infer-git-meta
```

## Use

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

main()

async function main() {
  const file = await unified()
    .use(remarkParse)
    .use(unifiedInferGitMeta)
    .use(remarkRehype)
    .use(rehypeDocument)
    .use(rehypeMeta, {
      // Published, modified are only added if these two are also defined:
      og: true,
      type: 'article'
    })
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(await read('readme.md'))

  console.log(file.data)
  console.log(String(file))
}
```

Now, running our module with `node example.js`, yields:

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

This package exports a plugin as the default export.

### `unified().use(unifiedInferGitMeta, options?)`

Plugin to infer some `meta` from Git.

This plugin sets [`file.data.meta.published`][meta-published] to the date a file
was first committed, [`file.data.meta.modified`][meta-modified] to the date a
file was last committed, and [`file.data.meta.author`][meta-author] to an
abbreviated list of top authors of the file.

###### `options.locales`

Locale(s) to use to join authors and sort their names (`string` or `string[]`,
default: `'en'`).

###### `options.limit`

Maximum number of authors to include (`number`, default: `3`).
Set to `-1` to not limit authors.

###### `options.authorRest`

Text to use to label more authors when abbreviating (`string`, default:
`'others'`).

###### `options.format`

Alternative format function to use (`(authors: string[]) => string`).
Is given a list of abbreviated author names.
If the list of authors had to be abbreviated, the last author is instead
replaced by `authorRest`.
Set `limit: -1` to receive all author names.

## Related

*   [`rehype-meta`](https://github.com/rehypejs/rehype-meta)
    — Add metadata to the head of a document
*   [`rehype-infer-title-meta`](https://github.com/rehypejs/rehype-infer-title-meta)
    — Infer file metadata from the title of a document
*   [`rehype-infer-description-meta`](https://github.com/rehypejs/rehype-infer-description-meta)
    — Infer file metadata from the description of a document

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

[health]: https://github.com/unifiedjs/.github

[contributing]: https://github.com/unifiedjs/.github/blob/HEAD/contributing.md

[support]: https://github.com/unifiedjs/.github/blob/HEAD/support.md

[coc]: https://github.com/unifiedjs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[unified]: https://github.com/unifiedjs/unified

[rehype-meta]: https://github.com/rehypejs/rehype-meta

[meta-published]: https://github.com/rehypejs/rehype-meta#configpublished

[meta-modified]: https://github.com/rehypejs/rehype-meta#configmodified

[meta-author]: https://github.com/rehypejs/rehype-meta#configauthor
