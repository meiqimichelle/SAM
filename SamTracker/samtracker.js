/* This is the spec (Navin's email)


As we discussed yesterday, here are the states and scenarios for the SAM Tracker:

Human-Readable States

Draft: "Draft"
WIPTINNotFound: "Work in Progress - TIN Consent Not Submitted"
WIPTINMatchSubmitted: "Work in Progress - Waiting for IRS TIN Match"
WIPTINMatchSatisfied: "Work in Progress - TIN Consent Complete"
SubmittedToTIN: "Submitted - Waiting for IRS TIN Match"
SubmittedToCage: "Submitted - Waiting for DoD CAGE Validation"
Active: "Active"
Expired: "Expired"

Can we also expand "WIP" in the arrow to "Work in Progress"?

Scenarios

Looks like there was a state missing - 
WIPTINMatchSubmitted->WIPTinMatchSatisfied

Scenario 1 (Smooth, successful registration)

(Step. <state transition> <text seen when we click on the arrow and get detail)
a: Please enter in the basic information and submit the TIN Consent form.
c: Your TIN Consent form has been submitted to the IRS. You can continue to enter your entity information.
<WIPTINMatchSubmitted->WIPTINMatchSatisfied>: Please enter in your core data, assertions, reps and certs, and points of contact to submit your entity for registration
h: Awaiting response from the CAGE validation
f: Your entity is active
Scenario 2 (More detail on the individual steps - note that a few of these steps do not actual require state transition

a: Please enter in the basic information and submit the TIN Consent form.
c: Your TIN Consent form has been submitted to the IRS. You can continue to enter your entity information.
<WIPTINMatchSubmitted->WIPTINMatchSatisfied>: Please enter in your core data, assertions, reps and certs, and points of contact to submit your entity for registration
<No state change>: You still need to input your assertions and points of contact to submit your entity for registration
<No state change>: Your size metrics are failing validation; please correct them
h: Awaiting response from the CAGE validation
f: Your entity is active
Scenario 3 (Error with CAGE Validation)

a: Please enter in the basic information and submit the TIN Consent form.
c: Your TIN Consent form has been submitted to the IRS. You can continue to enter your entity information.
<WIPTINMatchSubmitted->WIPTINMatchSatisfied>: Please enter in your core data, assertions, reps and certs, and points of contact to submit your entity for registration
h: Awaiting response from the CAGE validation
i: Your CAGE validation failed with the error: {CAGE Error}
h: Awaiting response from the CAGE validation
f: Your entity is active

We can use the above three scenarios, marry them up with the internal error codes, and show how we really could be "smart" about those error messages and provide real guidance to users. And then marry that up with the status tracker as we go forward.
*/

(function(){
var pifSM = new PifStateMachine();
var arrows = [];

function findArrow(arrows, id) {
    var foundArrow;
    arrows.some(function(arrow) {
        if (arrow.id === id) {
        foundArrow = arrow;
        return true;
        }
    });
    return foundArrow;
}

$(document).ready(function() {

    arrowSpecs.forEach( function( spec ) {
        arrows.push(new Arrow( spec ));
    });
    
    ['draft', 'wip', 'submitted', 'active', 'expired'].forEach( function(id) {
        $('div#anchor-chain').append($(findArrow(arrows, id).html));
        $('div.arrow-div#' + id + '-arrow-div').on('click', function( event ) {
            $('body').prepend($('<div class="popup-container">' +
            '<div class="popup-div" id="clicked-arrow">' + '<p id="' +
            id + '-payload">' +
            '<p>' +findArrow(arrows, id).help + '</p><button id="more-info"' +
            'value="Close">Close</button></p>'  +
            '</div></div>'));
            $('button#more-info').on('click', function( event ) {
                $('p.' + id + '-payload').html(
                    $('body div.popup-container').remove());
            });
        });
    });

    /*

    var toggled = false;
    ['draft', 'wip', 'submitted', 'active', 'expired'].forEach( function(id) {
        var primaryMessage = $(findArrow(arrows, id).html());
        var secondaryMessage = 'Extended Help';
        $('div#anchor-chain').append($(findArrow(arrows, id).html()));
        $('div.arrow-div#' + id + '-arrow-div').on('click', function( event ) {
            if (toggled === false) {
                message = primaryMessage;
            } else {
                message = secondaryMessage;
            }
            $('body').prepend($('<div class="popup-container">' +
            '<div class="popup-div" id="clicked-arrow">' + '<p id="' +
            id + '-payload">' +
            findArrow(arrows, id).help() + '<br />' +
            'Click for more information. <button id="more-info"' +
            'value="More"></p>' +
            '</div></div>'));
            $('button#more-info').on('click', function( event ) {
                    $('p.' + id + '-payload').html(
                    '<div class="popup-div" id="clicked-arrow">' + '<p id="' +
                    id + '-payload">' +
                    findArrow(arrows, id).help() + '<br />' +
                'Click to return. <button id="more-info"' +
                'value="Return"></p>' +
                    $('div.popup-div#clicked-arrow').
                            on('click', function (event) {
                        $('body').prepend($('<div class="popup-container">' +
                        '<div class="popup-div" id="show-more"' +
                        'z-index="20000">' +
                        '<p>Wow, even more information.</p>' +
                        '<p>Click this box to return to the other view.</p>' +
                        '</p><p>Click for more information. ' +
                        '<button id="more-info"' + 'value="More"></p>' +
                        '</div></div>'));
                    $('button#more-info').on('click', function( event ) {
                        $('div.popup-div#show-more').
                                on('click', function( event ) {
                            pifSM.report('click');
                            $('div.popup-div#clicked-arrow').
                                    css('visibility', 'visible');
                            $(this).remove();
                        });
                    });
                });
            });
        });
    });

*/

    var samSM = new pifSM.StateMachine ( samStateNodes );
    samSM.start('NotStarted');

    function loadAvailableEvents() {
        var availableEvents = 
            '<div class="usecase-controls" draggable="true">' +
            '<h2 class="usecase" id="top-header">SIMSammy</h2>' +
            '<p class="usecase" id="usecase-currentstate"><strong>' +
            'Current State: </strong><emphasis>' + samSM.stateImIn() +
            '</emphasis></p>' +
            '<p class="usecase" id="usecase-currentstate"><strong>' +
            'Trigger an Event: </strong></p>' ;
        samSM.availableEvents().forEach(function(availableEvent) {
                availableEvents += '<button class="usecase-button" id="' +
                    availableEvent.event + '-usecase-button" value="' +
                    availableEvent.event + '">' + availableEvent.eventName + '</button>';
        });
        availableEvents += '</div>';
            $('body').
                on('dragover', function(e) {
                    e.preventDefault()
                } ).
                on('drop', function(e) {
                    e.preventDefault()
                } );
            $('div.usecase#available-events').html(availableEvents).
                on('dragstart', function(ev)
                {});
            $('div.tracker-div#tracker-box').on('drop', function(e) {
                    e.preventDefault()
                } );
            $('button.usecase-button'
            ).on('click', function( x ) {
                samSM.happened(x.srcElement.value);
            loadAvailableEvents();
            });
    }
    loadAvailableEvents();
});

/////////////////////////////////////////
//                                     //
// DATA DATA DATA                      //
//                                     //
/////////////////////////////////////////

var samStateNodes = [
    new pifSM.StateNode( {
        id: 'NotStarted',
        state: function () {
            setArrowProperties( arrows, [
                { id: 'draft', fillColor: 'white', textColor: 'black',
                                    help: 'SIM Sammy is not running.'},
                { id: 'wip', fillColor: 'white', textColor: 'black',
                                    help: 'SIM Sammy is not running.'},
                { id: 'submitted', fillColor: 'white', textColor: 'black',
                                    help: 'SIM Sammy is not running.'},
                { id: 'active', fillColor: 'white', textColor: 'black',
                                    help: 'SIM Sammy is not running.'},
                { id: 'expired', fillColor: 'white', textColor: 'black',
                                    help: 'SIM Sammy is not running.'}
            ])
        },
        exits: [
            new pifSM.StateExit (
                { event: 'start', eventName: 'Start'},
                function() {
                },
                'Draft'
            )
        ]
    }),
    new pifSM.StateNode( {
        id: 'Draft',
        state: function () {
            setArrowProperties( arrows, [
                { id: 'draft', fillColor: 'gray', textColor: 'black',
                        help: 'Please enter in the basic information' +
                        'and submit the TIN Consent form.'},
                { id: 'wip', fillColor: 'white', textColor: 'black',
                        help: 'Please complete and submit your draft information.'},
                { id: 'submitted', fillColor: 'white', textColor: 'black',
                        help: 'Please complete and submit your draft information.'},
                { id: 'active', fillColor: 'white', textColor: 'black',
                        help: 'Please complete and submit your draft information.'},
                { id: 'expired', fillColor: 'white', textColor: 'black',
                        help: 'Please complete and submit your draft information.'}
            ])
        },
        exits: [
            new pifSM.StateExit (
                { event: 'submit', eventName: 'Submit TIN'},
                function() {
                },
                'WIPTINMatchSubmitted'
            )
        ]
    }),
    new pifSM.StateNode( {
        id: 'WIPTINMatchSubmitted',
        state: function () {
            $('svg g text#wip-arrow-text', $(findArrow(arrows, 'wip')).html()).
                text('Work in Progress--TIN Submitted');
            setArrowProperties( arrows, [
                { id: 'draft', fillColor: 'black', textColor: 'white',
                        help: 'This step is complete.'},
                { id: 'wip', fillColor: 'DarkGray', textColor: 'black', length: 300,
                        help: 'Your TIN Consent form has been' +
                        ' submitted to the IRS. You can continue' +
                        ' to enter your entity information.'},
                { id: 'submitted', fillColor: 'white', textColor: 'black',
                        help: 'Your TIN Consent form has been' +
                        ' submitted to the IRS. You can continue' +
                        ' to enter your entity information.'},
                { id: 'active', fillColor: 'white', textColor: 'black',
                        help: 'Your submission will become active after your TIN match is successful and your entity data is complete.'},
                { id: 'expired', fillColor: 'white', textColor: 'black',
                        help: 'This stage will mark completion of your registration.'}
            ])
        },
        exits: [
            new pifSM.StateExit (
                { event: 'tinnotfound', eventName: 'Return "No TIN Match'},
                function() {
                },
                'WIPTINNotFound'
            ),
            new pifSM.StateExit (
                { event: 'tinfound', eventName: 'Return "Found a TIN Match"'},
                function() {
                },
                'WIPTINMatchSatisfied'
            )
        ]
    }),
    new pifSM.StateNode( {
        id: 'WIPTINNotFound',
        state: function () {
            $('svg g text#wip-arrow-text', $(findArrow(arrows, 'wip')).html()).
                text('Work in Progress--TIN not found');
            setArrowProperties( arrows, [
                { id: 'draft', fillColor: 'black', textColor: 'white',
                        help: 'This step is complete.'},
                { id: 'wip', fillColor: 'white', textColor: 'black',
                        help: 'We couldn\'t find a match for your TIN.' +
                        ' Please check the information you have entered.',
                        length: 300},
                { id: 'draft', fillColor: 'black', textColor: 'white',
                        help: 'Please complete this'},
                { id: 'wip', fillColor: 'DarkGray', textColor: 'white',
                        help: 'This step requires completing the draft'},
                { id: 'submitted', fillColor: 'white', textColor: 'black',
                        help: 'This step requires completing the draft'},
                { id: 'active', fillColor: 'white', textColor: 'black',
                        help: 'This step requires completing the draft'},
                { id: 'expired', fillColor: 'white', textColor: 'black',
                        help: 'This step requires completing the draft'}
            ])
        },
        exits: [
            new pifSM.StateExit (
                { event: 'resubmit', eventName: 'Re-submit TIN Match'},
                function() {
                },
                'WIPTINMatchSubmitted'
            )
        ]
    }),
    new pifSM.StateNode( {
        id: 'WIPTINMatchSatisfied',
        state: function () {
            findArrow(arrows, 'wip').label = 'Work in Progress--TIN Consent Complete';
            setArrowProperties( arrows, [
                { id: 'draft', fillColor: 'black', textColor: 'white',
                        help: 'This step is complete'},
                { id: 'wip', fillColor: 'black', textColor: 'white',
                        help: 'This step is complete'},
                { id: 'submitted', fillColor: 'black', textColor: 'white',
                        help: 'Please enter in your core data, assertions, reps and certs, and points of contact to submit your entity for registration'},
                { id: 'active', fillColor: 'gray', textColor: 'black',
                        help: 'This step requires completing the draft'},
                { id: 'expired', fillColor: 'white', textColor: 'black',
                        help: 'This step requires completing the draft'}
            ])
        },
        exits: [
            new pifSM.StateExit (
                { event: 'submittocage', eventName: 'Submit to CAGE'},
                function() {
                },
                'SubmittedToCage'
            )
        ]
    }),
    new pifSM.StateNode( {
        id: 'SubmittedToCage',
        state: function () {
            findArrow(arrows, 'wip').label = 'Submitted to CAGE';
            setArrowProperties( arrows, [
                { id: 'draft', fillColor: 'black', textColor: 'white',
                                    help: 'Please complete this'},
                { id: 'wip', fillColor: 'black', textColor: 'white',
                                    help: 'This step requires completing the draft'},
                { id: 'submitted', fillColor: 'black', textColor: 'white',
                                    help: 'This step requires completing the draft'},
                { id: 'active', fillColor: 'black', textColor: 'white',
                                    help: 'This step requires completing the draft'},
                { id: 'expired', fillColor: 'white', textColor: 'black',
                                    help: 'This step requires completing the draft'}
            ])
        },
        exits: [
            new pifSM.StateExit (
                { event: 'cagestarted', eventName: 'Start CAGE process'},
                function() {
                    pifSM.report('cagestarted');
                },
                'CagePending'
            )
        ]
    }),
    new pifSM.StateNode( {
        id: 'CagePending',
        state: function () {
            setArrowProperties( arrows, [
                { id: 'draft', fillColor: 'black', textColor: 'white',
                                    help: 'Please complete this'},
                { id: 'wip', fillColor: 'black', textColor: 'white',
                                    help: 'This step requires completing the draft'},
                { id: 'submitted', fillColor: 'black', textColor: 'white',
                                    help: 'This step requires completing the draft'},
                { id: 'active', fillColor: 'black', textColor: 'white',
                                    help: 'This step requires completing the draft'},
                { id: 'expired', fillColor: 'white', textColor: 'black',
                                    help: 'This step requires completing the draft'}
            ])
        },
        exits: [
            new pifSM.StateExit (
                { event: 'cageerror', eventName: 'Error with CAGE'},
                function() {
                },
                'WIPTINMatchSatisfied'
            ),
            new pifSM.StateExit (
                { event: 'cagepassed', eventName: 'Cage passed'},
                function() {
                },
                'Active'
            )
        ]
    }),
    new pifSM.StateNode( {
        id: 'Active',
        state: function () {
            setArrowProperties( arrows, [
                { id: 'draft', fillColor: 'black', textColor: 'white',
                                    help: 'Please complete this'},
                { id: 'wip', fillColor: 'black', textColor: 'white',
                                    help: 'This step requires completing the draft'},
                { id: 'submitted', fillColor: 'black', textColor: 'white',
                                    help: 'This step requires completing the draft'},
                { id: 'active', fillColor: 'black', textColor: 'white',
                                    help: 'This step requires completing the draft'},
                { id: 'expired', fillColor: 'white', textColor: 'black',
                                    help: 'This step requires completing the draft'}
            ]),
            pifSM.report('satisfied: black black black black white');
        },
        exits: [
            new pifSM.StateExit (
                { event: 'completed', eventName: 'Completed'},
                function() {
                    pifSM.report('completed');
                },
                'Expired'
            )
        ]
    }),
    new pifSM.StateNode( {
        id: 'Expired',
        state: function () {
            setArrowProperties( arrows, [
                { id: 'draft', fillColor: 'black', textColor: 'white',
                                    help: 'Please complete this'},
                { id: 'wip', fillColor: 'black', textColor: 'white',
                                    help: 'This step requires completing the draft'},
                { id: 'submitted', fillColor: 'black', textColor: 'white',
                                    help: 'This step requires completing the draft'},
                { id: 'active', fillColor: 'black', textColor: 'white',
                                    help: 'This step requires completing the draft'},
                { id: 'expired', fillColor: 'black', textColor: 'white',
                                    help: 'This step requires completing the draft'}
            ]),
            pifSM.report('expired: black black black black black');
        },
        exits: [
            new pifSM.StateExit (
                { event: 'restart', eventName: 'Restart'},
                function() {
                    pifSM.report('restart');
                },
                'NotStarted'
            )
        ]
    })
];

var arrowSpecs = [
    {
        id: 'draft',
        length: 80,
        thickness:90,
        fillColor:'white',
        textColor:'black',
        help: 'Help me',
        label: 'Draft'
    },
    {
        id: 'wip',
        length: 170,
        thickness: 90,
        fillColor:'white',
        textColor:'black',
        help: 'Help me',
        label: 'Work in Progress'
    },
    {
        id: 'submitted',
        length: 160,
        thickness: 90,
        fillColor:'white',
        textColor:'black',
        help: 'Help me',
        label: 'CAGE Submission'
    },
    {
        id: 'active',
        length: 90,
        thickness: 90,
        fillColor:'white',
        textColor:'black',
        help: 'Help me',
        label: 'Active'
    },
    {
        id: 'expired',
        length: 100,
        thickness: 90,
        fillColor:'white',
        textColor:'black',
        help: 'Help me',
        label: 'Expired'
    }
];
})();
