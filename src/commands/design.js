import * as afs from 'async-file'
import fs from 'fs-extra'
import prompt from 'prompt'
import sizeOf from 'image-size'
import userInput from '../helpers/userInput'
import output from '../helpers/output'


export default async (projectRoot, config) => {
  try {
    // Load list of avaliable html pages and prepare prompt data.
    const projectSrc = `${projectRoot}${config.src}`
    const pageFiles = await afs.readdir(projectSrc)
    let html = {
      files: pageFiles.filter(n =>
        n.includes('.html') || n.includes('.md') || n.includes('.markdown')
      ),
      description: 'For which page you would like attach design to?\n',
      patternArray: [],
    }
    html.files.map((file, i) => {
      html.description = `${html.description}${i}: ${file}\n`
      html.patternArray.push(i)
    })
    html.pattern = new RegExp(html.patternArray.join('|'))
    html.description = `${html.description}Select number from the list above`

    // Load list of avaliable design files
    const designFiles = await afs.readdir(`${projectSrc}/designs`)
    let design = {
      files: designFiles.filter((n) => n.endsWith('.jpg') || n.endsWith('.jpeg') || n.endsWith('.png')),
      description: 'Which design you would like to apply to this page?\n',
      patternArray: [],
    }
    design.files.map((file, i) => {
      design.description = `${design.description}${i}: ${file}\n`
      design.patternArray.push(i)
    })
    design.pattern = new RegExp(design.patternArray.join('|'))
    design.description = `${design.description}Select number from the list above`

    // Collect variables.
    prompt.start()
    const { htmlIndex, designIndex } = await userInput([
      {
        name: 'htmlIndex',
        description: html.description,
        type: 'string',
        pattern: html.pattern,
        message: 'It must be a number from the list',
        required: true,
      },
      {
        name: 'designIndex',
        description: design.description,
        type: 'string',
        pattern: design.pattern,
        message: 'It must be a number from the list',
        required: true,
      },
    ])
    const selectedHtml = html.files[htmlIndex]
    const selectedHtmlName = selectedHtml.replace(/\.[^/.]+$/, "")
    const selectedDesign = design.files[designIndex]

    // Apply new design as a background CSS property
    const path = `${projectSrc}/designs/connect-designs.css`
    await fs.ensureFileSync(path)
    const data = await afs.readFile(path, 'utf8')
    let dimensions = sizeOf(`${projectSrc}/designs/${selectedDesign}`)

    // If width is bigger than 2000px, that means that it is doublesize.
    if (dimensions.width >= 2000) {
      dimensions.width = dimensions.width / 2
    }
    const newData = `${data}.show-designs .designs--${selectedHtmlName}, .show-code-designs .designs--${selectedHtmlName} { background-image: url('../designs/${selectedDesign}'); width: ${dimensions.width}px; margin: 0 ${dimensions.width / -2}px; }\n`
    await afs.writeFile(path, newData)

    // Display output.
    output(`Done! ${selectedDesign} attached to ${selectedHtml} page.`)
  } catch (err) {
    throw new Error(err)
  }
}