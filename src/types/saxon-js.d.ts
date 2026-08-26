declare module 'saxon-js' {
  interface SaxonTransformOptions {
    stylesheetText?: string
    stylesheetLocation?: string
    stylesheetFileName?: string
    sourceText?: string
    sourceLocation?: string
    sourceFileName?: string
    destination?: 'serialized' | 'document' | 'raw' | 'file' | 'replace'
    serializerParams?: Record<string, unknown>
    baseOutputURI?: string
  }

  interface SaxonResult {
    principalResult: string | Document | Node | unknown
    [key: string]: unknown
  }

  export function transform(options: SaxonTransformOptions, mode?: 'sync' | 'async'): SaxonResult
  export function getProcessorInfo(): unknown
  export function update(options: SaxonTransformOptions, mode?: 'sync' | 'async'): unknown
  export const XError: unknown
}
