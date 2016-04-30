import dispatcher from "../dispatcher";
import constants from "../constants";
import $ from "jquery";
import ConfigStore from "../stores/ConfigStore";
import { createEntry } from "./EntryActions";
import RecommendationStore from "../stores/RecommendationStore";

export function updateRecommendations() {
    let recommendations = [
        {
            "title": "Test Recommendation",
            "components": [],
            "tags": [],
            "equality_group": "571be59558288c58202f8bfd",
            "id": "571be59558288c58202f8bfe"
        }
    ];

    dispatcher.dispatch({
        type: constants.NEW_RECOMMENDATIONS,
        recommendations
    });
}

export function acceptRecommendation(id) {
    return createEntry(RecommendationStore.getRecommendation(id))
    .then(() => {
        dispatcher.dispatch({
            type: constants.DELETE_RECOMMENDATION,
            id
        })
    })
}

export function rejectRecommendation(id) {
    //TODO request
    dispatcher.dispatch({
        type: constants.DELETE_RECOMMENDATION,
        id
    });
}