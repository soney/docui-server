"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class InlineBlotDisplay {
}
exports.InlineBlotDisplay = InlineBlotDisplay;
;
class InlineBlotBackend {
    constructor(stateDoc) {
        this.stateDoc = stateDoc;
    }
    ;
    setState(state) {
        lodash_1.each(state, (value, key) => {
            this.stateDoc.submitObjectReplaceOp(['state', key], value);
        });
    }
    ;
    getState(key) {
        const { state } = this.stateDoc.getData();
        if (lodash_1.has(state, key)) {
            return state[key];
        }
        else {
            return null;
        }
    }
    ;
}
exports.InlineBlotBackend = InlineBlotBackend;
;
;
//# sourceMappingURL=InlineBlot.js.map