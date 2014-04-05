/**
	GameLogger history histogram widget JavaScript
	
	Version:
		1.0	Initial revision
*/

(function(gamelogger) {

var					

	/** 
	 * Registers the game historam widget to the container
	 */
	registerWidget = function(container) {
		var proto = container.children();
		proto.detach();
		
		// Sort games according to desired metric
		var order = gamelogger.history.walltime;
		if (container.attr("data-order") == "played")
			order = gamelogger.history.played;
		var ids = [];
		for (var gid in order) {
			ids.push(gid);			
		}
		ids.sort(function(a, b) {
			return order[b] - order[a];
		});
		
		var printTime = function(secs) {
			var hours = Math.floor(secs/3600);
			var mins = Math.floor((secs % 3600)/60);
			return hours + ":" + ((mins<10)?"0":"") + mins;
		};
		
		var walltimeMax = playedMax = NaN;
		for (var i in ids) {
			if (!(walltimeMax > gamelogger.history.walltime[ids[i]]))
				walltimeMax = gamelogger.history.walltime[ids[i]];				
			if (!(playedMax > gamelogger.history.played[ids[i]]))
				playedMax = gamelogger.history.played[ids[i]];
		}
		
		for (var i in ids) {			
		var 
			gid = ids[i],
			clone = proto.clone(),
			game = gamelogger.options.games[gid];
			
			clone.find("[data-instance=name]").each(function() {$(this).html(game.name);});
			clone.find("[data-instance=played]").each(function() {$(this).html(printTime(gamelogger.history.played[gid]));});
			clone.find("[data-instance=walltime]").each(function() {$(this).html(printTime(gamelogger.history.walltime[gid]));});
			clone.find("[data-instance=width-played]").each(function() {$(this).css("width", gamelogger.history.played[gid]/playedMax*100 + "%");});
			clone.find("[data-instance=width-walltime]").each(function() {$(this).css("width", gamelogger.history.walltime[gid]/walltimeMax*100 + "%");});
			clone.find("[data-instance=pic]").each(function() {
				$(this).html("<img src=\"" + game.picurl + "\">");});
//				$(this).html("<img src=\"" + game.picurl + "\" style=\"width: "+ $(this).width() + "px; height: "+ $(this).height() + "px;\">");});
			clone.find("[data-instance=bg]").each(function() {
				$(this).css("background-image","url(\""+ game.picurl+"\")");
			});
			
			if (gamelogger.history.colors) {
				clone.find("[data-instance=color]").each(function() {$(this).css("color", gamelogger.history.colors[gid])});
				clone.find("[data-instance=bg-color]").each(function() {$(this).css("background-color", gamelogger.history.colors[gid])});
			}
			
			container.append(clone);
		}
		
	};
	
	
	// Setup only after dependencies have set up 
	gamelogger.history.onSetup(function() {
		$(document).ready(function() {
			$(".gl-history-game-histogram").each(function() {	
				registerWidget($(this));
			}); 
		}); 
	});
})(gamelogger);
