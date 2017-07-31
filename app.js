function ProgressBar(props) {
  return (<div className="mb-1 progress">
                  <div className="progress-bar" role="progressbar" style={{width: props.percentage / 10 + "%"}} aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
              </div>);
}

function Timestamp(props) {
    return <li className="list-group-item"><strong>{props.label}</strong>: {props.time.toLocaleTimeString()}</li>;
}

function TimestampList(props) {
    const stamps = props.timestamps;
    const listItems = stamps.map(stamp =>
        <Timestamp label={stamp.label} time={stamp.time} />
    );

    return <ul className="list-group">{listItems}</ul>;
}

function padTime(number, length = 2) {
    return String(number).padStart(length, "0");
}
class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.audio = new Audio(
            "https://freesound.org/people/ShadyDave/sounds/273205/download/273205__shadydave__cloudy-day-loop.wav"
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
            total: (20 + 10 + 10 + 10 + 10) * 60 * 1000
        };
        this.toggle = this.toggle.bind(this);
    }

    playSound() {
        this.audio.play();
        setTimeout(() => this.audio.pause(), 4000);
    }

    diffTime(prevState) {
        if (prevState.time != null) {
          var currTime = new Date();
          var dt = currTime.getTime() - prevState.lastTimestamp.getTime();
          return prevState.time.getTime() - dt;
        } else {
          return -1
        }
    }
    tick() {
        this.setState(function (prevState, props) {
            var stage = prevState.stage;
            var currTime = new Date();
            var newTime = this.diffTime(prevState);
            var dt = prevState.time.getTime() - newTime;
            var accumulated = prevState.accumulated + dt;
            var percentage = Math.round(1000 * accumulated / prevState.total);
            var timestamps = prevState.timestamps;
            if (!prevState.timestamps.length) {
                timestamps.push({ label: "Begin", time: currTime });
            }
            if (prevState.time != null && newTime > 0) {
                return {
                    accumulated: accumulated,
                    percentage: percentage,
                    timestamps: timestamps,
                    lastTimestamp: currTime,
                    time: new Date(newTime)
                };
            } else {
                var newTime = prevState.phases[++stage] * 60 * 1000 + newTime;
                if (newTime) {
                    var newLabel = prevState.on ? "Stop: " : "Start: ";
                    timestamps.push({ label: newLabel, time: currTime });
                    this.playSound();
                    return {
                        accumulated: accumulated,
                        percentage: percentage,
                        timestamps: timestamps,
                        on: !prevState.on,
                        phases: prevState.phases,
                        stage: stage,
                        lastTimestamp: currTime,
                        time: new Date(newTime)
                    };
                } else {
                    timestamps.push({ label: "End: ", time: currTime });
                    clearInterval(this.timerID);
                    this.playSound();
                    return {
                        accumulated: accumulated,
                        percentage: 1000,
                        timestamps: timestamps,
                        lastTimestamp: currTime,
                        finished: true,
                        time: new Date(0)
                    };
                }
            }
        });
    }

    componentDidMount() {
        /*this.timerID = setInterval(
        () => this.tick(),
        this.props.tickRate
      )*/
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    toggle() {
        this.setState(prevState => {
            var currTime = new Date();
            var newTime = currTime;

            if (prevState.active) {
                var newTime = this.diffTime(prevState);
                clearInterval(this.timerID);
                return {
                    lastTimestamp: currTime,
                    active: !prevState.active
                };
            } else {
                clearInterval(this.timerID);
                this.timerID = setInterval(() => this.tick(), this.props.tickRate);
                console.log('Started');
                return { lastTimestamp: currTime, active: !prevState.active };
            }
        });
    }

    render() {
          const hours = padTime(this.state.time.getUTCHours());
          const minutes = padTime(this.state.time.getUTCMinutes());
          const seconds = padTime(this.state.time.getUTCSeconds());
          const milliseconds = padTime(this.state.time.getUTCMilliseconds(), 4);
        return (
            <div>
              <div className="row">
                  <div className="col">
                      <div className="jumbotron">
                          <h1>
                              <span className={"badge " + (this.state.on && !this.state.finished ? "badge-success" : "badge-danger") }>
                                {this.state.finished ? "FINISHED" : this.state.on ? "ON" : "OFF" }
                              </span>            
                          </h1>
                        <ProgressBar percentage={this.state.percentage} />
                          <div className="card card-outline-secondary">
                              <h1 className="display-2 border card-block card-title text-center">
                                  {minutes}m {seconds}s
                  </h1>
                          </div>
                          <div className="d-flex flex-row-reverse pt-2">
                              <button
                                  type="button"
                                  className="btn btn-primary btn-lg"
                                  onClick={this.toggle}
                              >
                                  {this.state.active ? "Pause" : "Start"}
                              </button>
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
ReactDOM.render(app, document.getElementById("root"));
