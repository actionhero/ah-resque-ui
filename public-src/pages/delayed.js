import React, { useState, useEffect } from 'react'
import { Button, Table, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Page from '../layouts/page'
import Pagination from '../components/pagination'

function DelayedPage ({ client, history, match }) {
  const [data, setData] = useState({
    timestamps: [],
    delayedjobs: {},
    counts: {},
    perPage: 15,
    page: parseInt(match.params.page || 0)
  })

  useEffect(() => {
    data.page = parseInt(match.params.page || 0)
    setData({ ...data })
  }, [match.params])

  useEffect(() => { loadData() }, [data.page])

  async function loadData () {
    const response = await client.action({
      start: (data.page * data.perPage),
      stop: ((data.page * data.perPage) + (data.perPage - 1))
    }, '/api/resque/delayedjobs')
    const timestamps = []

    if (response.delayedjobs) {
      Object.keys(response.delayedjobs).forEach(function (t) {
        timestamps.push({
          date: new Date(parseInt(t)),
          key: t
        })
      })
    }

    data.counts = { timestamps: response.timestampsCount }
    data.delayedjobs = response.delayedjobs
    data.timestamps = timestamps
    setData({ ...data })
  }

  async function delDelayed (timestamp, count) {
    if (confirm('Are you sure?')) {
      await client.action({ timestamp: timestamp, count: count }, '/api/resque/delDelayed', 'POST')
      await loadData()
    }
  }

  async function runDelayed (timestamp, count) {
    await client.action({ timestamp: timestamp, count: count }, '/api/resque/runDelayed', 'POST')
    await loadData()
  }

  let index = -1 + (data.perPage * data.page)
  let argCounter = -1

  return (
    <Page client={client}>
      <h1>Delayed Jobs</h1>

      <Row>
        <Col md={12}>
          {
            data.timestamps.map((t) => {
              index = -1
              return (
                <div key={t.date.getTime()} className='panel panel-primary'>
                  <div className='panel-heading'>
                    <h3 className='panel-title'>{t.date.toString()}</h3>
                  </div>
                  <div className='panel-body'>

                    <Table striped bordered hover size='sm'>
                      <thead>
                        <tr>
                          <td><strong>Class</strong></td>
                          <td><strong>Queue</strong></td>
                          <td><strong>Arguments</strong></td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          data.delayedjobs[t.key].tasks.map((job) => {
                            index++
                            return (
                              <tr key={`${t.date.getTime()}-${job.queue}-${JSON.stringify(job.args)}`}>
                                <td>{job.class}</td>
                                <td><Link to={`queue/${job.queue}`}>{job.queue}</Link></td>
                                <td>
                                  <ul>
                                    {
                                      job.args.map((a) => {
                                        argCounter++
                                        return <li key={`arg-${argCounter}`}>{JSON.stringify(a)}</li>
                                      })
                                    }
                                  </ul>
                                </td>
                                <td><Button onClick={runDelayed.bind(null, t.key, index)} variant='warning' size='small'>Run Now</Button></td>
                                <td><Button onClick={delDelayed.bind(null, t.key, index)} variant='danger' size='small'>Remove</Button></td>
                              </tr>
                            )
                          })
                        }
                      </tbody>
                    </Table>

                  </div>
                </div>
              )
            })
          }

          <Pagination
            history={history}
            page={data.page}
            total={data.counts.timestamps}
            perPage={data.perPage}
            base='/delayed'
          />

        </Col>
      </Row>
    </Page>
  )
}

export default DelayedPage
