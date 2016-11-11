import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Client from './client.jsx';

import NotificationZone from './notificationZone.jsx';
import Navigation from './navigation.jsx';
import Footer from './footer.jsx';

const Page = React.createClass({
  getInitialState: function(){
    return {
      client: new Client(),
      user: {},
      refreshInterval: 5,
      error: {
        title: '',
        body: '',
      }
    };
  },

  notify(message, level){
    this.setState({error: {
      level: level,
      message: message,
    }});
  },

  componentDidMount: function(){
    const client = this.state.client;
    client.notify = this.notify;
  },

  handleRefreshIntervalChangeUpdate(event){
    this.setState({refreshInterval: event.target.value});
  },

  render: function(){
    const childrenWithProps = React.Children.map(this.props.children,
      (child) => React.cloneElement(child, this.state)
    );

    return(
      <Grid>

        <Row>
          <Col md={12}>
            <Navigation {...this.state} handleRefreshIntervalChangeUpdate={this.handleRefreshIntervalChangeUpdate}/>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <NotificationZone
              level={this.state.error.level}
              message={this.state.error.message}
            />
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            {childrenWithProps}
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Footer {...this.state}/>
          </Col>
        </Row>

      </Grid>
    );
  }
});

export default Page;
