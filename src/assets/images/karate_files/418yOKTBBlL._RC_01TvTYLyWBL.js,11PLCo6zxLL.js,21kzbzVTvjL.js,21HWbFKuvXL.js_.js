(function(f){var h=window.AmazonUIPageJS||window.P,k=h._namespace||h.attributeErrors,r=k?k("CustomerReviewsCommonAssets",""):h;r.guardFatal?r.guardFatal(f)(r,window):r.execute(function(){f(r,window)})})(function(f,h,k){function r(){}f.when("A","cr-log-utils","cr-streaming-utils").register("cr-ajax-model",function(c,d,b){function a(a){l[a]&&(l[a].abort(),delete l[a])}function e(n,g,p,q,t,u,f,k){g=g||{};g.params=g.params||{};var x=u?u:v=v++;u=x;t=t?t:g.error||function(){};q=q?q:0;p=p?p:2;k=k?k:"FATAL";
var r="FATAL"===k?0:1,w=g.finallyCallback||function(){};f||(f="reviewsAjax"+m++,h.uet&&h.uet("tc",f));g.params.scope=f;g.contentType=g.contentType||"application/x-www-form-urlencoded;charset\x3dUTF-8";var y=g.success||function(){};g.success=function(a){delete l[u];"function"===typeof y&&y(a);"function"===typeof w&&w(a)};g.error=function(b,c,m){a(u);b=b||{};var l=(b.http||{}).status||"[]";q++;q<p?(c="AJAX Post to "+n+" from "+h.location.href+" failed, status code passed through parameter was: "+c+
", status code extracted from XHR HTTP object was: "+l+", attempt "+q+" of "+p+", error message was: \n "+m,d.logError(c,"WARN"),e(n,g,p,q,t,u,f,k)):(c="AJAX Post to "+n+" from "+h.location.href+" failed, status code passed through parameter was: "+c+", status code extracted from XHR HTTP object was: "+l+", exhausted "+p+" attempt(s), error message was: \n "+m,d.logError(c,k),d.logCount("AjaxFailureFatal",r),"function"===typeof t&&t(b),"function"===typeof w&&w(b))};"function"!==typeof g.chunk&&(g.chunk=
function(a){"appendFadeIn"===a[0]?b.appendFadeIn(a):"replace"===a[0]&&b.replace(a)});l[u]=c.post(n,g);return u}var m=0,v=1,l={};return{abort:a,post:e,postWithoutFatals:function(a,b,c,m,d,l,v){return e(a,b,c,m,d,l,v,"WARN")}}});"use strict";f.when("A","cr-jQuery","cr-log-utils","cr-number-utils").register("cr-A",function(c,d,b,a){c.getListFromState=function(a){var b=c.map(d("#cr-state-object, .cr-state-object"),function(a){return d(a).data("state")});return c.reduce(b,function(b,c){c!==k&&c[a]!==k&&
b.push(c[a]);return b},[])};c.getValueFromState=function(a){var e=c.getListFromState(a);1<e.length&&b.logError("More than one  value defined for key: "+a,"ERROR");return e[0]};var e={top:-100,left:-100};c.inView=function(a){a=a||d();if("function"===typeof a.offset){var b=(a.offset()||e).top-d(h).scrollTop();a=0<=b;b=b<d(h).height();return a&&b}return!1};c.onScreenAndVisible=function(b,c){b=b||d();c=a.isFiniteNumber(c)?c:0;if(b instanceof d||b.jquery){if(!b.is(":visible"))return!1;b=b[0].getBoundingClientRect();
return b.top>=0-c&&b.left>=0-c&&b.bottom<=d(h).height()+c&&b.right<=d(h).width()+c}return!1};c.compositeEventWrapper=function(a,e,d){var l=a;d&&(l=c.throttle(l,d,{trailing:!1}));return b.jsGuard(function(a){a&&(l(a),e&&a.$event&&a.$event.preventDefault())})};c.freeze=function(a){return"undefined"!==typeof Object&&"function"===typeof Object.freeze?Object.freeze(a):a};c.isFrozen=function(a){return"undefined"!==typeof Object&&"function"===typeof Object.isFrozen?Object.isFrozen(a):!1};return c});"use strict";
f.when("jQuery").register("cr-jQuery",function(c){return c});"use strict";f.declare("reviews-constants",{PUSH_STATE:!0,REPLACE_STATE:!1,RATING_SERVICE_CONTEXT_ID:"ReviewsConsumption",data:{REFTAG:"data-reftag",CSM_COUNTER:"data-csm-counter",getReviews:{STANDARD:"data-reviews-state-param",CHECKED:"data-reviews-param-checked",UNCHECKED:"data-reviews-param-unchecked"}},events:{CONTENT_CHANGED:"reviews:content-changed",RELOAD:"reviews:content-reload",RELOAD_COMPLETE:"reviews:content-reload-complete",
AUTOSCROLL_COMPLETE:"reviews:autoscroll-complete",FILTER_FIRE_AGGREGATE:"reviews:filter-action:aggregate:trigger",FILTER_FIRE_UPDATE:"reviews:filter-action:trigger",FILTER_AGGREGATE:"reviews:filter-action:aggregate",FILTER_PUSH:"reviews:filter-action:push-state",FILTER_REPLACE:"reviews:filter-action:replace-state",PAGINATION:"reviews:page-action",SEARCH_TEXTBOX:"reviews:search-textbox",SEARCH_BUTTON:"reviews:search-button",VOTE:"reviews:vote-action",TOGGLE_CLASS_CLICK:"reviews:toggle-class:click",
AJAX_POST:"reviews:ajax-post",SCROLL_TO_ELEMENT_CLICK:"reviews:scroll-to-element:click",OPEN_MASH_MODAL:"reviews:open-mash-modal",FILTER_APPLY:"reviews:filter-action:apply",FILTER_CHANGE:"reviews:filter-action:change",FILTER_TAB_CLICKED:"reviews:filter-action:tab-clicked",FILTER_APPLY_BEGIN:"reviews:filter-action:apply-begin",FILTER_APPLY_SUCCESS:"reviews:filter-action:apply-success",FILTER_APPLY_ERROR:"reviews:filter-action:apply-error",FILTER_APPLY_DONE:"reviews:filter-action:apply-done",INPUT_COMMENT:"reviews:input-comment",
SUBMIT_COMMENT:"reviews:submit-comment",OPEN_SUBMISSION_COMMENT:"reviews:open-comment-submission",SORT_COMMENTS:"reviews:sort-comments",MORE_COMMENTS:"reviews:more-comments",EDIT_COMMENT:"reviews:edit-comment",CANCEL_EDIT_COMMENT:"reviews:cancel-edit-comment",DELETE_COMMENT:"reviews:delete-comment",SUBMIT_EDIT_COMMENT:"reviews:submit-edit-comment",MODIFY_EDIT_COMMENT:"reviews:modify-edit-comment",INPUT_PRODUCT_LINK:"reviews:input-product-link",SELECT_PRODUCT_LINK:"reviews:select-product-link",STAR_RATING_CLICK:"ryp:star-rating-click",
STAR_RATING_CLEAR:"ryp:star-rating-clear-click",TRIGGER_WEBLAB:"reviews:trigger-weblab",REFTAG_TRIGGER:"reviews:trigger-reftag"},filterOptions:{SORT_KEY:"sortBy",HELPFUL:"helpful",RECENT:"recent",LEGACY_HELPFUL:"byRankDescending",LEGACY_RECENT:"bySubmissionDateDescending",MOBILE_HELPFUL:"sh",MOBILE_RECENT:"sd",STAR_KEY:"filterByStar",ALL_STARS:"all_stars",ONE_STAR:"one_star",TWO_STAR:"two_star",THREE_STAR:"three_star",FOUR_STAR:"four_star",FIVE_STAR:"five_star",POSTIVE:"positive",CRITICAL:"critical",
FORMAT_KEY:"formatType",ALL_FORMATS:"all_formats",CURRENT_FORMAT:"current_format",AVP_KEY:"reviewerType",ALL_REVIEWS:"all_reviews",AVP_ONLY:"avp_only_reviews",MEDIA_KEY:"mediaType",ALL_CONTENTS:"all_contents",MEDIA_ONLY:"media_reviews_only",LANGUAGE_KEY:"filterByLanguage",HEIGHT_KEY:"filterByHeight",WEIGHT_KEY:"filterByWeight"},keycodes:{ENTER:13,BACK_SPACE:8,SPACE:32},aui:{HIDDEN:"aok-hidden",NOWRAP:"aok-nowrap"}});"use strict";f.when("A","cr-string-utils","cr-log-utils").register("cr-popup",function(c,
d,b){function a(a){var e={};a&&a.data&&(e=a.data);var f=d.defaultIfBlank(e.url,a.$target.find("a").andSelf().filter("a").attr("href")),l=d.defaultIfBlank(e.title,"CustomerReviews");l=""+l;var n="";c.each({width:"500",height:"500",resizable:"1",scrollbars:"1",toolbar:"0",status:"1"},function(a,b){a=d.defaultIfBlank(e[b],a);n+=b+"\x3d"+a+","});n=n.slice(0,-1);var g=null;try{(g=h.open(f,l,n))?g.focus():b.logError("Unable to move focus to popup window with data: "+d.stringify(e),"ERROR"),a.$event.preventDefault()}catch(p){b.logError("Unable to open window with parameters: "+
d.stringify(e),"FATAL",p)}return g}c.declarative("cr-popup",["click"],b.jsGuard(a));return{popup:a}});"use strict";f.when("A","cr-jQuery","reviews-constants","cr-ajax-model","cr-string-utils","cr-global-view").register("cr-generic-declarative-actions",function(c,d,b,a,e,m){function f(a){g(a)&&a.data.selector&&a.data.cssClass&&(d(a.data.selector).toggleClass(a.data.cssClass),a.$event.preventDefault(),c.trigger("a:pageUpdate"))}function l(a){g(a)&&a.data.scrollToSelector&&(m.scrollTo(a.data.scrollToSelector,
0),a.$event.preventDefault())}function n(b){if(g(b)&&b.data.url&&b.data.params){b.$event.preventDefault();c.declarative.remove(b.$currentTarget,q.AJAX_POST);b=b.data;var e=b.params,l=d(b.indicatorSelector)[0],m=p(d.fn.hide,b.hideOnSuccessSelector),t=p(d.fn.show,b.showOnFailureSelector);d(b.removeOnLoadSelector).remove();a.post(b.url,{params:e,indicator:l,success:m,error:t})}}function g(a){return a&&a.data&&a.$event&&"function"===typeof a.$event.preventDefault}function p(a,b){if(b&&"function"===typeof a)return function(){var c=
d(b);0<c.length&&a.call(c)}}var q=b.events;c.declarative(q.TOGGLE_CLASS_CLICK,"click",f);c.declarative(q.SCROLL_TO_ELEMENT_CLICK,"click",l);c.declarative(q.AJAX_POST,"click",n);return{toggleCssClass:f,scrollToElement:l,ajaxPost:n}});"use strict";f.register("cr-global-model",function(){return{generateUrl:function(c,d){c&&"/"!==c.charAt(c.length-1)&&(c+="/");c&&d&&(c=c+"ref\x3d"+d);return c}}});"use strict";f.when("A","a-expander","cr-jQuery","reviews-constants","cr-string-utils").register("cr-global-view",
function(c,d,b,a,e){function m(a){var b="";if(a&&a.closest!==k){var c=a.closest("*["+g.REFTAG+"]");c&&(b=c.attr(g.REFTAG))}e.isBlank(b)&&a&&a.closest!==k&&(a=a.closest("*[rel]"))&&(b=a.attr("rel"));return e.defaultIfBlank(b,"cm_cr_unknown")}function f(a){return a&&"function"===typeof a.is?a.is("*["+g.getReviews.CHECKED+"]")&&a.is("*["+g.getReviews.UNCHECKED+"]"):!1}function l(a){return a&&a.has!==k&&a.is!==k?0<a.find(":checked").length||a.is(":checked"):!1}function n(a,b){return a&&a.attr!==k&&b?
e.parseJSON(a.attr(b))||{}:{}}var g=a.data;c.on("a:pageUpdate",function(){d!==k&&d.initializeExpanders()});return{getReviewsStateParamsFromElement:function(a){var b=c.reduce(g.getReviews,function(a,b){return a+"*["+b+"],"},"").slice(0,-1),e;b&&a&&a.closest!==k&&(e=a.closest(b));return f(e)?l(e)?n(e,g.getReviews.CHECKED):n(e,g.getReviews.UNCHECKED):n(e,g.getReviews.STANDARD)},getReftag:function(a){if(a&&a.$target)var c=a.$target;a&&a.id&&(c=b("#"+a.id));a&&a.expander&&a.expander.$expander&&(c=a.expander.$expander);
c=m(c);"cm_cr_unknown"===c&&a&&a.data&&a.data.reftag&&(c=a.data.reftag);return c},getReftagByDom:m,scrollTo:function(a,c){a=b(a).offset();c=c||0;var e=b("#cr-state-object").data("state");e=e!==k&&e.disableScroll;a&&a.top!==k&&!e&&(b("html,body").stop(),b("html,body").animate({scrollTop:a.top-c},{queue:!1,duration:500}))}}});"use strict";f.when("cr-A","cr-jQuery","cr-lazy-widget-model","cr-lazy-widget-view","cr-log-utils","cr-number-utils","cr-string-utils","cr-uri-utils","ready").register("cr-lazy-widget-controller",
function(c,d,b,a,e,m,f,l){function n(d){var g=c.getValueFromState("lazyWidgetDomainWhitelist"),m=l.getCurrentHostname();if(g)b:{for(var h=0;h<g.length;h++)if(f.endsWith(m,g[h])){e.logCount("LazyWidgetInvalidDomain",0);break b}e.logError("AJAX triggered from invalid domain: "+m,"WARN");e.logCount("LazyWidgetInvalidDomain",1)}else e.logCount("LazyWidgetInvalidDomain",1),e.logError("AJAX triggered with null whitelist from domain: "+m,"WARN");b.loadLazyWidgets(a.getLazyWidgetStubs())&&(e.logCount("LazyWidgetTrigger",
1),e.logCount("LazyWidgetTrigger:"+d,1))}var g={};g.bufferPixels=m.convertToInteger(c.getValueFromState("lazyWidgetLoaderBufferPixels"),1E3);g.delayBeforeTriggering=m.convertToInteger(c.getValueFromState("lazyWidgetLoaderDelayBeforeTriggering"),5E3);g.triggerLazyLoadIfWidgetWithinBuffer=function(e){b.lazyLoadHasTriggered()||a.getLazyWidgetStubs().each(function(a,b){if(c.onScreen(d(b),g.bufferPixels))return n("scroll"),c.off("scroll",g.triggerLazyLoadIfWidgetWithinBuffer),!1})};var h={};g.logVisibleStubMetrics=
function(b){a.getLazyWidgetStubs().each(function(a,b){a=d(b);b=a.data("widget-name");!h[b]&&c.onScreen(a)&&(e.logCount("VisibleLazyWidgetStub",1),e.logCount("VisibleLazyWidgetStub:"+b,1),h[b]=!0)})};c.on("scroll",g.logVisibleStubMetrics);c.on("scroll",g.triggerLazyLoadIfWidgetWithinBuffer);d(a.getHoverTargets()).mouseenter(function(){n("hover")});e.logCount("LazyWidgetTrigger",0);return c.freeze(g)});"use strict";f.when("cr-A","cr-ajax-model","cr-uri-utils","ready").register("cr-lazy-widget-model",
function(c,d,b){var a={},e=c.getValueFromState("lazyWidgetLoaderUrl"),m=!1;a.loadLazyWidgets=function(a){if(!m&&0<a.length){m=!0;var l=c.getValueFromState("asin"),f=c.getValueFromState("lazyWidgetCsrfToken"),g=c.getValueFromState("languageOfPreference");a=c.reduce(a,function(a,b){return a+"\x26lazyWidget\x3d"+c.$(b).data("widget-name")},e+"?asin\x3d"+l+"\x26csrf\x3d"+f+"\x26language\x3d"+g);d.postWithoutFatals(a,{success:r,cache:!1,headers:{"cache-control":"no-cache"},params:b.getUrlParametersMap()||
{}});return!0}return!1};a.lazyLoadHasTriggered=function(){return m};return c.freeze(a)});"use strict";f.when("cr-A","cr-jQuery","ready").register("cr-lazy-widget-view",function(c,d){var b={},a=c.getValueFromState("lazyWidgetLoaderHoverTargetsSelector")||"";b.getLazyWidgetStubs=function(){return d(".cr-lazy-widget")};b.getHoverTargets=function(){d(a)};return c.freeze(b)});"use strict";f.when("A").register("cr-log-utils",function(c){function d(a,b,c){h.ueLogError&&("string"!==typeof b&&(b="FATAL"),
c?h.ueLogError(c,{message:a,logLevel:b.toUpperCase(),attribution:"CustomerReviewsJS"}):h.ueLogError({message:a},{logLevel:b.toUpperCase(),attribution:"CustomerReviewsJS"}))}function b(a,b){return"string"===typeof b?b+a:"CustomerReviews:"+a}return{logError:d,jsGuard:function(a){if("function"===typeof a)return function(){try{return a.apply(this,arguments)}catch(e){d("Uncaught Error in function","FATAL",e)}};d("Unable to wrap non-function","ERROR");return a},incrementCount:function(a,c){h.ue&&(a=b(a,
c),c=h.ue.count(a)||0,h.ue.count(a,c+1))},logCount:function(a,c,d){h.ue&&(a=b(a,d),h.ue.count(a,c))}}});"use strict";f.when("A","reviews-constants").register("cr-mash-utils",function(c,d){function b(a){f.when("mash").execute(function(b){b.navstack.begin().modalOpen(a).end()})}var a=!1;f.when("mash").execute(function(){a=!0});c.declarative(d.events.OPEN_MASH_MODAL,"click",function(a){b(a.data.url);a.$event.preventDefault()});return{isMash:function(){return a},openModal:b}});"use strict";f.when("A",
"cr-log-utils").register("cr-number-utils",function(c,d){return{convertToInteger:function(b,a){if(b===parseInt(b,10))return b;if(null!==b&&b!==k&&""!==b)return parseInt(b.replace(/[^0-9]/g,""),10);if(a!==k)return a;d.logError("convertToInteger","Cannot convert "+b+" to Integer");return 0},isFiniteNumber:function(b){return"number"===typeof b&&!isNaN(b)&&isFinite(b)}}});"use strict";f.when("A","reviews-constants","cr-ajax-model").register("cr-reftag-utils",function(c,d,b){function a(a){b.post(a)}c.declarative(d.events.REFTAG_TRIGGER,
"click",function(b){b.data.refMarker&&b.data.reftagTriggerUrl&&a(b.data.reftagTriggerUrl+"/ref\x3d"+b.data.refMarker)});return{triggerRefTag:a}});"use strict";f.when("A","cr-jQuery").register("cr-streaming-utils",function(c,d){return{appendFadeIn:function(b){if(null!==b&&2<b.length&&null!==b[1]&&null!==b[2]){var a=b[1];b=d(b[2]).hide();d(a).append(b);c.fadeIn(b,500,"ease-in-out",function(){})}},replace:function(b){if(null!==b&&2<b.length&&null!==b[1]&&null!==b[2]){var a=b[2];d(b[1]).replaceWith(d(a))}}}});
"use strict";f.when("A","cr-log-utils").register("cr-string-utils",function(c,d){function b(a){return null===a||a===k?!0:0===c.trim(a).length}return{defaultIfBlank:function(a,c){return b(a)?c:a},isBlank:b,parseJSON:function(a){try{return c.parseJSON(a)}catch(e){d.logError("Unable to parse JSON object","ERROR",e)}return null},startsWith:function(a,b){return a===b?!0:null===a||null===b?!1:0===a.indexOf(b)},endsWith:function(a,b){if(a===b)return!0;if(null===a||null===b)return!1;var c=a.lastIndexOf(b);
return-1!==c&&c===a.length-b.length},stringify:function(a){return h.JSON&&h.JSON.stringify?h.JSON.stringify(a):a}}});"use strict";f.when("A").register("cr-uri-utils",function(c){function d(){return h.location.hostname}function b(a){a=a||h.location.href;var b={},d=a.indexOf("?"),f=a.indexOf("#");a=a.slice(d+1,f>d?f:k)||"";d=[];-1<a.indexOf("\x26")?d=a.split("\x26"):-1<a.indexOf("\x3d")&&(d=[a]);c.each(d,function(a,c){0<a.indexOf("\x3d")&&(a=a.split("\x3d"),b[a[0]]=a[1])});return b}return{getUrlParametersMap:b,
addKeyValuePair:function(a,c,d){d=d||0;if(b(a)[c]===d||!a||!c)return a;c="?"+c+"\x3d"+d;return-1<a.indexOf("?")?a.replace("?",c+"\x26"):a+c},getCurrentHostname:d,getDomainRealmBaseUrl:function(a){a=a||d();if(-1!==a.indexOf(".corp.amazon.com"))return"https://development.amazon.com/";if(-1!==a.indexOf(".proxy.amazon.com")){a=a.split(".")[1];var b={dub:"https://pre-prod.amazon.co.uk/",pdx:"https://pre-prod.amazon.co.jp/",pek:"https://pre-prod.amazon.cn/"};return b[a]!==k?b[a]:"https://pre-prod.amazon.com/"}return"/"}}});
"use strict";f.when("A","reviews-constants").register("cr-weblab-utils",function(c,d){function b(a){h.ue&&h.ue.trigger&&h.ue.trigger(a.weblabID,a.treatment)}c.declarative(d.events.TRIGGER_WEBLAB,"click",function(a){a.data.weblab&&a.data.treatment&&b({weblabID:a.data.weblab,treatment:a.data.treatment})});return{triggerWeblab:b}});"use strict";f.when("A","cr-uri-utils","cr-string-utils","3p-urijs","cr-jQuery").register("cr-extended-uri-utils",function(c,d,b,a,e){function f(){return a(h.location.href)}
function k(){return f().query()}return e.extend(d,{getCurrentUri:f,getCurrentQueryString:k,getCurrentQueryParameters:function(){return a.parseQuery(k())},isAmazonDomain:function(c){if("string"===typeof c||c instanceof String)c=a(c);var d=b.startsWith(c.domain(),"amazon");!1===d&&(c=c.hostname(),c=c.substring(c.indexOf(".")+1),d=b.startsWith(c,"amazon"));return d},setQueryParameters:function(d,e){if("string"===typeof d||d instanceof String)d=a(d);c.each(e,function(a,c){b.isBlank(a)?d.removeSearch(c):
d=d.setSearch(c,a)});return d},setReftag:function(c,d){if("string"===typeof c||c instanceof String)c=a(c);for(var e=c.segment(),f=!1,h=e.length-1;0<=h;h--)if(b.startsWith(e[h],"ref\x3d")){f=!0;e[h]="ref\x3d"+d;break}f||e.push("ref\x3d"+d);c.segment(e);return c}})});"use strict";f.when("A","cr-jQuery").register("histogram-trigger",function(c,d){function b(){c.onScreen(d("#histogramTable"))&&c.trigger("scroll")}c.on.afterLoad(b);return{triggerHistogram:b}})});
/* ******** */
(function(a){var c=window.AmazonUIPageJS||window.P,d=c._namespace||c.attributeErrors,b=d?d("CustomerReviewsMedleyAssets",""):c;b.guardFatal?b.guardFatal(a)(b,window):b.execute(function(){a(b,window)})})(function(a,c,d){a.when("A","medley-twister-view","medley-twister-model","ready").register("medley-twister-controller",function(b,e,f){function a(a){a=f.getASIN();var b=e.getDisplayedASIN();b&&a!==b&&(e.fadeReviews(!0),f.getReviews(b,function(){f.setASIN(b)},function(){},function(){e.fadeReviews(!1)}))}
var c=e.getLoadedASIN();f.setASIN(c);b.on("a:pageUpdate",a);return{onTwist:a}});"use strict";a.when("A","cr-jQuery").register("medley-twister-view",function(b,a){return{getDisplayedASIN:function(){return String(a("#ASIN").val()||"")},getLoadedASIN:function(){return(a("#cr-state-object").data("state")||{}).asin||""},fadeReviews:function(b){!1===b?a("#cm-cr-review-list .review,#most-recent-reviews-content .review").css("opacity",1):a("#cm-cr-review-list .review,#most-recent-reviews-content .review").css("opacity",
.5)}}});"use strict";a.when("A","cr-global-model","cr-ajax-model","cr-uri-utils","cr-jQuery").register("medley-twister-model",function(a,c,f,d,g){function b(a){var b=d.getUrlParametersMap()||{};b.asin=a;return b}var e;return{setASIN:function(a){e=a||""},getASIN:function(){return e},getReviews:function(a,c,e,d){var h=g("#cr-state-object").data("state");"string"===typeof a&&10===a.length?f.post(h.medleyReviewsAjaxUrl,{params:b(a),attribution:"getMedleyReviews",success:c,error:e,finallyCallback:d}):
"function"===typeof d&&d()}}})});
/* ******** */
(function(f){var g=window.AmazonUIPageJS||window.P,h=g._namespace||g.attributeErrors,b=h?h("CustomerReviewsVotingAssets",""):g;b.guardFatal?b.guardFatal(f)(b,window):b.execute(function(){f(b,window)})})(function(f,g,h){f.when("A","vote-model","vote-view","a-modal").register("vote-controller",function(b,c,a,l){function f(e,d){k(e,d);a.showElementByCssSelector(e,d.inFlight)}function k(e,d){a.hideElementByCssSelector(e,d.hideVoteComponents);d.hideAbuseComponents&&a.hideElementByCssSelector(e,d.hideAbuseComponents)}
function g(e,d){d.isReportAbuse&&(e=b.$("#mobile-abuse-"+d.voteInstanceId),l.get(e).hide());f(e,d.cssSelectors);c.submitVote(d.ajaxUrl,d.voteValue,d.voteInstanceId,d.csrfT,d.voteDimension,function(c){if(!0===c){c=e;var b=d.cssSelectors;k(c,b);a.showElementByCssSelector(c,b.onSuccess)}else c=e,b=d.cssSelectors,k(c,b),a.showElementByCssSelector(c,b.onError)},function(){var c=e,b=d.cssSelectors;k(c,b);a.showElementByCssSelector(c,b.onError)})}b.declarative("reviews:vote-action","click",function(a){g(a.$target,
a.data);a.$event.preventDefault()});return{submitVote:g}});"use strict";f.when("A","cr-ajax-model").register("vote-model",function(b,c){return{submitVote:function(a,b,f,g,h,e,d){c.post(a,{params:{voteInstanceId:f,voteValue:b,csrfT:g,voteDimension:h},attribution:"submitVote",success:e,error:d})}}});"use strict";f.when("A").register("vote-view",function(b){function c(a,c){return a.closest(".cr-vote").find(c)}return{hideThankYouAlert:function(a){c(a,".cr-vote-success").addClass("aok-hidden")},showThankYouAlert:function(a){c(a,
".cr-vote-success").removeClass("aok-hidden")},showErrorAlert:function(a){c(a,".cr-vote-error").removeClass("aok-hidden")},showFeedback:function(a){c(a,".cr-vote-feedback").removeClass("aok-hidden")},hideFeedback:function(a){c(a,".cr-vote-feedback").addClass("aok-hidden")},hideButtons:function(a){c(a,".cr-vote-buttons").addClass("aok-hidden")},hideElementByCssSelector:function(a,b){c(a,b).addClass("aok-hidden")},showElementByCssSelector:function(a,b){c(a,b).removeClass("aok-hidden")}}})});
/* ******** */
(function(d){var m=window.AmazonUIPageJS||window.P,p=m._namespace||m.attributeErrors,a=p?p("CustomerReviewsGalleryAssets",""):m;a.guardFatal?a.guardFatal(d)(a,window):a.execute(function(){d(a,window)})})(function(d,m,p){d.when("A","load").register("review-image-asset-loader",function(a){var b=!1;a.ajax("/gp/customer-reviews/aj/private/reviewsGallery/get-image-gallery-assets",{method:"post",success:function(c){d.load.css(c.reviewsLightboxCSS);var a=document.createElement("script");a.type="text/javascript";
a.async=!0;a.setAttribute("crossorigin","anonymous");a.src=c.reviewsLightboxJS;document.getElementsByTagName("head")[0].appendChild(a);b=!0;d.register("review-image-assets-loaded",{})},error:function(){var b="/gp/customer-reviews/aj/metrics/log-values?noCache\x3d"+(new Date).getTime();b+="\x26SimpleStack:ReviewImageAssetLoaderFailure\x3d1";m.Image&&((new Image).src=b)}});return{isLoaded:function(){return b}}});"use strict";d.when("A","cr-jQuery","cr-log-utils","reviews-constants","review-image-assets-loaded").register("review-image-binder",
function(a,b,c,v){function q(f,a,e,g,n){if(!(f&&a&&e instanceof b&&g instanceof b&&n instanceof b))return c.logError("Invalid parameters for imageBinder.initializeEventHandlers with ASIN: "+f+", galleryName: "+a+", $popoverTrigger: "+e+", $thumbnails: "+g+", $galleryLink: "+n,"FATAL"),!1;var r="reviewsLightbox-ready-"+a;g.click(function(){l(f,a);var c=g.index(this);e.click();d.when(r).execute(function(){b("#"+a).trigger("jumpToImageAtIndex",c)})});n.click(function(){l(f,a);e.click();d.when(r).execute(function(){b("#"+
a).trigger("hideImmersiveView")})});return!0}function l(b,a){if(!b||!a)return c.logError("Invalid parameters for imageBinder.initializeImageGallery with ASIN: "+b+", galleryName: "+a,"FATAL"),!1;if(e)return!0;(new ReviewsLightbox(a,"DESKTOP")).initializeForAsin(b);return e=!0}var e=!1,h={};d.when("reviewsLightbox-js").execute(function(){var a=b("#reviews-image-gallery-container"),c=a.attr("data-asin");0<a.length&&c&&q(c,"reviews-image-gallery",a.find(".a-popover-trigger"),a.find(".review-image-tile"),
a.find(".reviews-image-gallery-link"))});a.on(v.events.RELOAD_COMPLETE,function(){h={}});return{bindReview:function(a,c,e){var g=new ReviewGallery(e,"DESKTOP"),f=b("#"+c);f.find(".review-image-tile").each(function(c){b(this).click(function(){h[a]||(g.initializeForReview(a),h[a]=!0);f.find(".a-popover-trigger").click();d.when("reviewsLightbox-ready-"+e).execute(function(){g.render();g.showImageAtIndex(c)})})})},initializeImageGallery:l,initializeEventHandlers:q}});"use strict";d.when("A","cr-jQuery").register("cr-image-popover-controller",
function(a,b){function c(a){return function(){l(a)}}function d(){b(g).unbind("click");b(n).unbind("click");b(g).click(function(){var a=parseInt(h,10)+1;l(a);q()});b(n).click(function(){var a=parseInt(h,10)-1;l(a);q()});b(p).mouseenter(function(){q()}).mouseleave(function(){r.animate({opacity:0},100);m.animate({opacity:0},100)})}function q(){var a=.25,c=.25;b(g).css("cursor","pointer");b(n).css("cursor","pointer");h===e.length-1&&(a=0,b(g).css("cursor","auto"));0===h&&(c=0,b(n).css("cursor","auto"));
r.animate({opacity:a},100);m.animate({opacity:c},100)}function l(a){0<=a&&a<e.length&&(u.attr("src",e[a]),b(t[h]).removeClass("cr-lightbox-selected"),b(t[a]).addClass("cr-lightbox-selected"),h=a)}var e,h=0,f,r,m,g,n,t,p,u;return{initImagePopover:function(a,h,k){f=b("#"+a+"_image_popover");r=f.find(".cr-lightbox-navigator-button__next");m=f.find(".cr-lightbox-navigator-button__back");g=f.find(".cr-lightbox-navigator-container__next");n=f.find(".cr-lightbox-navigator-container__back");t=f.find(".cr-lightbox-image-thumbnail");
p=f.find(".cr-lightbox-image-viewer");u=p.find(".cr-lightbox-main-image");e=h.substring(1,h.length-1).split(",");for(a=0;a<t.length;a++)b(t[a]).removeClass("cr-lightbox-selected"),b(t[a]).click(c(a));a:{if(k&&k.popover&&k.popover.$trigger&&k.popover.$trigger.context&&(k=k.popover.$trigger.context.id)&&(k=k.split("-"),1<k.length)){k=parseInt(k[1],10);break a}k=void 0}l(k||0);d()}}});"use strict";d.when("A","cr-media-gallery-view").register("cr-media-gallery-controller",function(a,b){return{initialize:function(){var a=
b.getCurrentMasonryItems();a=Math.ceil(a.length/2);b.setMasonryListHeight(100*a,8*a)}}});"use strict";d.when("A","cr-jQuery").register("cr-media-gallery-view",function(a,b){var c=null,d=null;return{getCurrentMasonryItems:function(){a.objectIsEmpty(c)&&(c=b(".cr-mg-masonry-list"));return c.find(".cr-mg-masonry-item")},setMasonryListHeight:function(c,l){a.objectIsEmpty(d)&&(d=b(".cr-mg-masonry-list-height-control"));var e=d.get(0);e&&(e.style.setProperty("--height-to-column-width",c+"%"),e.style.setProperty("--height-in-pixel",
l+"px"))}}})});
/* ******** */
(function(g){var m=window.AmazonUIPageJS||window.P,p=m._namespace||m.attributeErrors,e=p?p("CustomerReviewsFilteringAssets",""):m;e.guardFatal?e.guardFatal(g)(e,window):e.execute(function(){g(e,window)})})(function(g,m,p){g.when("cr-A","cr-jQuery","cr-filtering-view","cr-filtering-model","cr-global-view","reviews-constants","cr-streaming-utils").register("cr-filtering-controller",function(e,f,b,d,l,c,k){function h(n){var a=!1,c=!1;n.toggleFilters&&(c=!0);d.setASIN(b.getLoadedFilterParam("asin"));
a=d.setReviewerType(n.reviewerType,c)||a;a=d.setFormatType(n.formatType,c)||a;a=d.setFilterByKeyword(n.filterByKeyword,c)||a;a=d.setFilterByLanguage(n.filterByLanguage,c)||a;a=d.setSortOrder(n.sortOrder,c)||a;a=d.setStarFilter(n.filterByStar,c)||a;a=d.setPageNumber(n.pageNumber,c)||a;a=d.setHeightFilter(n.filterByHeight,c)||a;return a=d.setWeightFilter(n.filterByWeight,c)||a}function q(a){if(h(a.data)||a.data.forceReload)a.data.sortOrder&&b.setSortDropdown(a.data.sortOrder),b.hideReviewLoadError(),
b.hideReviews(),b.showLoadingSpinner(),e.trigger(c.events.FILTER_APPLY_BEGIN,a),d.getReviews(function(){b.showReviews();"filterByHeight"===d.getActiveTab()&&b.scrollToFilterIndex("filterByHeight");"filterByWeight"===d.getActiveTab()&&b.scrollToFilterIndex("filterByWeight");e.trigger(c.events.FILTER_APPLY_SUCCESS,a)},function(){b.showReviewLoadError();e.trigger(c.events.FILTER_APPLY_ERROR,a)},function(){b.hideLoadingSpinner();e.trigger(c.events.FILTER_APPLY_DONE,a);e.trigger(c.events.RELOAD_COMPLETE)},
function(a){"appendFadeIn"===a[0]?k.appendFadeIn(a):"replace"===a[0]&&k.replace(a)},l.getReftag(a)),a.data.scrollToSelector&&l.scrollTo(a.data.scrollToSelector,0)}function g(a){a&&a.data&&q(a)}function a(a){a&&a.data&&a.$target&&a.data.filterType&&(a.data[a.data.filterType]=a.$target.val(),q(a))}function r(a){a&&a.data&&a.data.filterType&&(b.deactivateFilterTabHeaders(),b.activateFilterTabHeader(a.data.filterType),b.changeFilterOptionsTo(a.data.filterType),d.setActiveTab(a.data.filterType),"filterByHeight"!==
a.data.filterType&&"filterByWeight"!==a.data.filterType||b.scrollToFilterIndex(a.data.filterType))}d.setReviewsAjaxUrl(b.getReviewsAjaxUrl());b.enableDesktopDPFilterDropdown();e.declarative(c.events.FILTER_APPLY,"click",e.compositeEventWrapper(g,!0,100));e.declarative(c.events.FILTER_CHANGE,"change",e.compositeEventWrapper(a,!0,100));e.declarative(c.events.FILTER_TAB_CLICKED,"click",r);d.setReviewerType(b.getLoadedFilterParam("reviewerType"),!1);d.setFormatType(b.getLoadedFilterParam("formatType"),
!1);d.setFilterByKeyword(b.getLoadedFilterParam("filterByKeyword"),!1);d.setFilterByLanguage(b.getLoadedFilterParam("filterByLanguage"),!1);d.setStarFilter(b.getLoadedFilterParam("filterByStar"),!1);d.setSortOrder(b.getLoadedFilterParam("sortOrder"),!1);d.setPageNumber(b.getLoadedFilterParam("pageNumber"),!1);d.setHeightFilter(b.getLoadedFilterParam("filterByHeight"),!1);d.setWeightFilter(b.getLoadedFilterParam("filterByWeight"),!1);d.setLanguage(b.getLoadedFilterParam("languageOfPreference"));b.getLoadedFilterParam("showLanguageFilter")?
d.setActiveTab("filterByLanguage"):b.getLoadedFilterParam("showHeightFilter")&&(d.setActiveTab("filterByHeight"),b.scrollToFilterIndex("filterByHeight"));return{setFilterParams:h,onFilterApply:g,onFilterChange:a,onFilterTabClicked:r}});"use strict";g.when("A","cr-ajax-model","ready").register("cr-filtering-model",function(e,f){function b(){return h.asin||""}function d(){return g||""}function l(a,c){c?h[a]=c:delete h[a]}function c(a,c,b){var d=!1;a&&c!==p&&(d=k(a)!==c,!d&&b&&(c="CLEAR_VALUE",d=!0),
l(a,c));return d}function k(a){return h[a]||""}var h={},g="",m;return{getReviews:function(a,c,b,d,l){var e=g;m&&f.abort(m);l&&(e+="ref\x3d"+l);m=f.post(e,{params:h,attribution:"getFilteredReviews",success:a,error:c,finallyCallback:function(){b();m=0},chunk:d})},setASIN:function(a){var c=b()!==a;l("asin",a);return c},getASIN:b,setReviewsAjaxUrl:function(a){var c=d()!==a;g=a||"";return c},getReviewsAjaxUrl:d,setReviewerType:function(a,b){return c("reviewerType",a,b)},getReviewerType:function(){return k("reviewerType")},
setFormatType:function(a,b){return c("formatType",a,b)},getFormatType:function(){return k("formatType")},setFilterByKeyword:function(a,b){return c("filterByKeyword",a,b)},getFilterByKeyword:function(){return k("filterByKeyword")},setFilterByLanguage:function(a,b){return c("filterByLanguage",a,b)},getFilterByLanguage:function(){return k("filterByLanguage")},setSortOrder:function(a,b){return c("sortBy",a,b)},getSortOrder:function(){return k("sortBy")},setStarFilter:function(a,b){return c("filterByStar",
a,b)},getStarFilter:function(){return k("filterByStar")},setPageNumber:function(a,b){return c("pageNumber",a,b)},getPageNumber:function(){return k("pageNumber")},setHeightFilter:function(a,b){return c("filterByHeight",a,b)},getHeightFilter:function(){return k("filterByHeight")},setWeightFilter:function(a,b){return c("filterByWeight",a,b)},getWeightFilter:function(){return k("filterByWeight")},getFilterParams:function(){return h||{}},updateFilterParam:l,setActiveTab:function(a){return l("activeTab",
a)},getActiveTab:function(){return k("activeTab")},setLanguage:function(a){return l("language",a)}}});"use strict";g.when("cr-A","cr-jQuery","a-dropdown","ready").register("cr-filtering-view",function(e,f,b){function d(b){return(f("#cr-state-object").data("state")||{})[b]||""}return{getReviewsAjaxUrl:function(){return(f("#cr-state-object").data("state")||{}).reviewsAjaxUrl||""},showLoadingSpinner:function(){var b=e.getValueFromState("onLoadShowHideElements");f(b).removeClass("aok-hidden")},hideLoadingSpinner:function(){var b=
e.getValueFromState("onLoadShowHideElements");f(b).addClass("aok-hidden")},hideReviews:function(){f(".filterable-reviews-content").addClass("aok-hidden")},showReviews:function(){f(".filterable-reviews-content").removeClass("aok-hidden")},showReviewLoadError:function(){f(".review-load-error").removeClass("aok-hidden")},hideReviewLoadError:function(){f(".review-load-error").addClass("aok-hidden")},deactivateFilterTabHeaders:function(){f(".cr-tab-header-text").removeClass("cr-tab-active")},activateFilterTabHeader:function(b){f(".cr-tab-header-text-"+
b).addClass("cr-tab-active")},changeFilterOptionsTo:function(b){f(".cr-tab-content").addClass("aok-hidden");f(".cr-tab-content-"+b).removeClass("aok-hidden")},getLoadedFilterParam:d,setSortDropdown:function(d){b.getSelect("cm-cr-sort-dropdown").setValue(d)},scrollToFilterIndex:function(b){var c;c=0;var e;e=d("isCardTreatmentEnabled")?f(".cr-horizontal-scroll-list-cardify-padding ul \x3e *:first-child"):f(".cr-horizontal-scroll-list-padding ul \x3e *:first-child");var h=f(m).width();b=f("ul#"+b+"-button-list")[0];
if(e===p||h===p||b===p)c=-1;else{var g=parseInt(b.dataset.index);e=parseInt(e.css("padding-left").replace("px",""));if(-1!==g){c=e-h/2;for(h=0;h<g;h++)c+=f("#"+b.children[h].firstElementChild.id).outerWidth(!0);c+=f("#"+b.children[g].firstElementChild.id).outerWidth(!0)/2}}0>c||f(".cr-filter-scroll-container").animate({scrollLeft:c},50)},enableDesktopDPFilterDropdown:function(){f("#cm-cr-dp-review-sort-type").removeClass("aok-hidden")}}});"use strict";g.when("cr-A","cr-lighthut-terms-view","reviews-constants",
"cr-log-utils").register("cr-lighthut-terms-controller",function(e,f,b,d){function g(b){b&&b.filterByKeyword!==p&&(f.setSelected(b.filterByKeyword),d.incrementCount("LighthutTermClicked"))}e.on(b.events.FILTER_APPLY_BEGIN,e.compositeEventWrapper(function(b){b&&b.data&&g(b.data)}));return{onFilterApplied:g}});"use strict";g.when("A","cr-jQuery","ready").register("cr-lighthut-terms-view",function(e,f){return{setSelected:function(b){b=b.replace(/ /g,"_");var d=(b=f("#cr-lighthouse-term-"+b))&&b.hasClass("cr-lighthut-term-selected");
f(".cr-lighthut-term-selected").removeClass("cr-lighthut-term-selected");d||b.addClass("cr-lighthut-term-selected")}}})});
/* ******** */
