import React from 'react'
import { Link } from 'react-router'
import { Row, Col, Modal } from 'react-bootstrap'
import Pagination from './components/pagination.jsx'

const Failed = React.createClass({
  getInitialState: function () {
    return {
      timer: null,
      refreshInterval: parseInt(this.props.refreshInterval),
      failed: [],
      counts: {},
      focusedException: {},
      perPage: 50,
      showModal: false,
      page: parseInt(this.props.params.page || 0)
    }
  },

  componentWillReceiveProps (nextProps) {
    if (nextProps.refreshInterval !== this.state.refreshInterval) {
      this.setState({refreshInterval: parseInt(nextProps.refreshInterval)}, () => {
        this.loadFailed()
      })
    }

    if (nextProps.params && nextProps.params.page) {
      this.setState({page: nextProps.params.page}, () => {
        this.loadFailed()
      })
    }
  },

  componentDidMount () {
    this.loadFailed()
  },

  componentWillUnmount () {
    clearTimeout(this.timer)
  },

  loadFailedCount () {
    const client = this.props.client
    client.action({}, '/api/resque/resqueFailedCount', 'GET', (data) => {
      this.setState({counts: {failed: data.failedCount}})
      // $scope.pagination = $rootScope.genratePagination($scope.currentPage, $scope.perPage, $scope.counts.failed);
    })
  },

  loadFailed () {
    clearTimeout(this.timer)
    if (this.state.refreshInterval > 0) {
      this.timer = setTimeout(() => {
        this.loadFailed()
      }, (this.state.refreshInterval * 1000))
    }

    const client = this.props.client
    client.action({
      start: (this.state.page * this.state.perPage),
      stop: ((this.state.page * this.state.perPage) + (this.state.perPage - 1))
    }, '/api/resque/resqueFailed', 'GET', (data) => {
      this.setState({failed: data.failed}, () => {
        this.loadFailedCount()
      })
    })
  },

  removeFailedJob (index) {
    const client = this.props.client
    client.action({
      id: index
    }, '/api/resque/removeFailed', 'POST', (data) => {
      this.loadFailed()
    })
  },

  retryFailedJob (index) {
    const client = this.props.client
    client.action({
      id: index
    }, '/api/resque/retryAndRemoveFailed', 'POST', (data) => {
      this.loadFailed()
    })
  },

  removeAllFailedJobs () {
    const client = this.props.client
    if (window.confirm('Are you sure?')) {
      client.action({}, '/api/resque/removeAllFailed', 'POST', (data) => {
        this.loadFailed()
      })
    }
  },

  retryAllFailedJobs () {
    const client = this.props.client
    if (window.confirm('Are you sure?')) {
      client.action({}, '/api/resque/retryAndRemoveAllFailed', 'POST', (data) => {
        this.loadFailed()
      })
    }
  },

  renderFailureStack (index) {
    let focusedException = this.state.failed[index]
    focusedException.renderedStack = ''
    if (focusedException.backtrace) {
      focusedException.renderedStack = focusedException.backtrace.join('\r\n')
    }

    this.setState({
      focusedException: focusedException,
      showModal: true
    })
  },

  onHide () {
    this.setState({showModal: false})
  },

  render () {
    let index = -1 + (this.state.perPage * this.state.page)
    let argCounter = -1

    return (
      <div>

        <h1>Failed Jobs ({ this.state.counts.failed })</h1>

        <p>
          <button onClick={this.retryAllFailedJobs} className='btn btn-sm btn-warning'>Retry All</button> <button onClick={this.removeAllFailedJobs} className='btn btn-sm btn-danger'>Remove All</button>
        </p>

        <Row>
          <Col md={12}>

            <table id='failureTable' className='table table-striped table-hover '>
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
                    this.state.failed.map((f) => {
                      index++

                      return (
                        <tr key={`failure-${index}`}>
                          <td>{ (this.state.page * this.state.perPage) + (index + 1) }</td>
                          <td>{ f.failed_at }</td>
                          <td>
                            <a onClick={this.renderFailureStack.bind(null, index)} ><span className='glyphicon glyphicon-plus-sign' /></a>&nbsp;
                            <strong>{ f.exception }: { f.error }</strong>
                          </td>
                          <td><span className='text-success'><Link to={`queue/${f.queue}`}>{ f.queue }</Link></span></td>
                          <td>{ f.payload.class }</td>
                          <td>{ f.worker }</td>
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
                          <td><button onClick={this.retryFailedJob.bind(null, index)} className='btn btn-xs btn-warning'>Retry</button></td>
                          <td><button onClick={this.removeFailedJob.bind(null, index)} className='btn btn-xs btn-danger'>Remove</button></td>
                        </tr>
                      )
                    })
                  }
              </tbody>
            </table>

            <Pagination
              page={this.state.page}
              total={this.state.counts.failed}
              perPage={this.state.perPage}
              base='/resque/#/failed'
            />

          </Col>
        </Row>

        <Modal show={this.state.showModal} onHide={this.state.onHide}>
          <Modal.Header>{ this.state.focusedException.exception }: { this.state.focusedException.error }</Modal.Header>
          <Modal.Body>
            <p><strong>Queue</strong>: {this.state.focusedException.queue} </p>
            <p><strong>Worker</strong>: {this.state.focusedException.worker} </p>
            <p><strong>Payload</strong>:</p>
            <pre>
              {
                this.state.focusedException.payload ? JSON.stringify(this.state.focusedException.payload.args) : null
              }
            </pre>
            <p><strong>Stack</strong>:</p>
            <pre>{ this.state.focusedException.renderedStack }</pre>
          </Modal.Body>
          <Modal.Footer>
            <button className='btn btn-xs' onClick={this.onHide}>Close</button>
          </Modal.Footer>
        </Modal>

      </div>
    )
  }
})

export default Failed
