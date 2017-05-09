import React from 'react'
import {Link} from 'react-router'
import {Row, Col} from 'react-bootstrap'

const Workers = React.createClass({
  getInitialState: function () {
    return {
      timer: null,
      disableConfirm: false,
      workingLongerThen: 300,
      refreshInterval: parseInt(this.props.refreshInterval),
      workers: {},
      workerQueues: [],
      counts: {}
    }
  },

  componentWillReceiveProps (nextProps) {
    if (nextProps.refreshInterval !== this.state.refreshInterval) {
      this.setState({refreshInterval: parseInt(nextProps.refreshInterval)}, () => {
        this.loadWorkers()
      })
    }
  },

  componentDidMount () {
    this.loadWorkers()
  },

  componentWillUnmount () {
    clearTimeout(this.timer)
  },

  handleAutoRemoveWorkers(){
    this.setState({disableConfirm: true}); // make sure no confirmation boxes
    let smallestValue = this.state.workingLongerThen;
    this.state.workerQueues.map((w) => {
      if (w.worker.delta > smallestValue) {
        setTimeout(() => this.forceCleanWorker(w.workerName), 100);
      }
    });
  },

  loadWorkers () {
    clearTimeout(this.timer)
    if (this.state.refreshInterval > 0) {
      this.timer = setTimeout(() => {
        this.loadWorkers()
      }, (this.state.refreshInterval * 1000))
    }

    const client = this.props.client

    client.action({}, '/api/resque/resqueDetails', 'GET', (data) => {
      this.setState({
        workers: data.resqueDetails.workers,
        counts: {
          workers: Object.keys(data.resqueDetails.workers).length
        }
      }, () => {
        this.setState({chartConfig: this.state.chartConfig})

        Object.keys(this.state.workers).forEach((workerName) => {
          var worker = this.state.workers[workerName]
          if (typeof worker === 'string') {
            this.state.workers[workerName] = {
              status: worker,
              statusString: worker
            }
          } else {
            worker.delta = Math.round((new Date().getTime() - new Date(worker.run_at).getTime()) / 1000)
            worker.statusString = 'working on ' + worker.queue + '#' + worker.payload.class + ' for ' + worker.delta + 's'
          }
        })

        this.loadWorkerQueues()
      })
    })
  },

  loadWorkerQueues () {
    const client = this.props.client

    client.action({}, '/api/resque/loadWorkerQueues', 'GET', (data) => {
      let workerQueues = []
      Object.keys(data.workerQueues).forEach((workerName) => {
        let parts = workerName.split(':')
        let id = parts.pop()
        let host = parts.join(':')
        let queues = data.workerQueues[workerName].split(',')

        let worker = {}
        if (this.state.workers[workerName]) {
          worker = this.state.workers[workerName]
        }

        workerQueues.push({
          id: id, host: host, queues: queues, worker: worker, workerName: workerName
        })
      })

      this.setState({workerQueues: workerQueues})
    })
  },

  forceCleanWorker (workerName) {
    const client = this.props.client

    if (this.state.disableConfirm || confirm('Are you sure?')) {
      client.action({workerName: workerName}, '/api/resque/forceCleanWorker', 'POST', (data) => {
        this.loadWorkers()
      })
    }
  },

  render () {
    return (
      <div>
        <h1>Workers ({ this.state.counts.workers })</h1>

        <Row>
          <Col md={12}>

            <table className='table table-striped table-hover '>
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
                this.state.workerQueues.map((w) => {
                  return (
                    <tr key={w.workerName}>
                      <td>{ w.id }</td>
                      <td>{ w.host }</td>
                      <td>
                        <ul>
                          {
                            w.queues.map((q) => {
                              return (
                                <li key={`${w}-${q}`}>
                                  <Link to={`queue/${q}`}>{ q }</Link>
                                </li>
                              )
                            })
                          }
                        </ul>
                      </td>
                      <td><span className={w.worker.delta > 0 ? 'text-success' : ''}>{ w.worker.statusString }</span>
                      </td>
                      <td>
                        <button onClick={this.forceCleanWorker.bind(null, w.workerName)}
                                className='btn btn-xs btn-danger'>Remove Worker
                        </button>
                      </td>
                    </tr>
                  )
                })
              }

              </tbody>
            </table>

          </Col>
        </Row>

        <button
          onClick={() => this.setState({disableConfirm: !this.state.disableConfirm})}
        >
          {this.state.disableConfirm ? 'Enable' : 'Disable'} confirmation boxes
        </button>

        <div style={{display: 'flex', alignItems: 'center'}}>
          <button onClick={this.handleAutoRemoveWorkers}>
            Auto remove workers that are working longer then (seconds):
          </button>
          <input
            value={this.state.workingLongerThen}
            placeholder="Seconds"
            onChange={(e) => this.setState({workingLongerThen: e.target.value})}
          />
        </div>
      </div>
    )
  }
})

export default Workers
