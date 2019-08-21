const { Task, api } = require('actionhero')

module.exports = class MyTask extends Task {
  constructor () {
    super()
    this.name = 'spawnTask'
    this.description = 'an actionhero task'
    this.frequency = 10
    this.queue = 'fast-queue'
    this.middleware = []
    this.limit = 50
  }

  async run (data) {
    let i = 0
    while (i < this.limit) {
      await api.tasks.enqueue('fastTask', {}, 'fast-queue')
      i++
    }
    return this.limit
  }
}
