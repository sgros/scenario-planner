import React, { Component } from 'react';
import Gantt from './components/Gantt';
import Toolbar from './components/Toolbar';
import './App.css';

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
        console.log("Handling zoom change in app ", zoom);
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