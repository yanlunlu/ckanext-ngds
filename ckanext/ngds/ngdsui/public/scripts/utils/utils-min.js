ngds.util={};ngds.util.dom_element_constructor=function(c){var b=$("<"+c.tag+"/>",c.attributes);if(typeof c.children!=="undefined"){for(var a=0;a<c.children.length;a++){if(typeof c.children[a]==="undefined"){continue}if(c.children[a]["priority"]===1){b.prepend(ngds.util.dom_element_constructor(c.children[a]))}else{b.append(ngds.util.dom_element_constructor(c.children[a]))}}}return b};ngds.util.sequence_generator=function(){var a=0;var b=97;return{next:function(){return a=a+1},current:function(c){if(typeof c!=="undefined"&&c==="alph"){var d=String.fromCharCode(b).toUpperCase();b=b+1;return d}return a}}};ngds.util.tick=function(){var a=0;var b=function(){return ++a};var c=function(){return a};return{next:b,current:c}};ngds.util.node_matcher=function(e,d){if(e.className.match(d)!==null){return e.className.substring(e.className.indexOf("-")+1,e.length)}var b=$(e).parents();for(var c=0;c<b.length;c++){if(b[c].className.match(d)!==null){var a=b[c].className;return a.substring(a.indexOf("-")+1,a.length)}}return null};ngds.util.apply_feature_hover_styles=function(a,d){var c=a.feature.geometry.type;if(c==="Point"){var e=$(".lmarker-"+d);if(e.length>0){e.css("width","30px");e.css("height","45px");var b=$(".lmarker-"+d).next();b.css("font-size","14pt");b.css("margin-left","2px")}}else{a.setStyle({weight:2,color:"#d54799",fillColor:ngds.util.state.colorify[d]})}};ngds.util.apply_feature_default_styles=function(a,d){var c=a.feature.geometry.type;if(c==="Point"){var e=$(".lmarker-"+d);e.attr("src","/images/marker.png");e.css("width","25px");e.css("height","41px");var b=$(".lmarker-"+d).next();b.css("font-size","12.5pt");b.css("margin-left","0px")}else{a.setStyle({weight:1,color:ngds.util.state.colorify[d],fillColor:ngds.util.state.colorify[d],dashArray:"",opacity:0.7,fillOpacity:0.5})}};ngds.util.apply_feature_active_styles=function(a,c){var b=a.layer.feature.geometry.type;$(".result-"+c).addClass("selected");if(b==="Point"){$(".lmarker-"+c).attr("src","/images/marker-red.png")}else{a.layer.setStyle({weight:3,color:"red",fillColor:"red",fillOpacity:0.2,opacity:1,dashArray:""})}};ngds.util.reset_result_styles=function(){$(".result").removeClass("selected")};ngds.util.svg_crispify_post_process=function(){$("#map-container g").attr("shape-rendering","crispEdges")};ngds.util.clear_map_state=function(){$("#jspContainer").remove();$(".result").remove();$(".reader").remove();$(".search-results-page-nums").empty();$(".results-text").remove();ngds.Map.zoom_handler.clear_listeners();ngds.layer_map={};ngds.Map.clear_layer("geojson");ngds.util.state.map_features=[];for(var a in ngds.util.state.prominence){ngds.Map.map.removeLayer(ngds.util.state.prominence[a])}ngds.util.state.prominence={}};ngds.util.get_n_chars=function(c,b){if(typeof c==="undefined"||c===""){return""}if(c.length<=b){return c}var a=c.slice(0,b-4);while(a[a.length-1]==="."||a[a.length-1]===" "){a=a.slice(0,a.length-1)}return a+" ..."};ngds.util.deep_joiner=function(d,c,e){var a=[];for(var b=0;b<d.length;b++){a.push(d[b][c])}return a.join(e)||"None"};ngds.util.replace_content=function(a,b){$(a).empty();a.append(b)};ngds.util.parse_raw_json=function(b){var a=b.replace(/&#34;/g,'"').replace(/&#39;/g,'"').replace(/u\"/g,'"').replace(/null/g,'""');x=JSON.parse(a);return x};ngds.util.state={};ngds.util.rotate_color=function(){var a=["#f26a50","#99ca57","#a299c8","#b74692","#fcd53c","#414686","#0090A8","#f6879f","#177abe","#4a3134","#bd0331"];if(typeof ngds.util.state.rotate_color==="undefined"||ngds.util.state===null){ngds.util.state.rotate_color={};ngds.util.state.rotate_color["index"]=-1}if(ngds.util.state.rotate_color["index"]===a.length-1){ngds.util.state.rotate_color["index"]=-1}ngds.util.state.rotate_color["index"]=ngds.util.state.rotate_color["index"]+1;return a[ngds.util.state.rotate_color["index"]]};ngds.util.make_prominent=function(){if(typeof ngds.util.state.prominence==="undefined"){ngds.util.state.prominence={}}var g=ngds.util.state.prominence;for(var b in ngds.layer_map){if(typeof ngds.util.state.hidden_t!=="undefined"&&typeof ngds.util.state.hidden_t[b]!=="undefined"){if(typeof g[b]!=="undefined"){ngds.Map.map.removeLayer(g[b]);delete g[b]}continue}if(typeof ngds.util.state.hidden_t!=="undefined"&&typeof ngds.util.state.hidden_t[0]!=="undefined"){for(var b in ngds.util.state.prominence){ngds.Map.map.removeLayer(g[b]);delete g[b]}return}if(typeof g[b]==="undefined"){var e=ngds.layer_map[b];var f=e.getBounds();var d=ngds.util.compute_prominence(e);if(d>24000){var a=new L.LatLng((f._northEast.lat+f._southWest.lat)/2,(f._northEast.lng+f._southWest.lng)/2);var c=new L.CircleMarker(a,{weight:3,color:"green",fillColor:"green",fillOpacity:0,opacity:1,dashArray:"5,5"});c.setRadius(20);ngds.Map.map.addLayer(c);g[b]=c}}else{var e=ngds.layer_map[b];if(ngds.util.compute_prominence(e)<24000){ngds.Map.map.removeLayer(g[b]);delete g[b]}}}};ngds.util.compute_prominence=function(b){var a=ngds.Map.map.getBounds();var d=(a._northEast.lat-a._southWest.lat)*(a._northEast.lng-a._southWest.lng);var c=b.getBounds();var e=(c._northEast.lat-c._southWest.lat)*(c._northEast.lng-c._southWest.lng);return(d/e)};