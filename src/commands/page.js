import * as afs from 'async-file'
import prompt from 'prompt'
import getFronthackPath from '../helpers/getFronthackPath'
import regex from '../helpers/regex'
import generateReactComponent from '../helpers/generateReactComponent'
import userInput from '../helpers/userInput'


export default async (projectRoot, isReact, isNext, name) => {
  try {
    if (!name) {
      prompt.start()
      const { namePrompt } = await userInput({
        name: 'namePrompt',
        description: 'Name of new page (ex. contact, articles, about )',
        type: 'string',
        pattern: isReact ? regex.pascalCase : regex.kebabCase,
        message: `Name must be in ${isReact ? 'PascalCase' : 'kebab-case'}.`,
        required: true,
      })
      name = namePrompt
    }

    if (isReact) {
      if (!isNext) {
        generateReactComponent(projectRoot, isNext, 'page', name)
      } else {
        console.log('Nothing happened! In NextJS please add new pages that manually, by creating a file in "/pages" directory.')
      }
    } else {
      const fronthackPath = await getFronthackPath()
      const content = await afs.readFile(`${fronthackPath}/templates/page.html`, 'utf8')
      await afs.writeFile(`${projectRoot}/src/${name}.html`, content)
      console.log('Done!')
    }
  } catch (err) {
    throw new Error(err)
  }
}