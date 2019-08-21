import React from 'react'
import { HashRouter as Router, Route } from 'react-router-dom'
import Client from './components/client'

// import Page from './components/page.jsx'

import Overview from './pages/overview'
// import Failed from './failed.jsx'
// import Workers from './workers.jsx'
// import Delayed from './delayed.jsx'
// import Queue from './queue.jsx'
// import Locks from './locks.jsx'
// import Redis from './redis.jsx'

function ApplicationRouter () {
  const client = new Client()

  return (
    <Router>
      <Route exact path='/' render={(props) => <Overview {...props} client={client} />} />
      <Route exact path='/overview' render={(props) => <Overview {...props} client={client} />} />
      {/* <Route path='overview' component={Overview} />
      <Route path='failed' component={Failed} />
      <Route path='failed/:page' component={Failed} />
      <Route path='workers' component={Workers} />
      <Route path='queue/:queue' component={Queue} />
      <Route path='queue/:queue/:page' component={Queue} />
      <Route path='delayed' component={Delayed} />
      <Route path='delayed/:page' component={Delayed} />
      <Route path='locks' component={Locks} />
      <Route path='redis' component={Redis} /> */}
    </Router>
  )
}

export default ApplicationRouter
