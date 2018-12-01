'use strict'
const fs = require('fs-extra')


/**
 * Adds new import to app.sass file
 * @argument {string} projectSrc path to the src directory of current project
 * @argument {string} type can be 'component' or 'global'
 * @argument {string} machinename unique name identifier of the component
 */
module.exports = (projectSrc, type, machinename, cb = () => null) => {
  fs.readFile(`${projectSrc}/sass/app.sass`, 'utf8', (err, data) => {
    if (err) throw err
    const newData = data.replace(`New ${type}s`, `New ${type}s\n@import "${type}s/${machinename}"`)
    fs.writeFile(`${projectSrc}/sass/app.sass`, newData, (err) => {
      if (err) throw err
      console.log('Import added to app.sass')
      cb()
    })
  })
}