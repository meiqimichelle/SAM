// This is the primary JavaScript 'glue' code that ties the app-agnostic
// usdsJsHelper library to the SAM application
//
// This file lives at: https://github.com/GSA-OCSIT/sam-helper
//
// REQUIREMENTS:
// usdsJsHelper.js must be loaded before execution
//

(function() {
    if ( !SAM_HELPER_MODE ) {  // set if the extension includes configuration tool
        chrome.runtime.sendMessage({'command': 'get-helper-mode'}, function(response) {
            if (response.helperMode === 'help') {
                beAHelper();
            }
        });
    } else if ( SAM_HELPER_MODE === 'help') {
        beAHelper();
    }

    function beAHelper() {
        function DomSelectors() {   // Declare main selector strings to improve modularity

            this.pageName = 'div.page_heading'
            this.topBarInsertionPoint = '#UIPortalApplication'
            this.toggleHelperDiv =
                            '<div class="help-toggler" id="helper-toggle-div"><p><a href="#"' +
                            'id="toggle-link">Minimize the SAM Helper</a></p></div>'+
                            '<div class="help-shadow" id="toggle-shadow"></div>'
            this.quickHintDiv = '<div class="quick_hint" id="display-hover-text"></div>'
            this.helpBoxShadow = '<div id="help-shadow"></div>'
            this.siteHelpInsertionPoint = 'div#site-help'
            this.pageHelpInsertionPoint = 'div#page-help'
            this.progressInsertionPoint = 'div#progress'
        }
        var dS = new DomSelectors();
        var uJH = new UsdsJsHelper();

        var progress;
        var pageName = $(dS.pageName).text();
        if (pageName) {
            pageName += $('div.sub_heading').text();
        } else {
            pageName = 'SAM.gov';
            $('div#helper-top-bar').hide();
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

            var delegate = new SamHelperDelegate();
            delegate.doneFn = function(msg) {
                siteData = msg;
                callsLeft--;
                if (callsLeft === 0) {
                    $('html').trigger('ajaxDone');
                }
            };

            delegate.failFn = function(object, str) {
                console.log("Fail:" + str);
            };

            delegate.getSiteData();
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
            $(siteData.assets.html.pullTab.join('\n')).insertBefore(dS.topBarInsertionPoint);
            $(siteData.assets.html.topBarContent.join('\n')).insertBefore(dS.topBarInsertionPoint);
            $(dS.siteHelpInsertionPoint).
                    html( siteData.assets.html.site_help.join('\n'));
            $(dS.pageHelpInsertionPoint).
                    html( pageData.assets.html.page_help.join('\n'));
            $(dS.progressInsertionPoint).
                    // html('<p>Progress: ' + progress + '%</p>');
                    html('<img src="' + chrome.extension.getURL("Images/simTracker.png") +
                        '" height="100px" width="500px" />')
            $('div#toggle-shadow').css({
                                    'height': $('div#helper-toggle-div').css('height'),
                                    'width': $('div#helper-toggle-div').css('width')
                                    });
            $('div#helper-top-bar').css({
                                    'top': $('div#helper-toggle-div').css('height'),
                                    });
            $('div#help-shadow').css({'height':
                            $('div#helper-top-bar').css('height')});


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
                $('a#toggle-link').click(function() {
                    if ( $('div#helper-top-bar').is(":visible") ) {
                        $('div#helper-top-bar, div#help-shadow').slideUp();
                        $(this).text("View assistance for " + pageName);
                    sessionStorage.usdsJsHelperVisible = 'false';
                    } else {
                        $('div#helper-top-bar, div#help-shadow').slideDown();
                        $(this).text("Minimize the SAM Helper");
                    sessionStorage.usdsJsHelperVisible = 'true';
                    }
                });

                // trigger opening animation
                if (sessionStorage.usdsJsHelperVisible !== 'false') {
                    sessionStorage.usdsJsHelperVisible = 'true';
                }

                if ( sessionStorage.usdsJsHelperVisible === 'true') {
                    $('div#helper-top-bar').slideDown();
                } else {
                    $('div#helper-top-bar').slideUp();
                }
            });
        });
    }
})();
