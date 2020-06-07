import React, { Component } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import $ from "jquery";
import jsonTimestamp from '../../static/config.json';
import jsonAction from '../../static/action.json';
import jsonStateLevelScenario from '../../static/state_level_scenario.json';

export default class Gantt extends Component {
    constructor(props){
        super(props);

        this.configSetup();

        var actionLabel = this.loadActions();
        var priorityList = this.loadPriorities();
        var playersLabel = this.loadPlayers();

        this.state = {
            priority: priorityList,
            actionLabel: actionLabel,
            playersLabel: playersLabel,
            planRecalculated: false
        }
    }

    dataProcessor = null;

    initGanttDataProcessor(){
        this.dataProcessor = gantt.createDataProcessor({
            url: "http://localhost:8080/gantt",
            mode:"REST"
        });
    }

    setZoom(value) {
        switch (value) {
            case 'Hours':
                gantt.config.scale_unit = 'day';
                gantt.config.date_scale = '%d %M';

                gantt.config.scale_height = 60;
                gantt.config.min_column_width = 30;
                gantt.config.subscales = [
                    { unit:'hour', step:1, date:'%H' }
                ];
            break;
            case 'Days':
                gantt.config.min_column_width = 70;
                gantt.config.scale_unit = 'week';
                gantt.config.date_scale = '#%W';
                gantt.config.subscales = [
                    { unit: 'day', step: 1, date: '%d %M' }
                ];
                gantt.config.scale_height = 60;
            break;
            case 'Months':
                gantt.config.min_column_width = 70;
                gantt.config.scale_unit = 'month';
                gantt.config.date_scale = '%F';
                gantt.config.scale_height = 60;
                gantt.config.subscales = [
                    { unit:'week', step:1, date:'#%W' }
                ];
            break;
            default:
            break;
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        console.log(nextProps);
        var actionsUpdated = this.props.actions.length !== nextProps.actions.length;
        var zoomUpdated = this.props.zoom !== nextProps.zoom;
        var planUpdated = nextProps.planUpdated || nextState.planRecalculated || nextProps.planCleared || nextProps.projectImported;

        return actionsUpdated || zoomUpdated || planUpdated;
    }

    componentDidMount() {
        gantt.config.xml_date = "%Y-%m-%d %H:%i";
        gantt.config.show_links = true;

        this.setColumns();

        var taskUpdateHandler = function(id,item){
            console.log(item.failed);
            if (item.failed.includes('step_failed')){
                setTimeout(() => {
                    this.setState({
                        planRecalculated: true
                    });
                }, 200);

            }
        }.bind(this);

        gantt.attachEvent("onAfterTaskUpdate", taskUpdateHandler);

        gantt.attachEvent("onLoadStart", function(){
            gantt.message({id:"calculating", type:"warning", text:"Recalculating plan...", expire:300});
        });

        gantt.attachEvent("onLoadEnd", function(){
            gantt.message.hide("calculating");
        });

        gantt.serverList("actions", [
            {key:1, label:"Initial state"}
        ]);

        var task_sections = [
            { name: "description", height: 50, map_to: "text", type: "textarea", focus: true },
            { name: "time", height: 72, type: "time", map_to: "auto", time_format:["%d","%m","%Y","%H:%i"] },
            { name: "holder", height: 50, map_to:"holder", type:"select",options:this.state.playersLabel},
            { name:"action", height: 50, map_to:"action", type:"select", options:gantt.serverList("actions") },
            { name:"priority", height: 50, map_to:"priority", type:"select", options:this.state.priority },
            {name: "failed", type:"checkbox", map_to: "failed", options:[
                {key:"step_failed", label:"Step failed"}]},
            { name: "preconditions", height: 50, map_to:"preconditions", type:"textarea" },
            { name: "effects", height: 50, map_to:"effects", type:"textarea" }
        ];

        gantt.locale.labels["section_holder"] = "Holder";
        gantt.locale.labels["section_action"] = "Action";
        gantt.locale.labels["section_priority"] = "Priority";
        gantt.locale.labels["section_failed"] = "";
        gantt.locale.labels["section_preconditions"] = "Preconditions";
        gantt.locale.labels["section_effects"] = "Effects";

        gantt.config.lightbox.sections = task_sections;

        gantt.init(this.ganttContainer);
        gantt.load("http://localhost:8080/gantt");
        this.initGanttDataProcessor();
        this.dataProcessor.init(gantt);

        const script = document.createElement("script");
        script.async = true;
        script.src = "http://export.dhtmlx.com/gantt/api.js";
        script.id = "ganttApi";
        document.body.appendChild(script);
        document.head.appendChild(script);
    }

    componentWillUnmount() {
        if (this.dataProcessor) {
            this.dataProcessor.destructor();
            this.dataProcessor = null;
        }
    }

    componentDidUpdate() {
        console.log("Component did update -> gantt.render");
        if (this.props.planUpdated || this.state.planRecalculated || this.props.planCleared || this.props.projectImported){
            if (!this.props.planSuccessful && (!this.state.planRecalculated && !this.props.planCleared && !this.props.projectImported)){
                console.log("Error message");
                gantt.message({type:"error", text:"Impossible to generate a plan for a given set of goals.",expire:5000});
            }
            if (this.state.planRecalculated){
                this.setState({
                    planRecalculated: false
                });
            }

            console.log("It also loaded tasks.");
            gantt.init(this.ganttContainer);
            gantt.clearAll();
            gantt.load("http://localhost:8080/gantt");
            this.initGanttDataProcessor();
            this.dataProcessor.init(gantt);
        }
        gantt.render();
    }

    loadActions(){
        var actionLabel = [];
        var keys = Object.keys(jsonAction.actions);
        $.each(keys, function(i, val) {
            actionLabel.push({"key": i, "label": val})
        });

        return actionLabel;
    }

    loadPriorities(){
        var priorityList = [];
        var priorities = "";
        $.each(jsonTimestamp.priority, function(i, val) {
            priorityList.push({"key": i, "label": val})
            priorities += ";{ key:" + i + ", label:" + val +"}";
        });
        for(let r in priorityList){$('#priority').append($('<option>',{value: r,text: priorityList[r]}))}

        gantt.locale.labels["PriorityList"] = priorities;
        return priorityList;
    }

    loadPlayers(){
        var playersLabel = [];
        var cpt = 0;
        $.each(jsonStateLevelScenario.players, function(i, val) {
            $.each(val.actors, function(y, val2) {
                playersLabel.push({"key": cpt, "label": i + "." + val2.name})
                cpt++;
            })
        });
        for(let r in playersLabel){$('#holder').append($('<option>',{value: r,text: playersLabel[r]["label"]}))}

        return playersLabel;
    }

    setColumns(){
        gantt.config.columns = [
            {name:"text",       label:"Task name",  tree:true, width: 250 },
            {name:"start_date", label:"Start time", align:"center", resize: true, width: 100 },
            {name:"add",        label:"",           width:44 }
        ];
    }

    configSetup() {
      gantt.config.wide_form = 1;
      gantt.config.work_time = true;
      gantt.config.order_branch = true;
      gantt.config.autoscroll = true;
      gantt.config.auto_scheduling = true;
      gantt.config.autoscroll_speed = 100;
      gantt.config.fit_tasks = true;
      gantt.config.scale_height = 50;
      gantt.config.min_column_width = 100;
      gantt.config.open_tree_initially = true;
      gantt.config.duration_unit = "minute";
      gantt.config.time_step = 1;
      gantt.config.round_dnd_dates = false;
      gantt.config.buttons_left = ["dhx_save_btn", "dhx_cancel_btn"];
      gantt.config.buttons_right = ["dhx_delete_btn"];
    }

    render() {
        var zoom = this.props.zoom;
        var actions = this.props.actions;
        gantt.updateCollection("actions", actions);
        this.setZoom(zoom);
        console.log("Gantt rendering, zoom set to ", zoom);
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div
                    ref={(input) => { this.ganttContainer = input }}
                    style={{ width: '100%', height: '100%' }}
                >
                </div>
            </div>
        );
    }
}