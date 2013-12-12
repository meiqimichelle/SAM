// This is the primary JavaScript 'glue' code that ties the app-agnostic
// usdsJsHelper library to the SAM application
//
// This file lives at: https://github.com/GSA-OCSIT/sam-helper
//
// It requires usdsJsHelper.js be loaded before execution

// Load Ajax content in a synchronized function

(function() {
    var usdsJsHelper = new UsdsJsHelper();

    var progress;
    var page_name = $('div.page_heading').text();
    if (page_name) {
        page_name += $('div.sub_heading').text();
    } else {
        page_name = 'SAM.gov';
        $('div#busa-main').hide();
    }
    var pageToken = page_name.replace(/[^A-Za-z0-9]/g, '_');
    var arrowChainHtml;
    var useCaseHtml;

    // define the insertion points
    var insertionPoints = {
        samInsertionPoint: $('#UIPortalApplication'),
        busa_main_div: $('<div class="busa" id="busa-main"><div id="busa-content"></div></div>'),
        busa_toggle_div:
        $('<div class="busa" id="busa-toggle-div"><p><a href="#" id="busa-toggle">Minimize the SAM Helper</a></p></div>'),
        quickHintDiv:
            $('<div class="quick_hint" id="display-hover-text"></div>'),
        progressDiv: $('<div class="progress" id="progress"></div>')
    };
    
    // insertionPoints.busa_main_div.insertBefore(insertionPoints.samInsertionPoint);
    $('body').prepend('<div id="help-shadow"></div>');
    $('body').prepend(insertionPoints.busa_toggle_div);
    insertionPoints.quickHintDiv.insertAfter(insertionPoints.busa_toggle_div);
    $('div#help-shadow').css({'height':
            $('div.busa#busa-main').css('height')});

    if (sessionStorage.getItem("visible") == null) {
        sessionStorage.setItem("visible", 'true');
    }

    (function() {
        var callsLeft = 3;

        // read the JSON workflow data
        // sessionStorage.processMap = '{}';
        // $.getJSON('http://mo.tynsax.com/api/operations/sam-system-of-award-management-registration-process/map',
                // function(data) {
            // sessionStorage.processMap = JSON.stringify(data);
            // callsLeft--;
            // if (callsLeft === 0) { $('html').trigger('ajaxDone'); }
        // });

        $.ajax({
            type: "GET",
            url: chrome.extension.getURL("samHelper/samHelper.json"),
            dataType: "json"
        }).done(function(msg) {
              var jsonForPage;
              msg.pages.some(function (page) {
                  if (page.page_name === pageToken) {
                      jsonForPage = page;
                      return true;
                  }
              });
        usdsJsHelper.loadFieldHandlersForPage(jsonForPage);
        progress = jsonForPage.progress;
        callsLeft--;
        if (callsLeft === 0) { $('html').trigger('ajaxDone'); }
        });
        $.ajax({
            type: "GET",
            url: chrome.extension.getURL("SamTracker/samtracker.html"),
            dataType: "html"
        }).done(function(msg) {
            arrowChainHtml =
                $(msg).filter('div.tracker-div').children('div.arrow-chain');
            useCaseHtml =
                $(msg).filter('div.tracker-div').children('div.usecase');
            callsLeft--;
            if (callsLeft === 0) { $('html').trigger('ajaxDone'); }
        });
        $.ajax({
            type: "GET",
            url: chrome.extension.getURL("samHelper/samHelper.html"),
            dataType: "html"
        }).done( function(data) {
            var pageContent = usdsJsHelper.contentForPgItm(data, pageToken);
            if (data.page_help) {
                overviewText = '<div class="helper_item overview"' +
                    'title="overview_text"><p>' +
                    data.page_help +
                    '</p></div>';
            } else if ((pageContent !== undefined) &&
                            (pageContent.overview_text !== undefined)) {
                overviewText = pageContent.overview_text.outerHTML;
            } else {
                overviewText = ' ';
            }
            var siteStuff =
                    usdsJsHelper.contentForPgItm(data, 'site_info');
            $(siteStuff.site).insertBefore(insertionPoints.samInsertionPoint);
            $('tbody tr.site_help_table_row#site_help_table_row ' +
                    'td.site_help_table_item#page_section').
                    html(overviewText);
            var siteInfo ='<div class="helper_item help_info" title="help">' +
                    '<dl><dt><p>Get Help:</p><p>Email</dt>' +
                        '<dd><a href="mailto:sam-help@gsa.gov">' +
                        'sam-help@gsa.gov</a></dd>' +
                        '<dd>1-800-xxx-xxxx</a></dd></dl></div>';
            $('tbody tr.site_help_table_row#site_help_table_row ' +
                    'td.site_help_table_item#site_section').
                        html(siteInfo);
            $('tbody tr.site_help_table_row#site_help_table_row ' +
                    'td.site_help_table_item#progress_section').
                        html( arrowChainHtml );
                        // html('<p>Progress: ' + progress + '%</p>');

            $('dd#button-me').html( '<button id="view-workflow" name="show-mo" type="button">View</button>');
            $('dd#button-me').click(function() {
                $(window.open('', 'workflow',
                        'location=no, height=600, width=600').document.body).html(sessionStorage.processMap);
            });
            $('dd#wiz-me').
                    html( '<button id="launch-wizard" name="launch-wizard" type="button">Take me to the Wizard</button>');
            $('dd#wiz-me').click(function() {
                $(window.open('', 'wizard',
                        'location=no, height=600, width=600').document.body).html("I will be your wizard");
            });
            if (progress === undefined) {
                progress = 'calculating';
            }
        callsLeft--;
        if (callsLeft === 0) { $('html').trigger('ajaxDone'); }
        }).fail(function(jqXHR, textStatus) {
            alert('failed to read page content');
        });
    })();

if (!localStorage.helperMode || localStorage.helperMode === 'help') {
    $(document).ready(function() {
        $('html').on('ajaxDone', function() {
            // insert the DIVs into the DOM
            var fields, contentItems;
            var arrowChainHtml, useCaseHtml;


            // you can even blank out wrong choices!
            if (pageToken === 'Create_an_AccountChoose_Account_Type_') {
                $('div.sub_heading').text("");
                $('div.search_entity_results_div2').filter(function() {
                      return $(this).css('float') == 'right';
                }).remove();
                var itemToHide = $('div.search_entity_results_div2').filter(function() {
                                  return $(this).css('float') == 'right';
                                                 });
                itemToHide.prepend($(hideSysAccount));
            }
            // define toggle/click/slide behavior
            $('#busa-toggle').click(function() {
                if ( $('div.helper_item[title="site"]').is(":visible") ) {
                    $('div.helper_item[title="site"], div#help-shadow').slideUp();
                    $(this).text("View assistance for " + page_name);
                sessionStorage.usdsJsHelperVisible = 'false';
                } else {
                    $('div.helper_item[title="site"], div#help-shadow').slideDown();
                    $(this).text("Minimize the SAM Helper");
                sessionStorage.usdsJsHelperVisible = 'true';
                }
            });

            // trigger opening animation
            if (sessionStorage.usdsJsHelperVisible !== 'false') {
                sessionStorage.usdsJsHelperVisible = 'true';
            }

            if ( sessionStorage.usdsJsHelperVisible === 'true') {
                $('div#busa-main').slideDown();
            } else {
                $('div#busa-main').slideUp();
            }
            });

        });
    }
})();
