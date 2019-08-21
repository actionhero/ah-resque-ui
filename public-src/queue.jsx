import React from 'react'
import Pagination from './components/pagination.jsx'

const Queues = React.createClass({
  getInitialState: function () {
    return {
      timer: null,
      refreshInterval: parseInt(this.props.refreshInterval),
      queue: this.props.params.queue,
      jobs: [],
      queueLength: 0,
      perPage: 50,
      page: parseInt(this.props.params.page || 0)
    }
  },

  componentWillReceiveProps (nextProps) {
    if (nextProps.refreshInterval !== this.state.refreshInterval) {
      this.setState({ refreshInterval: parseInt(nextProps.refreshInterval) }, () => {
        this.loadQueue()
      })
    }

    if (nextProps.params && nextProps.params.page) {
      this.setState({ page: nextProps.params.page }, () => {
        this.loadQueue()
      })
    }
  },

  componentDidMount () {
    this.loadQueue()
  },

  componentWillUnmount () {
    clearTimeout(this.timer)
  },

  loadQueue () {
    clearTimeout(this.timer)
    if (this.state.refreshInterval > 0) {
      this.timer = setTimeout(() => {
        this.loadQueue()
      }, (this.state.refreshInterval * 1000))
    }

    const client = this.props.client

    client.action({
      queue: this.state.queue,
      start: (this.state.page * this.state.perPage),
      stop: ((this.state.page * this.state.perPage) + (this.state.perPage - 1))
    }, '/api/resque/queued', 'GET', (data) => {
      this.setState({
        jobs: data.jobs,
        queueLength: data.queueLength
      })
    })
  },

  delQueue () {
    const client = this.props.client

    if (confirm('Are you sure?')) {
      client.action({
        queue: this.state.queue
      }, '/api/resque/delQueue', 'POST', function (data) {
        window.location.push('/resque/#/overview') //TODO
        window.location.reload()
      })
    }
  },

  render () {
    let index = -1
    let argCounter = -1

    return (
      <div>
        <h1>{this.state.queue} ({this.state.queueLength})</h1>

        <p>
          <button onClick={this.delQueue} className='btn btn-xs btn-danger'>Delete Queue</button>
        </p>

        <table id='jobTable' className='table table-striped table-hover '>
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Class</th>
              <th>Arguments</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.jobs.map((job) => {
                index++

                return (
                  <tr key={JSON.stringify(job)}>
                    <td>{(this.state.page * this.state.perPage) + (index + 1)}</td>
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
        </table>

        <Pagination
          page={this.state.page}
          total={this.state.queueLength}
          perPage={this.state.perPage}
          base={`/resque/#/queue/${this.state.queue}`}
        />

      </div>
    )
  }
})

export default Queues
