const path = require('path')
const os = require('os')
const packageJSON = require(path.join(__dirname, '..', 'package.json'))
const { api, Action } = require('actionhero')

// A helper class

class RequeAction extends Action {
  constructor () {
    super()
    this.middleware = ['ah-resque-ui-proxy-middleware']
    this.logLevel = 'debug'
    this.toDocument = false
  }
}

// The actions

exports.ResuqePackageDetails = class ResuqePackageDetails extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:packageDetails'
    this.description = 'I return the resque package metadata'
    this.inputs = {}
  }

  async run ({ response }) {
    response.packageDetails = {}
    response.packageDetails.packageJSON = packageJSON
    response.packageDetails.redis = api.config.redis.tasks.args
  }
}

exports.ResuqeRedisInfo = class ResuqeRedisInfo extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:redisInfo'
    this.description = 'I return the results of redis info'
    this.inputs = {}
  }

  async run ({ response }) {
    const redisInfo = await api.resque.queue.connection.redis.info()
    if (redisInfo) { response.redisInfo = redisInfo.split(os.EOL) }
  }
}

exports.ResuqeResqueDetails = class ResuqeResqueDetails extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:resqueDetails'
    this.description = 'I return the results of api.tasks.details'
    this.inputs = {}
  }

  async run ({ response }) {
    response.resqueDetails = await api.tasks.details()
  }
}

exports.ResuqeLoadWorkerQueues = class ResuqeLoadWorkerQueues extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:loadWorkerQueues'
    this.description = 'I return the results of api.tasks.workers'
    this.inputs = {}
  }

  async run ({ response }) {
    response.workerQueues = await api.tasks.workers()
  }
}

exports.ResuqeForceCleanWorker = class ResuqeForceCleanWorker extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:forceCleanWorker'
    this.description = 'I remove a worker from resque'
    this.inputs = {
      workerName: { required: true }
    }
  }

  async run ({ params, response }) {
    response.generatedErrorPayload = await api.resque.queue.forceCleanWorker(params.workerName)
  }
}

exports.ResuqeFailedCount = class ResuqeFailedCount extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:resqueFailedCount'
    this.description = 'I return a count of failed jobs'
    this.inputs = {}
  }

  async run ({ response }) {
    response.failedCount = await api.tasks.failedCount()
  }
}

exports.ResuqeQueued = class ResuqeQueued extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:queued'
    this.description = 'I list enqueued jobs'
    this.inputs = {
      queue: {
        required: true
      },
      start: {
        required: true,
        formatter: function (p) { return parseInt(p) },
        default: 0
      },
      stop: {
        required: true,
        formatter: function (p) { return parseInt(p) },
        default: 99
      }
    }
  }

  async run ({ params, response }) {
    response.queueLength = await api.resque.queue.length(params.queue)
    response.jobs = await api.tasks.queued(params.queue, params.start, params.stop)
  }
}

exports.ResuqeDelQueue = class ResuqeDelQueue extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:delQueue'
    this.description = 'I delete a queue'
    this.inputs = {
      queue: { required: true }
    }
  }

  async run ({ response, params }) {
    response.deleted = await api.tasks.delQueue(params.queue)
  }
}

exports.ResuqeResqueFailed = class ResuqeResqueFailed extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:resqueFailed'
    this.description = 'I return failed jobs'
    this.inputs = {
      start: {
        required: true,
        formatter: function (p) { return parseInt(p) },
        default: 0
      },
      stop: {
        required: true,
        formatter: function (p) { return parseInt(p) },
        default: 99
      }
    }
  }

  async run ({ response, params }) {
    response.failed = await api.tasks.failed(params.start, params.stop)
  }
}

exports.ResuqeRemoveFailed = class ResuqeRemoveFailed extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:removeFailed'
    this.description = 'I remove a failed job'
    this.inputs = {
      id: {
        required: true,
        formatter: function (p) { return parseInt(p) }
      }
    }
  }

  async run ({ params }) {
    const failed = await api.tasks.failed(params.id, params.id)
    if (!failed) { throw Error('failed job not found') }
    await api.tasks.removeFailed(failed[0])
  }
}

exports.ResuqeRemoveAllFailed = class ResuqeRemoveAllFailed extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:removeAllFailed'
    this.description = 'I remove all failed jobs'
    this.inputs = {}
  }

  async run () {
    const failed = await api.tasks.failed(0, 0)
    if (failed && failed.length > 0) {
      const failedJob = failed[0]
      await api.tasks.removeFailed(failedJob)
      return this.run()
    }
  }
}

exports.ResuqeRetryAndRemoveFailed = class ResuqeRetryAndRemoveFailed extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:retryAndRemoveFailed'
    this.description = 'I retry a failed job'
    this.inputs = {
      id: {
        required: true,
        formatter: function (p) { return parseInt(p) }
      }
    }
  }

  async run ({ params }) {
    const failed = await api.tasks.failed(params.id, params.id)
    if (!failed) { throw new Error('failed job not found') }
    await api.tasks.retryAndRemoveFailed(failed[0])
  }
}

exports.ResuqeRetryAndRemoveAllFailed = class ResuqeRetryAndRemoveAllFailed extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:retryAndRemoveAllFailed'
    this.description = 'I retry all failed jobs'
    this.inputs = {}
  }

  async run () {
    const failed = await api.tasks.failed(0, 0)
    if (failed && failed.length > 0) {
      const failedJob = failed[0]
      await api.tasks.retryAndRemoveFailed(failedJob)
      return this.run()
    }
  }
}

exports.ResuqeLocks = class ResuqeLocks extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:locks'
    this.description = 'I return all locks'
    this.inputs = {}
  }

  async run ({ response }) {
    response.locks = await api.tasks.locks()
  }
}

exports.ResuqeDelLock = class ResuqeDelLock extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:delLock'
    this.description = 'I delte a lock'
    this.inputs = {
      lock: { required: true }
    }
  }

  async run ({ response, params }) {
    response.count = await api.tasks.delLock(params.lock)
  }
}

exports.ResuqeDelayedJobs = class ResuqeDelayedJobs extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:delayedjobs'
    this.description = 'I return paginated lists of delayedjobs'
    this.inputs = {
      start: {
        required: true,
        formatter: function (p) { return parseInt(p) },
        default: 0
      },
      stop: {
        required: true,
        formatter: function (p) { return parseInt(p) },
        default: 99
      }
    }
  }

  async run ({ response, params }) {
    const timestamps = []
    const delayedjobs = {}

    response.timestampsCount = 0
    const allTimestamps = await api.tasks.timestamps()
    if (allTimestamps.lenght === 0) { return }

    response.timestampsCount = allTimestamps.length

    for (let i = 0; i < allTimestamps.length; i++) {
      if (i >= params.start && i <= params.stop) { timestamps.push(allTimestamps[i]) }
    }

    for (const j in timestamps) {
      const timestamp = timestamps[j]
      delayedjobs[timestamp] = await api.tasks.delayedAt(timestamp)
    }

    response.delayedjobs = delayedjobs
  }
}

exports.ResuqeDelDelayed = class ResuqeDelDelayed extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:delDelayed'
    this.description = 'I delete a delayed job'
    this.inputs = {
      timestamp: {
        required: true,
        formatter: function (p) { return parseInt(p) }
      },
      count: {
        required: true,
        formatter: function (p) { return parseInt(p) }
      }
    }
  }

  async run ({ params, response }) {
    const delayed = await api.tasks.delayedAt(params.timestamp)
    if (delayed.tasks.length === 0 || !delayed.tasks[params.count]) { throw new Error('delayed job not found') }

    const job = delayed.tasks[params.count]
    response.timestamps = await api.tasks.delDelayed(job.queue, job.class, job.args)
  }
}

exports.ResuqeRunDelayed = class ResuqeRunDelayed extends RequeAction {
  constructor () {
    super()
    this.name = 'resque:runDelayed'
    this.description = 'I run a delayed job now'
    this.inputs = {
      timestamp: {
        required: true,
        formatter: function (p) { return parseInt(p) }
      },
      count: {
        required: true,
        formatter: function (p) { return parseInt(p) }
      }
    }
  }

  async run ({ params }) {
    const delayed = await api.tasks.delayedAt(params.timestamp)
    if (delayed.tasks.length === 0 || !delayed.tasks[params.count]) { throw new Error('delayed job not found') }

    const job = delayed.tasks[params.count]
    await api.tasks.delDelayed(job.queue, job.class, job.args)
    await api.tasks.enqueue(job.class, job.args, job.queue)
  }
}
