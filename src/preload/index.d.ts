import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      showContextMenu: (params?: any) => void
      onContextMenuAction: (callback: (action: string, params: any) => void) => void
      saveMarkdownClip: (markdown: string) => Promise<{ ok: boolean; path?: string; error?: string }>
    }
  }
}
