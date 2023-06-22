self.addEventListener('install', () => {
  console.debug('installed')
})

self.addEventListener('activate', () => {
  console.debug('activated')
  return self.clients.claim()
})

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  console.debug('fetch url', url.href)

  if (url.pathname.startsWith('/sw/download')) {
    e.respondWith(responseForDownload())
  }
})

function responseForDownload() {
  let count = 0
  const maxCount = 10
  const encoder = new TextEncoder()
  const contents = encoder.encode(
    'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?\n\n'
  )

  const totalByteLength = maxCount * contents.byteLength

  const stream = new ReadableStream({
    start(controller) {
      function write() {
        if (count < maxCount) {
          count += 1
          console.debug(`Writing lorem ipsum to the ReadableStream; loop: ${count}`)
          controller.enqueue(Uint8Array.from(contents))
          setTimeout(() => write(), 500)
        } else {
          controller.close()
        }
      }

      write()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': `${totalByteLength}`,
      'Content-Disposition': `attachment; filename="demo-${new Date().getTime()}.txt"`
    }
  })
}
