import {CONSTANTS} from "./constants.js";
import {Utils} from "./utils.js";

Utils.log(`Loaded: ${import.meta.url}`);

export class DTGRuler extends foundry.canvas.interaction.Ruler {

    static get WAYPOINT_LABEL_TEMPLATE() { return CONSTANTS.TEMPLATES.RULER.PATH; };

    _getWaypointLabelContext(waypoint, state) {
        const context = super._getWaypointLabelContext(waypoint, state);
        if (context === undefined)
            return context;

        if(context.distance.total) { context.descriptor = Utils.getRangeDescriptor(context.distance.total); }

        return context;
    }
}

export class DTGTokenRuler extends foundry.canvas.placeables.tokens.TokenRuler {

    static get WAYPOINT_LABEL_TEMPLATE() { return CONSTANTS.TEMPLATES.RULER.PATH; };

    _getWaypointLabelContext(waypoint, state) {
        const context = super._getWaypointLabelContext(waypoint, state);
        if (context === undefined)
            return context;

        if(context.distance.total) { context.descriptor = Utils.getRangeDescriptor(context.distance.total); }

        return context;
    }

}