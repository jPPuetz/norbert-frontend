import dispatcher from "../dispatcher";
import constants from "../constants";
import $ from "jquery";
import ConfigStore from "../stores/ConfigStore";

function modifyId(entry) {
    entry.id = entry._id;
    delete entry._id;
    return entry;
}

export function updateEntries() {
    return $.ajax({
        url: ConfigStore.apiLocation + "newsfeed/",
        method: "GET"
    })
    .done(entries => {
        return entries.map(modifyId)
    })
    .done(entries => {
        dispatcher.dispatch({
            type: constants.UPDATE_ENTRIES,
            entries
        })
    })
    //TODO implement message system and add entries could not be loaded method
}

export function createEntry(entry) {
    return $.ajax({
        url: ConfigStore.apiLocation + "entries",
        method: "POST",
        data: entry
    })
    .done(modifyId)
    .done(entry => {
        dispatcher.dispatch({
            type: constants.CREATE_ENTRY,
            entry
        })
    })
    //TODO implement message system and add entries could not be loaded method
}

export function updateEntry(entry) {
    $.ajax({
        url: ConfigStore.apiLocation + "entries/" + entry.id,
        method: "PUT",
        data: entry
    })
    .done(modifyId)
    .done(entry => {
        let { id } = entry;
        dispatcher.dispatch({
            type: constants.UPDATE_ENTRY,
            entry, id
        });
    })
    //TODO implement message system and add entries could not be loaded method
}

export function deleteEntry(id) {
    return $.ajax({
        url: ConfigStore.apiLocation + "entries/" + id,
        method: "DELETE"
    })
    .done(() => {
        dispatcher.dispatch({
            type: constants.DELETE_ENTRY,
            id
        });
    })
}

export function startEdit(id) {
    dispatcher.dispatch({
        type: constants.START_EDIT_ENTRY,
        id
    });
}

export function stopEdit(id) {
    dispatcher.dispatch({
        type: constants.STOP_EDIT_ENTRY
    })
}

export function loadNewImages(bottom) {
    dispatcher.dispatch({
        type: constants.LOAD_NEW_IMAGES
    });
}
