import React from 'react'
import { Row, Col } from 'react-bootstrap'

const Redis = React.createClass({
  getInitialState: function () {
    return {
      redisInfo: []
    }
  },

  componentDidMount () {
    this.loadRedisInfo()
  },

  loadRedisInfo () {
    const client = this.props.client

    client.action({}, '/api/resque/redisInfo', 'GET', (data) => {
      this.setState({redisInfo: data.redisInfo})
    })
  },

  render () {
    return (
      <div>
        <h1>Redis Info</h1>
        <p><em>Note: This data was retrieved from the ActionHero Resque Queue connection.  If you are using Redis cluster or split Redis configurations this data will be inaccruate.</em></p>

        <Row>
          <Col md={12}>

            <table className='table table-striped table-hover '>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.redisInfo.map((row) => {
                    let parts = row.split(':')
                    if (parts.length === 1 && row.length < 2) {
                      return null
                    } else if (parts.length === 1) {
                      return (
                        <tr key={row}>
                          <td colSpan={2}><h3>{row}</h3></td>
                        </tr>
                      )
                    } else {
                      return (
                        <tr key={row}>
                          <td>{parts[0]}</td>
                          <td>{parts[1]}</td>
                        </tr>
                      )
                    }
                  })
                }
              </tbody>
            </table>

          </Col>
        </Row>
      </div>
    )
  }
})

export default Redis
