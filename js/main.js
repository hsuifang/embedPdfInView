const url = '../docs/sample.pdf'

let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null

const scale = 1.5,
  canvas = document.querySelector('#pdf-render'),
  ctx = canvas.getContext('2d')

// Render the page
const renderPage = (num) => {
  pageIsRendering = true

  // Get page
  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale })
    canvas.height = viewport.height
    canvas.width = viewport.width

    const renderCtx = {
      canvasContext: ctx,
      viewport,
    }

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending)
        pageNumIsPending = null
      }
    })

    // output current page number
    document.querySelector('#page-num').textContent = num
  })
}
// check for pages rendering
const queueRenderPage = (num) => {
  if (pageIsRendering) {
    pageNumIsPending = num
  } else {
    renderPage(num)
  }
}

// show Prev page
const showPrevPage = () => {
  if (pageNum <= 1) {
    return
  } else {
    pageNum--
    queueRenderPage(pageNum)
  }
}

const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return
  } else {
    pageNum++
    queueRenderPage(pageNum)
  }
}

// Get Document
pdfjsLib
  .getDocument(url)
  .promise.then((pdfDoc_) => {
    pdfDoc = pdfDoc_
    document.querySelector('#page-count').textContent = pdfDoc.numPages
    renderPage(pageNum)
  })
  .catch((e) => {
    console.log(e)
    // Display error
    const div = document.createElement('div')
    div.className = 'error'
    div.appendChild(document.createTextNode(e.message))
    document.querySelector('body').insertBefore(div, canvas)
    //Remove top bar
    document.querySelector('.top-bar').style.display = 'none'
  })

// Button Event
document.querySelector('#prev-page').addEventListener('click', showPrevPage)
document.querySelector('#next-page').addEventListener('click', showNextPage)
