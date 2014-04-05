	<script type="text/javascript" src="gamelogger/gamelogger.js"></script>
	<script type="text/javascript" src="gamelogger/gamelogger.histogram.js"></script>

<div class="activegamesheader">
	<h1 style="width: 80px;"><a href="#" title="Player Name" alt="Player Name">Player</a></h1>
	<h1 style="width: 175px;"><a href="#" title="Name of Active Game" alt="Name of Active Game">Active Game</a></h1>
	<h1 style="width: 80px;"><a href="#" title="Total input device actions player has performed during this particular session." alt="Total input device actions player has performed during this particular session.">Tot. Actions</a></h1>
	<h1 style="width: 70px;"><a href="#" title="Duration Player Has Played this game on this particular session" alt="Duration Player Has Played this game on this particular session.">Du. Played</a></h1>
	
</div>
<div class="gamedetail">	
	<div class="player" style="background:url('./elements/mikko-avatar.jpg')"><span class="player">Mikko</span></div>
	<div class="gl-game-logo-bg" data-player="mikko"><div class="gl-game-name" ><span class="gl-game-name" data-player="mikko"></span></div></div>
	<div class="gl-apm-total"><span class="gl-apm-total" data-player="mikko"></span></div>
	<div class="gl-game-played"><span class="gl-game-played" data-player="mikko"></span></div>
</div>
<div class="gamedetail">	
	<div class="player" style="background:url('./elements/juha-avatar.jpg')"><span class="player">Juha</span></div>
	<div class="gl-game-logo-bg" data-player="juha"><div class="gl-game-name" ><span class="gl-game-name" data-player="juha"></span></div></div>
	<div class="gl-apm-total"><span class="gl-apm-total" data-player="juha"></span></div>
	<div class="gl-game-played"><span class="gl-game-played" data-player="juha"></span></div>
</div>
<!--
<div class="gamedetail">	
	<div class="player" style="background:url('./elements/sami-avatar.jpg')"><span class="player">Sami</span></div>
	<div class="gl-game-logo-bg" data-player="sami"><div class="gl-game-name" ><span class="gl-game-name" data-player="sami"></span></div></div>
	<div class="gl-apm-total"><span class="gl-apm-total" data-player="sami"></span></div>
	<div class="gl-game-played"><span class="gl-game-played" data-player="sami"></span></div>
</div>
-->
<div class="gamedetail">
	<div class="player" style="background:url('./elements/pavel-avatar.jpg')"><span class="player">Pavel</span></div>
	<div class="gl-game-logo-bg" data-player="pavel"><div class="gl-game-name" ><span class="gl-game-name" data-player="pavel"></span></div></div>
	<div class="gl-apm-total"><span class="gl-apm-total" data-player="pavel"></span></div>
	<div class="gl-game-played"><span class="gl-game-played" data-player="pavel"></span></div>
</div>

<div class="clear"></div>
	
<div class="gl-apm-histogram" 
	data-apm-max="150"
	data-players="Mikko,Juha,Pavel"
	data-duration="120"
	data-ticks="4"
	data-bins="30">
</div>	