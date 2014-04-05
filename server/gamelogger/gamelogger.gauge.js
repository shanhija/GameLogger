/**
	GameLogger Gauge widget JavaScript
	
	Version:
		1.0	Initial revision
*/
$(document).ready(function() {
	$(".gl-apm-gauge").each(function () {
		var container = $(this);
		var player = container.attr("data-player");
		
		// Setup background image
		var img = $(document.createElement('img'));
		container.css("position","relative");
		img.attr("src", container.attr("data-bg"));
		img.appendTo(container);

		// Setup widget
		var widget = new Object();			
		widget.width = container.width();

		// Setup canvas
		var canvas = $(document.createElement('canvas'));
		canvas.attr({width: container.width(), height: container.width()});
		canvas.css({top: 0, left: 0, "position": "absolute", "z-index": 10});
		canvas.appendTo(container);
		widget.context = canvas[0].getContext('2d');

		// Setup gauge image
		img = new Image();
		widget.img = img;
		$(img).attr("src", container.attr("data-pointer")).load(function() {
			widget.imgWidth = this.width;
		});

		// Setup parameters
		widget.minAngle = container.attr("data-angle-min");
		if (!widget.minAngle) widget.minAngle = 40;
		widget.maxAngle = container.attr("data-angle-max");
		if (!widget.maxAngle) widget.maxAngle = 320;
		widget.maxAPM = container.attr("data-apm-max");
		if (!widget.maxAPM) widget.maxAPM = 200;
					
		widget.update = function(apm) {
			widget.context.setTransform(1,0,0,1,0,0);
			widget.context.clearRect(0,0,widget.width, widget.width);				
			widget.context.translate(widget.width/2, widget.width/2);
			
			var angle = ((Math.min(apm,widget.maxAPM)/widget.maxAPM)*(widget.maxAngle-widget.minAngle)+widget.minAngle);				
			widget.context.rotate(angle/180*Math.PI);
			widget.context.drawImage(widget.img, -widget.imgWidth/2, 0);
		};
		
		gamelogger.addWidget(player, widget);
	});	
});