const pre = document.getElementById('log')
const anchor = document.getElementById('link')

function log(msg) {
  pre.innerText += msg + '\n'
}

anchor.addEventListener('click', () => {
  log('Downloading...')
})

navigator.serviceWorker
  .register('/service-worker.js')
  .then(async reg => {
    reg = await reg.update()

    if (reg.waiting) {
      reg.waiting.postMessage('skipWaiting')
    }

    if (reg.installing) {
      const sw = reg.installing

      sw.onstatechange = () => {
        sw.postMessage('skipWaiting')
      }
    }

    log('SW registered, download link is ready')
  })
  .catch(e => {
    console.error('failed to register service worker', e)
    log('SW failed to register')
  })
