"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function ProgressBar(props) {
    return React.createElement(
        "div",
        { className: "mb-1 progress" },
        React.createElement("div", { className: "progress-bar", role: "progressbar", style: { width: props.percentage / 10 + "%" }, "aria-valuenow": "0", "aria-valuemin": "0", "aria-valuemax": "100" })
    );
}

function Timestamp(props) {
    return React.createElement(
        "li",
        { className: "list-group-item" },
        React.createElement(
            "strong",
            null,
            props.label
        ),
        ": ",
        props.time.toLocaleTimeString()
    );
}

function TimestampList(props) {
    var stamps = props.timestamps;
    var listItems = stamps.map(function (stamp) {
        return React.createElement(Timestamp, { label: stamp.label, time: stamp.time });
    });

    return React.createElement(
        "ul",
        { className: "list-group" },
        listItems
    );
}

function padTime(number) {
    var length = arguments.length <= 1 || arguments[1] === undefined ? 2 : arguments[1];

    return String(number).padStart(length, "0");
}

var Timer = function (_React$Component) {
    _inherits(Timer, _React$Component);

    function Timer(props) {
        _classCallCheck(this, Timer);

        var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

        _this.audio = new Audio("https://freesound.org/people/ShadyDave/sounds/273205/download/273205__shadydave__cloudy-day-loop.wav");
        _this.state = {
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
        _this.toggle = _this.toggle.bind(_this);
        return _this;
    }

    Timer.prototype.playSound = function playSound() {
        var _this2 = this;

        this.audio.play();
        setTimeout(function () {
            return _this2.audio.pause();
        }, 4000);
    };

    Timer.prototype.diffTime = function diffTime(prevState) {
        if (prevState.time != null) {
            var currTime = new Date();
            var dt = currTime.getTime() - prevState.lastTimestamp.getTime();
            return prevState.time.getTime() - dt;
        } else {
            return -1;
        }
    };

    Timer.prototype.tick = function tick() {
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
    };

    Timer.prototype.componentDidMount = function componentDidMount() {
        /*this.timerID = setInterval(
        () => this.tick(),
        this.props.tickRate
        )*/
    };

    Timer.prototype.componentWillUnmount = function componentWillUnmount() {
        clearInterval(this.timerID);
    };

    Timer.prototype.toggle = function toggle() {
        var _this3 = this;

        this.setState(function (prevState) {
            var currTime = new Date();
            var newTime = currTime;

            if (prevState.active) {
                var newTime = _this3.diffTime(prevState);
                clearInterval(_this3.timerID);
                return {
                    lastTimestamp: currTime,
                    active: !prevState.active
                };
            } else {
                clearInterval(_this3.timerID);
                _this3.timerID = setInterval(function () {
                    return _this3.tick();
                }, _this3.props.tickRate);
                console.log('Started');
                return { lastTimestamp: currTime, active: !prevState.active };
            }
        });
    };

    Timer.prototype.render = function render() {
        var hours = padTime(this.state.time.getUTCHours());
        var minutes = padTime(this.state.time.getUTCMinutes());
        var seconds = padTime(this.state.time.getUTCSeconds());
        var milliseconds = padTime(this.state.time.getUTCMilliseconds(), 4);
        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "row" },
                React.createElement(
                    "div",
                    { className: "col" },
                    React.createElement(
                        "div",
                        { className: "jumbotron" },
                        React.createElement(
                            "h1",
                            null,
                            React.createElement(
                                "span",
                                { className: "badge " + (this.state.on && !this.state.finished ? "badge-success" : "badge-danger") },
                                this.state.finished ? "FINISHED" : this.state.on ? "ON" : "OFF"
                            )
                        ),
                        React.createElement(ProgressBar, { percentage: this.state.percentage }),
                        React.createElement(
                            "div",
                            { className: "card card-outline-secondary" },
                            React.createElement(
                                "h1",
                                { className: "display-2 border card-block card-title text-center" },
                                minutes,
                                "m ",
                                seconds,
                                "s"
                            )
                        ),
                        React.createElement(
                            "div",
                            { className: "d-flex flex-row-reverse pt-2" },
                            React.createElement(
                                "button",
                                {
                                    type: "button",
                                    className: "btn btn-primary btn-lg",
                                    onClick: this.toggle
                                },
                                this.state.active ? "Pause" : "Start"
                            )
                        )
                    )
                ),
                React.createElement(
                    "div",
                    { className: "mt-5 pt-2 col" },
                    React.createElement(
                        "h1",
                        null,
                        "Timestamps"
                    ),
                    React.createElement(TimestampList, { timestamps: this.state.timestamps })
                )
            )
        );
    };

    return Timer;
}(React.Component);

var app = React.createElement(
    "div",
    null,
    React.createElement(Timer, { tickRate: "100" })
);
ReactDOM.render(app, document.getElementById("root"));
