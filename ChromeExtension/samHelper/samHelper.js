// This is the primary JavaScript 'glue' code that ties the app-agnostic
// usdsJsHelper library to the SAM application
//
// This file lives at: https://github.com/GSA-OCSIT/sam-helper
//
// REQUIREMENTS:
// usdsJsHelper.js must be loaded before execution
//

(function() {

    if (!localStorage.helperMode || localStorage.helperMode === 'help') {
        function DomSelectors() {   // Declare main selector strings to improve modularity

            this.pageName = 'div.page_heading'
            this.topBarInsertionPoint = '#UIPortalApplication'
            this.toggleHelperDiv = '<div class="busa" id="busa-toggle-div"><p><a href="#"' +
                            'id="busa-toggle">Minimize the SAM Helper</a></p></div>'
            this.quickHintDiv = '<div class="quick_hint" id="display-hover-text"></div>'
            this.helpBoxShadow = '<div id="help-shadow"></div>'
        }
        var dS = new DomSelectors();
        var uJH = new UsdsJsHelper();

        var progress;
        var pageName = $(dS.pageName).text();
        if (pageName) {
            pageName += $('div.sub_heading').text();
        } else {
            pageName = 'SAM.gov';
            $('div#busa-main').hide();
        }
        var pageToken = pageName.replace(/[^A-Za-z0-9]/g, '_');
        var siteData;
        var pageData;
        var arrowChainHtml;
        var useCaseHtml;

        if (sessionStorage.getItem("visible") == null) {
            sessionStorage.setItem("visible", 'true');
        }

        (function() {        // Load Ajax content in a synchronized function
            var callsLeft = 1;

            $.ajax({
                type: "GET",
                url: chrome.extension.getURL("samHelper/samHelper.json"),
                dataType: "json"
            }).done(function(msg) {
                  siteData = msg;
                callsLeft--;
                if (callsLeft === 0) {
                    $('html').trigger('ajaxDone');
                }
            }).fail(function(object, str) {
                console.log("Fail:" + str);
            });
        })();

        $('html').on('ajaxDone', function() {
            siteData.pages.some(function (page) {       // Select the JSON branch for this page
                if (page.page_name === pageToken) {
                    pageData = page;
                    return true;
                }
            });
            uJH.loadFieldHandlersForPage(pageData);
            progress = pageData.progress;

            $('body').prepend(dS.helpBoxShadow);
            $('body').prepend($(dS.toggleHelperDiv));
            $(dS.quickHintDiv).insertAfter($(dS.toggleHelperDiv));
            $('div#help-shadow').css({'height':
                            $('div.busa#busa-main').css('height')});

            $(siteData.assets.html.topBarContent.join('\n')).insertBefore(dS.topBarInsertionPoint);
            $('tbody tr.site_help_table_row#site_help_table_row ' +
                    'td.site_help_table_item#page_section').
                    html(pageData.assets.html.page_overview.join('\n'));

            if (pageData.page_help) {
                overviewText = '<div class="helper_item overview"' +
                    'title="overview_text"><p>' +
                    pageData.page_help +
                    '</p></div>';
            } else {
                overviewText = ' ';
            }
            $('tbody tr.site_help_table_row#site_help_table_row ' +
                    'td.site_help_table_item#site_section').
                        html(siteData.assets.html.site_help.join('\n'));
            $('tbody tr.site_help_table_row#site_help_table_row ' +
                    'td.site_help_table_item#progress_section').
                        html( arrowChainHtml );
                        // html('<p>Progress: ' + progress + '%</p>');

            if (progress === undefined) {
                progress = 'calculating';
            }

            $(document).ready(function() {
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
                }
                // define toggle/click/slide behavior
                $('#busa-toggle').click(function() {
                    if ( $('div.helper_item[title="site"]').is(":visible") ) {
                        $('div.helper_item[title="site"], div#help-shadow').slideUp();
                        $(this).text("View assistance for " + pageName);
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
