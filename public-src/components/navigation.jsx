import React from "react";
import { Link } from "react-router-dom";
import { Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

function NavItem({ path, name }) {
  let active = false;
  const simpleHash = window.location.hash.replace("#/", "");
  if (path !== "/" && simpleHash.indexOf(path) === 0) {
    active = true;
  }

  if (path === "/") {
    path = "";
  }
  return (
    <LinkContainer exact to={`/${path}`}>
      <Nav.Link className={active ? "active" : ""}>
        {name || path.charAt(0).toUpperCase() + path.slice(1).toLowerCase()}
      </Nav.Link>
    </LinkContainer>
  );
}

function Navigation() {
  return (
    <div>
      <br />
      <Navbar bg="light" expand="lg">
        <Navbar.Brand>
          <Link className="navbar-brand" to="/">
            <img
              src="/public/resque/img/resque-logo.png"
              style={{ maxHeight: 30 }}
            />
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <NavItem path="/" name="Overview" />
            <NavItem path="failed" name="Failed" />
            <NavItem path="workers" name="Workers" />
            <NavItem path="delayed" name="Delayed" />
            <NavItem path="locks" name="Locks" />
            <NavItem path="redis" name="Redis" />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}

export default Navigation;
