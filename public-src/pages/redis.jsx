import React, { useState, useEffect } from "react";
import { Table, Row, Col } from "react-bootstrap";
import Page from "../layouts/page";

function RedisPage({ client }) {
  const [data, setData] = useState({
    redisInfo: []
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const response = await client.action({}, "/api/1/resque/redisInfo");
    setData({ redisInfo: response.redisInfo });
  }

  return (
    <Page client={client}>
      <h1>Redis Information</h1>
      <p>
        <em>
          Note: This data was retrieved from the ActionHero Resque Queue
          connection. If you are using Redis cluster or split Redis
          configurations this data will be inaccruate.
        </em>
      </p>

      <Row>
        <Col md={12}>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {data.redisInfo.map(row => {
                const parts = row.split(":");
                if (parts.length === 1 && row.length < 2) {
                  return null;
                } else if (parts.length === 1) {
                  return (
                    <tr key={row} className="table-primary">
                      <td colSpan={2}>
                        <h3>{row}</h3>
                      </td>
                    </tr>
                  );
                } else {
                  return (
                    <tr key={row}>
                      <td>{parts[0]}</td>
                      <td>{parts[1]}</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Page>
  );
}

export default RedisPage;
