const {
  app,
  Tray,
  Menu
} = require('electron')
const path = require('path')
const fs = require('fs')
const got = require('got')
const wallpaper = require('wallpaper')
const Deskly = require('deskly-cli')
const Configstore = require('configstore')
const pkg = require('./package.json')

const conf = new Configstore(pkg.name, {
  subreddits: ['earthporn', 'wallpaper', 'wallpapers'],
  sort: 'hot',
  limit: 50
})

let d = new Deskly()
let dir = path.join(__dirname, 'generated/')

if (app.dock)
  app.dock.hide()

app.on('ready', () => {
  var tray = new Tray(path.join(__dirname, 'assets/iconTemplate.png'))
  var menu = Menu.buildFromTemplate([{
      label: 'Generate Desktop Image',
      click: () => {
        let def = conf.all
        let promise = d.getPosts(def.sort, def.limit, d.getRandomSubreddit(def.subreddits))
          .catch(error => {
            console.log('-') // TODO: Error handling
          })

        d.getPost(promise)
          .then(post => {
            let p = dir + post.id + '.jpg'

            if (!fs.existsSync(dir)) fs.mkdirSync(dir)
            got.stream(post.url)
              .pipe(fs.createWriteStream(p))
              .on('finish', () => {
                wallpaper.set(p)
              })
          })
      }
    },
    {
      label: 'Copy Desktop Image Path',
      visible: false,
      click: () => {

      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Preferences...',
      accelerator: 'CmdOrCtrl+,',
      visible: false,
      click: () => {

      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      selector: 'terminate:'
    }
  ])

  tray.setContextMenu(menu)
})
