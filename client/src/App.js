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
            planUpdated: false,
            isClearingPlan: false,
            planCleared: false,
            projectImported: false
        }
        this.getGanttActions = this.getGanttActions.bind(this);
        this.calculatePlan = this.calculatePlan.bind(this);
        this.clearPlan = this.clearPlan.bind(this);
        this.handleProjectImport = this.handleProjectImport.bind(this);
    }

    handleProjectImport(){
        console.log("Importing project.")
        this.setState({
            projectImported: true
        });
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

    async clearPlan(){
        console.log("Clearing plan...");
        this.setState({
            isClearingPlan:true
        })
        await fetch('http://localhost:8080/gantt/clear').then(res => res.json()).then(data => {
            this.setState({
                isClearingPlan: false,
                planCleared: true
            });
            console.log("Clearing is done");
        });
    }


    handleZoomChange = (zoom) => {
        console.log("Handling zoom change in app ", zoom);
        this.setState({
            currentZoom: zoom
        });
    }

    shouldComponentUpdate(nextProps, nextState){
        console.log(nextState);
        if(nextState.isFetchingActions || nextState.isCalculatingPlan || nextState.isClearingPlan){
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

        if (prevState.planCleared){
            this.setState({
                planCleared:false
            });
        }

        if (prevState.projectImported){
            this.setState({
                projectImported: false
            });
        }
    }

    render() {
        console.log("Rendering app.");
        var currentZoom = this.state.currentZoom;
        var ganttActions = this.state.actions;
        var planUpdated = this.state.planUpdated;
        var planSuccessful = this.state.planSuccessful;
        var planCleared = this.state.planCleared;
        var projectImported = this.state.projectImported;
        console.log("Gantt actions: ", ganttActions);
        return (
            <div className="app-container">
                <div className="zoom-bar">
                    <Toolbar
                        zoom={currentZoom}
                        onZoomChange={this.handleZoomChange}
                        onActionsUpload={this.getGanttActions}
                        onCalculatePlan={this.calculatePlan}
                        onClearPlan={this.clearPlan}
                        onProjectImport={this.handleProjectImport}
                    />
                </div>
                <div className="gantt-container" style={{ width: '100%', height: '100%' }}>
                    <Gantt
                        zoom={currentZoom}
                        actions={ganttActions}
                        planUpdated={planUpdated}
                        planSuccessful={planSuccessful}
                        planCleared={planCleared}
                        projectImported={projectImported}
                    />
                </div>
            </div>
        );
    }
 }
 export default App;