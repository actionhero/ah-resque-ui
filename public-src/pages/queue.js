import React, { useState, useEffect } from 'react'
import { Button, Table, Row, Col } from 'react-bootstrap'
import Pagination from './../components/pagination'
import Page from '../layouts/page'

function QueuePage ({ client, history, match }) {
  const [data, setData] = useState({
    queue: match.params.queue,
    jobs: [],
    queueLength: 0,
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
      queue: data.queue,
      start: (data.page * data.perPage),
      stop: ((data.page * data.perPage) + (data.perPage - 1))
    }, '/api/resque/queued')
    data.jobs = response.jobs
    data.queueLength = response.queueLength
    setData({ ...data })
  }

  async function delQueue () {
    if (confirm('Are you sure?')) {
      await client.action({ queue: data.queue }, '/api/resque/delQueue', 'POST')
      history.replace('/')
    }
  }

  let index = -1
  let argCounter = -1

  return (
    <Page client={client}>
      <h1>{data.queue} ({data.queueLength})</h1>

      <p>
        <Button onClick={delQueue} variant='danger' size='sm'>Delete Queue</Button>
      </p>

      <Row>
        <Col md='12'>
          <Table id='jobTable' striped bordered hover size='sm'>
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>Class</th>
                <th>Arguments</th>
              </tr>
            </thead>
            <tbody>
              {
                data.jobs.map((job) => {
                  index++

                  return (
                    <tr key={JSON.stringify(job)}>
                      <td>{(index + 1)}</td>
                      <td>{job.class}</td>
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
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>

          <Pagination
            history={history}
            page={data.page}
            total={data.queueLength}
            perPage={data.perPage}
            base={`/queue/${data.queue}`}
          />
        </Col>
      </Row>
    </Page>
  )
}

export default QueuePage
