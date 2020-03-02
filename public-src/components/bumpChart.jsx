import React from "react";
import { ResponsiveAreaBump } from "@nivo/bump";
import { Spinner, Row, Col } from "react-bootstrap";

function BumpChart({ data }) {
  if (!data[0] || data[0].data.length < 2) {
    return (
      <Row>
        <Col md={12} style={{ textAlign: "center", paddingTop: 100 }}>
          <Spinner animation="border" />
        </Col>
      </Row>
    );
  }

  return (
    <ResponsiveAreaBump
      data={data}
      margin={{ top: 40, right: 100, bottom: 40, left: 100 }}
      spacing={8}
      colors={{ scheme: "category10" }}
      blendMode="multiply"
      animate={false}
      axisTop={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "",
        legendPosition: "middle",
        legendOffset: -36
      }}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "",
        legendPosition: "middle",
        legendOffset: 32
      }}
    />
  );
}

export default BumpChart;
