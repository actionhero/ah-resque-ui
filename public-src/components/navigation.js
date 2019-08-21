import React from 'react'
import { Link } from 'react-router-dom'
import { Nav, Navbar } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

function NavItem ({ path }) {
  let active = false
  const simpleHash = (window.location.hash.split('/')).pop()
  if (simpleHash === path) { active = true }

  return (
    <LinkContainer to={path}>
      <Nav.Link className={active ? 'active' : ''}>
        {(path.charAt(0).toUpperCase() + path.slice(1).toLowerCase())}
      </Nav.Link>
    </LinkContainer>
  )
}

function Navigation () {
  return (
    <div>
      <br />
      <Navbar bg='light' expand='lg'>
        <Navbar.Brand>
          <Link className='navbar-brand' to='overview'><img src='/resque/img/resque-logo.png' style={{ maxHeight: 30 }} /></Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='mr-auto'>
            <NavItem path='overview' />
            <NavItem path='failed' />
            <NavItem path='workers' />
            <NavItem path='delayed' />
            <NavItem path='locks' />
            <NavItem path='redis' />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  )
}

export default Navigation
