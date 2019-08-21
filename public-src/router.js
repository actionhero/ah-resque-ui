import React from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import Client from './components/client'

// import Page from './components/page.jsx'

import Overview from './pages/overview'
import Failed from './pages/failed'
import Workers from './pages/workers'
// import Delayed from './delayed.jsx'
// import Queue from './queue.jsx'
// import Locks from './locks.jsx'
import Redis from './pages/redis'

function PageNotFound () {
  return <p>Page not found</p>
}

function ApplicationRouter () {
  const client = new Client()

  return (
    <Router>
      <Switch>
        <Route exact path='/' render={(props) => <Overview {...props} client={client} />} />
        <Route exact path={['/failed', '/failed/:page']} render={(props) => <Failed {...props} client={client} />} />
        {/* <Route path='failed/:page' component={Failed} /> */}
        <Route exact path='/workers' render={(props) => <Workers {...props} client={client} />} />
        {/* <Route path='queue/:queue' component={Queue} /> */}
        {/* <Route path='queue/:queue/:page' component={Queue} /> */}
        {/* <Route path='delayed' component={Delayed} /> */}
        {/* <Route path='delayed/:page' component={Delayed} /> */}
        {/* <Route path='locks' component={Locks} /> */}
        <Route exact path='/redis' render={(props) => <Redis {...props} client={client} />} />
        <Route component={PageNotFound} />
      </Switch>
    </Router>
  )
}

export default ApplicationRouter