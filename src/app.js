import React from 'react';
import ReactDOM from 'react-dom';

function diffTime(prevState) {
  if (prevState.time != null) {
    const currTime = new Date();
    const dt = currTime.getTime() - prevState.lastTimestamp.getTime();
    return prevState.time.getTime() - dt;
  }
  return -1;
}

function ProgressBar(props) {
  return (<div className="mb-1 progress">
    <div className="progress-bar" role="progressbar" style={{ width: `${props.percentage / 10}%` }} aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
  </div>);
}

function ToggleButton(props) {
  return (<button
    type="button"
    className="btn btn-primary btn-lg"
    onClick={props.toggle}
  >
    {props.active ? 'Pause' : 'Start'}
  </button>);
}

function ResetButton(props) {
  return (<button
    type="button"
    className="btn btn-secondary btn-lg"
    onClick={props.reset}
  >Reset</button>
  );
}

function ActiveLabel(props) {
  let label;
  if (props.finished) {
    label = 'FINISHED';
  } else if (props.on) {
    label = 'ON';
  } else {
    label = 'OFF';
  }
  return (<span className={`badge ${props.on && !props.finished ? 'badge-success' : 'badge-danger'}`}>
    {label}
  </span>);
}

function Timestamp(props) {
  return <li className="list-group-item">
    <strong>{props.label}</strong>: {props.time.toLocaleTimeString()}
  </li>;
}

function TimestampList(props) {
  const stamps = props.timestamps;
  const listItems = stamps.map((stamp, index) =>
    <Timestamp key={index} label={stamp.label} time={stamp.time} />,
  );

  return <ul className="list-group">{listItems}</ul>;
}

function padTime(number, length = 2) {
  return String(number).padStart(length, '0');
}

class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.audio = new Audio(
      '273205__shadydave__cloudy-day-loop.wav',
    );
    this.state = {
      on: true,
      active: false,
      accumulated: 0,
      complete: false,
      phases: [20, 10, 10, 10, 10],
      stage: 0,
      lastTimestamp: new Date(),
      timestamps: [],
      time: new Date(20 * 60 * 1000),
      total: (20 + 10 + 10 + 10 + 10) * 60 * 1000,
    };
    this.toggle = this.toggle.bind(this);
    this.reset = this.reset.bind(this);
  }

  playSound() {
    this.audio.play();
    setTimeout(() => this.audio.pause(), 4000);
  }


  tick() {
    this.setState((prevState) => {
      let stage = prevState.stage;
      const currTime = new Date();
      let newTime = diffTime(prevState);
      const dt = prevState.time.getTime() - newTime;
      const accumulated = prevState.accumulated + dt;
      const percentage = Math.round((1000 * accumulated) / prevState.total);
      const timestamps = prevState.timestamps;
      if (!prevState.timestamps.length) {
        timestamps.push({ label: 'Begin', time: currTime });
      }
      if (prevState.time != null && newTime > 0) {
        return {
          accumulated,
          percentage,
          timestamps,
          lastTimestamp: currTime,
          time: new Date(newTime),
        };
      }
      stage += 1;
      newTime = (prevState.phases[stage] * 60 * 1000) + newTime;
      if (newTime) {
        const newLabel = prevState.on ? 'Stop: ' : 'Start: ';
        timestamps.push({ label: newLabel, time: currTime });
        this.playSound();
        return {
          accumulated,
          percentage,
          timestamps,
          on: !prevState.on,
          phases: prevState.phases,
          stage,
          lastTimestamp: currTime,
          time: new Date(newTime),
        };
      }
      timestamps.push({ label: 'End: ', time: currTime });
      clearInterval(this.timerID);
      this.playSound();

      return {
        accumulated,
        percentage: 1000,
        timestamps,
        lastTimestamp: currTime,
        finished: true,
        time: new Date(0),
      };
    },
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  reset() {
    if (this.timerID) {
      clearInterval(this.timerID);
    }
    this.setState(() => ({
      on: true,
      active: false,
      accumulated: 0,
      complete: false,
      phases: [20, 10, 10, 10, 10],
      stage: 0,
      lastTimestamp: new Date(),
      timestamps: [],
      time: new Date(20 * 60 * 1000),
      total: (20 + 10 + 10 + 10 + 10) * 60 * 1000,
    }));
  }

  toggle() {
    this.setState((prevState) => {
      const currTime = new Date();
      const timestamps = prevState.timestamps;
      if (prevState.active) {
        timestamps.push({ label: 'Paused', time: currTime });
        clearInterval(this.timerID);
        return { lastTimestamp: currTime, active: !prevState.active, timestamps };
      }
      clearInterval(this.timerID);
      if (prevState.timestamps.length > 0 || prevState.time < new Date(20 * 60 * 1000)) {
        timestamps.push({ label: 'Resumed', time: currTime });
      }
      this.timerID = setInterval(() => this.tick(), this.props.tickRate);
      return { lastTimestamp: currTime, active: !prevState.active, timestamps };
    });
  }

  render() {
    // const hours = padTime(this.state.time.getUTCHours());
    const minutes = padTime(this.state.time.getUTCMinutes());
    const seconds = padTime(this.state.time.getUTCSeconds());
    // const milliseconds = padTime(this.state.time.getUTCMilliseconds(), 4);
    return (
      <div>
        <div className="row">
          <div className="col">
            <div className="jumbotron">
              <h1>
                <ActiveLabel on={this.state.on} finished={this.state.finished} />
              </h1>
              <ProgressBar percentage={this.state.percentage} />
              <div className="card card-outline-secondary">
                <h1 className="display-2 border card-block card-title text-center">
                  {minutes}m {seconds}s
                </h1>
              </div>
              <div className="d-flex justify-content-between pt-2">
                <ResetButton reset={this.reset} />
                <ToggleButton toggle={this.toggle} active={this.state.active} />
              </div>
            </div>
          </div>
          <div className="mt-5 pt-2 col">
            <h1>Timestamps</h1>
            <TimestampList timestamps={this.state.timestamps} />
          </div>
        </div>
      </div>
    );
  }
}
const app = (
  <div>
    <Timer tickRate="100" />
  </div>
);

ReactDOM.render(app, document.getElementById('root'));
