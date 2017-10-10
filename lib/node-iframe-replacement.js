'use strict';

var config = require('../config/config.json'),		// config file
	isUrl = require('is-url'),              // module use to verify the sourceUrl is an actual URL
    cheerio = require('cheerio'),           // used to convert raw html into jQuery style object to we can use css selectors
    request = require('request-promise'),   // promise based request object
    NodeCache = require('node-cache'),    	// auto expiring in memory caching collection
    cache = new NodeCache({ stdTTL: 300 }); // cache source HTML for 5 minutes, after which we fetch a new version

module.exports = function(req, res, next) {

    // add res.merge to response object to allow us to fetch template url or use html template string
    res.merge = function(view, model, callback) {

        if (!model.sourceUrl) {
            // no .sourceUrl, therefore process this as normal
            res.render(view, model, callback);
        }
        else {

            // if no template selector provided, use body tag
            var sourcePlaceholder = model.sourcePlaceholder || 'body';

            // resolve the template, either url to jquery object or html
            resolveTemplate(model.sourceUrl).then(function($template) {

                // if a transform method is provided, execute
                if (model.transform) {
                    // pass a jquery version of the html along with a copy of the model
                    model.transform($template, model);
                }

                // convert view into html to be inserted
                res.render(view, model, function(err, html) {
                    if (err) next(err);

                    // convert view into jquery object
                    var $view = cheerio.load(html);

                    // if the view contains a head, append its contents to the original
                    var $viewHead = $view('head');
                    if ($viewHead && $viewHead.length > 0) {
                        // append meta, link, script and noscript to head
                        $template('head').append($viewHead.html());
                    }

                    // if the view has a body, use its contents otherwise use the entire content
                    var $viewBody = $view('body');

                    if ($viewBody && $viewBody.length > 0) {
                        // inject content into selector or body
                        $template(sourcePlaceholder).html($viewBody.html());    
                    }
                    else {
                        // no body tag in view, insert all content
                        $template(sourcePlaceholder).html($view.html());   
                    }

                    // return merged content
                    res.status(200).send($template.html());
                });
            })
            .catch(function(err) {
                // request failed, inform the user
                res.status(500).send(err).end(); 
            });
        }
    };

    next();
};

/**
 * @description Converts source url to $ object
 * @param {string} sourceUrl - url to external html content
 * @returns {Promise} returns promise of html source from sourceUrl
 */
function resolveTemplate(sourceUrl) {

    return new Promise(function(resolve, reject) {

        // if its a url and we have the contents in cache
        if (isUrl(sourceUrl) && cache.get(sourceUrl)) {

            // get source html from cache
            var html = cache.get(sourceUrl);

            // covert html into jquery object
            var $ = cheerio.load(html);

            // return source as a jquery style object
            resolve($);
        }
        else if (isUrl(sourceUrl)) {

            var params = {
                uri: sourceUrl,
				gzip: true, //use this flag to uncompress content received from server if any
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
                }
             };

            // request the source url
            return request(params).then(function(html) {

                // convert html into jquery style object so we can use selectors
                var $ = cheerio.load(html);

                // insert base tag to ensure links/scripts/styles load correctly
                $('head').prepend('<base href="' + sourceUrl + '">');
				
				var enableHttps = process.env.ENABLE_HTTPS == 'TRUE' ? true : false;
				var sourceServer = (enableHttps ? 'https://' : 'http://') + process.env.SERVER_NAME + ':' + process.env.SERVER_PORT;
				
				$('head').append('<script type="text/javascript">var PROXY_SERVER="' + sourceServer + '", TARGET_SERVER="' + process.env.TARGET_SERVER_URL + '";</script>')
				
				$('body').attr('onload', 'tagonFadeOutPreload(' + '"' + process.env.TARGET_SERVER_URL + '"' + ')');
				$('a').attr('onclick', 'tagonFadeInPreload(' + '"' + process.env.TARGET_SERVER_URL + '"' + ')');
				
				$('body').append('<div id="fake-collection-bar"></div>');

                $('img').attr('data-target-server', process.env.TARGET_SERVER_URL);
                $('a').attr('data-target-server', process.env.TARGET_SERVER_URL);
				
				// insert drag-drop event on images
				$('img').attr('ondragstart', 'tagonDragStart(event, ' + '"' + process.env.TARGET_SERVER_URL + '"' + ')');
                $('img').attr('ondragend', 'tagonDragEnd(event)');
                $('img').attr('draggable', 'true');

                $('a').attr('ondragstart', 'tagonDragStart(event, ' + '"' + process.env.TARGET_SERVER_URL + '"' + ')');
                $('a').attr('ondragend', 'tagonDragEnd(event)');
                $('a').attr('draggable', 'true');

                // Prevent right click
                $('body').attr('oncontextmenu', 'return false');
				
                // Prevent links open to new tab
                $('a').attr('target', '_self');

				// Hide all buttons - include also addToCart button
				$('button').css('display', 'none');
				
				// Load jQuery and fix conflict if any
				$('body').append('<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js" type="text/javascript"></script>');
				$('body').append('<script type="text/javascript">var tagonJquery = jQuery.noConflict(true);</script>');
				
				$('body').append('<script type="text/javascript">function tagonDone(){for(var e=document.getElementsByTagName("a"),t=0;t<e.length;t++)e[t].href="'+sourceServer+'"+"/proxy?url="+e[t].href;for(var a=document.getElementsByClassName("zoomContainer"),t=0;t<a.length;t++)a[t].style="display: none";}var isPageLoadedInterval=setInterval(function(){"complete"===document.readyState&&(clearInterval(isPageLoadedInterval),tagonDone())},100);</script>');
				
				// Test if jquery is loaded correctly
				$('body').append('<script type="text/javascript">tagonJquery(document).ready(function(){console.log(tagonJquery().jquery)});</script>');
				
				// Load external script for mobile drag drop
				$('body').append('<script src="'+sourceServer+'/load?file=js/drag-drop-polyfill.js'+'" type="text/javascript"></script>');
				
				// Load external script for desktop drag drop
				$('body').append('<script src="'+sourceServer+'/load?file=js/drag-drop.js'+'" type="text/javascript"></script>');
				
				// Load external scripts for each specific shop here!!!
				var shopUrl = getShopUniqueUrl(sourceUrl);
				if(config.jsConfigMap[shopUrl]) {
					var script_list = config.jsConfigMap[shopUrl].externalScripts;
					console.log(script_list);
					for(var i=0; i<script_list.length;i++){
						var script_name = script_list[i].split("config/")[1];
						console.log(script_name);
						$('body').append('<script src="'+sourceServer+'/load?file='+ script_name+'" type="text/javascript"></script>');						
					}
				}		

                // cache result as HTML so we dont have to keep getting it for future requests and it remains clean
                cache.set(sourceUrl, $.html());

                // resolve with jquery object containing content
                resolve($);
            })
            .catch(function(err) {

                // request failed
                reject('Unable to retrieve ' + sourceUrl);
            });
        }
        else {
            // the sourceUrl must contain markup, just return it
            resolve(sourceUrl);
        }
    });
}

function getShopUniqueUrl(sourceUrl) {
	var shopUniqueUrl = '';
	if(sourceUrl.startsWith('http://')) {
		shopUniqueUrl = sourceUrl.substring(sourceUrl.indexOf('http://') + 7, sourceUrl.length);
		shopUniqueUrl = shopUniqueUrl.substring(0, shopUniqueUrl.indexOf('/') > -1 ? shopUniqueUrl.indexOf('/') : shopUniqueUrl.length);
	}
	else if(sourceUrl.startsWith('https://')) {
		shopUniqueUrl = sourceUrl.substring(sourceUrl.indexOf('https://') + 8, sourceUrl.length);
		shopUniqueUrl = shopUniqueUrl.substring(0, shopUniqueUrl.indexOf('/') > -1 ? shopUniqueUrl.indexOf('/') : shopUniqueUrl.length);
	}
	return shopUniqueUrl;
}
