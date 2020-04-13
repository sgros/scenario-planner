import React, { Component, useState } from 'react';
import ReactDOM from 'react-dom';
import Gantt from './components/Gantt';
import Toolbar from './components/Toolbar';
import './App.css';

const data = {
    data: [
        { id: 1, text: 'Task #1', start_date: '15-04-2020', duration: 3, progress: 0.6, priority: 2 },
        { id: 2, text: 'Task #2', start_date: '18-04-2020', duration: 3, progress: 0.4, priority: 1 }
    ],
    links: [
        { id: 1, source: 1, target: 2, type: '0' }
    ]
};
class App extends Component {
    state = {
        currentZoom: 'Days',
        currentTime: "0"
    };

    setCurrentTime(){
        fetch('http://localhost:8080/time').then(res => res.json()).then(data => {
            this.setState({
                currentTime: data.time
            });
            console.log("data.time: " + data.time);
        });
    }
    handleZoomChange = (zoom) => {
        this.setState({
            currentZoom: zoom
        });
    }

    render() {
        const { currentZoom } = this.state;
        console.log(this.state);
        //this.setCurrentTime();
        //console.log(this.state.currentTime);
        return (
            <div>
                <div className="gantt-container">
                    <Gantt
                        tasks={data}
                        zoom={currentZoom}
                    />
                </div>
            </div>
        );
    }
 }
 export default App;