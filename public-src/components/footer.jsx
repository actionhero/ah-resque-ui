import React from "react";
import { Row, Col } from "react-bootstrap";

const packageJson = require("./../../package.json");

function Footer() {
  return (
    <footer>
      <hr />
      <Row>
        <Col md={6}>
          <p className="text-muted text-left">
            <a target="_new" href="https://github.com/actionhero/ah-resque-ui">
              <strong>ah-resque-ui version:</strong> {packageJson.version}
            </a>
            <br />
          </p>
        </Col>
      </Row>
    </footer>
  );
}

export default Footer;
