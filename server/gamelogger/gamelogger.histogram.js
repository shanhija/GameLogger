/**
	GameLogger Histogram widget JavaScript
	
	Version:
		1.0	Initial revision
*/
(function(gamelogger) {
	$(document).ready(function() {
	
	$(".gl-apm-histogram").each(function () {		
		var container = $(this);
		var oldDisplay = container.css("display");
		// Hide container when we are setting things up
		container.css("display","hidden");
		
		var widget = (function() {
		
		var 
			options = {
				players: container.attr("data-players").split(","),
				apmMax: container.attr("data-apm-max"),
				duration: container.attr("data-duration"),
				bins: container.attr("data-bins"),
				ticks: container.attr("data-ticks")
			},
			currentAPM = {
			},
			histogram = {
			};

			// Change container position to relative so we can set contained elements
			// to have position abosolute and their locations will be relative to the container
			container.css("position","relative");
			options.canvas = {
				lineWidth: parseFloat(container.css("border-width")),
				colors: {}
			};

			/* Helpoer function to add a label */
			var addLabel = function(contents, className) {
				var label = $(document.createElement("div"));
				label.html(contents);
				label.addClass(className);
				container.append(label);
				label.css("position","absolute");
				return label;
			};

			
			// Add horixontal axis label
			var xLabel = addLabel("Actions per minute","label");
			
			// Add vertial axis label
			var yLabel = addLabel("Time","label");
			yLabel.css({
				"transform": "rotate(-90deg)",
				"-webkit-transform": "rotate(-90deg)",
				"-ms-transform": "rotate(-90deg)"
			});
			
			// Add ticks
			var ticks = [];
			var maxHeight = 0;
			for (var i = 0; i < options.ticks; ++i) {
				ticks[i] = addLabel(Math.round(i/(options.ticks-1)*options.apmMax), "tick");
				maxHeight = Math.max(maxHeight, ticks[i].outerHeight(true));
			}

			// Add player labels
			var flags = [];
			var heightSum = 0;
			for (var i in options.players) {				
				var player = options.players[i];
				var flag = addLabel(player, "player");
				// Change player names to lowercase for CSS and JavaScript purposes
				player = player.toLowerCase();
				options.players[i] = player;
				flag.addClass(player);
				// z-index 3 makes the flag stay on top of the histogram canvas,
				// so the "flagpole" lines will not cross over any flags
				flag.css({left: 0, top: heightSum, "z-index": 3}); 
				heightSum += flag.outerHeight(true);
				flags[player] = flag;
				
				// Find player styles
				options.canvas.colors[player] = flag.css("color");
			}
			
			// Labels are in place. Construct geometry for histogram
			geometry = {
				left: yLabel.outerWidth(true),
				top: heightSum,
				width: Math.ceil(container.width() - yLabel.outerWidth(true) - ticks[options.ticks-1].outerWidth(true)/2),
				height: container.height() - heightSum - xLabel.outerHeight(true) - maxHeight
			};
						
			// Background canvas			
			var canvas = $(document.createElement('canvas'));
			canvas.css("position", "absolute");
			canvas.css({left: geometry.left, top: geometry.top});
			canvas.attr({width: geometry.width, height: geometry.height});
			canvas.appendTo(container);
			options.canvas.lineColor = canvas.css("border-color"),
			options.canvas.histLineWidth = parseFloat(canvas.css("border-width")),
			canvas.css("border","none");
			
			// Draw tick lines
			var context = canvas[0].getContext('2d');
			context.beginPath();
			context.moveTo(0, geometry.height/3);
			context.lineTo(geometry.width, geometry.height/3);
			context.moveTo(0, 2*geometry.height/3);
			context.lineTo(geometry.width, 2*geometry.height/3);
			context.lineWidth = options.canvas.lineWidth;
			context.strokeStyle = options.canvas.lineColor;
			if (context.setLineDash) context.setLineDash([options.canvas.lineWidth]);
			context.stroke();			
			if (context.setLineDash) context.setLineDash(0);
				
			// Draw border
			context.strokeRect(
				options.canvas.lineWidth/2, 
				options.canvas.lineWidth/2,
				geometry.width - options.canvas.lineWidth,
				geometry.height - options.canvas.lineWidth);
			
			
			// Setup actual histogram canvas
			canvas = $(document.createElement('canvas'));
			canvas.appendTo(container);			
			// Expand the canvas to the whole container. Positioning is handled when plotting and using geometry
			canvas.attr({width: container.width(), height: container.height()});
			canvas.css("position", "absolute");
			canvas.attr({left: 0,top: 0,"z-index": 2});
			
			// Position text
			yLabel.css({left: 0, top: geometry.top + (geometry.height-yLabel.outerHeight(true))/2});
			xLabel.css({
				left: geometry.left + (geometry.width-xLabel.outerWidth(true))/2,
				top: geometry.top + geometry.height + maxHeight
			});
			for (var i in ticks) {
				ticks[i].css({
					left: i/(options.ticks-1)*geometry.width-ticks[i].outerWidth(true)/2+geometry.left,
					top: geometry.top + geometry.height
				});
			}
			
			
			context = canvas[0].getContext('2d');
			canvas.css("border","none");
			canvas.css("background","none");
			
			// Apply line width/2 as margin
			geometry.left += options.canvas.histLineWidth/2;
			geometry.top += options.canvas.histLineWidth/2;
			geometry.height -= options.canvas.histLineWidth;
			geometry.width -= options.canvas.histLineWidth;

			var mapX = function(x) {
				var nx = x/options.apmMax;
				return Math.max(Math.min(nx,1),0)*geometry.width + geometry.left;
			};
			
			var mapBin = function(x) {
				var nx = x/(options.bins-1);
				return Math.max(Math.min(nx,1),0)*geometry.width + geometry.left;
			};
			var mapY = function(y) {
				var ny = y/(5*options.duration/options.bins);
				return (1-Math.max(Math.min(ny,1),0))*geometry.height + geometry.top;
			};

			
			var update = function(apm, player) {
				if (histogram[player]) {
					// If a person pushes updates that is not listed in the histogram, we ignore the updates
					
					if (apm)
						currentAPM[player] = apm;
					else
						currentAPM[player] = 0;
					var hist = histogram[player];
					--hist.counts[hist.apm[hist.pos]];
					apm = Math.min(Math.floor(apm/options.apmMax*options.bins),options.bins-1);
					++hist.counts[apm];
					hist.apm[hist.pos] = apm;
					hist.pos = (hist.pos+1) % options.duration;
				}
			};
			
			var updateOnce = function() {
				// Redraw histograms
				context.clearRect(0,0,canvas.width(), canvas.height());
				for (player in histogram) {
				
					// Draw histogram line
					context.beginPath();
					var hist = histogram[player];
					context.moveTo(mapX(0), mapY(hist.counts[0]));
					for (var i = 1; i < options.bins; ++i) {
						context.lineTo(mapBin(i),mapY(hist.counts[i]));
					}
					context.strokeStyle = options.canvas.colors[player];
					context.lineWidth = options.canvas.histLineWidth;
					context.stroke();
										
										
					// Draw circle
					context.beginPath();					
					context.lineWidth = options.canvas.lineWidth;
					var bin = Math.min(currentAPM[player]/options.apmMax*(options.bins-1),options.bins-1);
					var binLeft = Math.floor(bin);
					var binRight = Math.ceil(bin);
					var y = mapY(hist.counts[binLeft]);
					if (binLeft < binRight) 
						y = (bin-binLeft)*mapY(hist.counts[binRight]) +
							(binRight-bin)*mapY(hist.counts[binLeft]);
					context.arc(mapX(currentAPM[player]), y,
							2*options.canvas.histLineWidth, 0, 2*Math.PI, true);
					context.stroke();
					
					// Move flag
					var flag = flags[player];
//					flag.css("left", Math.min(mapX(currentAPM[player]), geometry.left + geometry.width - flag.outerWidth()));
					flag.css("left", mapX(currentAPM[player]));
					
					// Draw line from flag to the upper part of the apm circle
					context.beginPath();
					context.moveTo(mapX(currentAPM[player]), flag.position().top + parseFloat(flag.css("margin-top")));
					context.lineTo(mapX(currentAPM[player]), y - 2*options.canvas.histLineWidth);
					context.stroke();
					
					
				}
			};

			for (var ind in options.players) {
				var player = options.players[ind];
				// Initialize APM histogram
				hist = {
					apm: [],
					pos: 0,
					counts: []		
				};
				for (var i = 0; i < options.duration; ++i) {
					hist.apm[i] = 0;
				}
				for (var i = 0; i < options.bins; ++i) {
					hist.counts[i] = 0;
				}
				hist.counts[0] = options.duration;
				histogram[player] = hist;						
				
				// Initialize everyone to 0 apm
				update(0, player);
			}
						
			return {
				players: options.players,
				update: update,
				updateOnce: updateOnce,		
			}
		})();				

		// Function to get previous apm data from server and initialize histogram from that
		$.get(gamelogger.options.path + "browserConnect.php?request=observeHiResAPMHistory&limit=" + container.attr("data-duration"), function(data) {
			var data = JSON.parse(data);
			for (var player in data) {
				var rows = data[player];
				for (var ri in rows) {
					for (var ai in rows[ri]["apm"]) {
						widget.update(rows[ri]["apm"][ai], player);
					}
				}
			}
			
			// Register widget	
			for (var ind in widget.players) {		
				gamelogger.addWidget(widget.players[ind], widget);
			}			
			gamelogger.addWidget("*", widget);	

			container.css("border","none");
			container.css("display",oldDisplay);
			
		});		
	});	
	});
})(gamelogger);