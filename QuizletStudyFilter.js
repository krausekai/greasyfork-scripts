//Set amount wanted (eg: 20 items)
//Choose items via random range function (20 from entire deck)
//Filter by -X / +X options if wanted (prioritize worst/best first, or search only these?)

//Make sure we're viewing all starrable items
var starList = document.getElementsByClassName("first study-all");
starList[0].click();

//Clear current starred selection.
var starGroups = document.getElementsByClassName("star-chunk");
for (i =0; i < starGroups.length; ++i){
	if (starGroups[i].innerText.indexOf("Select all")>-1){
		starGroups[i].click();
	}
	if (starGroups[i].innerText.indexOf("Deselect these")>-1){
		starGroups[i].click();
	}
}

//Filtering criteria
var maximumAmount = 3;

//Generate new selection to study.
var stars = document.getElementsByClassName("star");
for (i =0; i< maximumAmount; ++i){
	var randomSelection = Math.floor(Math.random() * (stars.length - 0 + 1)) + 0;
	stars[randomSelection].click();
}