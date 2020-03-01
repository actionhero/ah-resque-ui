import React from "react";
import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";

import NotificationZone from "../components/notificationZone";
import Navigation from "../components/navigation";
import Footer from "../components/footer";

function Page({ children, client }) {
  const [notification, setNotification] = useState({
    level: "info",
    message: "",
    show: false
  });

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
          <NotificationZone
            level={notification.level}
            message={notification.message}
            show={notification.show}
          />
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
