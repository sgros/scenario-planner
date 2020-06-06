import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import axios, { post } from 'axios';
import { gantt } from 'dhtmlx-gantt';

export default class Toolbar extends Component {
    handleZoomChange = (e) => {
        if (this.props.onZoomChange) {
            this.props.onZoomChange(e.target.value)
        }
    }

    importGanttActions(){
        if (this.props.onActionsUpload) {
            this.props.onActionsUpload()
        }
    }

    calculatePlan(){
        console.log("Will trigger props method for plan calculation.");
        if (this.props.onCalculatePlan){
            this.props.onCalculatePlan()
        }
    }

    handleFileChange = async (e) => {
        console.log("Handling file change");
        var fileChanged = await this.onChangeFile(e);
        console.log("Promise returned: ", fileChanged);
        if (fileChanged){
            console.log("File changed!");
            this.importGanttActions();
        }
    }

    async onChangeFile(event) {
        return new Promise((resolve, reject) => {
            var file = event.target.files[0];
            console.log(file);
            if (file === 'undefined'){
                resolve(false);
            }
            var reader = new FileReader();

            reader.onload = (e) => {
                var loaded_data = JSON.parse(e.target.result);
                console.log("Loaded data, should import now.");
                // send loaded data to server to save in database
                const url = "http://localhost:8080/actions/import";
                const formData = { data: loaded_data };
                var postResult = post(url, formData)
                    .then(response => resolve(true));
            }
            reader.readAsText(file);
        });
    }

    render() {
        const zoomRadios = ['Hours', 'Days', 'Months'].map((value) => {
            const isActive = this.props.zoom === value;
            return (
                <label key={ value } className={ `radio-label ${isActive ? 'radio-label-active': ''}` }>
                    <input type='radio'
                        checked={ isActive }
                        onChange={ this.handleZoomChange }
                        value={ value }/>
                    { value }
                </label>
            );
        });
        return (
            <div>
                <div>
                    <b>Zooming: </b>
                        { zoomRadios }
                </div>
                <div>
                    <button className="button-left" onClick={() => this.calculatePlan()}>
                        Calculate plan
                    </button>
                    <input id="myInput"
                        type="file"
                        ref={(ref) => this.upload = ref}
                        style={{display: 'none'}}
                        onChange={this.handleFileChange.bind(this)}
                    />
                    <MuiThemeProvider>
                        <RaisedButton
                            className="button-left"
                            label="Import actions"
                            primary={false}
                            onClick={()=>{this.upload.click()}}
                        />
                    </MuiThemeProvider>
                    <div className="dropdown-menu" style={{width: '100%' }}>
                        <button className="button-right" onClick={() => gantt.exportToPNG({raw:true})}>Export to PNG</button>
                        <button className="button-right" onClick={() => gantt.exportToPDF({raw:true})}>Export to PDF</button>
                        <button className="button-right" onClick={() => gantt.exportToExcel({raw:true})}>Export to Excel</button>
                        <button className="button-right" onClick={() => gantt.exportToICal({raw:true})}>Export to iCal</button>
                    </div>
                </div>
            </div>
        );
    }
}