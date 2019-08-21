import React, { useState, useEffect } from 'react'
import { Table, Button, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Page from '../layouts/page'

function WorkersPage ({ client }) {
  const [data, setData] = useState({
    workers: {},
    workerQueues: [],
    counts: {}
  })

  useEffect(() => { loadData() }, [])

  async function loadData () {
    let response = await client.action({}, '/api/resque/resqueDetails')
    const workers = response.resqueDetails.workers
    const counts = {
      workers: Object.keys(response.resqueDetails.workers).length
    }

    Object.keys(workers).forEach((workerName) => {
      var worker = workers[workerName]
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

    response = await client.action({}, '/api/resque/loadWorkerQueues')
    const workerQueues = []
    Object.keys(response.workerQueues).forEach((workerName) => {
      const parts = workerName.split(':')
      const id = parts.pop()
      const host = parts.join(':')
      const queues = response.workerQueues[workerName].split(',')

      let worker = {}
      if (workers[workerName]) {
        worker = workers[workerName]
      }

      workerQueues.push({
        id: id, host: host, queues: queues, worker: worker, workerName: workerName
      })
    })

    setData({ workers, counts, workerQueues })
  }

  async function forceCleanWorker (workerName) {
    if (confirm('Are you sure?')) {
      await client.action({ workerName: workerName }, '/api/resque/forceCleanWorker', 'POST')
      loadData()
    }
  }

  return (
    <Page client={client}>
      <h1>Workers ({data.counts.workers})</h1>

      <Row>
        <Col md={12}>

          <Table striped bordered hover size='sm'>
            <thead>
              <tr>
                <td><strong>ID</strong></td>
                <td><strong>Host</strong></td>
                <td><strong>Queues</strong></td>
                <td><strong>Status</strong></td>
                <td>&nbsp;</td>
              </tr>
            </thead>
            <tbody>
              {
                data.workerQueues.map((w) => {
                  return (
                    <tr key={w.workerName}>
                      <td>{w.id}</td>
                      <td>{w.host}</td>
                      <td>
                        <ul>
                          {
                            w.queues.map((q) => {
                              return (
                                <li key={`${w}-${q}`}>
                                  <Link to={`queue/${q}`}>{q}</Link>
                                </li>
                              )
                            })
                          }
                        </ul>
                      </td>
                      <td><span className={w.worker.delta > 0 ? 'text-success' : ''}>{w.worker.statusString}</span></td>
                      <td>
                        <Button onClick={forceCleanWorker.bind(null, w.workerName)} variant='danger' size='sm'>Remove Worker</Button>
                      </td>
                    </tr>
                  )
                })
              }

            </tbody>
          </Table>
        </Col>
      </Row>

    </Page>
  )
}

export default WorkersPage
