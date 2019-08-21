import React, { useState, useEffect } from 'react'
import { ButtonToolbar, Button, Table, Modal, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Page from '../layouts/page'
import Pagination from '../components/pagination'

function FailedPage ({ client, history, match }) {
  const [data, setData] = useState({
    failed: [],
    counts: {},
    focusedException: {},
    perPage: 15,
    showModal: false,
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
    }, '/api/resque/resqueFailed')
    data.failed = response.failed
    setData({ ...data })
    await loadFailedCount()
  }

  async function loadFailedCount () {
    const response = await client.action({}, '/api/resque/resqueFailedCount')
    data.counts = { failed: response.failedCount }
    setData({ ...data })
  }

  async function removeFailedJob (index) {
    await client.action({ id: index }, '/api/resque/removeFailed', 'POST')
    await loadData()
  }

  async function retryFailedJob (index) {
    await client.action({ id: index }, '/api/resque/retryAndRemoveFailed', 'POST')
    await loadData()
  }

  async function removeAllFailedJobs () {
    if (window.confirm('Are you sure?')) {
      await client.action({}, '/api/resque/removeAllFailed', 'POST')
      await loadData()
    }
  }

  async function retryAllFailedJobs () {
    if (window.confirm('Are you sure?')) {
      await client.action({}, '/api/resque/retryAndRemoveAllFailed', 'POST')
      await loadData()
    }
  }

  function renderFailureStack (index) {
    const focusedException = data.failed[index]
    focusedException.renderedStack = ''
    if (focusedException.backtrace) {
      focusedException.renderedStack = focusedException.backtrace.join('\r\n')
    }

    data.focusedException = focusedException
    data.showModal = true
    setData({ ...data })
  }

  function onHide () {
    data.showModal = false
    setData({ ...data })
  }

  let index = -1 + (data.perPage * data.page)
  let argCounter = -1

  return (
    <Page client={client}>
      <h1>Failed Jobs ({data.counts.failed})</h1>

      <Row>
        <Col md={12}>
          <ButtonToolbar>
            <Button onClick={retryAllFailedJobs} size='sm' variant='warning'>Retry All</Button>
            &nbsp;
            <Button onClick={removeAllFailedJobs} size='sm' variant='danger'>Remove All</Button>
          </ButtonToolbar>
        </Col>
        <br />
        <br />
      </Row>

      <Row>
        <Col md={12}>
          <Table id='failureTable' striped bordered hover size='sm'>
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>Date</th>
                <th>Exception</th>
                <th>Queue</th>
                <th>Method</th>
                <th>Worker</th>
                <th>Arguments</th>
                <th>&nbsp;</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {
                data.failed.map((f) => {
                  index++

                  return (
                    <tr key={`failure-${index}`}>
                      <td>{(data.page * data.perPage) + (index + 1)}</td>
                      <td>{f.failed_at}</td>
                      <td>
                        <a onClick={renderFailureStack.bind(null, index)}>➕</a>&nbsp;
                        <strong>{f.exception}: {f.error}</strong>
                      </td>
                      <td><span className='text-success'><Link to={`/queue/${f.queue}`}>{f.queue}</Link></span></td>
                      <td>{f.payload.class}</td>
                      <td>{f.worker}</td>
                      <td>
                        <ul>
                          {
                            f.payload.args.map((a) => {
                              argCounter++
                              return <li key={`arg-${argCounter}`}>{JSON.stringify(a)}</li>
                            })
                          }
                        </ul>
                      </td>
                      <td><Button onClick={retryFailedJob.bind(null, index)} variant='warning' size='sm'>Retry</Button></td>
                      <td><Button onClick={removeFailedJob.bind(null, index)} variant='danger' size='sm'>Remove</Button></td>
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>

          <Pagination
            history={history}
            page={data.page}
            total={data.counts.failed}
            perPage={data.perPage}
            base='/failed'
          />

        </Col>
      </Row>

      <Modal show={data.showModal} onHide={onHide} size='xl'>
        <Modal.Header><h3>{data.focusedException.exception}: {data.focusedException.error}</h3></Modal.Header>
        <Modal.Body>
          <p><strong>Queue</strong>: {data.focusedException.queue} </p>
          <p><strong>Worker</strong>: {data.focusedException.worker} </p>
          <p><strong>Payload</strong>:</p>
          <pre>
            {
              data.focusedException.payload ? JSON.stringify(data.focusedException.payload.args) : null
            }
          </pre>
          <p><strong>Stack</strong>:</p>
          <pre>{data.focusedException.renderedStack}</pre>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='small' onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Page>
  )
}

export default FailedPage
