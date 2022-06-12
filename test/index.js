/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('../index.js').Options} Options
 */

import cp from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import {promisify} from 'node:util'
import test from 'tape'
import semver from 'semver'
import rimraf from 'rimraf'
import {nanoid} from 'nanoid'
import {toVFile, write} from 'to-vfile'
import {unified} from 'unified'
import unifiedInferGitMeta from '../index.js'

const exec = promisify(cp.exec)

const current = process.cwd()

const localeAware = semver.gte(process.versions.node, '14.0.0')

process.chdir(path.join(current, 'test'))

process.on('exit', () => {
  process.chdir(path.join(current))
  clean()
})

test('unifiedInferGitMeta', async (t) => {
  clean()

  await exec('git init')

  // Alpha commits once on `a` and twice on `b`.
  await exec('git config user.email alpha@example.com')
  await exec('git config user.name Alpha')
  await write({path: 'example-a.txt', value: String(nanoid())})
  await write({path: 'example-b.txt', value: String(nanoid())})
  await exec('git add *.txt')
  await exec('git commit -m one')
  await write({path: 'example-b.txt', value: String(nanoid())})
  await exec('git add *.txt')
  await exec('git commit -m two')
  await sleep(400)

  // Bravo commits once on `a`, `b`, and `c`.
  await exec('git config user.email bravo@example.com')
  await exec('git config user.name Bravo')
  await write({path: 'example-a.txt', value: String(nanoid())})
  await write({path: 'example-b.txt', value: String(nanoid())})
  await write({path: 'example-c.txt', value: String(nanoid())})
  await exec('git add *.txt')
  await exec('git commit -m three')
  await sleep(400)

  // Charlie commits once on `a`, `b`, and `c`.
  await exec('git config user.email charlie@example.com')
  await exec('git config user.name Charlie')
  await write({path: 'example-a.txt', value: String(nanoid())})
  await write({path: 'example-b.txt', value: String(nanoid())})
  await write({path: 'example-c.txt', value: String(nanoid())})
  await exec('git add *.txt')
  await exec('git commit -m four')
  await sleep(400)

  // Delta commits once on `a`.
  await exec('git config user.email delta@example.com')
  await exec('git config user.name Delta')
  await write({path: 'example-a.txt', value: String(nanoid())})
  await exec('git add *.txt')
  await exec('git commit -m five')
  await sleep(400)

  // An uncommited file
  await write({path: 'example-d.txt', value: String(nanoid())})

  // Test
  const a = await run('example-a.txt')
  const b = await run('example-b.txt')
  const c = await run('example-c.txt')
  const d = await run('example-d.txt')

  t.equal(
    a.author,
    'Alpha, Bravo, and others',
    '`author`: should abbreviate authors if there are many'
  )
  t.ok(a.published instanceof Date, '`published`: should be a date')
  t.ok(a.modified instanceof Date, '`modified`: should be a date')
  t.ok(
    Number(a.modified) > Number(a.published),
    '`modified`: should be later than `published`'
  )
  t.equal(
    a.author,
    'Alpha, Bravo, and others',
    '`author`: should abbreviate authors if there are multiple'
  )
  t.equal(
    b.author,
    'Alpha, Bravo, and Charlie',
    '`author`: should not abbreviate authors if there are exactly as many as `maxAuthors` (default: 3)'
  )
  t.equal(
    c.author,
    'Bravo and Charlie',
    '`author`: should not abbreviate authors if there are less than `maxAuthors`'
  )
  t.equal(
    d.author,
    undefined,
    '`author`: should be undefined if the file is not commited'
  )
  t.equal(
    Number(d.modified),
    Number(d.published),
    '`modified`, `published`: should be equal and set to `now` if the file is not comitted'
  )

  let {author} = await run('example-a.txt', {locales: 'en-GB'})
  t.equal(
    author,
    // Note: no oxford comma.
    localeAware ? 'Alpha, Bravo and others' : 'Alpha, Bravo, and others',
    '`author`: should support `locales`'
  )

  // .
  ;({author} = await run('example-a.txt', {
    locales: 'ru',
    authorRest: 'другие'
  }))

  t.equal(
    author,
    localeAware ? 'Alpha, Bravo и другие' : 'Alpha, Bravo, and другие',
    '`author`: should support `authorRest`'
  )

  // .
  ;({author} = await run('example-a.txt', {limit: -1}))

  t.equal(
    author,
    'Alpha, Bravo, Charlie, and Delta',
    '`author`: should not abbreviate with `limit: -1`'
  )

  // .
  ;({author} = await run('example-a.txt', {limit: 2}))

  t.equal(
    author,
    'Alpha and others',
    '`author`: should abbreviate with `limit: 2`'
  )

  // .
  ;({author} = await run('example-a.txt', {limit: 1}))

  t.equal(author, 'Alpha', '`author`: should abbreviate with `limit: 1`')

  // .
  ;({author} = await run('example-a.txt', {
    format(authors) {
      return authors.join('|')
    }
  }))

  t.equal(author, 'Alpha|Bravo|others', '`author`: should support `format`')
})

/**
 * @param {string} path
 * @param {Options} [options]
 * @returns {Promise<Record<string, unknown>>}
 */
async function run(path, options) {
  /** @type {Root} */
  const root = {type: 'root', children: []}
  const file = toVFile({path})
  await unified().use(unifiedInferGitMeta, options).run(root, file)
  const meta = /** @type {Record<string, unknown>} */ (
    file.data.meta || (file.data.meta = {})
  )
  return meta
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function clean() {
  rimraf.sync(path.join('test', '.git'))
  rimraf.sync(path.join('test', 'example-a.txt'))
  rimraf.sync(path.join('test', 'example-b.txt'))
  rimraf.sync(path.join('test', 'example-c.txt'))
  rimraf.sync(path.join('test', 'example-d.txt'))
}
