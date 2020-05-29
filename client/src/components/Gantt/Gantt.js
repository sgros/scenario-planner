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

        gantt.config.xml_date = "%Y-%m-%d %H:%i";
        this.configSetup();

        var actionLabel = this.loadActions();
        var priorityList = this.loadPriorities();
        var playersLabel = this.loadPlayers();

        this.state = {
            priority: priorityList,
            actionLabel: actionLabel,
            playersLabel: playersLabel
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

    shouldComponentUpdate(nextProps) {
        var actionsUpdated = this.props.actions.length !== nextProps.actions.length;
        var zoomUpdated = this.props.zoom !== nextProps.zoom;

        return actionsUpdated || zoomUpdated;
    }

    componentDidMount() {
        this.setColumns();

        gantt.serverList("actions", [
            {key:1, label:"Initial state"}
        ]);

        var task_sections = [
            { name: "description", height: 50, map_to: "text", type: "textarea", focus: true },
            { name: "time", height: 72, type: "time", map_to: "auto", time_format:["%d","%m","%Y","%H:%i"] },
            { name: "holder", height: 50, map_to:"holder", type:"select",options:this.state.playersLabel},
            { name:"action", height: 50, map_to:"action", type:"select", options:gantt.serverList("actions") },
            { name:"priority", height: 50, map_to:"priority", type:"select", options:this.state.priority },
            { name: "success_rate", height: 50, map_to:"success_rate", type:"textarea" }
        ];

        gantt.locale.labels["section_holder"] = "Holder";
        gantt.locale.labels["section_action"] = "Action";
        gantt.locale.labels["section_priority"] = "Priority";
        gantt.locale.labels["section_success_rate"] = "Success rate";

        gantt.config.lightbox.sections = task_sections;

        gantt.init(this.ganttContainer);
        gantt.load("http://localhost:8080/gantt");
        this.initGanttDataProcessor();
    }

    componentWillUnmount() {
        if (this.dataProcessor) {
            this.dataProcessor.destructor();
            this.dataProcessor = null;
        }
    }

    componentDidUpdate() {
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
        {name:"text",       label:"Task name",  tree:true, width: 150 },
        {name:"start_date", label:"Start time", align:"center", resize: true, width: 120 },
        {name:"end_date",   label:"End date",   align:"center", resize: true, width: 120 },
        {name:"priority",  label:"Priority", height:22, type:"select", map_to:"priority", template:function(obj){
            var priorities = gantt.locale.labels["PriorityList"].split(';');
            var token = "key:" + obj.priority + ",";
            var correctPriority = priorities.find(element => element.includes(token));
            var myRegexp = /(?:^|\s)label:(.*?)}(?:\s|$)/g;
            var match = myRegexp.exec(correctPriority);
            if (match !== null && match[1] !== null){
                return match[1];
            }
            return "Low";
        }},
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
      //gantt.config.scale_unit = this.props.zoom.scale_unit;
      gantt.config.duration_unit = "hour";
      gantt.config.scale_height = 50;
      gantt.config.min_column_width = 100;
      //gantt.config.date_scale = this.props.zoom.date_scale;
      gantt.config.open_tree_initially = true;
      //gantt.config.subscales = this.props.zoom.subscales;
      gantt.templates.timeline_cell_class = function(task, date){
        if(!gantt.isWorkTime({task:task, date: date}))
          return "week_end";
        return "";
      };
      gantt.setWorkTime({
        hours: [9,17]
      })
      gantt.setWorkTime({ day:6, hours:false });
      gantt.setWorkTime({ day:7, hours:false });
      gantt.locale.labels["milestone"] = "Milestone";
      gantt.config.buttons_left = ["dhx_save_btn", "dhx_cancel_btn", "milestone"];
      gantt.config.buttons_right = ["dhx_delete_btn"];
      //addTodayMarker();
    }

    render() {
        var zoom = this.props.zoom;
        var actions = this.props.actions;
        gantt.updateCollection("actions", actions);
        this.setZoom(zoom);
        console.log("Gantt rendering, zoom set to ", zoom);
        return (
            <div
                ref={(input) => { this.ganttContainer = input }}
                style={{ width: '100%', height: '100%' }}
            >
            </div>
        );
    }
}