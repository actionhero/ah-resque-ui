import React, { useState, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'

function Footer ({ client }) {
  const [data, setData] = useState({
    redis: {},
    version: ''
  })

  useEffect(() => {
    async function fetchData () {
      const data = await client.action({}, '/api/resque/packageDetails')
      setData({
        version: data.packageDetails.packageJSON.version,
        redis: data.packageDetails.redis[0]
      })
    }

    fetchData()
  }, [])

  return (
    <footer>
      <hr />
      <Row>
        <Col md={6}>
          <p className='text-muted'>
            <span className='text-warning'><strong>redis connection:</strong></span> {data.redis.host}:{data.redis.port}#{data.redis.db}<br />
          </p>
        </Col>

        <Col md={6}>
          <p className='text-muted text-right'>
            <a target='_new' href='https://github.com/actionhero/ah-resque-ui'><strong>ah-resque-ui version:</strong> {data.version}</a><br />
          </p>
        </Col>
      </Row>
    </footer>
  )
}

export default Footer
