import React, { Component } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

export default class Gantt extends Component {
    componentDidMount() {
        gantt.config.xml_date = "%Y-%m-%d %H:%i";
        const { tasks } = this.props;
        gantt.init(this.ganttContainer);
        gantt.parse(tasks);
        this.configSetup();
    }

    render() {
        this.setColumns();
        const { zoom } = this.props;
        this.setZoom(zoom);
        return (
            <div
                ref={(input) => { this.ganttContainer = input }}
                style={{ width: '100%', height: '100%' }}
            ></div>
        );
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
        return this.props.zoom !== nextProps.zoom;
    }

    componentDidUpdate() {
        gantt.render();
    }

    setColumns(){
        console.log(gantt.config.columns)

        gantt.config.columns =  [
        {name:"text",       label:"Task name",  tree:true, width: 150 },
        {name:"start_date", label:"Start time", align:"center", resize: true, width: 120 },
        {name:"end_date",   label:"End date",   align:"center", resize: true, width: 120 },
        //{name:"priority",    height:22, type:"select",   map_to:"priority", options:priority, default_value:"Low"},
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
      gantt.config.scale_unit = this.props.zoom.scale_unit;
      gantt.config.duration_unit = "hour";
      gantt.config.scale_height = 50;
      gantt.config.min_column_width = 1000;
      gantt.config.date_scale = this.props.zoom.date_scale;
      gantt.config.open_tree_initially = true;
      gantt.config.subscales = this.props.zoom.subscales;
      gantt.templates.task_cell_class = function(task, date){
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
}