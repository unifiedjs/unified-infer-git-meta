// Need a random export to turn this into a module?
export type Whatever = unknown

declare module 'vfile' {
  interface DataMap {
    meta: {
      /**
       * Date when this content was first published.
       *
       * Populated by `unified-infer-git-meta` from Git history.
       */
      published?: Date

      /**
       * Date when this content was last modified.
       *
       * Populated by `unified-infer-git-meta` from Git history.
       */
      modified?: Date

      /**
       * Authors who contributed to this content.
       *
       * Populated by `unified-infer-git-meta` from Git history.
       */
      author?: string
    }
  }
}
