import React, { useState, useEffect } from 'react'
import useInterval from './../hooks/useInterval'
import { Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Page from '../layouts/page'
import BumpChart from '../components/bumpChart'

const pollingInterval = 5000
const maxSampleLength = 13

function timeFormatter (time) {
  return ('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2) + ':' + ('0' + time.getSeconds()).slice(-2)
}

function OverviewPage ({ client }) {
  const [data, setData] = useState({
    queues: {},
    workers: [],
    stats: {},
    counts: {},
    samples: []
  })

  useEffect(() => { loadData() }, [])
  useInterval(() => { loadData() }, [pollingInterval])

  async function loadData () {
    let queues = {}
    let workers = {}
    let stats = {}
    let counts = {}

    let response = await client.action({}, '/api/resque/resqueDetails', 'GET')
    queues = response.resqueDetails.queues || {}
    workers = response.resqueDetails.workers || {}
    stats = response.resqueDetails.stats || {}
    counts = {
      queues: Object.keys(response.resqueDetails.queues).length || 0,
      workers: Object.keys(response.resqueDetails.workers).length || 0
    }

    response = await client.action({}, '/api/resque/resqueFailedCount', 'GET')
    counts.failed = response.failedCount

    Object.keys(workers).forEach((workerName) => {
      const worker = workers[workerName]
      if (typeof worker === 'string') {
        workers[workerName] = {
          status: worker,
          statusString: worker
        }
      } else {
        worker.delta = Math.round((new Date().getTime() - new Date(worker.run_at).getTime()) / 1000)
        worker.statusString = 'working on ' + worker.queue + '#' + worker.payload.class + ' for ' + worker.delta + 's'
      }
    })

    const samples = data.samples
    const time = timeFormatter(new Date())

    for (const name in queues) {
      let found = false
      samples.forEach((sample) => {
        if (sample.id === name) { found = true }
      })

      if (!found) { samples.push({ id: name, data: [] }) }

      for (const i in samples) {
        if (samples[i].id === name) {
          samples[i].data.push({ x: time, y: queues[name].length })
          if (samples[i].data.length > maxSampleLength) { samples[i].data.shift() }
        }
      }
    }

    setData({ queues, stats, counts, workers, samples })
  }

  const chartData = []
  data.samples.forEach((series) => { chartData.push(series) })

  return (
    <Page client={client}>
      <h1>Resque Overview</h1>

      <Row>
        <Col md={12} style={{ height: 450 }}>
          <BumpChart data={chartData} />
        </Col>
      </Row>

      <Row>
        <Col md={2}>
          <h3>Stats:</h3>
          <table className='table table-hover'>
            <tbody>
              {
                Object.keys(data.stats).map((k) => {
                  const v = data.stats[k]
                  if (k.indexOf(':') > 0) { return null }

                  return (
                    <tr key={k}>
                      <td>{k}</td>
                      <td>{v}</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </Col>

        <Col md={4}>
          <h2>Queues ({data.counts.queues})</h2>

          <table className='table table-hover '>
            <thead>
              <tr>
                <th>Queue Name</th>
                <th>Jobs</th>
              </tr>
            </thead>
            <tbody>
              <tr className='table-warning'>
                <td><strong><Link to='/failed'>failed</Link></strong></td>
                <td><strong>{data.counts.failed || 0}</strong></td>
              </tr>

              {
                Object.keys(data.queues).map((q) => {
                  return (
                    <tr key={q}>
                      <td><Link to={`/queue/${q}`}>{q}</Link></td>
                      <td>{data.queues[q].length}</td>
                    </tr>
                  )
                })
              }

            </tbody>
          </table>
        </Col>

        <Col md={5}>
          <h2>Workers ({data.counts.workers})</h2>

          <table className='table table-striped table-hover '>
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>

              {
                Object.keys(data.workers).map((name) => {
                  const worker = data.workers[name]
                  return (
                    <tr key={name}>
                      <td><span className={worker.delta > 0 ? 'text-success' : ''}>{name}</span></td>
                      <td><span className={worker.delta > 0 ? 'text-info' : ''}>{worker.statusString}</span></td>
                    </tr>
                  )
                })
              }

            </tbody>
          </table>
        </Col>
      </Row>
    </Page>
  )
}

export default OverviewPage
