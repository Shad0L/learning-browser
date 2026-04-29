import { app, shell, BrowserWindow, ipcMain, Menu, session } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.shadol.learning-browser')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('show-context-menu', (event, params) => {
    const template = [
      { role: 'copy', label: 'Copy' },
      { role: 'paste', label: 'Paste' },
      { type: 'separator' },
      {
        label: 'Open in New Tab',
        click: () => {
          event.sender.send('context-menu-action', { action: 'open-in-new-tab', params })
        }
      },
      {
        label: 'Save Image',
        click: () => {
          event.sender.send('context-menu-action', { action: 'save-image', params })
        }
      }
    ]
    const menu = Menu.buildFromTemplate(template as any)
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender) || undefined })
  })

  let isAdblockerEnabled = false
  const AD_DOMAINS = [
    '*://*.doubleclick.net/*',
    '*://*.google-analytics.com/*',
    '*://*.googlesyndication.com/*',
    '*://*.facebook.com/tr*',
    '*://*.adnxs.com/*',
    '*://*.adsrvr.org/*',
    '*://*.scorecardresearch.com/*',
    '*://*.zedo.com/*',
    '*://*.adbrite.com/*',
    '*://*.bns.net/*',
    '*://*.exponential.com/*',
    '*://*.quantserve.com/*',
    '*://*.criteo.com/*',
    '*://*.taboola.com/*',
    '*://*.outbrain.com/*'
  ]

  ipcMain.on('toggle-adblocker', (_, enabled: boolean) => {
    isAdblockerEnabled = enabled
  })

  ipcMain.handle('get-adblocker-status', () => {
    return isAdblockerEnabled
  })

  session.defaultSession.webRequest.onBeforeRequest(
    { urls: AD_DOMAINS },
    (_details, callback) => {
      if (isAdblockerEnabled) {
        callback({ cancel: true })
      } else {
        callback({ cancel: false })
      }
    }
  )

  // Phase 2.3 Web Clipper IPC fallback: save markdown clip to local filesystem when available
  ipcMain.handle('save-markdown-clip', async (_event, markdown) => {
    try {
      const dir = join(app.getPath('userData'), 'clips')
      await fs.promises.mkdir(dir, { recursive: true })
      const file = join(dir, `clip-${Date.now()}.md`)
      await fs.promises.writeFile(file, markdown, 'utf8')
      return { ok: true, path: file }
    } catch (err) {
      return { ok: false, error: (err as Error)?.message ?? 'unknown' }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
