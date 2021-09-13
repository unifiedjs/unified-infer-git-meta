/**
 * @callback Format
 * @param {string[]} authors
 * @returns {string}
 *
 * @typedef Options
 * @property {string|string[]} [locales='en']
 *   Locale(s) to use to join authors and sort their names.
 * @property {number} [limit=3]
 *   Maximum number of authors to include.
 *   Set to `-1` to not limit authors.
 * @property {string} [authorRest='others']
 *   Text to use to label more authors when abbreviating.
 * @property {Format} [format]
 *   Alternative format function to use.
 *   Is given a list of abbreviated author names.
 *   If the authors had to be abbreviated, the last author is instead replaced
 *   by `authorRest`.
 *   Set `limit: -1` to receive all author names.
 */

import {exec} from 'node:child_process'
import {promisify} from 'node:util'
import {csvParse} from 'd3-dsv'

const own = {}.hasOwnProperty

/**
 * Plugin to infer some `meta` from Git.
 *
 * This plugin sets `file.data.meta.published` to the date a file was first
 * committed, `file.data.meta.modified` to the date a file was last committed,
 * and `file.data.meta.author` to an abbreviated list of top authors of the
 * file.
 *
 * @type {import('unified').Plugin<[Options?]|[]>}
 */
export default function unifiedInferGitMeta(options = {}) {
  const locales = options.locales || 'en'
  const limit = options.limit || 3
  const rest = options.authorRest || 'others'
  const collator = new Intl.Collator(locales)
  /** @type {{format(items: string[]): string}} */
  // @ts-expect-error: TS doesn’t know about `ListFormat` yet.
  const listFormat = new Intl.ListFormat(locales)

  // eslint-disable-next-line complexity
  return async (_, file) => {
    const {stdout} = await promisify(exec)(
      'git log --all --follow --format="%aN,%aE,\\"%cD\\"" "' + file.path + '"',
      {cwd: file.cwd}
    )

    const commits = [
      ...csvParse('name,email,date\n' + stdout, (d) => ({
        // Git should yield clean data, but just to be sure.
        /* c8 ignore next 3 */
        date: new Date(d.date || ''),
        name: d.name || '',
        email: d.email || ''
      }))
    ]

    /** @type {Record<string, {name: string, commits: number}>} */
    const byEmail = {}
    let index = -1
    let published = new Date()
    let modified = new Date()

    while (++index < commits.length) {
      const commit = commits[index]
      const current = (byEmail[commit.email] || {}).commits || 0

      if (index === 0) modified = commit.date
      if (index === commits.length - 1) published = commit.date

      byEmail[commit.email] = {name: commit.name, commits: current + 1}
    }

    /** @type {Array<{email: string, name: string, commits: number}>} */
    const sortedCommits = []
    /** @type {string} */
    let email

    for (email in byEmail) {
      if (own.call(byEmail, email)) {
        sortedCommits.push({email, ...byEmail[email]})
      }
    }

    const sortedAuthors = sortedCommits
      .sort((a, b) => b.commits - a.commits || collator.compare(a.name, b.name))
      .map((d) => d.name)
    const abbreviatedAuthors =
      limit > -1 && sortedAuthors.length > limit
        ? limit === 1
          ? [sortedAuthors[0]]
          : [...sortedAuthors.slice(0, limit - 1), rest]
        : sortedAuthors

    /** @type {string|undefined} */
    const author =
      (options.format
        ? options.format(abbreviatedAuthors)
        : listFormat.format(abbreviatedAuthors)) || undefined

    const matter = /** @type {Record<string, unknown>} */ (
      file.data.matter || {}
    )
    const meta = /** @type {Record<string, unknown>} */ (
      file.data.meta || (file.data.meta = {})
    )
    if (!matter.published && !meta.published) meta.published = published
    if (!matter.modified && !meta.modified) meta.modified = modified
    if (author && !matter.author && !meta.author) meta.author = author
  }
}
