/**
	GameLogger JavaScript
	
	Version:
		1.0	Initial revision
*/
		$("#debug").append("loadgamelogger");

var gamelogger = (function() {

var
	// Options for game logger
	options = {
		apm: {
			bufferSize: 5
		},
		games: []
	},
	
	// Observers to find when setup is done. Used by other gamelogger classes
	setupObservers = [],
	setupDone = false,
	
	// Object to store current information
	current = {
		games : {
			players: []
		},
		apm : {
			buffer: [],
			next:	"{}",
			pos:	[]
			
		}
	},
	
	// Count update cycles in seconds
	seconds = 0,
	
	// Current server time
	serverTime = 0,

	// APM widgets
	widgets = {
	},
	
	/** 
	 *	Fetch new data for buffers
	 */		
	updateBuffers = function(seconds) {
		if ((seconds + 2) % options.apm.bufferSize == 0) {			
			// Fetch new data two seconds before buffer runs out
			$.get(options.path+'browserConnect.php?request=observeAPM', function(data) {
				// Store as text so we don't have problems when we switch buffers
				current.apm.next = data;
			});		

			$.get(options.path+'browserConnect.php?request=observeGame', function(data) {
				current.games = JSON.parse(data);
			});

		} else if (seconds % options.apm.bufferSize == 0) {
			// Previous buffer has ran out. Switch to new one
			current.apm.buffer = JSON.parse(current.apm.next);

			// Store server time and remove it from the buffer
			serverTime = current.apm.buffer.now;
			delete current.apm.buffer.now;
		}
	},

	/**
	 * Routine to update APM observers
	 */
	updateAPMObservers = function() {				
		// Draw updates
		var pos = (seconds % options.apm.bufferSize);
		for (var player in current.apm.buffer) {
			// Update player
			var value = 0;
			if (current.apm.buffer[player]["updated"] >= serverTime - options.apm.bufferSize) {
				// Updated is the time the buffer was stored on the server
				// serverTime is the time the buffer was fetched from the server
				// If the buffer was stored on the server not more than bufferSize seconds ago
				// it still has current apm data
				value = current.apm.buffer[player]["apm"][pos];
			} 
			
			for (var id in widgets[player]) {
				widgets[player][id].update(value, player); // Pass in player
			}
		}
		
		// Asterisk widgets are updated separately
		for (var id in widgets["*"]) {
			widgets["*"][id].updateOnce();
		}
	},
	
	/**
	 * Update game observers
	 */
	updateGameObservers = function() {
		// Update observers when we have new data
		for (var playerIndex in current.games["players"]) {
			player = current.games["players"][playerIndex];
			if (!(player in current.games)) {
				// Player not in "playing" state
				$(".gl-apm-avg[data-player='"+player+"']").html("");
				$(".gl-apm-total[data-player='"+player+"']").html("");
				$(".gl-game-id[data-player='"+player+"']").html("");
				$(".gl-game-name[data-player='"+player+"']").html("");
				$(".gl-game-played[data-player='"+player+"']").html("");
				$(".gl-game-logo[data-player='"+player+"']").html("");
				$(".gl-game-logo-bg[data-player='"+player+"']").css("background-image","");
				
			} else {
				var game = current.games[player];
				
				$(".gl-apm-avg[data-player='"+player+"']").html(Math.round(game.apmsum / game.updates));
				$(".gl-apm-total[data-player='"+player+"']").html(game.apmsum);
				$(".gl-game-id[data-player='"+player+"']").html(game.gameid);
				var played = parseInt(game.updated) - parseInt(game.began);
				$(".gl-game-name[data-player='"+player+"']").html(options.games[game.gameid].name);
				
				var hours = Math.floor(played/3600);
				var mins = Math.floor((played % 3600)/60);
				$(".gl-game-played[data-player='"+player+"']").html(hours + ":" + ((mins<10)?"0":"") + mins);
				
				var logowrapper = $(".gl-game-logo[data-player='"+player+"']");				
				logowrapper.html("<img src=\"" + options.games[game.gameid]["picurl"] + "\" style=\"width: "+ logowrapper.width() + "px; height: "+ logowrapper.height() + "px;\">");
				
				$(".gl-game-logo-bg[data-player='"+player+"']").css("background-image",
					"url(\""+options.games[game.gameid]["picurl"] + "\")");
			}
			
		}			
	},
	
	/** 
	 * General observers
	 */
	updateGeneralObservers = function() {
		
	},
	
	// update routine to fetch data and update clients
	// Assumed to be called every second
	update = function() {
		
		updateBuffers(seconds);
		
		// Update observers
		updateAPMObservers();
		if (seconds % options.apm.bufferSize == 0) {		
			updateGameObservers();
		}
		updateGeneralObservers();
		
		// Correct clock
		var msecs = new Date().getTime() % 1000;
		setTimeout(update, 1000-msecs + (msecs>500?1000:0));			
		
		++seconds;
	}, 
		
	/** 
	 * Append a widget to the collection of widgets. The name '*' is used to denote that
	 * the widget is updated 
	 */
	addWidget = function(player, widget) {
		if (typeof widgets[player] == "undefined") 
			widgets[player] = [];		
		widgets[player].push(widget);		
	},
	
	/**
	 * Adds basic widgets as observers
	 */
	registerBasicWidgets = function() {
		// Text observers
		$(".gl-apm-text").each(function() {
			var container = $(this);
			var player = container.attr("data-player");
			var widget = {};
			widget.update = function(apm) {
				if (apm >= 0)
					container.html(apm);
				else	
					container.html("N/A");
			};
			addWidget(player, widget);
		});		
	},
	
	/**
	 * Add listeners to find when setup is done. This implies that options are available.
	 */
	registerSetupDone = function(func) {
		if (setupDone) {
			func();
		} else {
			setupObservers.push(func);
		}
	}
	
	/**
	 * Set up the game logger after the settings have been read
	 */
	setup = function() {
		
		// Fetch initial data
		$.get(options.path+'browserConnect.php?request=observeAPM', function(data) {
			current.apm.buffer = JSON.parse(data);
			// Store server time and remove it from the buffer
			serverTime = current.apm.buffer.now;
			delete current.apm.buffer.now;	
		});		

		$.get(options.path+'browserConnect.php?request=observeGame', function(data) {
			current.games = JSON.parse(data);
			updateGameObservers();
		});
		
		
		// Start off with few seconds to get APM data as soon as possible
		seconds = (serverTime - 2) % options.apm.bufferSize;	

		// Defer widget registeration to when document is ready and all elements available
		$(document).ready(registerBasicWidgets());
		
		// Start update
		setTimeout(update, 1000-(new Date().getTime() % 1000));			
		
		setupDone = true;
		for (var i in setupObservers) {
			// Invoke listeners
			setupObservers[i]();
		}
	},
		
			
	/**
	 * Interpret gamelogger settings
	 */	 
	readSettings = function(data) {
		$("#debug").append("settings");

		// Handle settings
		var lines = data.split(/\r\n|\n/)
		for (i = 0; i < lines.length; ++i) {
			if (lines[i].length == 0) {
				continue;
			}
			
			if (lines[i][0] == '#') {
				// Settings start with #
				setting = lines[i].split(/\t/);
				if (setting.length == 3) {
					if (setting[1] == "apmBufferSize") {
						options.apm.bufferSize = parseInt(setting[2]);					
					} else if (setting[1] == "serverTime") {
						options.serverTime = parseInt(setting[2]);
						serverTime = options.serverTime;
					}
				}
			} else if (lines[i][0] == '!') {
				// Comment line
			} else {
				// Game setting
				game = lines[i].split(/\t/);
				options.games[game[0]] = {name: game[2], picurl: game[3]};
			}
		}	
		
		setup();	
	};
		$("#debug").append("start gamelogger");
	// Find script location
	var scripts = document.getElementsByTagName('script');
	var path = scripts[scripts.length-1].src.split('?')[0];      // remove any ?query
	options.path = path.split('/').slice(0, -1).join('/')+'/';	
		$("#debug").append("start path");
	// Function to fetch settings
	$.get(options.path+'browserConnect.php?request=settings', readSettings)
	 .error(function(jqXHR, status, error) { 
		alert("Error: Could not read settings."); 
	});
	
	return {
		addWidget: addWidget,
		options: options,
		onSetup: registerSetupDone
	};
	
})();