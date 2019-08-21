import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'

// import NotificationZone from '../components/notificationZone'
import Navigation from '../components/navigation'
import Footer from '../components/footer'

function Page ({ children, client }) {
  // getInitialState: function () {
  //   return {
  //     client: new Client(),
  //     user: {},
  //     refreshInterval: 5,
  //     error: { show: false }
  //   }
  // },

  // notify (message, level) {
  //   clearTimeout(this.state.error.timer)

  //   const timer = setTimeout(() => {
  //     this.setState({ error: { show: false } })
  //   }, 5000)

  //   this.setState({
  //     error: {
  //       show: true,
  //       timer: timer,
  //       level: level,
  //       message: message
  //     }
  //   })
  // },

  // componentDidMount: function () {
  //   const client = this.state.client
  //   client.notify = this.notify
  // },

  // componentWillUnmount () {
  //   if (this.state.error.timer) { clearTimeout(this.state.error.timer) }
  // },

  // handleRefreshIntervalChangeUpdate (event) {
  //   this.setState({ refreshInterval: event.target.value })
  // },

  return (
    <Container>

      <Row>
        <Col md={12}>
          <Navigation />
        </Col>
      </Row>

      {/* <Row>
        <Col md={12}>
          <NotificationZone
            level={this.state.error.level}
            message={this.state.error.message}
            show={this.state.error.show}
          />
        </Col>
      </Row> */}

      <Row>
        <Col md={12}>
          {children}
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Footer client={client} />
        </Col>
      </Row>

    </Container>
  )
}

export default Page
