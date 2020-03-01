import React, { useState, useEffect } from "react";
import { Table, Row, Col } from "react-bootstrap";
import Page from "../layouts/page";

function LocksPage({ client }) {
  const [data, setData] = useState({
    locks: []
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const response = await client.action({}, "/api/1/resque/locks", "GET");
    const locks = [];
    Object.keys(response.locks).forEach(function(l) {
      locks.push({ lock: l, at: new Date(parseInt(response.locks[l]) * 1000) });
    });
    data.locks = locks;
    setData({ ...data });
  }

  async function delLock(lock) {
    if (confirm("Are you sure?")) {
      await client.action({ lock: lock }, "/api/1/resque/delLock", "POST");
      await loadData();
    }
  }

  let index = -1;

  return (
    <Page client={client}>
      <h1>Locks ({data.locks.length})</h1>

      <Row>
        <Col md={12}>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>Name</th>
                <th>Expires</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {data.locks.map(l => {
                index++;
                return (
                  <tr key={`${index}-${l.at.getTime()}`}>
                    <td>{index + 1}</td>
                    <td>{l.lock}</td>
                    <td>{l.at.toString()}</td>
                    <td>
                      <button
                        onClick={delLock.bind(null, l.lock)}
                        className="btn btn-xs btn-warning"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Page>
  );
}

export default LocksPage;
