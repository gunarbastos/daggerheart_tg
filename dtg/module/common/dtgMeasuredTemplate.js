import {Utils} from "./utils.js";

Utils.log(`Loaded: ${import.meta.url}`);

export class DTGMeasuredTemplate extends foundry.canvas.placeables.MeasuredTemplate {

    //Method copied from foundry.canvas.placeables.MeasuredTemplate
    //Will need to be changed when that function is changed
    _refreshRulerText() {
        const {distance, t} = this.document;
        const grid = canvas.grid;
        if ( t === "rect" ) {
            const {A: {x: x0, y: y0}, B: {x: x1, y: y1}} = this.ray;
            const dx = grid.measurePath([{x: x0, y: y0}, {x: x1, y: y0}]).distance;
            const dy = grid.measurePath([{x: x0, y: y0}, {x: x0, y: y1}]).distance;
            let w = dx.toNearest(0.01).toLocaleString(game.i18n.lang);
            let h = dy.toNearest(0.01).toLocaleString(game.i18n.lang);
            const rangeW = Utils.getRangeDescriptor(w);
            const rangeH = Utils.getRangeDescriptor(w);
            if ( grid.units ) {
                w = `${w} ${grid.units}`;
                h = `${h} ${grid.units}`;
            }
            this.ruler.text = `${w} (${rangeW}) × ${h} (${rangeH})`;
        } else {
            let r = distance.toNearest(0.01).toLocaleString(game.i18n.lang);
            const rangeR = Utils.getRangeDescriptor(r);
            if ( grid.units ) r = `${r} ${grid.units}`;
            this.ruler.text = `${r} (${rangeR})`;
        }
        this.ruler.position.set(this.ray.dx + 10, this.ray.dy + 5);
    }

}