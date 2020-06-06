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
            isFetchingActions: false,
            isCalculatingPlan: false,
            planSuccessful: true,
            planUpdated: false
        }
        this.getGanttActions = this.getGanttActions.bind(this);
        this.calculatePlan = this.calculatePlan.bind(this);
    }

    async getGanttActions(){
        console.log("Getting Gantt actions...");
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

    async calculatePlan(){
        console.log("Planning actions...");
        this.setState({
            isCalculatingPlan:true
        })
        await fetch('http://localhost:8080/gantt/plan').then(res => res.json()).then(data => {
            this.setState({
                planSuccessful: data.success,
                isCalculatingPlan:false,
                planUpdated: true
            });
            console.log("Planning is done: ", this.state.planSuccessful);
        });
    }

    handleZoomChange = (zoom) => {
        console.log("Handling zoom change in app ", zoom);
        this.setState({
            currentZoom: zoom
        });
    }

    shouldComponentUpdate(nextProps, nextState){
        if(nextState.isFetchingActions || nextState.isCalculatingPlan){
            return false;
        }
        return true;
    }

    componentDidMount() {
        this.getGanttActions();
    }

    componentDidUpdate(prevProps, prevState){
        if (prevState.planUpdated){
            this.setState({
                planUpdated:false
            });
        }
    }

    render() {
        console.log("Rendering app.");
        var currentZoom = this.state.currentZoom;
        var ganttActions = this.state.actions;
        var planUpdated = this.state.planUpdated;
        var planSuccessful = this.state.planSuccessful;
        console.log("Gantt actions: ", ganttActions);
        return (
            <div className="app-container">
                <div className="zoom-bar">
                    <Toolbar
                        zoom={currentZoom}
                        onZoomChange={this.handleZoomChange}
                        onActionsUpload={this.getGanttActions}
                        onCalculatePlan={this.calculatePlan}
                    />
                </div>
                <div className="gantt-container">
                    <Gantt
                        zoom={currentZoom}
                        actions={ganttActions}
                        planUpdated={planUpdated}
                        planSuccessful={planSuccessful}
                    />
                </div>
            </div>
        );
    }
 }
 export default App;