/**
	GameLogger history JavaScript
	
	Version:
		1.0	Initial revision
*/

gamelogger.history = (function(gamelogger) {

var	
	options = {	},
	history = {
		data: {},
		began: NaN,
		ends: NaN
	},
	
	setupDone = false,
	setupListeners = [],
	
	walltime = {},		
	played = {},
	maximums = {
		walltime: 0,
		played: 0
	},
	
	/**
	 * Calculates the walltime for each game
	 * Assumes the games in each players history are sorted ascending with respect to began
	 */
	calcWalltimes = function() {
	var 
		sessions = {},
		indices = {},
		ghistory = {};
					
		// Populate player values
		for (var player in history.data) {
			if (history.data[player].games.length > 0) {
				ghistory[player] = history.data[player].games;
				indices[player] = 0;
			}
		}
		
		var anyMore = true;
		
		// Iterate through data and calculate wall times for each game
		while (anyMore) {
			var next = began = NaN;
			
			// Find the person that has the next first session in wall time
			for (var player in indices) {
				if (!(began < ghistory[player][indices[player]].began)) {
					began = ghistory[player][indices[player]].began;
					next = player;
				}					
			}
			
			var game = ghistory[next][indices[next]++];
			if (indices[next] == ghistory[next].length) {
				// Reached the end for this player.
				delete indices[next];
			}
			
			// Interpret game session
			if (!sessions[game.gameid]) {
				// No session, start a new
				sessions[game.gameid] = {
					began: game.began,
					ends: game.updated
				};
				walltime[game.gameid] = 0;
			} else {
				// Check if the current game session overlaps with existing common session
				var session = sessions[game.gameid];
				if (session.ends < game.began) {
					// No overlap
					walltime[game.gameid] += session.ends - session.began;
					session.began = game.began;
					session.ends = game.updated;
				} else {
					// Overlap
					session.ends = Math.max(game.updated, session.ends);
				}
			}
			
			// Check if we have any more games to interpret
			anyMore = false;
			for (var key in indices) {
				if (indices.hasOwnProperty(key)) anyMore = true;
			}
		}
		// Close open sessions
		for (var si in sessions) {
			walltime[si] += sessions[si].ends - sessions[si].began;
			if (walltime[si] > maximums.walltime)
				maximums.walltime = walltime[si];
		}
		gamelogger.history.walltime = walltime;
	},
	
	/**
	 * Calculates played times for each game.
	 */
	calcPlayed = function() {
		for (var player in history.data) {
			var games = history.data[player].games;
			for (var gi in games) {
				var game = games[gi];
				if (!played[game.gameid])
					played[game.gameid] = 0;
				played[game.gameid] += game.updated - game.began;
			}
		}
		
		for (var gi in played) {
			if (played[gi] > maximums.played) {
				maximums.played = played[gi];
			}
		}
		gamelogger.history.played = played;
	},	
	
	/**
	 * Add listener to notify when setup is done.
	 */
	registerSetupDone = function(func) {
		if (setupDone) 
			func();
		else 
			setupListeners.push(func);
	},	
		
	/**
	 * Converts the given gradient structure to colors for the games
	 */
	calcGradient = function(gradient) {
	var 
		order = played,
		colors = {};		

		// Sort played games' ids according to desired order
		switch (gradient.order) {
		case "name":
			for (var id in played) {
				order[id] = options.games[id].name;
			}
			break;
		case "id":
			for (var id in played) {
				order[id] = id;
			}
			break;
		case "walltime":
			order = walltime;
		}
		var ids = [];
		for (var gid in order) {
			ids.push(gid);			
		}
		ids.sort(function(a, b) {
			return order[b] - order[a];
		});

		// Convert gradient to a more manageable form
		for (var i = 0; i < gradient.data.length; ++i) {
			// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var 
			shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
			hex = gradient.data[i].color;
			
			hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				return r + r + g + g + b + b;
			});

			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			gradient.data[i].color = result ? [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)] : null;
		}
		gradient.data.sort(function(a, b) {
			return a.pos - b.pos;
		});		
		var minPos = gradient.data[0].pos,
			maxPos = gradient.data[gradient.data.length-1].pos;

		var rgbToHex = function(rgb) {
			rgb = ((rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16);
			while (rgb.length < 6)
				rgb = "0"+rgb;
			return '#' + rgb;			
		};
			
		// Calculate gradient					
		for (var i in ids) {
			if (i == 0) {
				colors[ids[i]] = rgbToHex(gradient.data[0].color);
			} else if (i == ids.length-1) {
				colors[ids[i]] = rgbToHex(gradient.data[gradient.data.length-1].color);
			} else {
			var
				alpha =  0,
				rgb = [0,0,0],
				j = 1,
				pos = i/(ids.length-1)*(maxPos-minPos)+minPos;
				
				for (; j < gradient.data.length; ++j)
					if (pos <= gradient.data[j].pos) break;
				alpha = (pos - gradient.data[j-1].pos)/(gradient.data[j].pos - gradient.data[j-1].pos);
				
				for (var k = 0; k < 3; ++k)
					rgb[k] = Math.round(alpha*gradient.data[j].color[k] + (1-alpha)*gradient.data[j-1].color[k]);					
				
				colors[ids[i]] = rgbToHex(rgb);
			}
		}
		gamelogger.history.colors = colors;
	},
	
	
	setup = function(data) {
		var data = JSON.parse(data);			
				
		// Construct a continous vector from APM data at minute resolution
		// Notice that this is not strictly APM but a smoothed version of it.
		for (var player in data) {
			var apm = [],
				began = time = 0;
			for (var ai in data[player].apm) {
				var buf = data[player].apm[ai];
				
				if (began == 0) {
					time = began = buf.began;
					
					if (!(history.began < began)) {
						history.began = began;
					}
				}

				while (time < buf.began) {
					apm.push(0);
					time += 60;
				}
				apm = apm.concat(buf.apm);
				time = buf.ends;
			}
			
			if (!(history.ends > time)) {
				history.ends = time;
			}			
/*				
			for (var ai in data[player].apm) {
				var buf = data[player].apm[ai];
				
				if (began == 0) {
					began = Math.floor(buf.updated/60);
					time = began;
					
					if (!(history.began < began*60)) {
						history.began = began*60;
					}
				}

				while (time < Math.floor(buf.updated/60)) {
					// Store last minute values. This also handles the change of minute in a consecutive apm monitoring
					if (count > 0) {
						apm.push(sum/count);
						sum = count = 0;
					} else 
						apm.push(0);
					++time;
				}
				
				// Due to the way apm is synchronized and the requirement that the size of apm buffer is a factor of 60
				// no apm buffer overlaps the boundary of two minutes
				for (var j in buf.apm) {
					sum += buf.apm[j];
					++count;
				}
			} 
			
			if (!(history.ends > time*60)) {
				history.ends = time*60;
			}
			*/
			// Also check games for when the time begins
			for (var gi in data[player].games) {
				var game = data[player].games[gi];
				if (!(history.began < game.began))
					history.began = game.began;
				if (!(history.ends > game.updated))
					history.ends = game.updated;
			}
			
/*			if (count > 0)
				apm.push(sum/count);*/
				
			history.data[player] = {
				apm : {
					data: apm,
					began: began
				},
				games : data[player].games				
			}
		}

		var gradient = (gamelogger.history)?gamelogger.history.gradient:false;
		gamelogger.history = history;
		
		// Calculate game times from history
		calcWalltimes();
		calcPlayed();
		
		if (gradient) {
			calcGradient(gradient);
		}
		
		// Clear loading
		$('.gl-history-loading').each(function() {$(this).html("");});
		$('.gl-history-loaded').each(function() {$(this).css("visibility", "visible");});
		
		// Notify listeners
		for (var si in setupListeners) {
			setupListeners[si]();
		}

		$("#debug").append("history: " + history.began + "=>" + history.ends);

	};
	

	/** Register to find when gamelogger setup is done **/
	gamelogger.onSetup(function() {
		options = gamelogger.options;
						$("#debug").append("start history");

		// Follow up by reading history data
		$.get(options.path + 'browserConnect.php?request=observeHistory', setup)
			.error(function(jqXHR, status, error) { alert("Error: Could not read history.");});
	});
	
	return {
		onSetup: registerSetupDone
	};
})(gamelogger);


	