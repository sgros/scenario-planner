import React, { Component } from 'react';
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
      constructor(props){
        super(props);
        this.state = {
            currentZoom: 'Days',
            currentTime: "0"
        }
    }

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
        var currentZoom = this.state.currentZoom;
        console.log(currentZoom);
        return (
            <div className="app-container">
                <div className="zoom-bar">
                    <Toolbar
                        zoom={currentZoom}
                        onZoomChange={this.handleZoomChange}
                    />
                </div>
                <div className="gantt-container">
                    <Gantt
                        zoom={currentZoom}
                    />
                </div>
            </div>
        );
    }
 }
 export default App;