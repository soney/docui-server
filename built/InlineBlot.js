"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class InlineBlotDisplay {
}
exports.InlineBlotDisplay = InlineBlotDisplay;
;
class InlineBlotBackend {
    constructor(formatsDoc, formatId, blotId) {
        this.formatsDoc = formatsDoc;
        this.formatId = formatId;
        this.blotId = blotId;
    }
    ;
    getTextContent() {
        return this.formatsDoc.traverse(['formats', this.formatId, 'blots', this.blotId, 'textContent']);
    }
    ;
    setState(state) {
        lodash_1.each(state, (value, key) => {
            this.formatsDoc.submitObjectReplaceOp(['formats', this.formatId, 'blots', this.blotId, 'state', key], value);
        });
    }
    ;
    getState(key) {
        const { formats } = this.formatsDoc.getData();
        const { state } = formats[this.formatId].blots[this.blotId];
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