import color from '@heroku-cli/color'
import {Command, flags} from '@heroku-cli/command'
import * as Heroku from '@heroku-cli/schema'
import {ux} from '@oclif/core'
import * as lodash from 'lodash'
import * as clipboardy from 'clipboardy'
const {exec} = require('child_process')
const {promisify} = require('util')
const execAsync = promisify(exec)

const getLocalNodeVersion = async () => {
  const {stdout} = await execAsync('node -v')
  return stdout
}

const getInstallMethod = () => {
  return 'brew'
}

const getInstallLocation = async () => {
  const {stdout} = await execAsync('which heroku')
  const formattedOutput = stdout.replace(/\n/g, '')
  return formattedOutput
}

const getLocalProxySettings = async (unmasked = false) => {
  const command = `httpsProxy=$(scutil --proxy | awk -F': ' '/HTTPSProxy/ {print $2}')

  # Check if HTTPSProxy has a value
  if [ -n "$httpsProxy" ]; then
    echo "$httpsProxy"
  else
    echo "no proxy set"
  fi`

  const {stdout} = await execAsync(command)
  const hasProxySet = !stdout.includes('no proxy set')

  if (unmasked) {
    return stdout
  }

  return hasProxySet ? 'xxxxx\n' : stdout
}

const getInstalledPLugins = async () => {
  const {stdout} = await execAsync('heroku plugins')
  return stdout
}

const getHerokuStatus = async () => {
  const {stdout} = await execAsync('heroku status')
  return stdout
}

export default class DoctorVitals extends Command {
  static description = 'list local user setup for debugging'
  static topic = 'doctor'

  static flags = {
    unmasked: flags.boolean({required: false}),
    'copy-results': flags.boolean({description: 'copies results to clipboard', required: false}),
    json: flags.boolean({description: 'display as json', required: false}),
  }

  async run() {
    const {flags} = await this.parse(DoctorVitals)
    const copyResults = flags['copy-results']
    const time = new Date()
    const dateChecked = time.toISOString().split('T')[0]
    const cliInstallMethod = getInstallMethod()
    const cliInstallLocation = await getInstallLocation()
    const os = this.config.platform
    const cliVersion = `v${this.config.version}`
    const nodeVersion = await getLocalNodeVersion()
    const networkConfig = {
      httpsProxy: await getLocalProxySettings(flags.unmasked),
    }
    const installedPlugins = await getInstalledPLugins()
    const herokuStatus = await getHerokuStatus()

    const isHerokuUp = true

    ux.styledHeader(`${color.heroku('Heroku CLI Doctor')} · ${color.cyan(`User Local Setup on ${dateChecked}`)}`)
    ux.log(`${color.cyan('CLI Install Method:')} ${cliInstallMethod}`)
    ux.log(`${color.cyan('CLI Install Location:')} ${cliInstallLocation}`)
    ux.log(`${color.cyan('OS:')} ${os}`)
    ux.log(`${color.cyan('Heroku CLI Version:')} ${cliVersion}`)
    ux.log(`${color.cyan('Node Version:')} ${nodeVersion}`)

    ux.log(`${color.cyan('Network Config')}`)
    ux.log(`HTTPSProxy: ${networkConfig.httpsProxy}`)

    ux.log(`${color.cyan('Installed Plugins')}`)
    ux.log(`${installedPlugins}`)

    ux.log(`${color.bold(color.heroku('Heroku Status'))}`)
    ux.log(`${color.bold(color.heroku('----------------------------------------'))}`)
    ux.log(isHerokuUp ? color.green(herokuStatus) : color.red(herokuStatus))

    if (copyResults) {
      // copy results to clipboard here
      clipboardy.default.writeSync(`${color.heroku('Heroku CLI Doctor')} · ${color.cyan(`User Local Setup on ${dateChecked}`)}`)
      clipboardy.default.writeSync(`${color.cyan('CLI Install Method:')} ${cliInstallMethod}`)
      clipboardy.default.writeSync(`${color.cyan('CLI Install Location:')} ${cliInstallLocation}`)
      clipboardy.default.writeSync(`${color.cyan('OS:')} ${os}`)
      clipboardy.default.writeSync(`${color.cyan('Heroku CLI Version:')} ${cliVersion}`)
      clipboardy.default.writeSync(`${color.cyan('Node Version:')} ${nodeVersion}`)
      clipboardy.default.writeSync(`${color.cyan('Network Config')}`)
      clipboardy.default.writeSync(`HTTPSProxy: ${networkConfig.httpsProxy}`)
      clipboardy.default.writeSync(`${color.cyan('Installed Plugins')}`)
      clipboardy.default.writeSync(`${installedPlugins}`)
      clipboardy.default.writeSync(`${color.bold(color.heroku('Heroku Status'))}`)
      clipboardy.default.writeSync(`${color.bold(color.heroku('----------------------------------------'))}`)
      clipboardy.default.writeSync(isHerokuUp ? color.green(herokuStatus) : color.red(herokuStatus))
    }
  }
}
