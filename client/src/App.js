import React, { Component } from 'react';
import Gantt from './components/Gantt';
import Toolbar from './components/Toolbar';
import './App.css';

class App extends Component {
      constructor(props){
        super(props);
        this.state = {
            currentZoom: 'Days',
            currentTime: "0",
            actions: [],
            isFetchingActions: false
        }
        this.getGanttActions = this.getGanttActions.bind(this);
    }

    async getGanttActions(){
        console.log("Getting Gantt actions");
        this.setState({
            isFetchingActions:true
        })
        await fetch('http://localhost:8080/actions').then(res => res.json()).then(data => {
            this.setState({
                actions: data.actions,
                isFetchingActions:false
            });
            console.log("Loaded actions: ", this.state.actions);
        });
    }

    handleZoomChange = (zoom) => {
        console.log("Handling zoom change in app ", zoom);
        this.setState({
            currentZoom: zoom
        });
    }

    shouldComponentUpdate(nextProps, nextState){
        if(nextState.isFetchingActions){
            return false;
        }
        return true;
    }

    componentDidMount() {
        this.getGanttActions();
    }

    render() {
        console.log("Rendering app.");
        var currentZoom = this.state.currentZoom;
        var ganttActions = this.state.actions;
        console.log("Gantt actions: ", ganttActions);
        return (
            <div className="app-container">
                <div className="zoom-bar">
                    <Toolbar
                        zoom={currentZoom}
                        onZoomChange={this.handleZoomChange}
                        onActionsUpload={this.getGanttActions}
                    />
                </div>
                <div className="gantt-container">
                    <Gantt
                        zoom={currentZoom}
                        actions={ganttActions}
                    />
                </div>
            </div>
        );
    }
 }
 export default App;