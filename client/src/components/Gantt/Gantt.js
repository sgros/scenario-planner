import React, { Component } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

export default class Gantt extends Component {
    componentDidMount() {
        gantt.config.xml_date = "%Y-%m-%d %H:%i";
        const { tasks } = this.props;
        gantt.init(this.ganttContainer);
        gantt.parse(tasks);
    }

    render() {
        const { zoom } = this.props;
        this.setZoom(zoom);
        this.setColumns();
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
}