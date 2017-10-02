const os = require('os')
const path = require('path')
const util = require('util')
const exec = require('child_process').exec

const doBash = async (commands) => {
  if (!Array.isArray(commands)) { commands = [commands] }
  const fullCommand = '/bin/bash -c \'' + commands.join(' && ') + '\''
  console.log('>> ' + fullCommand)
  return util.promisify(exec)(fullCommand)
}

exports.specHelper = class SpecHelper {
  constructor () {
    this.testDir = os.tmpdir() + '/ah-resque-ui'
    this.projectDir = path.normalize(path.join(__dirname, '..'))

    console.log(`using ${this.testDir}`)
  }

  async build () {
    let actionHeroVersion = require('./../package.json').peerDependencies.actionhero

    const commands = [
      'rm -rf ' + this.testDir,
      'mkdir -p ' + this.testDir,
      'cd ' + this.testDir + ' && npm install actionhero@' + actionHeroVersion,
      'cd ' + this.testDir + ' && ./node_modules/.bin/actionhero generate',
      'cd ' + this.testDir + ' && npm install',
      'rm -f ' + this.testDir + '/node_modules/ah-resque-ui',
      'ln -s ' + this.projectDir + ' ' + this.testDir + '/node_modules/ah-resque-ui',
      'cd ' + this.testDir + ' && npm run actionhero -- link --name ah-resque-ui'
    ]

    if (process.env.SKIP_BUILD !== 'true') {
      for (let i in commands) { await doBash(commands[i]) }
    }
  }

  async start () {
    const {Process} = require(this.testDir + '/node_modules/actionhero/index.js')
    this.actionhero = new Process()
    process.env.PROJECT_ROOT = this.testDir
    this.api = await this.actionhero.start()
    this.api.resque.multiWorker.options.minTaskProcessors = 1
    this.api.resque.multiWorker.options.maxTaskProcessors = 1
  }

  async stop () {
    this.api.resque.multiWorker.options.minTaskProcessors = 0
    this.api.resque.multiWorker.options.maxTaskProcessors = 0
    await this.actionhero.stop()
  }
}
