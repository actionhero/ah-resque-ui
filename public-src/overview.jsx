import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ReactHighcharts from 'react-highcharts';

const Dashboard = React.createClass({
  getInitialState(){
    return {
      timer: null,
      refreshInterval: this.props.refreshInterval,
      queues: {},
      workers: [],
      stats: {},
      counts: {},
      chartConfig: {
        chart: {
          type: 'spline',
          // events: {
          //   load: function(){ $scope.chart = this; }
          // }
        },
        title: 'null',
        xAxis: {
          type: 'datetime',
          tickPixelInterval: 150
        },
        yAxis: {
          title: {
            text: 'Queue Length'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          floating: true,
        },
        exporting: {enabled: true},
        series: [],
      },
    };
  },

  componentWillReceiveProps(nextProps){
    if(nextProps.refreshInterval){
      this.setState({refreshInterval: nextProps.refreshInterval}, ()=>{
        this.loadDetails();
      });
    }
  },

  componentDidMount(){
    this.loadDetails();
  },

  componentWillUnmount(){
    clearTimeout(this.timer);
  },

  loadFailedCount(){
    const client = this.props.client;
    client.action({}, '/api/resque/resqueFailedCount', 'GET', (data) => {
      let counts = this.state.counts;
      counts.failed = data.failedCount;
      this.setState({counts: counts});
    });
  },

  loadDetails(){
    clearTimeout(this.timer);
    if(this.state.refreshInterval > 0){
      this.timer = setTimeout(() => {
        this.loadDetails();
      }, (this.state.refreshInterval * 1000));
    }

    const client = this.props.client;

    client.action({}, '/api/resque/resqueDetails', 'GET', (data) => {
      this.setState({
        queues: data.resqueDetails.queues,
        workers: data.resqueDetails.workers,
        stats: data.resqueDetails.stats,
        counts: {
          queues: Object.keys(data.resqueDetails.queues).length,
          workers: Object.keys(data.resqueDetails.workers).length,
        }
      }, () => {
        this.loadFailedCount();

        Object.keys(this.state.queues).forEach((q) => {
          let found = false;
          let point = {x: new Date().getTime(), y: this.state.queues[q].length};
          this.state.chartConfig.series.forEach((s) => {
            if(s.name === q){
              found = true;
              s.data.push(point);
              while(s.data.length > 100){ s.data.shift(); }
            }
          });
          if(!found){
            this.state.chartConfig.series.push({
              name: q,
              animation: false,
              data: [point],
            });
          }
        });

        this.setState({chartConfig: this.state.chartConfig});

        Object.keys(this.state.workers).forEach((workerName) => {
          var worker = this.state.workers[workerName];
          if(typeof worker === 'string'){
            this.state.workers[workerName] = {
              status: worker,
              statusString: worker,
            };
          }else{
            worker.delta = Math.round((new Date().getTime() - new Date(worker.run_at).getTime()) / 1000);
            worker.statusString = 'working on ' + worker.queue + '#' + worker.payload.class + ' for ' + worker.delta + 's';
          }
        });
      });
    });
  },

  render(){
    return(
      <div>
        <h1>Resque Overview</h1>

        <Row>
          <Col md={3}>
            <h3>Stats:</h3>
            <table className="table table-hover">
              <tbody>

                {
                  Object.keys(this.state.stats).map((k) => {
                    let v = this.state.stats[k];
                    if(k.indexOf(':') > 0){ return null; }

                    return(
                      <tr key={k}>
                        <td>{k}</td>
                        <td>{v}</td>
                      </tr>
                    );
                  })
                }

              </tbody>
            </table>
          </Col>
          <Col md={9}>
            <ReactHighcharts
              isPureConfig={false}
              ref="chart"
              config={ this.state.chartConfig }
              domProps={{
                style: {
                  minWidth: '310px',
                  height: '300px',
                  margin: '0'
                }
              }
            } />
          </Col>
        </Row>

        <Row>
        <Col md={4}>
          <h2>Queues ({ this.state.counts.queues })</h2>

          <table className="table table-striped table-hover ">
            <thead>
              <tr>
                <th>Queue Name</th>
                <th>Jobs</th>
              </tr>
            </thead>
            <tbody>
              <tr className={ this.state.counts.failed > 0 ? 'danger' : '' }>
                <td><strong><a href="/resque/#/failed">failed</a></strong></td>
                <td><strong>{ this.state.counts.failed || 0 }</strong></td>
              </tr>

              {
                Object.keys(this.state.queues).map((q) => {
                  return (
                    <tr key={q}>
                      <td><a href={`/resque/#/queue/${q}`}>{ q }</a></td>
                      <td>{this.state.queues[q].length}</td>
                    </tr>
                  );
                })
              }

            </tbody>
          </table>
        </Col>

        <Col md={8}>
          <h2>Workers ({ this.state.counts.workers })</h2>

          <table className="table table-striped table-hover ">
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>

              {
                Object.keys(this.state.workers).map((name) => {
                  let worker = this.state.workers[name];
                  return (
                    <tr key={name}>
                      <td><span className={ worker.delta > 0 ? 'text-success' : ''}>{ name }</span></td>
                      <td><span className={ worker.delta > 0 ? 'text-success' : ''}>{ worker.statusString }</span></td>
                    </tr>
                  );
                })
              }

            </tbody>
          </table>
        </Col>
      </Row>

    </div>
    );
  },

});

export default Dashboard;
