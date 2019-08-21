import React, { useState, useEffect } from 'react'
import Page from '../layouts/page'

function OverviewPage ({ client }) {
  const [data, setData] = useState({
    queues: {},
    workers: [],
    stats: {},
    counts: {}
  })

  useEffect(() => {
    loadDetails()
  })

  async function loadFailedCount () {
    const response = await client.action({}, '/api/resque/resqueFailedCount', 'GET')
    const counts = data.counts
    counts.failed = response.failedCount
    data.counts = counts
    setData(data)
  }

  async function loadDetails () {
    const response = await client.action({}, '/api/resque/resqueDetails', 'GET')
    data.queues = response.resqueDetails.queues || {}
    data.workers = response.resqueDetails.workers || {}
    data.stats = response.resqueDetails.stats || {}
    data.counts = {
      queues: Object.keys(response.resqueDetails.queues).length || 0,
      workers: Object.keys(response.resqueDetails.workers).length || 0
    }
    setData(data)

    await loadFailedCount()

    Object.keys(data.workers).forEach((workerName) => {
      const worker = data.workers[workerName]
      if (typeof worker === 'string') {
        data.workers[workerName] = {
          status: worker,
          statusString: worker
        }
      } else {
        worker.delta = Math.round((new Date().getTime() - new Date(worker.run_at).getTime()) / 1000)
        worker.statusString = 'working on ' + worker.queue + '#' + worker.payload.class + ' for ' + worker.delta + 's'
      }
    })
  }

  return (
    <Page client={client}>
      <h1>Overview Page</h1>
    </Page>
  )
}

export default OverviewPage
