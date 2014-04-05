/**
	GameLogger history histogram widget JavaScript
	
	Version:
		1.0	Initial revision
*/

(function(gamelogger) {

var					
	timelineContainer = [],
	tooltip = [],
	
	weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

var	
	/**
	 * Constructs a single APM timeline to be attached to a view
	 */
	apmTimeline = function(containerElement) {
	var container = containerElement;
	
	var		
		data = {},
		player = container.attr("data-player"),		
		span = (gamelogger.history.ends - gamelogger.history.began)/60,	
		offset = gamelogger.history.began,
		lineColor = container.css("border-color"),
		lineWidth = parseFloat(container.css("border-width")),		
		canvas = [];
		
	var		
		/**
		 * Change timeline to be exactly as wide as width 
		 */
		zoom = function(width) {		
			container.width(width);
			// Adjusting width clears the canvas automatically
			canvas.attr("width", width*data.width);
			canvas.css("left", width*data.left);
			
		var 
			context = canvas[0].getContext('2d');
			context.strokeStyle = lineColor;
			context.lineWidth = lineWidth;
			
			context.beginPath();
			context.moveTo(0,data.apm[0]);
			for (var i = 1; i < data.apm.length; ++i) {
				context.lineTo(i/span*width, data.apm[i]);
			}
			context.stroke();			
		};

		// Ignore players with no data
		if (!(gamelogger.history.data[player]))
			return { zoom: function(){}, container: container};		

		/**
		 * Gather data and initialize view		 
		 */
	var max = container.attr("data-apm-max"),		
		apm = gamelogger.history.data[player].apm;
		
		data = {
			left : (apm.began - offset)/span/60,
			width : apm.data.length/span,
			apm : apm.data
		};
		for (var i = 0; i < apm.data.length; ++i) {
			data.apm[i] = (1-Math.min(data.apm[i], max)/max)*container.height();
		}

		container.css("position", "relative");
		
		canvas = $(document.createElement('canvas'));
		canvas.attr({width: container.width(), height : container.height()});		

		canvas.appendTo(container);		
		canvas.css("position","absolute");
		canvas.css("height", container.height());	
		
		container.css("border","none");		
		
		zoom(container.width());		
		
		return {			
			zoom: zoom,
			container: container		
		}
	},
	
	/**
	 * Constructs a single game timeline to be attached to a view
	 */
	gameTimeline = function(containerElement) {
	var container = containerElement;
	var
		data = [],
		tooltip = [],
		offset = gamelogger.history.began,
		span = gamelogger.history.ends - gamelogger.history.began;
		player = container.attr("data-player");
				
	var
		/**
		 * Change timeline to be exactly as wide as width 
		 */
		zoom = function(width) {
			container.width(width);
			for (var i in data) {
				data[i].box.css({left: width*data[i].left, width: width*data[i].width});
			}
		};
		
		// Ignore players with no data
		if (!(gamelogger.history.data[player]))
			return { zoom: function(){}, container: container};		
		
		/**
		 * Gather data and initialize view		 
		 */
		games = gamelogger.history.data[player].games;
		 
		// Convert position and width data to between [0,1] with respect to history range 
		for (var i in games) {
			data.push({
				id: games[i].gameid,
				left: (games[i].began - offset)/span,
				width: (games[i].updated - games[i].began)/span				
			});
		}	
		
		var width = container.width();
		container.css("position", "relative");
		for (var i in data) {
			var box = $('<div>');
			box.css("position","absolute");
			box.css({"left": width*data[i].left, "width": width*data[i].width});
			if (gamelogger.history.colors)
				box.css("background-color", gamelogger.history.colors[data[i].id]);
			container.append(box);
			// Store boxes for later reference
			data[i].box = box;
			
			
			(function(box) {
				// Create a new context so that the game object is accessible later
			var game = jQuery.extend(true, {}, games[i]);
			
				var calcTime = function(x) {
					return (x-box.offset().left)/box.width()*(game.updated-game.began)+game.began;
				};
			
				box.bind("mouseenter", function(event) {
					// Trigger an event notifying any listeners that the mouse is over a game
					var time = calcTime(event.pageX);
					container.trigger("gameenter", { 
						player: player, 
						game: game, 
						position: {
							x: event.pageX, 
							y: event.pageY
						},
						time: time
					});
				});
				
				box.bind("mousemove", function(event) {
					// Trigger an event notifying any listeners that the mouse is over a game
					container.trigger("gamehover", { 
						player: player, 
						game: game, 
						position: {
							x: event.pageX, 
							y: event.pageY
						},
						time: calcTime(event.pageX)
					});

				});
				
				box.bind("mouseleave", function(event) {
					// Trigger an event notifying any listeners that the mouse no longer over a game
					container.trigger("gameleave",  { 
						player: player, 
						game: game, 
						position: {
							x: event.pageX, 
							y: event.pageY
						},
						time: calcTime(event.pageX)
					});

				});
			})(box);
		}		
	
		return {
			zoom: zoom,
			container: container
		}
	},
	
	/**
	 * Constructs a single tick timeline to be attached to a view
	 */
	tickTimeline = function(containerElement) {
	var container = containerElement,
		ticks = [];
		
	var		
		/**
		 * Helper function to determine appropriate units
		 */
		tickUnits = function(width) {
		var
			// estimate number of ticks	
			noTicks = 0.3 * Math.sqrt(width),
			delta = (gamelogger.history.ends - gamelogger.history.began)*1000/ noTicks,
			size, unit,

			// map of app. size of time units in milliseconds
			timeUnitSize = {
				"second": 1000,
				"minute": 60 * 1000,
				"hour": 60 * 60 * 1000,
				"day": 24 * 60 * 60 * 1000
			},
			spec = [
				[1, "second"], [2, "second"], [5, "second"], [10, "second"],
				[30, "second"], 
				[1, "minute"], [2, "minute"], [5, "minute"], [10, "minute"],
				[30, "minute"], 
				[1, "hour"], [2, "hour"], [4, "hour"],
				[8, "hour"], [12, "hour"],
				[1, "day"], [2, "day"], [3, "day"]
			],
			minSize = 0;

			for (var i = 0; i < spec.length - 1; ++i)
				if (delta < (spec[i][0] * timeUnitSize[spec[i][1]]
							 + spec[i + 1][0] * timeUnitSize[spec[i + 1][1]]) / 2)
					break;					
			size = spec[i][0];
			unit = spec[i][1];	
				
			return {
				size: size,
				unit: unit,
				timeUnitSize: timeUnitSize,
				noTicks: noTicks
			}
		},
		
		/**
		 * Helper function to setup date
		 */
		tickStartDate = function(units) {
		var 
			d = new Date(gamelogger.history.began*1000),
			step = units.size * units.timeUnitSize[units.unit],
			
			floorInBase = function (n, base) { return base * Math.floor(n / base); };

			switch (units.unit) {
				case "second": d.setUTCSeconds(floorInBase(d.getUTCSeconds(), units.size)); break;
				case "minute": d.setUTCMinutes(floorInBase(d.getUTCMinutes(), units.size)); break;
				case "hour": d.setUTCHours(floorInBase(d.getUTCHours(), units.size)); break;
			}
				
			d.setUTCMilliseconds(0);		
			if (step >= units.timeUnitSize.minute) d.setUTCSeconds(0);
			if (step >= units.timeUnitSize.hour) d.setUTCMinutes(0);
			if (step >= units.timeUnitSize.day) d.setUTCHours(0);
			if (step >= units.timeUnitSize.day * 4) d.setUTCDate(1);
			
			return {
				date: d,
				step: step
			}
		},
		
		/**
		 * Helper function to construct a tick at the desired time
		 */
		createTick = function(date, units, width, lastDay) {
		var
			t = units.size * units.timeUnitSize[units.unit],
			pad = function(s) {return (s<10)?("0"+s):s;};
			
			var noDate = true;
			if (t < units.timeUnitSize.minute)				
				label = date.getHours() + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
			else {
				if (span < 2 * units.timeUnitSize.day)
					label = date.getHours() + ":" + pad(date.getMinutes());
				else {
					noDate = false;
					label = pad(date.getHours()) + ":" + pad(date.getMinutes());
					if (date.getDay() != lastDay.getDay())
						label = weekDays[date.getDay()] + " " + label;
				}
			}		

		var tick = $('<div>'),
			offset = gamelogger.history.began,
			span = gamelogger.history.ends - gamelogger.history.began;
			
			tick.html(label);
			tick.css("position","absolute");			
			tick.css({
				left: (date.getTime()/1000-offset)/span*width - width/(units.noTicks+1)/2,
				width: width/(units.noTicks+1)
			});

			return tick;
		},
		
		/**
		 * Zoom ticks to given width 
		 */		 
		zoom = function (width) {		
		var
			units = tickUnits(width),
			tick = tickStartDate(units),
			v = NaN;			
			
			// Remove old ticks
			for (var i in ticks) {
				ticks[i].remove();
			}
			ticks = [];
			var lastDay = new Date((gamelogger.history.began - 86400)*1000);
			do {
				prev = v;
				v = tick.date.getTime();
				// Construct new tick
				var tickDiv = createTick(tick.date, units, width, lastDay);				
				lastDay.setTime(v);
				
				ticks.push(tickDiv);
				container.append(tickDiv);	
				
				tick.date.setTime(v + tick.step);
			} while (v/1000 < gamelogger.history.ends && v != prev);			
		}
		
		container.css("position", "relative");		
		zoom(container.width());
	
		return {			
			zoom: zoom,
			container: container
		}
	},	
	
	/**
	 * Game information tooltip
	 */
	createTooltip = function(container) {
	var
		elements = [],
		pad = function(s) {return (s<10)?("0"+s):s;},
		options = {};
			
	var
		/**
		 * Updates the tooltip and moves it to appropriate location
		 */
		update = function(params) {
			if (options.followx) {
				leftPos = params.position.x;
				if (options.followx == "right")
					leftPos += container.width();
					
				container.css("left", leftPos);
			}
			
			if (options.followy) {
				topPos = params.position.y;
				if (options.followy == "bottom")
					topPos += container.height();
				container.css("top", topPos);
			}
			for(var i in elements) {
				elements[i](params);
			}
		};
		
		// Collect elements and initialize them
		$('.gl-player').each(function() {
		var element = $(this);		
			elements.push(function(params) {element.html(params.player); }); 
		});
		$('.gl-player-class').each(function() {
		var element = $(this);		
		var classes = element.attr("class");
			elements.push(function(params) {
				element.attr("class", classes);
				element.addClass(params.player); 
			}); 
		});
		
		$('.gl-game-name').each(function() {
		var element = $(this);
			elements.push(function(params) {element.html(gamelogger.options.games[params.game.gameid].name); }); 
		});
		$('.gl-game-id').each(function() {
		var element = $(this);
			elements.push(function(params) {element.html(params.game.gameid);}); 
		});
		$('.gl-apm-avg').each(function() {
		var element = $(this);		
			elements.push(function(params) {element.html(Math.round(params.game.apmsum/params.game.updates)); }); 
		});
		$('.gl-apm-total').each(function() {
		var element = $(this);
			elements.push(function(params) {element.html(params.game.apmsum);}); 
		});		
		$('.gl-game-played').each(function() {	
		var element = $(this);
			elements.push(function(params) {
			var played = parseInt(params.game.updated) - parseInt(params.game.began);
			var	hours = Math.floor(played/3600),
				mins = Math.floor((played % 3600)/60);		
				element.html(hours + ":" + ((mins<10)?"0":"") + mins);
			}); 
		});
		$('.gl-game-logo').each(function() {
		var element = $(this);		
			elements.push(function(params) {
			var	img = $('<img>');
				img.attr("src", gamelogger.options.games[params.game.gameid]["picurl"]);
				img.css({width: element.width(), height: element.height()});
				element.html(img);
			}); 
		});
		$('.gl-game-logo-bg').each(function() {
		var element = $(this);		
			elements.push(function(params) {
				element.css("background-image", "url(\""+gamelogger.options.games[params.game.gameid]["picurl"] + "\")");
			}); 
		});
		$('.gl-history-timeline-time').each(function() {
		var element = $(this);		
			elements.push(function(params) {
			var	date = new Date(Math.round(params.time*1000));
				element.html(weekDays[date.getDay()] + " " + pad(date.getHours()) + ":" + pad(date.getMinutes()));
			}); 
		});
		
		
		container.css("position","absolute");
		
		container.bind("mousemove",function(event) {
			event.preventDefault();
			return false;
		});

		if (container.attr("data-follow-x"))
			options.followx = container.attr("data-follow-x");
			
		if (container.attr("data-follow-y"))
			options.followy = container.attr("data-follow-y");
		
		return {
			update: update,
			show: function() {container.show();},
			hide: function() {container.hide();}
		}		
	},
	
	
	/** 
	 * Registers a timeline view 
	 */
	registerView = function(viewport) {
	var
		// View parameters defining the zoom level
		timelines = [],
		view = {
			width : viewport.width(),
			zoom : viewport.width(),		
			panning: false,
			left: 0,
			lastX: 0
		},
		connect = function(tooltip) {
			for (var i in timelines) {
				timelines[i].container.bind("gameenter", function(event, params) {
					tooltip.show();
					tooltip.update(params);
				});
				timelines[i].container.bind("gamehover", function(event, params) {
					tooltip.update(params);
				});
				timelines[i].container.bind("gameleave", function(event, params) {
					tooltip.hide();
				});
			}
		};
				
		viewport.css({
			overflow : "hidden",
			position : "relative"
		});	
				
		
		// Construct a special container that holds all of the timelines. 
		timelineContainer = $('<div>');		
		var contents = viewport.children();
		contents.detach();
		timelineContainer.append(contents);
		viewport.append(timelineContainer);
		timelineContainer.css({
			position: "absolute",
			left: 0,
			height: viewport.height(),
			width: view.width
		});
		
		timelineContainer.find('.gl-history-timeline-apm').each(function() {
			// Add APM timelines to the view widget
			timelines.push(apmTimeline($(this)));
		});
		timelineContainer.find('.gl-history-timeline-game').each(function() {
			// Add game timelines to the view widget
			timelines.push(gameTimeline($(this)));
		});		
		timelineContainer.find('.gl-history-timeline-ticks').each(function() {
			// Add timeline ticks to the view widget
			timelines.push(tickTimeline($(this)));
		});
		
		
		// viewport modifications operation
		var zoom = function(scale, toBorder) {
			
			var old = view.zoom;
			view.zoom = Math.max(Math.min(view.zoom * scale, (gamelogger.history.ends - gamelogger.history.began)/60*4),viewport.width()); 			
			view.left = toBorder  - (toBorder - view.left)*(view.zoom/old);			
			view.left = Math.max(viewport.width() - view.zoom, Math.min(view.left, 0));	
						
			timelineContainer.width(view.zoom);
			timelineContainer.css("left", view.left);
			
			for (var i in timelines) {
				timelines[i].zoom(view.zoom);
			}
		};
		
		// Zoom with mouse wheel
		viewport.bind("mousewheel", function(event, delta) {
			zoom(Math.pow(2,(delta>0)?1:-1), event.pageX - viewport.offset().left);
			// Prevent page scroll
			event.preventDefault();
			return false;
		});
		
		// Control operations	
/*		if (viewport.swipe) {
			// Swipe loaded, connect events
			var swipeStart = {
				width: NaN,
				x: NaN
			};
			viewport.swipe( {
				pinchStatus:function(event, phase, direction, distance , duration , fingerCount, pinchZoom) {
					switch(phase) {
					case "start":
						swipeStart = {
							width : event.pageX - viewport.offset().left - view.left,
							x : event.pageX,
							lastX: 0
						};
						break;												
						timelineContainer.css("transform","scale(1,1)");
						timelineContainer.css("-webkit-transform-origin",swipeStart.width/view.width*100+"% 0");
					case "move":
						timelineContainer.css("transform","scale("+pinchZoom+",1)");
						timelineContainer.css("-webkit-transform-origin",(swipeStart.x-viewport.offset().left)/viewport.width()*100+"% 0");
//						timelineContainer.css("-webkit-transform-origin",swipeStart.width/view.width*100+"% 0");
//						timelineContainer.css("left", event.pageX - viewport.offset().left - swipeStart.width*pinchZoom); 
						swipeStart.lastX = event.pageX;
						break;
					case "end":
						timelineContainer.css("transform", "");
						if (event.pageX == 0)
							zoom(pinchZoom, swipeStart.width, swipeStart.lastX - viewport.offset().left);
						else
							zoom(pinchZoom, swipeStart.width, event.pageX - viewport.offset().left);
					};
					$("#debug").html("x: " + event.pageX + " start: " + swipeStart.x + " width: " + swipeStart.width+ " zoom:" + pinchZoom + " phase:" + phase + " origin: " + (swipeStart.width/view.width*100+"% 0 0"));
					event.preventDefault();
				},
				fingers:2,  
				pinchThreshold:0  
			});			
		}*/
		
		
		// Panning support
		viewport.bind("mousedown", function(event) {
			view.panning = true;
			view.lastX = event.pageX;
			// Prevent select
			event.preventDefault();
			return false;
		});
		viewport.bind("mousemove", function(event) {
			if (view.panning) {
				// Move timelineContainer
				view.left += event.pageX - view.lastX;
				// Restrict movement to always fill the viewport
				view.left = Math.max(viewport.width() - view.zoom, Math.min(view.left, 0));
				view.lastX = event.pageX;
				timelineContainer.css("left", view.left);
			} else {
				// Show gameinfo
			}				
		});
		var stopPanning = function(event) { view.panning = false; event.preventDefault(); return false;};
		viewport.bind("mouseup", stopPanning);
		viewport.bind("mouseleave", stopPanning);

		return {
			connect: connect
		}
	};
	
	
	// Defer registration until document is ready and history data are loaded and analyzed
	gamelogger.history.onSetup(function() {
		$(document).ready(function() {
		
			$('.gl-history-timeline-tooltip').each(function() {
				// Constructs a single tooltip
				tooltip = createTooltip($(this));
			});				
		
			$(".gl-history-timeline").each(function() {	
			var view = registerView($(this));
				view.connect(tooltip);
			}); 
		}); 
	});
})(gamelogger);
