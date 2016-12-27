import React from 'react'
import { Link } from 'react-router'

const _NavItem = React.createClass({
  render () {
    let active = false
    let simpleHash = (window.location.hash.split('/')).pop()
    if (simpleHash === this.props.path) { active = true }

    return (
      <li className={active ? 'active' : ''}>
        <Link to={`${this.props.path}`}>
          {(this.props.path.charAt(0).toUpperCase() + this.props.path.slice(1).toLowerCase())}
        </Link>
      </li>
    )
  }
})

const Nav = React.createClass({
  getInitialState () {
    return ({refreshInterval: this.props.refreshInterval})
  },

  handleRefreshIntervalChangeUpdate (event) {
    this.props.handleRefreshIntervalChangeUpdate(event)
  },

  render () {
    return (
      <div>
        <br />

        <nav className='navbar navbar-default'>
          <div className='container-fluid'>

            <div className='navbar-header'>
              <button type='button' className='navbar-toggle collapsed' data-toggle='collapse' data-target='#navbar-collapse-1' aria-expanded='false'>
                <span className='sr-only'>Toggle navigation</span>
                <span className='icon-bar' />
                <span className='icon-bar' />
                <span className='icon-bar' />
              </button>
              <Link className='navbar-brand' to='overview'><img src='/resque/img/resque-logo.png' height='100%' /></Link>
            </div>

            <div className='collapse navbar-collapse' id='navbar-collapse-1'>

              <ul className='nav navbar-nav'>
                <_NavItem path='overview' />
                <_NavItem path='failed' />
                <_NavItem path='workers' />
                <_NavItem path='delayed' />
                <_NavItem path='locks' />
                <_NavItem path='redis' />
              </ul>

              <form className='navbar-form navbar-right' role='search'>
                <label className='control-label'>Refresh Interval:</label>
                <div id='refresher' className='form-group'>
                  <select defaultValue={this.state.refreshInterval} onChange={this.handleRefreshIntervalChangeUpdate} className='form-control'>
                    <option value='0'>no refresh</option>
                    <option value='1'>1s</option>
                    <option value='5'>5s</option>
                    <option value='30'>30s</option>
                    <option value='60'>1m</option>
                  </select>
                </div>
              </form>

            </div>
          </div>
        </nav>
      </div>
    )
  }
})

export default Nav
