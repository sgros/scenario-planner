import React, { Component } from 'react';
//import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

export default class GanttTask extends Component {
  render(){
  console.log("GanttTask rendered");
    return (
    <>
        <div className="modal fade" id="my-form" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Task editor</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="exampleInputEmail1">Task name</label>
                            <input className="form-control" name="description"></input>
                        </div>
                        <label>Holder</label>
                        <div className="input-group mb-3">
                            <select className="custom-select" id="holder">
                            </select>
                        </div>
                        Priority
                        <div className="input-group mb-3">
                            <select className="custom-select" id="priority">
                            </select>
                        </div>
                        Action
                        <div className="input-group mb-3">
                            <select className="custom-select" id="actions">
                            </select>
                        </div>
                        <br></br>
                        Start Date
                        <div className="form-group">
                            <div className="input-group date" id="datepicker1" data-target-input="nearest">
                                <input type="text" className="form-control datetimepicker-input" data-target="#datepicker1"></input>
                                <div className="input-group-append" data-target="#datepicker1" data-toggle="datetimepicker">
                                    <div className="input-group-text"><i className="fa fa-calendar"></i></div>
                                    </div>
                                </div>
                            </div>
                            <br></br>
                            <div className="form-group">
                                <label htmlFor="randomDate">Start date randomness</label>
                                <input type="text" className="form-control" id="randomDate" placeholder="Randomness you want to add (+ x days)or 0 randomness" defaultValue="0"></input>
                            </div>
                            <div className="form-group">
                                <label htmlFor="duration">Duration</label>
                                <input type="text" className="form-control" id="duration" placeholder="Duration of the task (days)"></input>
                            </div>
                            <div className="form-group">
                                <label htmlFor="random">Randomness</label>
                                <input type="text" className="form-control" id="random" placeholder="Randomness you want to add (+/- x days)or 0 no randomness" defaultValue="0"></input>
                            </div>
                            <br></br>
                            Pre Condition
                            <div className="input-group mb-3">
                                <select className="selectpicker" multiple data-live-search="true" id="postCond">
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="offsetPre">Pre condition offset</label>
                                <input type="text" className="form-control" id="offsetPre" placeholder="+/- x days, default 0" defaultValue="0"></input>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" name="save" value="Save">Save changes</button>
                            <button type="button" className="btn btn-secondary" name="close" value="Close">Close</button>
                            <button type="button" className="btn btn-danger" name="delete" value="Delete">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
  }
}