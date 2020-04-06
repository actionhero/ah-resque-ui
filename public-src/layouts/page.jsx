import React from "react";
import { useState } from "react";
import { Container, Row, Col, Alert, Button } from "react-bootstrap";
import Navigation from "../components/navigation";
import Footer from "../components/footer";

function Page({ children, client }) {
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState("");

  client.notifiers = [
    (error) => {
      setError(error);
      setShowError(true);
    },
  ];

  return (
    <Container>
      <Row>
        <Col md={12}>
          <Navigation />
          <br />
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Alert
            show={showError}
            variant="danger"
            onClose={() => setShowError(false)}
            dismissible
          >
            <p>{error}</p>
          </Alert>
        </Col>
      </Row>

      <Row>
        <Col md={12}>{children}</Col>
      </Row>

      <Row>
        <Col md={12}>
          <Footer client={client} />
        </Col>
      </Row>
    </Container>
  );
}

export default Page;
