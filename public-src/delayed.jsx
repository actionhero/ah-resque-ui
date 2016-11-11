import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Pagination from './components/pagination.jsx';

const Delayed = React.createClass({
  getInitialState: function(){
    return {
      timer: null,
      refreshInterval: this.props.refreshInterval,
      timestamps: [],
      delayedjobs: {},
      counts: {},
      perPage: 50,
      page: parseInt(this.props.params.page || 0),
    };
  },

  componentWillReceiveProps(nextProps){
    if(nextProps.refreshInterval){
      this.setState({refreshInterval: nextProps.refreshInterval}, ()=>{
        this.loadDelayedJobs();
      });
    }

    if(nextProps.params && nextProps.params.page){
      this.setState({page: nextProps.params.page}, ()=>{
        this.loadDelayedJobs();
      });
    }
  },

  componentDidMount(){
    this.loadDelayedJobs();
  },

  componentWillUnmount(){
    clearTimeout(this.timer);
  },

  loadDelayedJobs(){
    clearTimeout(this.timer);
    if(this.state.refreshInterval > 0){
      this.timer = setTimeout(() => {
        this.loadDelayedJobs();
      }, (this.state.refreshInterval * 1000));
    }

    const client = this.props.client;

    client.action({
      start: (this.state.page * this.state.perPage),
      stop: ((this.state.page * this.state.perPage) + (this.state.perPage - 1))
    }, '/api/resque/delayedjobs', 'GET', (data) => {
      let timestamps = [];
      if(data.delayedjobs){
        Object.keys(data.delayedjobs).forEach(function(t){
          timestamps.push({
            date: new Date(parseInt(t)),
            key: t,
          });
        });
      }

      this.setState({
        counts: {timestamps: data.timestampsCount},
        delayedjobs: data.delayedjobs,
        timestamps: timestamps,
      });
    });
  },

  delDelayed(timestamp, count){
    const client = this.props.client;

    if(confirm('Are you sure?')){
      client.action({
        timestamp: timestamp,
        count: count,
      }, '/api/resque/delDelayed', 'POST', (data) => {
        this.loadDelayedJobs();
      });
    }
  },

  runDelayed(timestamp, count){
    const client = this.props.client;

    client.action({
      timestamp: timestamp,
      count: count,
    }, '/api/resque/runDelayed', 'POST', (data) => {
      this.loadDelayedJobs();
    });
  },

  render(){
    let argCounter = 0;
    let index = 0;

    return(
      <div>
        <h1>Delayed Jobs</h1>

        <Row>
          <Col md={12}>
            {
              this.state.timestamps.map((t) => {
                index = -1;
                return(
                  <div key={t.date.getTime()} className="panel panel-primary">
                    <div className="panel-heading">
                      <h3 className="panel-title">{ t.date.toString() }</h3>
                    </div>
                    <div className="panel-body">

                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <td><strong>Class</strong></td>
                            <td><strong>Queue</strong></td>
                            <td><strong>Arguments</strong></td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            this.state.delayedjobs[t.key].map((job) => {
                              index++;
                              return (
                                <tr key={`${t.date.getTime()}-${job.queue}-${JSON.stringify(job.args)}`}>
                                  <td>{ job.class }</td>
                                  <td><a href={`/resque/#/queue/${job.queue}`}>{ job.queue }</a></td>
                                  <td>
                                    <ul>
                                      {
                                        job.args.map((a) => {
                                          argCounter++;
                                          return <li key={`arg-${argCounter}`}>{JSON.stringify(a)}</li>;
                                        })
                                      }
                                    </ul>
                                  </td>
                                  <td width="100"><button onClick={this.runDelayed.bind(null, t.key, index)} className="btn btn-xs btn-warning">Run Now</button></td>
                                  <td width="100"><button onClick={this.delDelayed.bind(null, t.key, index)} className="btn btn-xs btn-danger">Remove</button></td>
                                </tr>
                              );
                            })
                          }
                        </tbody>
                      </table>

                    </div>
                  </div>
                );
              })
            }

            <Pagination
              page={this.state.page}
              total={this.state.counts.timestamps}
              perPage={this.state.perPage}
              base="/resque/#/delayed"
            />

          </Col>
        </Row>
      </div>
    );
  }
});

export default Delayed;
