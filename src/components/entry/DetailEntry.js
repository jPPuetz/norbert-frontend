/**
 * @author Arwed Mett
 */
import React, { Component } from "react";
import {Modal, Button, ButtonGroup, SplitButton, MenuItem, FormControl} from "react-bootstrap";
import { deleteEntry, updateEntry, stopEdit, uploadFile } from "../../actions/EntryActions";
import EntryStore from "../../stores/EntryStore";
import constants from "../../constants";
import moment from "moment";
import DateTimeField from "react-bootstrap-datetimepicker";

export default class DetailEntry extends Component {

    constructor() {
        super();
        this.state = {
            data: EntryStore.editEntry,
            components: []
        }
    }

    componentWillMount() {
        EntryStore.on("editEntryChanged", entry => {
            this.setState({
                data: entry
            })
            this.handleUpdate();
        })
        this.handleUpdate();
    }

    handleUpdate() {
        if(this.handleEntryUpdate) EntryStore.removeListener("updateChange", this.handleEntryUpdate)
        this.handleEntryUpdate = id => {
            if(EntryStore.editEntry.id === id) {
                this.setState({
                    data: EntryStore.editEntry
                })
            }
        }
        EntryStore.on("updateEntry", this.handleEntryUpdate);
    }
    render() {
        if(!this.state.data) return <div hidden="true" />;
        const components = this.state.data.components ? this.state.data.components.map((comp, i) => {
            return <div key={i}>{createComponent(comp, this.handleCompChange.bind(this, i))}</div>
        }) : [];

        let hashtags = "";
        this.state.data.tags.forEach(tag => {
            hashtags += "#" + tag;
        });
        //Dialog to edit the entry
        return <Modal show={true} onHide={this.handleEditClose.bind(this)} className="detailEntry">
                <Modal.Header>
                    <Modal.Title>
                         <FormControl
                             type="text"
                             className="title"
                             value={this.state.data.title}
                             onChange={this.updateTitle.bind(this)}
                         />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {components}
                </Modal.Body>
                <Modal.Footer>
                    <div className="col-lg-7">
                    <div className="input-group tags">
                        <span className="input-group-addon">Tags: </span>
                        <FormControl
                            type="text"
                            placeholder="#awesome"
                            value={hashtags}
                            onChange={this.handleChangeHashtag.bind(this)}
                        />
                    </div>
                    </div>
                    <ButtonGroup>
                        <Button
                            bsStyle="danger"
                            
                            onClick={this.handleDelete.bind(this)}
                        ><div className="fa fa-trash fa-fw"/></Button>
                        <SplitButton
                            id={`add-component-${this.props.id}`}
                            bsStyle="primary"
                            title={<div className="fa fa-plus fa-fw " />}
                            onClick={this.addTask.bind(this)}
                        >
                            <MenuItem onClick={this.addTask.bind(this)}>Aufgabe</MenuItem>
                            <MenuItem onClick={this.addText.bind(this)}>Text</MenuItem>
                            <MenuItem onClick={this.addNotification.bind(this)}>Erinnerung</MenuItem>
                            <MenuItem onClick={this.addDocument.bind(this)}>Dokument</MenuItem>
                            <input ref="fileUploader" type="file" style={{display: "none"}} />
                        </SplitButton>
                    </ButtonGroup>
                </Modal.Footer>
        </Modal>;
    }
    handleDelete() {
        stopEdit();
        deleteEntry(this.state.data.id);
    }
    addTask() {
        this.addComponent({
            type: constants.TASK,
            data: {
                finished: false,
                text: ""
            }
        });
    }
    addText() {
        this.addComponent({
            type: constants.DESCRIPTION,
            data: {
                text: ""
            }
        });
    }
    addNotification() {
        this.addComponent({
            type: constants.NOTIFICATION,
            data: {
                date: Date.now()
            }
        });
    }
    addDocument() {
        let entry = this.state.data;
        $(this.refs.fileUploader).change(function(e) {
            if(this.ran) return;
            this.ran = true;
            uploadFile(this.files[0], entry);
        });
        $(this.refs.fileUploader).click();
    }
    addComponent(comp) {
        if(!comp.data) comp.data = {};
        this.state.data.components.push(comp);
        this.setState({
            data: this.state.data
        })
        updateEntry(this.state.data);
    }
    updateTitle(oEvent) {
        let entry = this.state.data;
        entry.title = oEvent.target.value;
        if(entry.title.length >= 30) return;
        this.setState({
            data: entry
        })
        updateEntry(entry);
    }
    handleCompChange(id, component) {
        this.state.data.components[id] = component;
        this.setState({data: this.state.data});
        updateEntry(this.state.data, this.props.id);
    }
    handleChangeHashtag(oEvent) {
        let rawHashtags = oEvent.target.value;
        let { data } = this.state;
        data.tags = rawHashtags.split(/#| /).filter(tag => { return tag.length > 0 });
        if(/#$/.test(rawHashtags)) data.tags.push("");
        this.setState({data})
        updateEntry(this.state.data);
    }
    handleEditClose() {
        stopEdit();
    }
}

/*
 * The following functions are generator functions for components.
 * These functions get a model of the compenent and a change event listener.
 * Than the return a html representation of the component.
 */


function createDescription(component, change) {
    let rows = component.data.text.split("\n").length;
    rows = rows >= 5 ? rows : 5;
    return <FormControl
        type="textarea"
        placeholder="Beschreibung..."
        value={component.data.text}
        onChange={onChange}
        rows={rows}
        className="textarea description"
    />;
    function onChange(oEvent) {
        component.data.text = oEvent.target.value;
        change(component)
    }
};


function createNotification(component, change) {
    let date = new Date(parseInt(component.data.date));
    
    let day = date.getDate() + "";
    //This is the reason why i hate dates.
    //Who came up with the idea to start counting months with 0.
    //This is insane. :-) -- <=q
    let month = date.getMonth() + 1 + ""; 
    let year = date.getFullYear() + "";

    day = day.length == 2 ? day : "0"+day;
    month = month.length == 2 ? month : "0"+month;
    return <div
            className="input-group notification"
        >
            <DateTimeField
                dateTime={parseInt(component.data.date)}
                onChange={onChange}
                className="form-control"
            />
    </div>;

    function onChange(time) {
        component.data.date = time
        change(component)
    }
}

function createDocument(component, change) {
    let content = component.data.processing ? 
        <p>Datei wird verarbeitet...</p> 
        :
        <a 
            className="fa fa-file"
            href={"http://" + component.data.url}
        >
            { " " + component.data.name }
        </a>
    return <div>
        {content}
    </div>;
}

function createTask(component, change) {
    return <div className="input-group">
        <span
            className="input-group-addon"
        >
            <input 
                type="checkbox"
                checked={JSON.parse(component.data.finished)}
                onChange={onChecked}
            />
        </span>

        <input
            className="form-control"
            type="text"
            onChange={onChange}
            value={component.data.text}
        />
    </div>;
    function onChecked(oEvent) {
        component.data.finished = !JSON.parse(component.data.finished);
        change(component);
    }
    function onChange(oEvent) {
        component.data.text = oEvent.target.value;
        change(component);
    }
}

/**
 * Choose the right generator function.
 */
function createComponent(comp, onChange) {
    let creator = function() {
        console.warn("Unknown component type: " + comp.type);
        return <div hidden="true" />
    }
    switch(comp.type) {
        case constants.DESCRIPTION: {
            creator = createDescription;
            break;
        }
        case constants.NOTIFICATION: {
            creator = createNotification;
            break;
        }
        case constants.DOCUMENT: {
            creator = createDocument;
            break;
        }
        case constants.TASK: {
            creator = createTask;
            break;
        }
    }
    return creator(comp, onChange);
}
