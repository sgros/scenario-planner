import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import axios, { post } from 'axios';

export default class Toolbar extends Component {
    handleZoomChange = (e) => {
        if (this.props.onZoomChange) {
            this.props.onZoomChange(e.target.value)
        }
    }

    onChangeFile(event) {
        var file = event.target.files[0];
        console.log(file);
        var reader = new FileReader();

        reader.onload = (e) => {
            var loaded_data = JSON.parse(e.target.result);

            // send loaded data to server to save in database
            const url = "http://localhost:8080/actions/import";
            const formData = { data: loaded_data };
            return post(url, formData)
                .then(response => console.log(response));
        }
        reader.readAsText(file);
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
                    <input id="myInput"
                        type="file"
                        ref={(ref) => this.upload = ref}
                        style={{display: 'none'}}
                        onChange={this.onChangeFile.bind(this)}
                    />
                    <MuiThemeProvider>
                        <RaisedButton
                            label="Import actions"
                            primary={false}
                            onClick={()=>{this.upload.click()}}
                        />
                    </MuiThemeProvider>
                </div>
            </div>
        );
    }
}