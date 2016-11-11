import React from 'react';
import { Row, Col } from 'react-bootstrap';


const Footer = React.createClass({
  getInitialState(){
    return {
      redis: {},
      version: '',
    };
  },

  componentDidMount(){
    this.loadPackageDetails();
  },

  loadPackageDetails(){
    const client = this.props.client;

    client.action({}, '/api/resque/packageDetails', 'GET', (data) => {
      this.setState({
        version: data.packageDetails.packageJSON.version,
        redis: {
          host: data.packageDetails.redis[0].host,
          port: data.packageDetails.redis[0].port,
          db: data.packageDetails.redis[0].db,
        }
      });
    });
  },

  render(){
    return(
      <div>
        <hr />
        <Row>

          <Col md={6}>
            <p className="text-muted">
              <span className="text-warning"><strong>redis connection:</strong></span>  { this.state.redis.host }:{ this.state.redis.port }#{ this.state.redis.db }<br />
            </p>
          </Col>

          <Col md={6}>
            <p className="text-muted text-right">
              <a target="_new" href="https://github.com/evantahler/ah-resque-ui"><strong>ah-resque-ui version:</strong> { this.state.version }</a><br />
            </p>
          </Col>

        </Row>
      </div>
    );
  }
});

export default Footer;
