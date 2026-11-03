// A lightweight implementation of a behavior tree for complex NPC actions
class Node {
    constructor() {
        this.state = 'ready';
    }
    evaluate() { return 'failure'; }
}

export class Sequence extends Node {
    constructor(nodes) {
        super();
        this.nodes = nodes;
    }
    evaluate(context) {
        for (let node of this.nodes) {
            const status = node.evaluate(context);
            if (status !== 'success') return status;
        }
        return 'success';
    }
}

export class Selector extends Node {
    constructor(nodes) {
        super();
        this.nodes = nodes;
    }
    evaluate(context) {
        for (let node of this.nodes) {
            const status = node.evaluate(context);
            if (status !== 'failure') return status;
        }
        return 'failure';
    }
}

export class Action extends Node {
    constructor(actionFn) {
        super();
        this.actionFn = actionFn;
    }
    evaluate(context) {
        return this.actionFn(context);
    }
}
