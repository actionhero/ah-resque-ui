import React, { useState, useEffect } from 'react'
import useInterval from './../hooks/useInterval'
import { Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Page from '../layouts/page'

const pollingInterval = 5000

function OverviewPage ({ client }) {
  const [data, setData] = useState({
    queues: {},
    workers: [],
    stats: {},
    counts: {}
  })

  useEffect(() => { loadData() }, [])
  useInterval(() => { loadData() }, [5000])

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

    setData({ queues, stats, counts, workers })
  }

  return (
    <Page client={client}>
      <h1>Resque Overview</h1>

      <Row>
        <Col md={3}>
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
        <Col md={9}>
          {/* <ReactHighcharts
            isPureConfig={false}
            ref='chart'
            config={data.chartConfig}
            domProps={{
              style: {
                minWidth: '310px',
                height: '300px',
                margin: '0'
              }
            }}
          /> */}
        </Col>
      </Row>

      <Row>
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
                <td><strong><Link to='failed'>failed</Link></strong></td>
                <td><strong>{data.counts.failed || 0}</strong></td>
              </tr>

              {
                Object.keys(data.queues).map((q) => {
                  return (
                    <tr key={q}>
                      <td><Link to={`queue/${q}`}>{q}</Link></td>
                      <td>{data.queues[q].length}</td>
                    </tr>
                  )
                })
              }

            </tbody>
          </table>
        </Col>

        <Col md={8}>
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
                      <td><span className={worker.delta > 0 ? 'text-success' : ''}>{worker.statusString}</span></td>
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
