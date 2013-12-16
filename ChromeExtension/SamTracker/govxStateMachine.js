function PifStateMachine() {

    this.StateExit = function( event, action, nextId ) {
        this.event = { event: event.event, eventName: event.eventName };
        this.action = action;
        this.nextId = nextId;
        this.nextState = null;
    };

    this.StateNode = function( args ) {
        if (arguments.length === 0) { throw 'StateNode: Missing Parameters'; }
        if (!(arguments[0] instanceof Object) || arguments.length > 1) {
            throw 'StateNode: Illegal Parameters';
        }

        var args = arguments[0];
        var status = 'idle';
        this.id = args.id;
        this.state = args.state;
        this.exits = args.exits;

        this.enter = function( ) {
            status = 'occupied';
            if (this.state) { (this.state)(); }
        }

        this.availableEvents = function() {
            var events = [];
            this.exits.forEach( function(exit) {
                events.push(exit.event);
            });
            return events;
        }

        this.send = function( event ) {
            var action;
            this.exits.some( function( exit ) {
                if (exit.event === event) {
                    action = exit.action;
                    status = 'idle';
                    return true;
                }
            });
            if (action) { action(); };
        };

        this.toString = function() {
            return 'StateNode: id="' + this.id + '\n';
        };
    };

    this.StateMachine = function( stateNodes ) {
        var theStateImIn;
        var lookups = [];
        var thisCanHappen = [];
        var nodes = [];
        var smStatus = 'instantiated';

        this.start = function(initialState) {
            lookups.some( function(lookup) {
                if (lookup.id === initialState) {
                    theStateImIn = lookup.state;
                    theStateImIn.enter();
                    return true;
                }
            });
            smStatus = 'running';
        }

        this.stateImIn = function() { return theStateImIn.id; };

        this.happened = function(event) {
            theStateImIn.exits.some(function(exit) {
                if (exit.event.event === event) {
                    exit.action();
                    theStateImIn = exit.nextState;
                    theStateImIn.enter();
                    return true;
                }
            });
        }

        this.toString = function() {
            var stateStrings = 'StateMachine:\n' + 'Status: ' +
                ((smStatus === 'started') ?
                    ('Started: ' + 'Current State: ' + theStateImIn.id) :
                    ('Not Started')) + '\n';
            nodes.forEach( function( node ) {
                stateStrings += node.toString() + '\n';
            });
            return stateStrings;
        }

        this.availableEvents = function() {
            if (smStatus === 'running') {
                return theStateImIn.availableEvents();
            } else {
                return [];
            }
        }

        function stateForId(id) {
            var theState = null;
            lookups.some( function(thisState, index, lookups) {
                if (thisState.id === id) {
                    theState = thisState.state;
                    return true;
                }
            });
            return theState;
        }

        stateNodes.forEach( function(thisDef) {
            // nodes.push(new PifStateMachine.StateNode (thisDef));
            nodes.push(thisDef);
        }, this);
        nodes.forEach( function(thisState) {
            lookups.push( { id: thisState.id, state: thisState } );
        });
        nodes.forEach( function(thisState) {
            thisState.exits.forEach( function(thisExit) {
                thisExit.nextState = stateForId(thisExit.nextId);
            });
        });
    };
}
