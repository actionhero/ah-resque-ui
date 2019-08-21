const { Task } = require('actionhero')

const sleep = (time = 5000) => {
  return new Promise((resolve) => { setTimeout(resolve, time) })
}

module.exports = class MyTask extends Task {
  constructor () {
    super()
    this.name = 'fastTask'
    this.description = 'an actionhero task'
    this.frequency = 10
    this.queue = 'fast-queue'
    this.middleware = []
  }

  async run (data) {
    await sleep(100)
    return new Date().getTime()
  }
}
