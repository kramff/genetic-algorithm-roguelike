var music = new Audio();
//music.src = "vampire_killer.mp3";
music.src = "vampire_ogger.ogg";
function MusicLoop () {
	//this.currentTime = 0.051220; //Because the MP3 doesn't loop correctly otherwise
	this.currentTime = 0;
	this.play();
}
music.addEventListener('ended', MusicLoop, false);

music.play();

var musicPlaying = true;

function MuteToggle () {
	musicPlaying = !musicPlaying
	if (musicPlaying)
	{
		//music.play();
		document.getElementById("mute_button").src = "sound_on_hover.png";
	}
	else
	{
		//music.pause();
		document.getElementById("mute_button").src = "sound_off_hover.png";
	}
}

function MuteButtonHoverOn () {
	if (musicPlaying)
	{
		document.getElementById("mute_button").src = "sound_on_hover.png";
	}
	else
	{
		document.getElementById("mute_button").src = "sound_off_hover.png";
	}
}
function MuteButtonHoverOff () {
	if (musicPlaying)
	{
		document.getElementById("mute_button").src = "sound_on.png";
	}
	else
	{
		document.getElementById("mute_button").src = "sound_off.png";
	}
}

//Sound is currently HIGHLY ANNOYING after 500 LOOPS
MuteToggle();document.getElementById("mute_button").src = "sound_off.png"; music.volume = 0;

function VolumeAdjust () {
	if (musicPlaying && music.volume < 1)
	{
		music.volume += 0.05;
		if (music.volume > 0.94) music.volume = 1;
	}
	if (!musicPlaying && music.volume > 0)
	{
		music.volume -= 0.05;
		if (music.volume < 0.06) music.volume = 0;
	}
}