import type { ConfigResultWithHooks, UserConfig, TSConfig as _TSConfig } from '@pandacss/types'
import { getBaseEngine, type PandaBaseEngine } from './base'
import { getJsxEngine, type PandaJsxEngine } from './jsx'
import { getPathEngine, type PandaPathEngine } from './path'
import { getPatternEngine, type PandaPatternEngine } from './pattern'

export const getEngine = (conf: ConfigResultWithHooks): Context => {
  const { config } = conf
  return {
    ...getBaseEngine(conf),
    patterns: getPatternEngine(config),
    jsx: getJsxEngine(config),
    paths: getPathEngine(config),
    file: getFileEngine(config),
  }
}

const getFileEngine = (config: UserConfig): PandaFileEngine => {
  const { forceConsistentTypeExtension, outExtension } = config

  return {
    ext(file: string) {
      return `${file}.${outExtension}`
    },
    extDts(file: string) {
      const dts = outExtension === 'mjs' && forceConsistentTypeExtension ? 'd.mts' : 'd.ts'
      return `${file}.${dts}`
    },
    __extDts(file: string) {
      return forceConsistentTypeExtension ? this.extDts(file) : file
    },
    import(mod: string, file: string) {
      return `import { ${mod} } from '${this.ext(file)}';`
    },
    importType(mod: string, file: string) {
      return `import type { ${mod} } from '${this.__extDts(file)}';`
    },
    exportType(mod: string, file: string) {
      return `export type { ${mod} } from '${this.__extDts(file)}';`
    },
    exportStar(file: string) {
      return `export * from '${this.ext(file)}';`
    },
    exportTypeStar(file: string) {
      return `export * from '${this.__extDts(file)}';`
    },
    isTypeFile(file: string) {
      return file.endsWith('.d.ts') || file.endsWith('.d.mts')
    },
  }
}

export interface PandaFileEngine {
  ext(file: string): string
  extDts(file: string): string
  __extDts(file: string): string
  import(mod: string, file: string): string
  importType(mod: string, file: string): string
  exportType(mod: string, file: string): string
  exportStar(file: string): string
  exportTypeStar(file: string): string
  isTypeFile(file: string): boolean
}

export interface Context extends PandaBaseEngine {
  patterns: PandaPatternEngine
  jsx: PandaJsxEngine
  paths: PandaPathEngine
  file: PandaFileEngine
}
