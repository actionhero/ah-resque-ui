import React from 'react'
import {Link} from 'react-router'
import {Row, Col} from 'react-bootstrap'
import ReactHighcharts from 'react-highcharts'
const numeral = require('numeral');

const Overview = React.createClass({
  prevState: null,
  change: {},

  getInitialState () {
    return {
      timer: null,
      onlySlow: true,
      refreshInterval: parseInt(this.props.refreshInterval),
      queues: {},
      workers: [],
      stats: {},
      counts: {},
      chartConfig: {
        chart: {
          type: 'spline'
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
          floating: true
        },
        exporting: {enabled: true},
        series: []
      }
    }
  },

  componentWillReceiveProps (nextProps) {
    if (nextProps.refreshInterval !== this.state.refreshInterval) {
      this.setState({refreshInterval: parseInt(nextProps.refreshInterval)}, () => {
        this.loadDetails()
      })
    }
  },

  componentDidUpdate(prevProps, prevState) {
    this.prevState = prevState;
  },

  componentDidMount () {
    this.loadDetails()
  },

  componentWillUnmount () {
    clearTimeout(this.timer)
  },

  loadFailedCount () {
    const client = this.props.client;
    client.action({}, '/api/resque/resqueFailedCount', 'GET', (data) => {
      let counts = this.state.counts;
      counts.failed = data.failedCount;
      this.setState({counts: counts})
    })
  },

  loadDetails () {
    clearTimeout(this.timer);

    if (this.state.refreshInterval > 0) {
      this.timer = setTimeout(() => {
        this.loadDetails()
      }, (this.state.refreshInterval * 1000))
    }

    const client = this.props.client;

    client.action({}, '/api/resque/resqueDetails', 'GET', (data) => {
      this.setState({
        queues: (data.resqueDetails.queues || {}),
        workers: (data.resqueDetails.workers || []),
        stats: (data.resqueDetails.stats || {}),
        counts: {
          queues: Object.keys(data.resqueDetails.queues).length || 0,
          workers: Object.keys(data.resqueDetails.workers).length || 0
        }
      }, () => {
        this.loadFailedCount();

        Object.keys(this.state.queues).forEach((q) => {
          let found = false;
          let point = {x: new Date().getTime(), y: this.state.queues[q].length};
          this.state.chartConfig.series.forEach((s) => {
            if (s.name === q) {
              found = true;
              s.data.push(point);
              while (s.data.length > 100) {
                s.data.shift()
              }
            }
          });
          if (!found) {
            this.state.chartConfig.series.push({
              name: q,
              animation: false,
              data: [point]
            })
          }
        });

        this.setState({chartConfig: this.state.chartConfig});

        Object.keys(this.state.workers).forEach((workerName) => {
          let worker = this.state.workers[workerName];
          if (typeof worker === 'string') {
            this.state.workers[workerName] = {
              status: worker,
              statusString: worker
            }
          } else {
            worker.delta = Math.round((new Date().getTime() - new Date(worker.run_at).getTime()) / 1000)
            worker.statusString = 'working on ' + worker.queue + '#' + worker.payload.class + ' for ' + worker.delta + 's'
          }
        })
      })
    })
  },

  clearAllSlow(){
    const client = this.props.client;
    Object.keys(this.state.workers).map((workerName) => {
      let worker = this.state.workers[workerName];
      if (worker.delta >= 30) {
        client.action({workerName}, '/api/resque/forceCleanWorker', 'POST', (data) => null);
      }
    });
  },

  retryFailed(){
    const client = this.props.client;
    client.action({}, '/api/resque/retryAndRemoveAllFailed', 'POST', (data) => null);
  },

  render () {

    let totalSlow = 0;
    let workersGrouped = {};

    Object.keys(this.state.workers).map((name) => {
      let serverName = name.split('(')[1].split(')')[0];
      let init = {
        slow: {},
        quick: {},
      };
      workersGrouped[serverName] = typeof workersGrouped[serverName] === 'undefined' ? init : workersGrouped[serverName];

      let queue = name.split(' ')[0];
      workersGrouped[serverName].slow[queue] = typeof workersGrouped[serverName].slow[queue] === 'undefined' ? 0 : workersGrouped[serverName].slow[queue];
      workersGrouped[serverName].quick[queue] = typeof workersGrouped[serverName].quick[queue] === 'undefined' ? 0 : workersGrouped[serverName].quick[queue];

      let worker = this.state.workers[name];
      if (worker.delta && worker.delta >= 30) {
        totalSlow++;
        workersGrouped[serverName].slow[queue]++;
      } else {
        workersGrouped[serverName].quick[queue]++;
      }
    });

    let stats = [];

    Object.keys(workersGrouped).forEach((key) => {
      stats.push(
        <tr key={key}>
          <td>{key}</td>
          <td>{workersGrouped[key].slow.httpStatus}</td>
          <td>{workersGrouped[key].slow.screenshot}</td>
          <td>{workersGrouped[key].quick.httpStatus}</td>
          <td>{workersGrouped[key].quick.screenshot}</td>
        </tr>
      );
    });

    stats =
      <table style={{width: '100%'}}>
        <tbody>
        <tr style={{fontWeight: 600}}>
          <td>Server</td>
          <td>slow http status</td>
          <td>slow screenshots</td>
          <td>quick http status</td>
          <td>quick screenshots</td>
        </tr>
        {stats}
        </tbody>
      </table>;


    return (
      <div>
        <h1>Resque Overview</h1>

        <Row>
          <Col md={3}>
            <h3>Stats:</h3>
            <table className='table table-hover'>
              <tbody>

              {
                Object.keys(this.state.stats).map((k) => {
                  let v = this.state.stats[k];
                  let was = this.prevState && this.prevState.stats[k] ? this.prevState.stats[k] : 0;
                  if (was !== 0 && was !== v) {
                    this.change[k] = v - was;
                  }
                  if (k.indexOf(':') > 0) {
                    return null
                  }

                  return (
                    <tr key={k}>
                      <td>{k}</td>
                      <td>{numeral(v).format('0,0')}</td>
                      <td
                        style={{color: 'green'}}
                      >
                        {`${this.change[k] > 0 ? '+' : ''}${numeral(this.change[k]).format('0,0')}`}
                      </td>
                    </tr>
                  )
                })
              }

              </tbody>
            </table>
          </Col>
          <Col md={9}>
            <ReactHighcharts
              isPureConfig={false}
              ref='chart'
              config={this.state.chartConfig}
              domProps={{
                style: {
                  minWidth: '310px',
                  height: '300px',
                  margin: '0'
                }
              }}/>
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <h2>Queues ({ this.state.counts.queues })</h2>

            <table className='table table-striped table-hover '>
              <thead>
              <tr>
                <th>Queue Name</th>
                <th>Jobs</th>
              </tr>
              </thead>
              <tbody>
              <tr className={this.state.counts.failed > 0 ? 'danger' : ''}>
                <td><strong><Link to='failed'>failed</Link></strong></td>
                <td><strong>{ this.state.counts.failed || 0 }</strong></td>
              </tr>

              {
                Object.keys(this.state.queues).map((q) => {
                  return (
                    <tr key={q}>
                      <td><Link to={`queue/${q}`}>{ q }</Link></td>
                      <td>{numeral(this.state.queues[q].length).format('0,0')}</td>
                    </tr>
                  )
                })
              }

              </tbody>
            </table>
          </Col>

          <Col md={8}>
            <h2>Workers total: { numeral(this.state.counts.workers).format('0,0') } slow: {totalSlow}</h2>
            <div>{stats}</div>

            <button
              style={{fontWeight: this.state.onlySlow ? 900 : 100}}
              onClick={() => this.setState({onlySlow: true})}
            >
              Only slow
            </button>
            <button
              style={{fontWeight: this.state.onlySlow ? 100 : 900}}
              onClick={() => this.setState({onlySlow: false})}
            >
              Show all
            </button>
            <button onClick={() => this.clearAllSlow()}>Clear all slow workers</button>
            <button onClick={() => this.retryFailed()}>Retry all failed jobs</button>
            <table className='table table-striped table-hover '>
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
                  if (this.state.onlySlow === true) {
                    if (!worker.delta || worker.delta < 30) {
                      return null;
                    }
                  }
                  return (
                    <tr key={name}>
                      <td><span className={worker.delta > 0 ? 'text-success' : ''}>{ name }</span></td>
                      <td><span className={worker.delta > 0 ? 'text-success' : ''}>{ worker.statusString }</span></td>
                    </tr>
                  )
                })
              }

              </tbody>
            </table>
          </Col>
        </Row>

      </div>
    )
  }

})

export default Overview
