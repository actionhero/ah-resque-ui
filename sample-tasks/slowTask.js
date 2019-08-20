const { Task } = require('actionhero')

const sleep = (time = 5000) => {
  return new Promise((resolve) => { setTimeout(resolve, time) })
}

module.exports = class MyTask extends Task {
  constructor () {
    super()
    this.name = 'slowTask'
    this.description = 'an actionhero task'
    this.frequency = 5000
    this.queue = 'default'
    this.middleware = []
  }

  async run (data) {
    await sleep(5000)
    return new Date().getTime()
  }
}
