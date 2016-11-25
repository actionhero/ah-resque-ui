import React from 'react'
import ReactDOM from 'react-dom'
import {Router, Route, hashHistory, IndexRedirect} from 'react-router'

import Page from './components/page.jsx'

import Overview from './overview.jsx'
import Failed from './failed.jsx'
import Workers from './workers.jsx'
import Delayed from './delayed.jsx'
import Queue from './queue.jsx'
import Locks from './locks.jsx'

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path='/' component={Page}>
      <IndexRedirect to='/overview' />

      <Route path='overview' component={Overview} />
      <Route path='failed' component={Failed} />
      <Route path='failed/:page' component={Failed} />
      <Route path='workers' component={Workers} />
      <Route path='queue/:queue' component={Queue} />
      <Route path='queue/:queue/:page' component={Queue} />
      <Route path='delayed' component={Delayed} />
      <Route path='delayed/:page' component={Delayed} />
      <Route path='locks' component={Locks} />
    </Route>
  </Router>,

  document.getElementById('application')
)
