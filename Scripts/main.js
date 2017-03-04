/* Main.js: contains logic necessary for game to run */

// Global Variables 
var NORTH = 0;
var EAST = 1;
var SOUTH = 2;
var WEST = 3;
// Global Variables 

// Size parameters.
var cellHeight = 40;
var cellWidth = cellHeight * 2;
var cellImgHeight = cellHeight * 1.5;
var cellImgWidth = cellWidth;
var worldHeight = 600;
var worldWidth = 800;
// Size parameters

// Cell memory
var numCellsX = worldWidth / cellWidth;
var numCellsY = numCellsX;

var cellXClicked = null;
var cellYClicked = null;

var cellXClicked_prev = null;
var cellYClicked_prev = null;

var cellXHovered = null;
var cellYHovered = null;

var cellXPreviousHovered = null;
var cellYPreviousHovered = null;

var popupXPos = null;
var popupYPos = null;

var g_relX = null;
var g_relY = null;
// Cell memory

// Popup variables
var elements = [];
var defaultelements = [];
var popupIsOpen = false;
var subPopUpMenuElements = null;
var contMMXY = [];
var whichPopUpFlag = 0;//0 - normal, 1 - wwtreatment, 2 - dwtreatment
//new popup mgmt variables start
var isSubPopUpPresent = false;
var isMainPopUpPresent = false;
var popupCell = null;
var popupMainWidthHeight = 168;
var popupCreatedCell = [];
// Popup variables

var highlightPosition = [];

// Connect to world.
var canvas;
var context;
// Connect to world.

// Initialize world
var world = new Array(numCellsX);
var worldLakes = new Array(numCellsX);
var sources = [];
var visited = [];
var pending = [];

var lakeSource = null;
var lakes = [];
var visitedLakes = [];
var lakesToVisit = [];

var totalUsableWater = 0;
var lastTurnsUsableWater = 0;

var circuitStack = [];

var industry = [];
var farmland = [];
var neighborhoods = [];

var scenarioAquifer = null;

var gameStart = new Date(2015, 1, 1, 0, 0, 0, 0);
var gameDate = gameStart;
var gameMoney = 10000;
var population = 0;
var thisTurnsIncome = 0;
var newPopulation = 0;

var populationGenerated = 0;
var moneyGenerated = 0;

// Determines the length of user turns
var turnDuration = 1000;

// Background image for game
var imgScenario = null;

var levelToLoad = null;
var pageXML = null;
// Initialize world

//in progress, not to delete
// Water flow parameters
var backfillPipes = true;
var maxFlow = false;
var showFlow = false;
var circuitComplete = false;
// var showQualities = false;
// Water flow parameters.

// UI variables
var customDialog = null;

var dialogBox = null;
var dialogOverlay = null;

var helpIcon = null;
var icon = null;

var finishButton = null;

var trashIcon = null;
var trashButton = null;

var homeIcon = null;
var homeButton = null;

var rainBowButton = null;

var populationIcon = null;
var populationText = null;
var moneyIcon = null;
var moneyText = null;

var playerInformation = null;

var levelTheme;
var audioControl;
var audioOn;
var audioOff;
var isMuted = false;
// UI variables

// Stores all persistent page data
var gameCookie;

// Only one of these should ever be true, indicates what world the player is in
var isHappyWorld = false;
var isAgricultureWorld = false;
var isIndustryWorld = false;
var isOceanWorld = false;
var isWetWorld = false;
var isAridWorld = false;

// If this is true then tick does not activate
var isPaused = false;

// Load all images.
var imgPipes = loadPipeImages("resources/imgs/piping/");

//Global popup variables
var record_X = null;
var record_Y = null;
//Global popup variables

//remove all references of this variable - shree
var imgHighlighter = new Image();
imgHighlighter.src = 'resources/imgs/highlightsquare.png';

var imgTutorialSquare = new Image();
imgTutorialSquare.src = 'resources/imgs/tutorialsquare.png';

// Conditions contains all of the squares that need to be built upon in order to complete a scenario
var conditions = null;

var resImgs = new Array();
for (var i = 1; i <= 3; i++) {
	resImgs[i] = new Image();
	resImgs[i].src = "resources/imgs/res/res_" + i + ".png";
}

var agrImgs = new Array();
for (var i = 1; i <= 3; i++) {
	agrImgs[i] = new Image();
	agrImgs[i].src = "resources/imgs/agr/agr_" + i + ".png";
}

var indImgs = new Array();
for (var i = 1; i <= 3; i++) {
	indImgs[i] = new Image();
	indImgs[i].src = "resources/imgs/ind/ind_" + i + ".png";
}

function loadPipeImages(rootFile) {
	var imgs = new Object();
	for (var i = 1; i < 16; i++) {
		var img = new Image();
		var fileName = "0000" + i.toString(2);
		fileName = fileName.substr(fileName.length - 4);
		img.src = rootFile + fileName + ".png";
		imgs[i] = img;
	}
	return imgs;
}
// Load all images.

// Cookie functions
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}

function checkCookie(check) {
	var value = getCookie(check);
	if (value != "") {
	} else {
	}
}

function startCookie() {
	// If any scenarios are completed then make green highlight visible
	if (document.cookie) {
		gameCookie = getCookie("scenario");
	} else {
		setCookie("scenario", "0", 365);
	}
}
// Cookie functions

// position manipulators
function inWorld(x, y) {
	return x >= 0 && x < numCellsX && y >= 0 && y < numCellsY;
}

function toCell(px, py) {
	// Get the cell clicked on.
	var cellY = ((px - worldWidth / 2 + cellImgWidth / 2) * (-cellHeight * .5) - (py - worldHeight + cellImgHeight) * cellWidth * .5) / (cellHeight * .5 * cellWidth * .5 - cellWidth * .5 * -cellHeight * .5);
	var cellX = (py - worldHeight + cellImgHeight + cellY * cellHeight * .5) / (-cellHeight * .5);
	cellX = Math.floor(cellX) + 1;
	cellY = Math.floor(cellY) + 2;
	return [cellX, cellY];
}

function move(cell, direction) {
	switch (direction) {
		case NORTH: return cell.y >= numCellsY - 1 ? null : world[cell.x][cell.y + 1];
		case EAST: return cell.x <= 0 ? null : world[cell.x - 1][cell.y];
		case SOUTH: return cell.y <= 0 ? null : world[cell.x][cell.y - 1];
		case WEST: return cell.x >= numCellsX - 1 ? null : world[cell.x + 1][cell.y];
		default: return null;
	}
}

function getXYPos(htmlElem) {
	var pos_x = 0;
	var pos_y = 0;

	while (htmlElem) {
		pos_x += (htmlElem.clientLeft + htmlElem.offsetLeft - htmlElem.scrollLeft);
		pos_y += (htmlElem.clientTop + htmlElem.offsetTop - htmlElem.scrollTop);
		htmlElem = htmlElem.offsetParent;
	}
	return [pos_x, pos_y];
}


function inCircle(x, y, cx, cy, radius) {
	var distancesquared = ((x - cx) * (x - cx)) + ((y - cy) * (y - cy));
	return distancesquared <= (radius * radius);
}

function getActiveCircle(xPos, yPos) {
	for (var i = 0; i < elements.length; i++) {
		if (inCircle(xPos, yPos, elements[i].cx, elements[i].cy, elements[i].rad) == true) {
			if (isMainPopUpPresent || isSubPopUpPresent)
				return elements[i];
		}
	}
	return null;
}
// position manipulators

// Pausing and unpausing
function gamePause(){
	isPaused = true;
}

function gameUnpause(){
	isPaused = false;
}
// Pausing and unpausing

// For checking win conditions
function checkConditions(){
	var conditionMet = false;
	
	// var conditions = [][]; //condtions is a 2d array, first column is the condition the second column is true or false if the condition is met
		
	$(conditions).each(function () {
		var condition = $(this);
		var conditionX = condition.attr('x');
		var conditionY = condition.attr('y');
		var conditionType = conditions.attr('type');
		
		// var conditionMet = false;

		// if (inWorld(conditionX, conditionY) && (world[conditionX][conditionY].type.name == conditionType || world[conditionX][conditionY].type.name == 'completed')) {
		// if()
			// condition.attr('type', 'completed');

		// } else {
			
		switch(conditionType){
			case 'circuitComplete':
				if(circuitComplete){
					conditionMet = true;
				} else {
					conditionMet = false;
				}
				break;
			default:
				var loopX;
				var loopY;
				
				for(loopX = 0; loopX < numCellsX; loopX++){
					for(loopY = 0; loopY < numCellsY; loopY++){
						var tempCell = world[loopX][loopY];
						
						if(tempCell.type.name == conditionType && tempCell.inFlowCircuit){
							// console.log(tempCell.inFlowCircuit + " " + tempCell.type.name);
							conditionMet = true;
							// console.log("Found one!");
							break;
						} else {
							conditionMet = false;
						}
						
					}
					
					if(conditionMet){
						break;
					}
				}
				
				break;
		}
	});
			// alert(conditionX + " " + conditionY + " " + conditionType);
			// alert("condition not met");
		// }
	// console.log(conditionMet);
		var pageURL = location.href;

		if(pageURL.indexOf("?") == -1){
			conditionMet = false;
		}

		if(conditionMet){
			// alert("condition met");	
			var urlScenario = pageURL.slice(pageURL.indexOf("?") + 1);
			currentScenario = urlScenario.slice(0,urlScenario.indexOf("."));
			// alert(currentScenario);	
			var scenariosCompleted = null;

			switch(currentScenario){
				case("scenario1"):
					scenariosCompleted = "1";
					break;
				case("scenario2"):
					scenariosCompleted = "2";
					break;
				case("scenario3"):
					scenariosCompleted = "3";
					break;
				case("scenario4"):
					scenariosCompleted = "4";
					break;
				case("scenario5"):
					scenariosCompleted = "5";
					break
				case("scenario6"):
					scenariosCompleted = "6";
					break;
				case("scenario7"):
					scenariosCompleted = "7";
					break;
				case("scenario8"):
					scenariosCompleted = "8";
					break;
				case("scenario9"):
					scenariosCompleted = "9";
					break;
				case("scenario10"):
					scenariosCompleted = "10";
					break;
				default:
					break;
			}
			if(parseInt(gameCookie) >= parseInt(scenariosCompleted)){

			} else {
				setCookie("scenario", scenariosCompleted, 365);
			}

			ScenarioCompleted();

		}

	// });
}
// For checking conditions

// Water flow functions
function probe(){ // Goes through sources
	circuitComplete = false;

	for(var sourcesIndex = 0; sourcesIndex < sources.length; sourcesIndex++){
		var tempSource = sources[sourcesIndex];

		var sourceName = tempSource.type.name;
		var sourceNeighbors = tempSource.getNeighbors();
		
		var isWaterPulled = false;
		
		var waterPulledFromLake = tempSource.maxWaterUsage;
		
		//Initializes source values
		tempSource.curUnits = waterPulledFromLake;
		// Take water from lake or aquifer.
		
		var tempX = tempSource.x;
		var tempY = tempSource.y;
		
		var tempLake = worldLakes[tempX][tempY];
		
		if(tempLake.lake.name == "lake"){
			tempLake.lake.curWaterStorage -= waterPulledFromLake;
			
			isWaterPulled = true;
		}
		
		var neighborsToVisit = [];

		// Only grab neighbors that haven't been visited, and aren't lakes or empty.
		for(var n = 0; n < 4; n++){
			if(sourceNeighbors[n]){
				tempX = sourceNeighbors[n].x;
				tempY = sourceNeighbors[n].y;
				
				tempLake = worldLakes[tempX][tempY];
				
				// if on lake tile pull from there, else pull from aquifer.
				if(!isWaterPulled && tempLake.lake.name != 'empty'){
					tempLake.curWaterStorage -= waterPulledFromLake;
					
					if(tempLake.curWaterStorage < 0){
						tempLake.curWaterStorage = 0;
					}
					
					isWaterPulled = true;
				}
				
				if(sourceNeighbors[n] && visited.indexOf(sourceNeighbors[n]) == -1 && sourceNeighbors[n].type.name != "empty" && sourceNeighbors[n].type.name != "source"){

					neighborsToVisit.push(sourceNeighbors[n]);
				}
			}
		}
		
		if(!isWaterPulled){
			scenarioAquifer.curWaterStorage -= waterPulledFromLake;
			
			if(scenarioAquifer.curWaterStorage < 0){
				tempSource.curUnits += scenarioAquifer.curWaterStorage;
			
				scenarioAquifer.curWaterStorage = 0;
			}
		}
		
		var curWaterAvailable = tempSource.curUnits * tempSource.curQuality;
		
		totalUsableWater += curWaterAvailable;
		
		tempSource.inFlowCircuit = true;
		visited.push(tempSource);

		// tempSource.qualityDropPerUsage = tempSource.curQuality;
	
		var tempCurWaterUsage = tempSource.curWaterUsage * tempSource.curPopulation;
		
		// Temporary variables to pass flow information to next neighbor
		tempSource.outputUnits = curWaterAvailable - (curWaterAvailable * tempSource.evaporationPerUsage);
		tempSource.outputQuality = tempSource.curQuality - (tempCurWaterUsage * tempSource.qualityDropPerUsage);

		/*console.log(tempSource.curUnits)
		 console.log("Source output: " + tempSource.outputUnits + "; Quality :" + tempSource.outputQuality);*/

		// Sources can have multiple children. Each gets equal output.
		var outputPerChild = tempSource.outputUnits / neighborsToVisit.length;

		for(var n = 0; n < neighborsToVisit.length; n++){
			var tempNeighbor = neighborsToVisit[n];

			// Must be a pipe or other non-empty/non-input/non-output. Screened above							
			tempNeighbor.inputUnits = outputPerChild;
			tempNeighbor.inputQuality = tempSource.outputQuality;

			// Decrease cell integrity for repair mechanic

			// Go to next neighbor
			flow(tempSource, tempNeighbor);	
		}
	}
	
	if(pending.length == 0){
		resolveFlow();
	} else {
		while(pending.length > 0){
			// Pending is a list of all pipe branches left to explore.
			// FinishFlow goes through each just like normal flow()
			finishFlow();
		}
	}
}

function flow(previousCell, cell){ // Branches down until multiple neighbors are found			
	var cellName = cell.type.name;

	// Grab incoming flow
	cell.curUnits = cell.inputUnits;
	cell.curQuality = cell.inputQuality;

	var curWaterAvailable = cell.curUnits * cell.curQuality;
	
	totalUsableWater += curWaterAvailable;
	
	var treatmentModifier = 0;
	
	var tempCurWaterUsage = cell.curWaterUsage * cell.curPopulation;
	
	switch(cellName){
		case 'pipe':
			break;
		case 'watertower':
			// Check if water should be pulled from storage
			var predictedWaterAvailable = lastTurnsUsableWater - totalUsableWater;
			
			if(curWaterAvailable < predictedWaterAvailable){
				curWaterAvailable += cell.curWaterStorage;
				cell.curWaterStorage = 0;
			} else {
				// Refill storage
				if(cell.curWaterStorage < cell.maxWaterStorage){
					var spaceLeft = (cell.maxWaterStorage - cell.curWaterStorage);

					if((curWaterAvailable - spaceLeft) < 0){
						cell.curWaterStorage += curWaterAvailable;
						landTermination();
					} else {
						cell.curWaterStorage += spaceLeft;
						curWaterAvailable -= spaceLeft;
					}
				}
			}
			break;
		case 'wastewater':			
			treatmentModifier = cell.treatmentModifier;
			
			break;
		case 'drinkingwater':

			treatmentModifier = cell.treatmentModifier;	
			
			break;		
		case 'agricultural':
			if(curWaterAvailable >= tempCurWaterUsage){
				cell.curPopulation += cell.usageIncreaseWithSurplus;
				
				if(cell.curPopulation >= cell.maxPopulation){
					cell.curPopulation = cell.maxPopulation;
					expand(cell);
				}
				
				moneyGenerated = cell.curPopulation * cell.moneyGeneratedPerUsage;	
			} else { // Insufficient water, terminate early.
			
				// console.log("Cell population " + cell.curPopulation + " - " + cell.usageDecreaseWithDeficit);
			
				cell.curPopulation -= cell.usageDecreaseWithDeficit;
				
				if(cell.curPopulation <= 0){
					cell.curPopulation = 0;
					disappearFromFlow(cell);
				}

				// Don't generate income

				// Insufficient water, terminate early.
				landTermination(cell);
				// return;
			}
			
			newPopulation += cell.curPopulation;
			break;
		case 'residential':
			// console.log(curWaterAvailable);
		
			if(curWaterAvailable >= tempCurWaterUsage){
				cell.curPopulation += cell.usageIncreaseWithSurplus;
				
				if(cell.curPopulation > cell.maxPopulation){
					cell.curPopulation = cell.maxPopulation;
					expand(cell);
				}				
				moneyGenerated = cell.curPopulation * cell.moneyGeneratedPerUsage;	
			} else { // Insufficient water, terminate early.
			
				// console.log("Cell population " + cell.curPopulation + " - " + cell.usageDecreaseWithDeficit);
			
				cell.curPopulation -= cell.usageDecreaseWithDeficit;
				
				if(cell.curPopulation <= 0){
					cell.curPopulation = 0;
					disappearFromFlow(cell);
				}
				
				// console.log("Cell population " + cell.curPopulation + " - " + cell.usageDecreaseWithDeficit);
				
				// Don't generate income

				// Insufficient water, terminate early.
				landTermination(cell);
				// return;
			}
			
			newPopulation += cell.curPopulation;
			break;
		case 'industrial':
			if(curWaterAvailable >= tempCurWaterUsage){
				cell.curPopulation += cell.usageIncreaseWithSurplus;
				
				if(cell.curPopulation >= cell.maxPopulation){
					cell.curPopulation = cell.maxPopulation;
					expand(cell);
				}
				
				moneyGenerated = cell.curPopulation * cell.moneyGeneratedPerUsage;	
			} else { // Insufficient water, terminate early.
				cell.curPopulation -= cell.usageDecreaseWithDeficit;
				
				if(cell.curPopulation <= 0){
					cell.curPopulation = 0;
					disappearFromFlow(cell);
				}

				// Don't generate income

				// Insufficient water, terminate early.
				landTermination(cell);
				// return;
			}
			
			newPopulation += cell.curPopulation;
			break;
		default:
			
			break;
	}
	
	// console.log(cell.type.name + " has " + cell.curPopulation + " population.");
	// console.log("Population is now " + newPopulation);
	
	thisTurnsIncome += Math.round(moneyGenerated);
	moneyGenerated = 0;
	// newPopulation = Math.round(newPopulation);

	var cellNeighbors = cell.getNeighbors();

	var neighborsToVisit = [];

	for(var n = 0; n < 4; n++){
		if(cellNeighbors[n] && cellNeighbors[n] != previousCell && visited.indexOf(cellNeighbors[n]) == -1 && cellNeighbors[n].type.name != 'empty' && cellNeighbors[n].type.name != 'empty'){
			neighborsToVisit.push(cellNeighbors[n]);
		}
	}
	
	// tempCurWaterUsage = cell.curPopulation * cell.curWaterUsage;
	
	if(neighborsToVisit == 0){
		// Decrease cell integrity for repair mechanic
		landTermination(cell);
		return;
	} else if(neighborsToVisit.length > 1){
		pending.push(cell);
	}else {
		for(var n = 0; n < neighborsToVisit.length; n++){
			var tempNeighbor = neighborsToVisit[n];

			if(tempNeighbor != previousCell){
				
				cell.inFlowCircuit = true;
				visited.push(cell);
				
				cell.outputUnits = curWaterAvailable - (tempCurWaterUsage * cell.evaporationPerUsage);
				cell.outputQuality = cell.curQuality - (tempCurWaterUsage* cell.qualityDropPerUsage) + treatmentModifier;
				
				// var outputPerChild = cell.outputUnits / neighborsToVisit.length;
				
				tempNeighbor.inputUnits = cell.outputUnits;
				tempNeighbor.inputQuality = cell.outputQuality;

				// Decrease cell integrity for repair mechanic
				flow(cell, tempNeighbor);
				
				var tempX = tempNeighbor.x;
				var tempY = tempNeighbor.y;
				
				var tempLake = worldLakes[tempX][tempY];
								
				if(tempLake.lake.name == "lake"){
					terminate(cell, tempNeighbor);
				}
			}
		}
	}
}

function finishFlow(){ // Goes through 'pending' elements 
	for(var pendingIndex = 0; pendingIndex < pending.length; pendingIndex++){
		var cell = pending[pendingIndex];
		var cellName = cell.type.name;
		var cellNeighbors = cell.getNeighbors();

		cell.curUnits = cell.inputUnits;
		cell.curQuality = cell.inputQuality;

		var curWaterAvailable = cell.curUnits * cell.curQuality;
		
		var tempCurWaterUsage = cell.population * cell.curWaterUsage;
		
		totalUsableWater += curWaterAvailable;
		
		var treatmentModifier = 0;
		
		// Determine if there's enough water for use
		switch(cellName){
			case 'pipe':
				break;
			case 'watertower':
				// Check if water should be pulled from storage
				var predictedWaterAvailable = lastTurnsUsableWater - totalUsableWater;
				
				if(curWaterAvailable < predictedWaterAvailable){
					curWaterAvailable += cell.curWaterStorage;
					cell.curWaterStorage = 0;
				} else {
					// Refill storage
					if(cell.curWaterStorage < cell.maxWaterStorage){
						var spaceLeft = (cell.maxWaterStorage - cell.curWaterStorage);

						if((curWaterAvailable - spaceLeft) < 0){
							cell.curWaterStorage += curWaterAvailable;
							landTermination(cell);

						} else {
							cell.curWaterStorage += spaceLeft;
							curWaterAvailable -= spaceLeft;
						}
					}
				}
				break;
			case 'wastewater':
				
				treatmentModifier = cell.treatmentModifier;
				
				break;
			case 'drinkingwater':

				treatmentModifier = cell.treatmentModifier;	
				
				break;		
			case 'agricultural':
				if(curWaterAvailable >= tempCurWaterUsage){
					cell.curPopulation += cell.usageIncreaseWithSurplus;
				
					if(cell.curPopulation >= cell.maxPopulation){
						cell.curPopulation = cell.maxPopulation;
						expand(cell);
					}
					
					moneyGenerated = cell.curPopulation * cell.moneyGeneratedPerUsage;	
				} else { // Insufficient water, terminate early.
				
					
				
					cell.curPopulation -= cell.usageDecreaseWithDeficit;
					
					if(cell.curPopulation <= 0){
						cell.curPopulation = 0;
						disappearFromFlow(cell);
					}

					// Don't generate income
					landTermination(cell);
					// return;
				}
				
				newPopulation += cell.curPopulation;
				break;
			case 'residential':
				if(curWaterAvailable >= tempCurWaterUsage){
					cell.curPopulation += cell.usageIncreaseWithSurplus;
					
					if(cell.curPopulation >= cell.maxPopulation){
						cell.curPopulation = cell.maxPopulation;
						expand(cell);
					}					
					moneyGenerated = cell.curPopulation * cell.moneyGeneratedPerUsage;	
				} else { // Insufficient water, terminate early.
				
					console.log("Cell population " + cell.curPopulation + " - " + cell.usageDecreaseWithDeficit);
				
					cell.curPopulation -= cell.usageDecreaseWithDeficit;
					
					if(cell.curPopulation <= 0){
						cell.curPopulation = 0;
						disappearFromFlow(cell);
					}

					// Don't generate income
					landTermination(cell);
					// return;
				}
				
				newPopulation += cell.curPopulation;
				break;
			case 'industrial':
				if(curWaterAvailable >= tempCurWaterUsage){
					cell.curPopulation += cell.usageIncreaseWithSurplus;
					
					if(cell.curPopulation >= cell.maxPopulation){
						cell.curPopulation = cell.maxPopulation;
						expand(cell);
					}
					
					moneyGenerated = cell.curPopulation * cell.moneyGeneratedPerUsage;	
				} else { // Insufficient water, terminate early.
					cell.curPopulation -= cell.usageDecreaseWithDeficit;
					
					if(cell.curPopulation <= 0){
						cell.curPopulation = 0;
						disappearFromFlow(cell);
					}

					// Don't generate income

					landTermination(cell);
					// return;
				}
				
				newPopulation += cell.curPopulation;
				break;
			default:
				break;
		}
		
		// console.log(cell.type.name + " has " + cell.curPopulation + " population.");
		// console.log("Population is now " + newPopulation);
		
		thisTurnsIncome += Math.round(moneyGenerated);
		moneyGenerated = 0;
		// newPopulation = Math.round(newPopulation);
		
		var neighborsToVisit = [];

		// Grab all neighbors excluding empty.
		for(var n = 0; n < 4; n++){
			if(cellNeighbors[n] && visited.indexOf(cellNeighbors[n]) == -1 && cellNeighbors[n].type.name != 'empty' && cellNeighbors[n].type.name != 'source'){
				neighborsToVisit.push(cellNeighbors[n]);
			}
		}
	
		cell.inFlowCircuit = true;
		visited.push(cell);		
		
		// Setup output to next square.
		cell.outputUnits = curWaterAvailable - (tempCurWaterUsage* cell.evaporationPerUsage);
		cell.outputQuality = cell.curQuality - (tempCurWaterUsage * cell.qualityDropPerUsage) + treatmentModifier;
				
		var outputPerChild = cell.outputUnits / neighborsToVisit.length;

		for(var n = 0; n < neighborsToVisit.length; n++){
			var tempNeighbor = neighborsToVisit[n];
		
			tempNeighbor.inputUnits = outputPerChild;
			tempNeighbor.inputQuality = cell.outputQuality;

			console.log(cellName + ", " + cell.outputUnits + "; Quality :" + cell.outputQuality);

			// Decrease cell integrity for repair mechanic

			flow(cell, tempNeighbor);
			
			var tempX = tempNeighbor.x;
			var tempY = tempNeighbor.y;
			
			var tempLake = worldLakes[tempX][tempY];
			
			if(tempLake.lake.name == "lake"){
				terminate(cell, tempNeighbor);
			}
		}
	}	
	resolveFlow();
}

function resolveFlow(){
	
	var loopX;
	var loopY;
	// Check all squares
	for(loopX = 0; loopX < numCellsX; loopX++){
		for(loopY = 0; loopY < numCellsY; loopY++){
			var cell = world[loopX][loopY];
			
			// console.log(cell);
			
			if((cell.type.name == 'agricultural' || cell.type.name == 'industrial' || cell.type.name == 'residential') && visited.indexOf(cell) == -1){
				
				cell.inFlowCircuit = false;
				
				// console.log("Cell population " + cell.curPopulation + " - " + cell.usageDecreaseWithDeficit);
				cell.curPopulation -= cell.usageDecreaseWithDeficit;
				
				if(cell.curPopulation <= 0){
					cell.curPopulation = 0;
					disappear(cell);
				}
				
				// Don't generate income
				newPopulation += cell.curPopulation;
			}
		}
	}
	
	// Diffuse water capacity and quality through lakes and groundwater

	if(lakeSource){
		// Recharge the lake.
		startLakeDiffusion();
	}

	if(scenarioAquifer){
		// Recharge the aquifer.
		if(scenarioAquifer.curWaterStorage < scenarioAquifer.maxWaterUsage){
			scenarioAquifer.curWaterStorage += scenarioAquifer.rechargeAmount;
		}

		if(scenarioAquifer.curWaterStorage > scenarioAquifer.maxWaterUsage){
			scenarioAquifer.curWaterStorage = scenarioAquifer.maxWaterUsage;
		}
	}

	visited = [];
	pending = [];
	
	lastTurnsUsableWater = totalUsableWater;
	totalUsableWater = 0;
	
	// console.log(newPopulation);
	
	population = newPopulation;
	newPopulation = 0;
	
	gameMoney += thisTurnsIncome;
	thisTurnsIncome = 0;

	populationText.innerHTML = Math.round(population);
	moneyText.innerHTML = Math.round(gameMoney);

	// sources = [];
}

function startLakeDiffusion(){
	var cell = lakeSource.parent;
	var currentStorage = cell;
	var maxStorage = cell.maxWaterUsage;

	// Factor evaporation and loss due to quality.
	var changeInStorage = (currentStorage * cell.curQuality) - (cell.curWaterStorage * cell.evaporationPerUsage);

	// Recharge lake cell.
	changeInStorage += cell.rechargeAmount;

	var netStorage = currentStorage + changeInStorage;

	var excess = 0;

	if(currentStorage > maxStorage){
		excess = netStorage - maxStorage;
	}

	var grossStorage = netStorage - excess;
	cell.curWaterStorage = grossStorage;

	var cellNeighbors = cell.getNeighbors();

	var neighborsToVisit = [];

	// Grab all lake neighbors.
	for(var n = 0; n < 4; n++){
		if(cellNeighbors[n]){
			var tempX = cellNeighbors[n].x;
			var tempY = cellNeighbors[n].y;
		
			var tempLake = worldLakes[tempX][tempY];
			if(tempLake.lake.name == "lake" && visitedLakes.indexOf(cellNeighbors[n]) == -1){
				neighborsToVisit.push(cellNeighbors[n]);
			}
		}
		
	}

	visitedLakes.push(cell);

	for(n = 0; n < neighborsToVisit.length; n++){
		var tempNeighbor = neighborsToVisit[n];

		// Setup output to next square.
		cell.outputQuality = cell.curQuality - (currentStorage * cell.qualityDropPerUsage);

		var outputPerChild = excess / neighborsToVisit.length;

		tempNeighbor.inputUnits = outputPerChild;
		tempNeighbor.inputQuality = cell.outputQuality;


		diffuse(cell, tempNeighbor, excess, maxStorage);
	}
}

function diffuse(previousCell, cell, incomingWater, storageLimit){
	var currentStorage = cell.curWaterStorage;
	var maxStorage = storageLimit;

	// Factor evaporation and loss due to quality.
	var changeInStorage = (currentStorage * cell.curQuality) - (cell.curWaterStorage * lakeSource.evaporationPerUsage);

	// Recharge lake cell.
	changeInStorage += cell.rechargeAmount + incomingWater;

	var netStorage = currentStorage + changeInStorage;

	var excess = 0;

	if(currentStorage > maxStorage){
		excess = netStorage - maxStorage;
	}

	var grossStorage = netStorage - excess;
	cell.curWaterStorage = grossStorage;

	var cellNeighbors = cell.getNeighbors();

	var neighborsToVisit = [];

	// Grab all lake neighbors.
	for(var n = 0; n < 4; n++){
		if(cellNeighbors[n]){
			var tempX = cellNeighbors[n].x;
			var tempY = cellNeighbors[n].y;
		
			var tempLake = worldLakes[tempX][tempY];
			if(tempLake.lake.name == "lake" && visitedLakes.indexOf(cellNeighbors[n]) == -1){
				neighborsToVisit.push(cellNeighbors[n]);
			}
		}
		
	}

	visitedLakes.push(cell);

	for(n = 0; n < neighborsToVisit.length; n++){
		var tempNeighbor = neighborsToVisit[n];

		// Setup output to next square.
		cell.outputQuality = cell.curQuality - (currentStorage * cell.qualityDropPerUsage);

		var outputPerChild = excess / neighborsToVisit.length;

		tempNeighbor.inputUnits = outputPerChild;
		tempNeighbor.inputQuality = cell.outputQuality;		
		lakesToVisit.push(tempNeighbor);
		
	}
}

function expand(cell){ // A growing production structure will expand over time
		
	switch(cell.type.name){
		case "industrial":			
			var possibleCells = [];
			
			var loopX;
			var loopX;
			
			for(loopX = 0; loopX < numCellsX; loopX++){
				for(loopY = 0; loopY < numCellsY; loopY++){
					var tempCell = world[loopX][loopY];
					
					if(tempCell.type.name != 'empty'){
						var tempNeighbors = tempCell.getNeighbors();
						
						for(var i = 0; i < tempNeighbors.length; i++){
							if(tempNeighbors[i].type.name == 'residential'){
								possibleCells.push(world[loopX][loopY]);
							}
						}
					}
				}
			}
			
			var randomChoice = Math.floor(Math.random() * possibleCells.length);
			
			var tempNeighbor = possibleCells[randomChoice];
			
			world[tempNeighbor.x][tempNeighbor.y].setType(new Industrial(world[tempNeighbor.x][tempNeighbor.y]));
			
			break;
		case "residential":
			var possibleCells = [];
			
			var loopX;
			var loopY;
			
			for(loopX = 0; loopX < numCellsX; loopX++){
				for(loopY = 0; loopY < numCellsY; loopY++){
					var tempCell = world[loopX][loopY];
					
					if(tempCell.type.name != 'agricultural'){
						var tempNeighbors = tempCell.getNeighbors();
						
						for(var i = 0; i < tempNeighbors.length; i++){
							if(tempNeighbors[i] && tempNeighbors[i].type.name == 'residential'){
								possibleCells.push(world[loopX][loopY]);
							}
						}
					}
				}
			}
			// console.log(possibleCells);
			if(possibleCells.length > 0){
				var randomChoice = Math.floor(Math.random() * possibleCells.length);
				// console.log(randomChoice);
				var tempNeighbor = possibleCells[randomChoice];
				// console.log(tempNeighbor);			
				world[tempNeighbor.x][tempNeighbor.y].setType(new Residential(world[tempNeighbor.x][tempNeighbor.y]));
			}
			
			break;
		case "agricultural":
			var possibleCells = [];
			
			var loopX;
			var loopX;
			
			for(loopX = 0; loopX < numCellsX; loopX++){
				for(loopY = 0; loopY < numCellsY; loopY++){
					if(world[loopX][loopY].type.name != 'empty'){
						possibleCells.push(world[loopX][loopY]);
					}
				}
			}
			
			var randomChoice = Math.floor(Math.random() * possibleCells.length);	
			
			var tempNeighbor = possibleCells[randomChoice];
			
			world[tempNeighbor.x][tempNeighbor.y].setType(new Agricultural(world[tempNeighbor.x][tempNeighbor.y]));
			break;
		default:
			
			break;

	}
	paint();
}

function disappearFromFlow(cell){ // When a BasicItem 'starves' from lack of water over time 
	
	console.log(cell.type.name +  " at square " + cell.x + ", " + cell.y + " is out of water and must disappear");
	
	if(pending.indexOf(cell) != -1){
		pending.splice(pending.indexOf(cell), 1);
	}
	
	switch(cell.type.name){
		case "industrial":
			industry.splice(industry.indexOf(cell), 1);
			break;
		case "residential":
			neighborhoods.splice(neighborhoods.indexOf(cell), 1);
			break;
		case "agricultural":
			farmland.splice(farmland.indexOf(cell), 1);
			break;
	}
		
	cell.curPopulation = 0;
	cell.inFlowCircuit = false;
	
	world[cell.x][cell.y].emptyType(new Empty(world[cell.x][cell.y]));
	world[cell.x][cell.y].setType(new Pipe(world[cell.x][cell.y]));
	
	
	paint();
}

function disappear(cell){ // When a BasicItem not in the main circuit 'starves' from lack of water over time 
	
	console.log(cell.type.name + " is out of water and must disappear");
	
	if(pending.indexOf(cell) != -1){
		pending.splice(pending.indexOf(cell), 1);
	}
	
	switch(cell.type.name){
		case "industrial":
			industry.splice(industry.indexOf(cell), 1);
			break;
		case "residential":
			neighborhoods.splice(neighborhoods.indexOf(cell), 1);
			break;
		case "agricultural":
			farmland.splice(farmland.indexOf(cell), 1);
			break;
	}
	
	cell.curPopulation = 0;
	cell.inFlowCircuit = false;
	
	world[cell.x][cell.y].emptyType(new Empty(world[cell.x][cell.y]));
	// world[cell.x][cell.y].setType(new Empty(world[cell.x][cell.y]));
	
	// console.log(cell.x + ", " + cell.y);
	// console.log(cell.type.name);
			
	paint();
}

function terminate(previousCell, terminatingCell){
	circuitComplete = true;

	terminatingCell.inputUnits = previousCell.outputUnits;
	terminatingCell.inputQuality = previousCell.outputQuality;

	terminatingCell.curUnits += terminatingCell.inputUnits;
	terminatingCell.curQuality = (terminatingCell.inputQuality + terminatingCell.curQuality) / 2;

	// console.log("Terminating lake at " + terminatingCell.x + ", " + terminatingCell.y + "| " + terminatingCell.curUnits);
}

function circuitCheckStart(cell){
	cell.inFlowCircuit = true;
	
	if(visited.indexOf(cell) == -1){
		visited.push(cell);	
	}
	
	var cellNeighbors = cell.getNeighbors();
	
	var neighborsToVisit = [];
				
	// Grab all neighbors excluding empty.
	for(var n = 0; n < 4; n++){
		if(cellNeighbors[n] && visited.indexOf(cellNeighbors[n]) == -1 && cellNeighbors[n].type.name != 'empty'){
			neighborsToVisit.push(cellNeighbors[n]);
		}
	}
	
	// console.log(neighborsToVisit);
	
	for(var n = 0; n < neighborsToVisit.length; n++){
		var tempNeighbor = neighborsToVisit[n];
		
		var tempX = tempNeighbor.x;
		var tempY = tempNeighbor.y;
		
		var tempLake = worldLakes[tempX][tempY];
		
		if(tempLake.lake.name == "lake"){
			circuitTermination();
		} else {
			circuitCheck(tempNeighbor);
		}
	}
}

// Checks to see if the source and its downstream circuit have an output when water fails to reach it e.g. a pipe into a lake
function circuitCheck(cell){
		
	if((cell.type.name == 'agricultural' || cell.type.name == 'industrial' || cell.type.name == 'residential') && visited.indexOf(cell) == -1){
		cell.curPopulation -= cell.usageDecreaseWithDeficit;
		if(cell.curPopulation <= 0){
			cell.curPopulation = 0;
			disappearFromFlow(cell);
		}
	}
	
	cell.inFlowCircuit = true;
	visited.push(cell);	
	
	var cellNeighbors = cell.getNeighbors();
	
	var neighborsToVisit = [];
	
	// console.log("Cell at x: " + cell.x + ", y: " + cell.y + " of type: " + cell.type.name);
	
	// Grab all neighbors excluding empty.
	for(var n = 0; n < 4; n++){
		if(cellNeighbors[n] && visited.indexOf(cellNeighbors[n]) == -1 && cellNeighbors[n].type.name != 'empty'){
			neighborsToVisit.push(cellNeighbors[n]);
		}
	}
		
	for(var n = 0; n < neighborsToVisit.length; n++){
		var tempNeighbor = neighborsToVisit[n];
		
		var tempX = tempNeighbor.x;
		var tempY = tempNeighbor.y;
		
		var tempLake = worldLakes[tempX][tempY];
		
		if(tempLake.lake.name == "lake"){
			circuitTermination();
		} else {
			circuitCheck(tempNeighbor);
		}
	}
}

function circuitTermination(){
	circuitComplete = true;
	// console.log("Circuit is complete: " + circuitComplete);
}

function landTermination(cell){
	if(cell && cell.type.name != "empty"){
		// console.log(cell.type.name);
		circuitCheckStart(cell);
	}
}
// Water flow functions


// Time functions
// Run a simulation tick.
function tick() {
	// population = 0;
	if(!isPaused){
		probe();
		checkConditions();
	} else {
		console.log("The game is paused.");
	}
}
// Time functions

//Painting methods
//Paint the connections between elements

function paintConnections(cell) {
	context.strokeStyle = "#00F";
	context.fillStyle = "#0FF";
	context.lineWidth = 4;

	var x1 = worldWidth / 2 - cellImgWidth / 2 + cell.x * cellWidth * .5 - cell.y * cellWidth * .5 + cellWidth / 2;
	var y1 = worldHeight - cellImgHeight - cell.y * cellHeight * .5 - cell.x * cellHeight * .5 + cellImgHeight - cellHeight / 2;

	for (var childID in cell.children) {
		var child = cell.children[childID];
		var x2 = worldWidth / 2 - cellImgWidth / 2 + child.x * cellWidth * .5 - child.y * cellWidth * .5 + cellWidth / 2;
		var y2 = worldHeight - cellImgHeight - child.y * cellHeight * .5 - child.x * cellHeight * .5 + cellImgHeight - cellHeight / 2;
		var dx = x2 - x1;
		var dy = y2 - y1;

		x2 = x1 + dx * .9;
		y2 = y1 + dy * .9;
		dx = x2 - x1;
		dy = y2 - y1;

		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.lineTo(x2 - dx * .15 + dy * .15, y2 - dy * .15 - dx * .15);
		context.moveTo(x2, y2);
		context.lineTo(x2 - dx * .15 - dy * .15, y2 - dy * .15 + dx * .15);
		context.stroke();
	}

	if (sinks[cell.getHash()] != null) {
		context.beginPath();
		context.arc(x1, y1, 4, 0, Math.PI * 2, false);
		context.fill();
	}
}

function paintcell() {

	context.fillStyle = "#000";
	context.drawImage(imgScenario, 0, 0, 800, 600);

	// Show what cell is selected,
	if (cellXClicked != null) {
		var px = worldWidth / 2 - cellImgWidth / 2 + cellXClicked * cellWidth * .5 - cellYClicked * cellWidth * .5;
		var py = worldHeight - cellImgHeight - cellYClicked * cellHeight * .5 - cellXClicked * cellHeight * .5;

		context.drawImage(imgHighlighter, px, py + cellImgHeight - cellHeight, cellWidth, cellHeight);
	}

	// Show what cell is hovered,
	if (cellXHovered != null) {
		var px = worldWidth / 2 - cellImgWidth / 2 + cellXHovered * cellWidth * .5 - cellYHovered * cellWidth * .5;
		var py = worldHeight - cellImgHeight - cellYHovered * cellHeight * .5 - cellXHovered * cellHeight * .5;

		context.drawImage(imgHighlighter, px, py + cellImgHeight - cellHeight, cellWidth, cellHeight);
	}

	$(conditions).each(function () {
		var condition = $(this);
		var conditionX = condition.attr('x');
		var conditionY = condition.attr('y');

		if (inWorld(conditionX, conditionY)) {
			var px = worldWidth / 2 - cellImgWidth / 2 + conditionX * cellWidth * .5 - conditionY * cellWidth * .5;
			var py = worldHeight - cellImgHeight - conditionY * cellHeight * .5 - conditionX * cellHeight * .5;

			context.drawImage(imgTutorialSquare, px, py + cellImgHeight - cellHeight, cellWidth, cellHeight);
		}
	});

	// Paint tiles.
	for (var y = numCellsY - 1; y >= 0; y--) {
		for (var x = numCellsX - 1; x >= 0; x--) {
			var px = worldWidth / 2 - cellImgWidth / 2 + x * cellWidth * .5 - y * cellWidth * .5;
			var py = worldHeight - cellImgHeight - y * cellHeight * .5 - x * cellHeight * .5;
			world[x][y].paint(px, py, cellImgWidth, cellImgHeight);
		}
	}
	if (showFlow) {
		// Paint connections.
		for (var y = numCellsY - 1; y >= 0; y--) {
			for (var x = numCellsX - 1; x >= 0; x--) {
				paintConnections(world[x][y]);
			}
		}
	}

	//createPopUpSystem(g_relX, g_relY, 7);

	// context.fillStyle="#000";
	// context.fillText("date: " + formatDate(gameDate), 10, 20);
	// context.fillText("money: " + gameMoney, 10, 34);
	// context.fillText("population: " + getPopulation(), 10, 48);

}

function paint() {
	context.fillStyle = "#000";
	context.drawImage(imgScenario, 0, 0, 800, 600);

	// Show what cell is selected,
	if (cellXClicked != null) {
		var px = worldWidth / 2 - cellImgWidth / 2 + cellXClicked * cellWidth * .5 - cellYClicked * cellWidth * .5;
		var py = worldHeight - cellImgHeight - cellYClicked * cellHeight * .5 - cellXClicked * cellHeight * .5;

		// context.drawImage(imgHighlighter, px, py + cellImgHeight - cellHeight, cellWidth, cellHeight)
	}

	// Paint tiles.
	for (var y = numCellsY - 1; y >= 0; y--) {
		for (var x = numCellsX - 1; x >= 0; x--) {
			var px = worldWidth / 2 - cellImgWidth / 2 + x * cellWidth * .5 - y * cellWidth * .5;
			var py = worldHeight - cellImgHeight - y * cellHeight * .5 - x * cellHeight * .5;
			world[x][y].paint(px, py, cellImgWidth, cellImgHeight);
		}
	}

	if (showFlow) {
		// Paint connections.
		for (var y = numCellsY - 1; y >= 0; y--) {
			for (var x = numCellsX - 1; x >= 0; x--) {
				paintConnections(world[x][y]);
			}
		}
	}
}

/*function resetPopUpFlags() {
 isSubPopUpPresent = false;
 isMainPopUpPresent = false;
 record_X = null;
 record_Y = null;
 record_cell = null;
 isMainMenuClicked = false;
 isSubMenuClicked = false;
 isLeafClicked = false;
 click_X = null;
 click_Y = null;
 isToggleMainMenu = false;
 isMainClickedElsewhere = false;
 clickedElement = null;
 isSubLeafClicked = false;
 isBackButtonClicked = false;
 }*/
// End painting functions

// code to be executed before window is finished loading
function linkup() {

}

// Functions for handling end of scenario
function ScenarioCompleted() {

	function FinishButton() {
		this.initialize = function () {
			btn = document.getElementById('finishButton');
			btn.style.display = "block";

			btn.style.fontFamily = "Arctik";
			btn.innerHTML = "Continue";
			this.redraw();

			btn.addEventListener('click', ContinueCareer);
		}

		this.redraw = function () {
			var rect = document.getElementById("world").getBoundingClientRect();

			var newLeft = rect.left + (rect.width * (2 / 5));
			var newTop = rect.top + (rect.height * (7 / 8));

			btn.style.left = newLeft + "px";
			btn.style.top = newTop + "px";
		}

		this.exit = function () {
			var chksrvy = checkSurvey(window.location.href);
			console.log("href="+chksrvy);
			if(chksrvy != -1){
				$("#btnNextQues").trigger("click");
			}

			btn.style.display = "none";
			finishButton = null;
		}
	}

	finishButton = new FinishButton();
	finishButton.initialize();
}

function FinishScenario() {
	// alert(isMuted);
	if (isMuted) {
		window.location = "career.php";
	} else {
		window.location = "career.php?0";
	}
}

function ContinueCareer() {
	finishButton.exit();

	function FinishAlert() {
		this.initialize = function (dialog) {

			dialogOverlay = document.getElementById('dialogOverlay');
			winBox = document.getElementById('winBox');

			dialogOverlay.style.display = "block";
			winBox.style.display = "block";

			document.getElementById('winBoxBody').innerHTML = dialog;
			document.getElementById('winBoxBody').style.fontFamily = "Arctik";

			icon.style.display = "none";
			helpIcon = null;
			audioControl.hide();
			trashIcon.style.display = "none";
			homeIcon.style.display = "none";
			moneyIcon.style.display = "none";
			populationIcon.style.display = "none";

			this.redraw();

			if (!isMuted) {
				audioControl.win();
			}
		}

		this.redraw = function () {
			var imageWidth = document.getElementById("winBoxImage").width;
			var imageHeight = document.getElementById("winBoxImage").height;

			var rect = document.getElementById("world").getBoundingClientRect();

			var newLeft = rect.left + rect.width / 2 - (imageWidth / 2);
			var newTop = rect.top + rect.height / 2 - (imageHeight / 2);

			winBox.style.left = newLeft + "px";
			winBox.style.top = newTop + "px";
		}

		// this.exit = function(){
		// FinishScenario();
		// }
	}

	finishAlert = new FinishAlert();
	finishAlert.initialize("Congratulations!");
}
// Functions for handling end of scenario

// Level Initialization Functions
// Grab level XML
function readLevel() {
	var xml = "<board>\n";

	for (var x = 0; x < numCellsX; x++) {
		for (var y = 0; y < numCellsY; y++) {
			var cell = world[x][y];
			if (cell.type.name != "empty") {
				xml += cell.type.toXML();
			}
		}
	}
	return xml + "</board>";
}

// Initiate level loading
function loadLevelAJAX(level) {
	$.ajax({
		url: "resources/levels/" + level,
		context: document.body,
		dataType: "xml",
		async: false,
	}).done(function (xml) {
		loadLevel(xml);
	});
}

// Initialize level
function loadLevel(xml) {
	pageXML = xml;
	// sources = Object();
	// sinks = Object();

	// Normalize board to initial state.
	for (var x = 0; x < numCellsX; x++) {
		world[x] = new Array(numCellsY);
		for (var y = 0; y < numCellsY; y++) {
			world[x][y] = new WorldCell(x, y);
		}
		worldLakes[x] = new Array(numCellsY);
		for (var y = 0; y < numCellsY; y++) {
			worldLakes[x][y] = new LakeCell(x, y);
		}
	}

	// Load board.
	var board = $(xml).find("board");
	var imgSrc = $(board).find("img").attr('src');
	imgScenario = new Image();
	imgScenario.src = imgSrc;

	if (imgSrc.match("world_happy.png")) {
		isHappyWorld = true;
		imgAquifer.src = 'resources/imgs/Groundwater/happy.png';
	} else if (imgSrc.match("world_ocean.png")) {
		isOceanWorld = true;
		imgAquifer.src = 'resources/imgs/Groundwater/ocean.png';
	} else if (imgSrc.match("world_wet.png")) {
		isWetWorld = true;
		imgAquifer.src = 'resources/imgs/Groundwater/wet.png';
	} else if (imgSrc.match("world_ind.png")) {
		isIndustryWorld = true;
		imgAquifer.src = 'resources/imgs/Groundwater/industrial.png';
	} else if (imgSrc.match("world_agri.png")) {
		isAgricultureWorld = true;
		imgAquifer.src = 'resources/imgs/Groundwater/agricultural.png';
	} else if (imgSrc.match("world_arid")) {
		isAridWorld = true;
		imgAquifer.src = 'resources/imgs/Groundwater/arid.png';
	}
	
	scenarioAquifer = new WorldAquifer();
	scenarioAquifer.setAquifer(new Aquifer(scenarioAquifer));
	
	imgScenario.addEventListener('load', function () {

		function resetPopUpFlags() {
			isSubPopUpPresent = false;
			isMainPopUpPresent = false;

			record_X = null;
			record_Y = null;
			record_cell = null;

			isMainMenuClicked = false;
			isSubMenuClicked = false;
			isLeafClicked = false;

			click_X = null;
			click_Y = null;

			isToggleMainMenu = false;
			isMainClickedElsewhere = false;

			clickedElement = null;
			isSubLeafClicked = false;
			isBackButtonClicked = false;
		}

		$(board).find("cell").each(function () {
			var cell = $(this);
			var x = cell.attr('x');
			var y = cell.attr('y');
			var type = cell.attr('type');
			var buildable = cell.attr('buildable');

			switch (type) {
				case "pipe": world[x][y].setType(new Pipe(world[x][y])); break;
				case "source": world[x][y].setType(new Source(world[x][y])); break;
				case "lake": worldLakes[x][y].setLake(new Lake(worldLakes[x][y])); break;
				case "lakeSource": worldLakes[x][y].setLake(new LakeSource(worldLakes[x][y]));break;
				case "industrial": world[x][y].setType(new Industrial(world[x][y])); break;
				case "agricultural": world[x][y].setType(new Agricultural(world[x][y])); break;
				case "residential": world[x][y].setType(new Residential(world[x][y])); break;
				case "dwtreatment": world[x][y].setType(new Treatment(world[x][y])); break;
				case "wwtreatment": world[x][y].setType(new WWTreatment(world[x][y])); break;
				case "watertower": world[x][y].setType(new Watertower(world[x][y])); break;
				case "aquifer": world[x][y].setType(new Aquifer(world[x][y])); break;
				default: break;
			}

			if (buildable == "false") {
				world[x][y].buildable = false;
			} else {
				world[x][y].buildable = true;
			}

		});

		conditions = $(pageXML).find("conditions").find("condition");

		$(conditions).each(function () {
			var condition = $(this);
			var conditionX = condition.attr('x');
			var conditionY = condition.attr('y');

			if (inWorld(conditionX, conditionY)) {
				var px = worldWidth / 2 - cellImgWidth / 2 + conditionX * cellWidth * .5 - conditionY * cellWidth * .5;
				var py = worldHeight - cellImgHeight - conditionY * cellHeight * .5 - conditionX * cellHeight * .5;

				context.drawImage(imgTutorialSquare, px, py + cellImgHeight - cellHeight, cellWidth, cellHeight);
			}
		});

		// Create the new connections.
		// probe();
		paint();

		document.getElementById("finishButton").style.display = "none";

		function startAudio() {
			function AudioControl() {
				this.initialize = function () {
					control = document.getElementById("audioControl");
					audioOn = document.getElementById("audioOn");
					audioOff = document.getElementById("audioOff");

					levelTheme = new Audio('resources/sounds/agricultural.mp3');

					// if (isHappyWorld) {
					// levelTheme = new Audio('resources/sounds/happy.mp3');
					// } else if (isAgricultureWorld) {
					// levelTheme = new Audio('resources/sounds/agricultural.mp3');
					// } else if (isAridWorld) {
					// levelTheme = new Audio('resources/sounds/arid.mp3');
					// } else if (isIndustryWorld) {
					// levelTheme = new Audio('resources/sounds/industry.mp3');
					// } else if (isOceanWorld) {
					// levelTheme = new Audio('resources/sounds/ocean.mp3');
					// } else if (isWetWorld) {
					// levelTheme = new Audio('resources/sounds/wet.mp3');
					// } else {
					// Default to this
					levelTheme = new Audio('resources/sounds/agricultural.mp3');
					// }

					levelTheme.loop = true;
					levelTheme.volume = .5;

					this.redraw();
					// this.on();

					var pageURL = location.href;
					var themeTime;

					var firstParam = pageURL.slice(pageURL.indexOf("&") + 1);

					if (firstParam.indexOf("&") == -1) {
						if (!isNaN(firstParam)) {
							this.on();
						} else {
							audioControl.muted = true;
							isMuted = true;
							this.off();
						}
					} else {
						var secondAmpersand = firstParam.slice(pageURL.indexOf("&"));
						firstParam = firstParam.slice(pageURL.indexOf(secondAmpersand));
						
						if (!isNaN(firstParam)) {
							this.on();
						} else {
							audioControl.muted = true;
							isMuted = true;
							this.off();
						}
					}

					function ToggleAudio() {
						if (isMuted) {
							audioControl.on();
						} else {
							audioControl.off();
						}
					}

					audioOn.addEventListener('click', ToggleAudio);
					audioOff.addEventListener('click', ToggleAudio);
				}

				this.redraw = function () {
					var rect = canvas.getBoundingClientRect();

					var newLeft = rect.left + (rect.width * (1 / 10));
					var newTop = rect.top + (rect.height * (9 / 10));

					control.style.left = newLeft + "px";
					control.style.top = newTop + "px";
				}

				this.on = function () {
					levelTheme.play();
					isMuted = false;
					audioOn.style.display = "block";
					audioOff.style.display = "none";

					setCookie("music", "on", 365);
				}

				this.off = function () {
					levelTheme.pause();
					isMuted = true;
					audioOn.style.display = "none";
					audioOff.style.display = "block";

					setCookie("music", "off", 365);
				}

				this.hide = function () {
					audioOn.style.display = "none";
					audioOff.style.display = "none";
				}

				this.win = function () {

					levelTheme.pause();

					var winTheme = new Audio('resources/sounds/win.mp3');
					winTheme.loop = false;
					winTheme.volume = .5;

					winTheme.play();
				}

				this.lose = function () {

				}
			}

			audioControl = new AudioControl();
			audioControl.initialize();
		}

		startAudio();

		function startTrash() {
			function TrashButton() {
				this.initialize = function () {
					trashIcon = document.getElementById("trashIcon");

					trashIcon.style.display = "block";

					this.redraw();

					trashIcon.addEventListener('click', TrashObject);
				}

				this.redraw = function () {
					var rect = canvas.getBoundingClientRect();

					var newLeft = rect.left + (rect.width * (30 / 40));
					var newTop = rect.top + (rect.height * (1 / 10));

					trashIcon.style.left = newLeft + "px";
					trashIcon.style.top = newTop + "px";
				}

				function TrashObject() {
					//alert(cellXClicked);
					if (cellXClicked != null) {
						// if(world[cellXClicked][cellYClicked].type.name != "empty"){
						// alert(this);
						world[cellXClicked][cellYClicked].emptyType(new Empty(world[cellXClicked][cellYClicked]));
						paintcell();
						popupIsOpen = false;
						cellXClicked = null;
						cellYClicked = null;
						cellXHovered = null;
						cellYHovered = null;
						// alert(world[cellXClicked][cellYClicked].type.name);
						// }


						resetPopUpFlags();
						//isMainPopUpPresent = true;
						//createPopUpSystem(record_X, record_Y, 7, "na"); // for main menu
						paint();
						//$("imghSquare").hide();
					}
				}
			}

			trashButton = new TrashButton();
			trashButton.initialize();
		}

		startTrash();

		function startHome() {
			function HomeButton() {
				this.initialize = function () {
					homeIcon = document.getElementById("homeIcon");

					homeIcon.style.display = "block";

					this.redraw();

					homeIcon.addEventListener('click', ReturnHome);
				}

				this.redraw = function () {
					var rect = canvas.getBoundingClientRect();

					var newLeft = rect.left + (rect.width * (1 / 40));
					var newTop = rect.top + (rect.height * (9 / 10));

					homeIcon.style.left = newLeft + "px";
					homeIcon.style.top = newTop + "px";
				}

				function ReturnHome() {
					if (isMuted) {
						window.location = "index.html";
					} else {
						window.location = "index.html?0";
					}

				}
			}

			homeButton = new HomeButton();
			homeButton.initialize();
		}

		startHome();

		function startPlayerInformation(){
			function PlayerInformation(){ // Money, Population, etc...
				this.initialize = function () {
					populationIcon = document.getElementById("populationIcon");
					moneyIcon = document.getElementById("moneyIcon");

					populationText = document.getElementById("populationText");
					moneyText = document.getElementById("moneyText");

					populationIcon.style.display = "block";
					moneyIcon.style.display = "block";

					populationText.style.display = "block";
					moneyText.style.display = "block";	
					
					var loopX;
					var loopY;
					
					var populationAccumulator = 0;
					
					for(loopX = 0; loopX < numCellsX; loopX++){
						for(loopY = 0; loopY < numCellsY; loopY++){
							var temp = world[loopX][loopY];
							
							if(temp.type.name == 'agricultural' || temp.type.name == 'industrial' || temp.type.name == 'residential'){
								
								populationAccumulator += temp.curPopulation;
								// console.log("populationAccumulator is " + populationAccumulator);
							}
						}
					}
					
					population = populationAccumulator;
					
					populationText.innerHTML = population;
					moneyText.innerHTML = gameMoney;

					this.redraw();
				}

				this.redraw = function () {
					var rect = document.getElementById("world").getBoundingClientRect();

					// Adjust Icons
					var newLeft = rect.left + (rect.width * (32 / 40));
					var newTop = rect.top + (rect.height * (1 / 40));

					moneyIcon.style.left = newLeft + "px";
					moneyIcon.style.top = newTop + "px";

					newLeft = rect.left + (rect.width * (64 / 80));
					newTop = rect.top + (rect.height * (5 / 40));

					populationIcon.style.left = newLeft + "px";
					populationIcon.style.top = newTop + "px";

					// Adjust Icon text
					newLeft = rect.left + (rect.width * (35 / 40));
					newTop = rect.top + (rect.height * (3 / 80));

					moneyText.style.left = newLeft + "px";
					moneyText.style.top = newTop + "px";

					newLeft = rect.left + (rect.width * (35 / 40));
					newTop = rect.top + (rect.height * (12 / 80));

					populationText.style.left = newLeft + "px";
					populationText.style.top = newTop + "px";
				}
			}

			playerInformation = new PlayerInformation();
			playerInformation.initialize();
		}

		startPlayerInformation();

		function CustomAlert() {
			this.initialize = function (dialog) {

				dialogOverlay = document.getElementById('dialogOverlay');
				dialogBox = document.getElementById('dialogBox');

				dialogOverlay.style.display = "block";
				dialogBox.style.display = "block";

				document.getElementById('dialogBoxBody').innerHTML = dialog;
				document.getElementById('dialogBoxBody').style.fontFamily = "Arctik";

				this.redraw();
				
				gamePause();
			}

			this.redraw = function () {
				var imageWidth = document.getElementById("dialogBoxImage").width;
				var imageHeight = document.getElementById("dialogBoxImage").height;

				var rect = document.getElementById("world").getBoundingClientRect();

				var newLeft = rect.left + rect.width / 2 - (imageWidth / 2);
				var newTop = rect.top + rect.height / 2 - (imageHeight / 2);

				dialogBox.style.left = newLeft + "px";
				dialogBox.style.top = newTop + "px";
			}

			this.exit = function () {
				dialogBox.style.display = "none";
				dialogOverlay.style.display = "none";
				if (isMuted) {
					audioControl.off();
				} else {
					audioControl.on();
				}
				customDialog = null;
				trashIcon.style.display = "block";
				homeIcon.style.display = "block";
				
				gameUnpause();
			}
		}

		function HelpIcon() {
			this.initialize = function () {
				icon = document.getElementById('helpIcon');
				icon.style.display = "block";

				var rect = canvas.getBoundingClientRect();

				var newLeft = rect.left + (rect.width * (1 / 40));
				var newTop = rect.top - (rect.height * (1 / 40));

				//icon.style.left =  newLeft + "px";
				//icon.style.top = newTop + "px";

				var helpClicked = function () {
					customDialog = new CustomAlert();

					var helpDialog;

					switch (levelToLoad) {
						case "scenario1.xml":
							helpDialog = "Click on the field " + "<br />" + "to place buildings.";
							break;
						case "scenario2.xml":
							helpDialog = "Lay piping to bring " + "<br />" + "water to each residential " + "<br />" + "area.";
							break;
						case "scenario3.xml":
							helpDialog = "There are two types of  " + "<br />" + "treatment plants. " + "<br />" + "Place one to process " + "<br />" + "drinking water.";
							break;
						default: // Sandbox
							helpDialog = "Here you can try " + "<br />" + "things out";
							break;
					}

					customDialog.initialize(helpDialog);
					audioControl.hide();
					trashIcon.style.display = "none";
					icon.style.display = "none";
					homeIcon.style.display = "none";
					helpIcon = null;

				}

				icon.addEventListener('click', helpClicked);


			}

			this.redraw = function () {
				var rect = canvas.getBoundingClientRect();

				var newLeft = rect.left + (rect.width * (1 / 40));
				var newTop = rect.top + (rect.height * (1 / 40));

				icon.style.left = newLeft + "px";
				icon.style.top = newTop + "px";
			}
		}

		customDialog = new CustomAlert();
		var introDialog;

		switch (levelToLoad) {
			case "scenario1.xml":
				introDialog = "Let's start simple. " + "<br />" + "Connect the pipes \n so " + "<br />" + "the water can flow";
				break;
			case "scenario2.xml":
				introDialog = "Try adding a drinking water" + "<br />" + "treatment facility.";
				break;
			case "scenario3.xml":
				introDialog = "Try adding a wastewater water" + "<br />" + "treatment facility.";
				break;
			case "scenario4.xml":
				introDialog = "The next step is " + "<br />" + "connecting a neighborhood.";
				break;
			default: // Sandbox
				introDialog = "Here you can " + "<br />" + "try things out";
				break;
		}

		customDialog.initialize(introDialog);

		$("#dialogBoxButton").click(function () {
			startTour();
			customDialog.exit();
			helpIcon = new HelpIcon();
			helpIcon.initialize();
			helpIcon.redraw();
//            startTour();
		});

		audioControl.hide();
		trashIcon.style.display = "none";

		if (homeButton != null) {
			homeIcon.style.display = "none";
		}

		if (helpIcon != null) {
			icon.style.display = "none";
		}
	});
}
// Level Initialization Functions

function adjustOverlays(){
	var dvui = document.getElementById("UI");
	var canvasW = document.getElementById("world");

	/*var cLeft = canvasW.style.marginLeft;
	 var cBottom = parseInt(canvasW.style.bottom, 10);
	 dvui.style.left = (cLeft + 15) + "px";
	 dvui.style.bottom = (cBottom - 15) + "px"; */

	var rect = canvasW.getBoundingClientRect();
	var newLeft = rect.left + (rect.width * (1 / 30));
	var newTop = rect.top + (rect.height * (0.82));
	dvui.style.left = newLeft + "px";
	dvui.style.top = newTop + "px";

	var dvRBow = document.getElementById("dvAnimRnbw");

	newLeft = rect.right - (rect.width * (0.12));
	newTop = rect.top + (rect.height * (0.01));

	dvRBow.style.left = newLeft + "px";
	dvRBow.style.top = newTop + "px";
}

function highlightreposition(X, Y){

//Center the menu around the nearest cell clicked upon
    radius = 60;
    $hlight = $("#imghSquare");
    var rect = document.getElementById("world").getBoundingClientRect();
    var newLeft = rect.left + (rect.width * (1 / 40));
    var newTop = rect.top + (rect.height * (1 / 40));

    px = X , py= Y ;
    var cellY = ((px - worldWidth / 2 + cellImgWidth / 2) * (-cellHeight * .5) - (py - worldHeight + cellImgHeight) * cellWidth * .5) / (cellHeight * .5 * cellWidth * .5 - cellWidth * .5 * -cellHeight * .5);
    var cellX = (py - worldHeight + cellImgHeight + cellY * cellHeight * .5) / (-cellHeight * .5);
    cellX = Math.floor(cellX) + 1;
    cellY = Math.floor(cellY) + 2;
    //cellXY = [cellX, cellY];
    posX = worldWidth / 2 - cellImgWidth / 2 + cellX * cellWidth * .5 - cellY * cellWidth * .5;
    posY = worldHeight - cellImgHeight - cellY * cellHeight * .5 - cellX * cellHeight * .5;

    var rc = [posX, posY];
    //var toCellHover = toCell(rc[0], rc[1]);
    //if(toCellHover[0]<13 && toCellHover[1]<7){
    //if(cellX >= 0 && cellX < numCellsX && cellY >= 0 && cellY < numCellsY)//{
    //if(inWorld(toCellHover[0],toCellHover[1]))

    $hlight.show();
    $hlight.css({ 'top': rc[1]+6, 'left': rc[0]-2, 'z-index': 1 });

    $spnTooltip = $("#spnToolTip");
    $spnTooltip.css({ 'top': rc[1] + 10, 'left': rc[0]+newLeft , 'z-index': 1 });
}

//window event
$(window).resize(function (e) {

	if (customDialog != null) {
		customDialog.redraw();
	}

	if (helpIcon != null) {
		helpIcon.redraw();
	}

	if (finishButton != null) {
		finishButton.redraw();
	}

	if(playerInformation != null){
		playerInformation.redraw();
	}

	audioControl.redraw();
	trashButton.redraw();
	homeButton.redraw();

    adjustOverlays();
    //rainBowButton.redraw();
    highlightreposition(e.pageX, e.pageY);
});

//Program begins
$(window).load(function () {
    // Animation
    var bkgdXPosRb = 99;
    var bkgdXPosBrd = 0;
    var isAnimRbOk = false;
    var isAnimBrdOk = false;
    var $rainbow = $('#dvAnimRnbw');
    var $birds = $('#dvAnimBrd');
    var rbBkWidth = 99;
    var brdBkWidth = 9;
    var frmRate = 160;


    function resetPopUpFlags() {
        isSubPopUpPresent = false;
        isMainPopUpPresent = false;

        record_X = null;
        record_Y = null;
        record_cell = null;

        isMainMenuClicked = false;
        isSubMenuClicked = false;
        isLeafClicked = false;

        click_X = null;
        click_Y = null;

        isToggleMainMenu = false;
        isMainClickedElsewhere = false;

        clickedElement = null;
        isSubLeafClicked = false;
        isBackButtonClicked = false;
    }

    //$rainbow.show();
    function animRb() {
        if (isAnimRbOk) {
            $rainbow.css({'background-position-x': bkgdXPosRb + 'px'});
        }
        bkgdXPosRb -= rbBkWidth;
        if(bkgdXPosRb <= -1484){
            bkgdXPosRb = 0;
        }
        if(bkgdXPosRb > -99){
            bkgdXPosRb = -99;
        }
        setTimeout(animRb, frmRate);
    }

    function animBrd(){
        if (isAnimBrdOk) {
            $birds.css({'background-position-x': bkgdXPosBrd + 'px'});
        }
        bkgdXPosBrd -= brdBkWidth;
        if(bkgdXPosBrd <= -22400){
            bkgdXPosBrd = 0;
        }
        if(bkgdXPosBrd < 0){
            bkgdXPosBrd = 0;
        }
        setTimeout(animBrd, frmRate);
    }

	/*$rainbow.hover(function() {
		isAnimRbOk = true;
	}, function() {
		isAnimRbOk = false;
	});
	$birds.hover(function() {
		isAnimBrdOk = true;
	}, function() {
		isAnimBrdOk = false;
	});*/

	//animBrd();
	//Animation

	$("#dvLoading").fadeOut("slow");

	//

	adjustOverlays();

	//
	isSubPopUpPresent = false;
	isMainPopUpPresent = false;
	// Link up.
	canvas = document.getElementById('world');
	context = canvas.getContext('2d');
	context.imageSmoothingEnabled = false;
	Chart.defaults.global.animation = false;

	// Initialize world.
	var pageURL = location.href;
	
	// console.log(pageURL);
	
	if (pageURL.indexOf("?") == -1) {
		levelToLoad = "level1.xml";
	} else if(pageURL.indexOf("&") != -1){
		console.log(levelToLoad);
		var newLevel = pageURL.slice(pageURL.indexOf("?") + 1, pageURL.indexOf("&"));;
		levelToLoad = newLevel;
	} else {
		console.log(levelToLoad);
		var newLevel = pageURL.slice(pageURL.indexOf("?") + 1);;
		levelToLoad = newLevel;
	}

	loadLevelAJAX(levelToLoad);

// used in worldcell.js - not to be deleted
	$("#careerMode").click(function () {
		showQualities = $(this).is(':checked');
		paint();
	});
	$("#sandboxMode").click(function () {
		showQualities = $(this).is(':checked');
		paint();
	});


	var record_cell = null;

	var isMainMenuClicked = false;
	var isSubMenuClicked = false;
	var isLeafClicked = false;

	var click_X = null;
	var click_Y = null;

	var isToggleMainMenu = false;
	var isMainClickedElsewhere = false;


    var clickedElement = null;
    var isSubLeafClicked = false;
    var isBackButtonClicked = false;
    var imgData = null;
    var gHoveredCell = null;
    var $hlight = $('#imghSquare');
    var isOKToCreateMenu = false;
    //new popup mgmt variables end

    var tempclickedcx = 0, tempclickedcy = 0;

    function CreatePopupsCommon() {
        context.fillStyle = "#000";
        context.drawImage(imgScenario, 0, 0, 800, 600);
        elements = [];

        // Show what cell is selected,
        if (cellXClicked != null) {
            var px = worldWidth / 2 - cellImgWidth / 2 + cellXClicked * cellWidth * .5 - cellYClicked * cellWidth * .5;
            var py = worldHeight - cellImgHeight - cellYClicked * cellHeight * .5 - cellXClicked * cellHeight * .5;

            //context.drawImage(imgHighlighter, px, py + cellImgHeight - cellHeight, cellWidth, cellHeight);
        }

        // Show what cell is hovered,
        if (cellXHovered != null && popupIsOpen == false) {
            var px = worldWidth / 2 - cellImgWidth / 2 + cellXHovered * cellWidth * .5 - cellYHovered * cellWidth * .5;
            var py = worldHeight - cellImgHeight - cellYHovered * cellHeight * .5 - cellXHovered * cellHeight * .5;

            //context.drawImage(imgHighlighter, px, py + cellImgHeight - cellHeight, cellWidth, cellHeight);
        }

        $(conditions).each(function () {
            var condition = $(this);
            var conditionX = condition.attr('x');
            var conditionY = condition.attr('y');
            if (inWorld(conditionX, conditionY)) {
                var px = worldWidth / 2 - cellImgWidth / 2 + conditionX * cellWidth * .5 - conditionY * cellWidth * .5;
                var py = worldHeight - cellImgHeight - conditionY * cellHeight * .5 - conditionX * cellHeight * .5;
                context.drawImage(imgTutorialSquare, px, py + cellImgHeight - cellHeight, cellWidth, cellHeight);
            }
        });

        // Paint tiles.
        for (var y = numCellsY - 1; y >= 0; y--) {
            for (var x = numCellsX - 1; x >= 0; x--) {
                var px = worldWidth / 2 - cellImgWidth / 2 + x * cellWidth * .5 - y * cellWidth * .5;
                var py = worldHeight - cellImgHeight - y * cellHeight * .5 - x * cellHeight * .5;
                world[x][y].paint(px, py, cellImgWidth, cellImgHeight);
            }
        }
        if (showFlow) {
            // Paint connections.
            for (var y = numCellsY - 1; y >= 0; y--) {
                for (var x = numCellsX - 1; x >= 0; x--) {
                    paintConnections(world[x][y]);
                }
            }
        }
    }

    function ResetUI() {
        context.fillStyle = "#000";
        context.drawImage(imgScenario, 0, 0, 800, 600);
        elements = [];

        // Show what cell is selected,
        if (cellXClicked != null) {
            var px = worldWidth / 2 - cellImgWidth / 2 + cellXClicked * cellWidth * .5 - cellYClicked * cellWidth * .5;
            var py = worldHeight - cellImgHeight - cellYClicked * cellHeight * .5 - cellXClicked * cellHeight * .5;

            //context.drawImage(imgHighlighter, px, py + cellImgHeight - cellHeight, cellWidth, cellHeight);
        }

        // Show what cell is hovered,
        if (cellXHovered != null && popupIsOpen == false) {
            var px = worldWidth / 2 - cellImgWidth / 2 + cellXHovered * cellWidth * .5 - cellYHovered * cellWidth * .5;
            var py = worldHeight - cellImgHeight - cellYHovered * cellHeight * .5 - cellXHovered * cellHeight * .5;

            //context.drawImage(imgHighlighter, px, py + cellImgHeight - cellHeight, cellWidth, cellHeight);
        }

        $(conditions).each(function () {
            var condition = $(this);
            var conditionX = condition.attr('x');
            var conditionY = condition.attr('y');
            if (inWorld(conditionX, conditionY)) {
                var px = worldWidth / 2 - cellImgWidth / 2 + conditionX * cellWidth * .5 - conditionY * cellWidth * .5;
                var py = worldHeight - cellImgHeight - conditionY * cellHeight * .5 - conditionX * cellHeight * .5;
                context.drawImage(imgTutorialSquare, px, py + cellImgHeight - cellHeight, cellWidth, cellHeight);
            }
        });

        // Paint tiles.
        for (var y = numCellsY - 1; y >= 0; y--) {
            for (var x = numCellsX - 1; x >= 0; x--) {
                var px = worldWidth / 2 - cellImgWidth / 2 + x * cellWidth * .5 - y * cellWidth * .5;
                var py = worldHeight - cellImgHeight - y * cellHeight * .5 - x * cellHeight * .5;
                world[x][y].paint(px, py, cellImgWidth, cellImgHeight);
            }
        }
        if (showFlow) {
            // Paint connections.
            for (var y = numCellsY - 1; y >= 0; y--) {
                for (var x = numCellsX - 1; x >= 0; x--) {
                    paintConnections(world[x][y]);
                }
            }
        }
        isSubPopUpPresent = false;
        isMainPopUpPresent = false;

        /*record_X = null;
         record_Y = null;
         record_cell = null;

         isMainMenuClicked = false;
         isSubMenuClicked = false;
         isLeafClicked = false;

         click_X = null;
         click_Y = null;

         isToggleMainMenu = false;
         isMainClickedElsewhere = false;

         clickedElement = null;
         isSubLeafClicked = false;
         isBackButtonClicked = false;*/

        console.log("isSubPopUpPresent:" + isSubPopUpPresent+" isMainPopUpPresent:" + isMainPopUpPresent + " record_X:" + record_X + " record_Y:" + record_Y + " record_cell:"+ record_cell);
        console.log(" isMainMenuClicked:" + isMainMenuClicked + " isSubMenuClicked:" + isSubMenuClicked + " isLeafClicked:"+ isLeafClicked);
        console.log(" click_X:"+click_X + " click_Y:" + click_Y + " isToggleMainMenu:" + isToggleMainMenu);
        console.log(" isMainClickedElsewhere:" + isMainClickedElsewhere + " clickedElement:" + clickedElement);
        console.log(" isSubLeafClicked:" + isSubLeafClicked + " isBackButtonClicked:" + isBackButtonClicked);


    }

    //Popup menu methods
    function recenter(in_posX, in_posY, radius) {
        //Center the menu around the nearest cell clicked upon
        cellXY = toCell(in_posX, in_posY);
        posX = worldWidth / 2 - cellImgWidth / 2 + cellXY[0] * cellWidth * .5 - cellXY[1] * cellWidth * .5;
        posY = worldHeight - cellImgHeight - cellXY[1] * cellHeight * .5 - cellXY[0] * cellHeight * .5;

        //Handle borderline conditions in popup placement
        var diff_x = posX - (radius + 60);
        if (diff_x < 0) {
            posX = posX - diff_x;
        }

        var sum_x = (radius + 60 + posX);
        if (sum_x > worldWidth) {
            posX = worldWidth - (radius + 60);
        }

        var sum_y = (radius + 60 + posY);
        if (sum_y > worldHeight) {
            posY = worldHeight - (radius + 60);
        }
        return [posX, posY];
    }

    //returns corresponding popup item's image - popup creation
    function getPopImage(imgNum, pType) {
        var imgPop = "";
        var tempImgNum = 0;

        //offset based on popup menu item
        switch (pType) {
            case "na":
            default: tempImgNum = imgNum;
                break;

            case "is": tempImgNum = imgNum + 51; break;
            case "dw": tempImgNum = imgNum + 61; break;
            case "ww": tempImgNum = imgNum + 31; break;
        }

        //map corresponding image
        switch (tempImgNum) {
            case 0: imgPop = "imgPop0"; break;
            case 1: imgPop = "imgPop1"; break;
            case 2: imgPop = "imgPop2"; break;

            case 3:
            case 31: imgPop = "imgPop3"; break;

            case 4: imgPop = "imgPop4"; break;

            case 5:
            case 51: imgPop = "imgPop5"; break;

            case 6:
            case 61: imgPop = "imgPop6"; break;

            case 32: imgPop = "imgPopww1"; break;
            case 33: imgPop = "imgPopww2"; break;
            case 34: imgPop = "imgPopww3"; break;

            case 52: imgPop = "imgPopis1"; break;
            case 53: imgPop = "imgPopis2"; break;

            case 62: imgPop = "imgPopdw1"; break;
            case 63: imgPop = "imgPopdw2"; break;
            case 64: imgPop = "imgPopdw3"; break;
        }
        return imgPop;
    }

    //returns corresponding image's tooltip
    function getTooltip(imgNum, pType) {
        var retTooltip = "";
        var tempImgNum = 0;

        //offset based on popup menu item
        switch (pType) {
            case "na":
            default: tempImgNum = imgNum;
                break;

            case "is": tempImgNum = imgNum + 51; break;
            case "dw": tempImgNum = imgNum + 61; break;
            case "ww": tempImgNum = imgNum + 31; break;
        }

        //map corresponding name
        switch (tempImgNum) {
            case 0: retTooltip = "Residential"; break;
            case 1: retTooltip = "Agricultural"; break;
            case 2: retTooltip = "Industrial"; break;

            case 3:
            case 31: retTooltip = "Wastewater treatment Plant"; break;
            case 32: retTooltip = "Disinfection"; break;
            case 33: retTooltip = "Filtration"; break;
            case 34: retTooltip = "Coagulation"; break;

            case 4: retTooltip = "Pipe"; break;

            case 5:
            case 51: retTooltip = "Infrastructure"; break;
            case 52: retTooltip = "Source"; break;
            case 53: retTooltip = "Water Tower"; break;

            case 6:
            case 61: retTooltip = "Drinking water treatment Plant"; break;
            case 62: retTooltip = "Primary"; break;
            case 63: retTooltip = "Secondary"; break;
            case 64: retTooltip = "Tertiary"; break;
        }
        return retTooltip;
    }


    function getTooltipDesc(imgNum, pType) {
        var retTooltip = "";
        var tempImgNum = 0;

        //offset based on popup menu item
        switch (pType) {
            case "na":
            default: tempImgNum = imgNum;
                break;

            case "is": tempImgNum = imgNum + 51; break;
            case "dw": tempImgNum = imgNum + 61; break;
            case "ww": tempImgNum = imgNum + 31; break;
        }

        //map corresponding name
        switch (tempImgNum) {
            case 0: retTooltip = "Use this to create Residential site"; break;
            case 1: retTooltip = "Use this to create Agricultural site"; break;
            case 2: retTooltip = "Use this to create Industrial site"; break;

            case 3:
            case 31: retTooltip = "Use this to add a waste water treatment plant. Opens up options to add different types of waste water treatment plants"; break;
            case 32: retTooltip = "Add a waste water treatment plant which purifies by Disinfection"; break;
            case 33: retTooltip = "Add a waste water treatment plant which purifies by Filtration"; break;
            case 34: retTooltip = "Add a waste water treatment plant which purifies by Coagulation"; break;

            case 4: retTooltip = "Add a Pipe"; break;

            case 5:
            case 51: retTooltip = "Use to choose between various Infrastructure elements"; break;
            case 52: retTooltip = "Add a Source of water"; break;
            case 53: retTooltip = "Add a Water Tower"; break;

            case 6:
            case 61: retTooltip = "Use this to add a drinking water treatment plant. Opens up options to add different types of drinking water treatment plants"; break;
            case 62: retTooltip = "Add a Primary drinking water treatment plant"; break;
            case 63: retTooltip = "Add a Secondary drinking water treatment plant"; break;
            case 64: retTooltip = "Add a Tertiary drinking water treatment plant"; break;
        }
        return retTooltip;
    }

    function getNextXY(posX, posY, radius, angle) {
        return [posX + ((radius) * Math.cos(angle)), posY + ((radius) * Math.sin(angle))];
    }

    //creates the popup menu system
    function createPopUpSystem(in_posX, in_posY, NumberOfCircles, pop_type, clickedElement,e) {
        CreatePopupsCommon();
        var angle = 0;  //calculated based on the formula 2*Math.PI/7 + offset for ordering the icons
        var radius = 60;
        var step = 0;
        var recentered = recenter(in_posX, in_posY, radius);
        posX = recentered[0];
        posY = recentered[1];
        if (pop_type == "na") {
            angle = 1.05;
            posX += popupMainWidthHeight/4;
            posY += popupMainWidthHeight/4;
            step = (2 * Math.PI) / NumberOfCircles;
        }
        else {
            posX = clickedElement.cx;
            posY = clickedElement.cy;
            step = Math.PI / NumberOfCircles;
            if(pop_type=="ww") {
                angle = 5.35;
            }
            if(pop_type=="dw") {
                angle = 1.75;
            }
            if(pop_type=="is") {
                angle = 0.75;
            }
        }

        //create items
        var isSubmenuDisplayed = false;

        for (i = 0; i < NumberOfCircles; i++) {
            var inXY = [];

            if (pop_type == "na") {
                inXY = getNextXY(posX, posY, radius, angle);
                tempclickedcx = posX;
                tempclickedcy = posY;
            }
            else {
                if (isSubmenuDisplayed == false) {
                    inXY[0] = posX;
                    inXY[1] = posY;
                    isSubmenuDisplayed = true;
                }
                else {
                    tempclickedcx = clickedElement.cx;
                    tempclickedcy = clickedElement.cy;
                    inXY = getNextXY(clickedElement.cx, clickedElement.cy, radius, angle);
                }
            }

            var x = inXY[0];
            var y = inXY[1];

            angle += step;

            var imagePop = document.getElementById(getPopImage(i, pop_type));
            var imageTooltip = getTooltip(i, pop_type);
            var imageTooltipDesc = getTooltipDesc(i, pop_type);
            context.globalCompositeOperation = 'source-atop';
            var numAssign = 0;
            switch (pop_type) {
                case "na":numAssign = i; defaultelements.push({ cx: x, cy: y, rad: 30, num: i, tooltip: imageTooltip, tooltipdesc: imageTooltipDesc });break;
                case "ww":numAssign = i + 61;break;
                case "dw":numAssign = i + 31;break;
                case "is":numAssign = i + 51;break;
            }
            elements.push({ cx: x, cy: y, rad: 30, num: numAssign, tooltip: imageTooltip, tooltipdesc: imageTooltipDesc});
            if(i == 0 || pop_type == "na"){
                context.drawImage(imagePop, x - 30, y - 40 + cellImgHeight - cellHeight, 52, 52);
            }
            else {
                switch(pop_type) {
                    case "ww":
                        context.drawImage(imagePop, x - 22, y - 32 + cellImgHeight - cellHeight, 40, 40);
                        break;
                    case "dw":
                        context.drawImage(imagePop, x - 26, y - 36 + cellImgHeight - cellHeight, 40, 40);
                        break;
                    case "is":
                        context.drawImage(imagePop, x - 26, y - 36 + cellImgHeight - cellHeight, 40, 40);
                        break;
                }
            }
        }
    }

    function createItem(inputElement, clickedWorldXY) {
        switch (inputElement.num) {
            //items on world
            case 0: world[clickedWorldXY[0]][clickedWorldXY[1]].setType(new Residential(world[clickedWorldXY[0]][clickedWorldXY[1]])); break;//residential
            case 1: world[clickedWorldXY[0]][clickedWorldXY[1]].setType(new Agricultural(world[clickedWorldXY[0]][clickedWorldXY[1]])); break;//agricultural
            case 2: world[clickedWorldXY[0]][clickedWorldXY[1]].setType(new Industrial(world[clickedWorldXY[0]][clickedWorldXY[1]])); break;//industrial
            case 4: world[clickedWorldXY[0]][clickedWorldXY[1]].setType(new Pipe(world[clickedWorldXY[0]][clickedWorldXY[1]])); break;//pipe
            case 62: world[clickedWorldXY[0]][clickedWorldXY[1]].setType(new WWTreatment(world[clickedWorldXY[0]][clickedWorldXY[1]], 1));
                if (world[clickedWorldXY[0]][clickedWorldXY[1]].type.name == "wwtreatment") {
                    world[clickedWorldXY[0]][clickedWorldXY[1]].type.addTreatmentComponent(new Disinfection(world[clickedWorldXY[0]][clickedWorldXY[1]].type));
                } else {
                    alert("This component can only be added to a waste water treatment plant");
                }
                break;

            case 63: world[clickedWorldXY[0]][clickedWorldXY[1]].setType(new WWTreatment(world[clickedWorldXY[0]][clickedWorldXY[1]], 1));
                if (world[clickedWorldXY[0]][clickedWorldXY[1]].type.name == "wwtreatment") {
                    world[clickedWorldXY[0]][clickedWorldXY[1]].type.addTreatmentComponent(new Filtration(world[clickedWorldXY[0]][clickedWorldXY[1]].type));
                } else {
                    alert("This component can only be added to a waste water treatment plant");
                }
                break;

            case 64: world[clickedWorldXY[0]][clickedWorldXY[1]].setType(new WWTreatment(world[clickedWorldXY[0]][clickedWorldXY[1]], 1));
                if (world[clickedWorldXY[0]][clickedWorldXY[1]].type.name == "wwtreatment") {
                    world[clickedWorldXY[0]][clickedWorldXY[1]].type.addTreatmentComponent(new Coagulation(world[clickedWorldXY[0]][clickedWorldXY[1]].type));
                } else {
                    alert("This component can only be added to a waste water treatment plant");
                }
                break;

            case 52: world[clickedWorldXY[0]][clickedWorldXY[1]].setType(new Aquifer(world[clickedWorldXY[0]][clickedWorldXY[1]])); break;
            case 53: world[clickedWorldXY[0]][clickedWorldXY[1]].setType(new Watertower(world[clickedWorldXY[0]][clickedWorldXY[1]])); break;

            case 32: world[clickedWorldXY[0]][clickedWorldXY[1]].setType(new Treatment(world[clickedWorldXY[0]][clickedWorldXY[1]], 1));
                if (world[clickedWorldXY[0]][clickedWorldXY[1]].type.name == "dwtreatment") {
                    world[clickedWorldXY[0]][clickedWorldXY[1]].type.addTreatmentComponent(new WWTP_Primary(world[clickedWorldXY[0]][clickedWorldXY[1]].type));
                } else {
                    alert("This component can only be added to a drinking water treatment plant");
                }
                break;

            case 33: world[clickedWorldXY[0]][clickedWorldXY[1]].setType(new Treatment(world[clickedWorldXY[0]][clickedWorldXY[1]], 1));
                if (world[clickedWorldXY[0]][clickedWorldXY[1]].type.name == "dwtreatment") {
                    world[clickedWorldXY[0]][clickedWorldXY[1]].type.addTreatmentComponent(new WWTP_Secondary(world[clickedWorldXY[0]][clickedWorldXY[1]].type));
                } else {
                    alert("This component can only be added to a drinking water treatment plant");
                }
                break;

            case 34: world[clickedWorldXY[0]][clickedWorldXY[1]].setType(new Treatment(world[clickedWorldXY[0]][clickedWorldXY[1]], 1));
                if (world[clickedWorldXY[0]][clickedWorldXY[1]].type.name == "dwtreatment") {
                    world[clickedWorldXY[0]][clickedWorldXY[1]].type.addTreatmentComponent(new WWTP_Tertiary(world[clickedWorldXY[0]][clickedWorldXY[1]].type));
                } else {
                    alert("This component can only be added to a drinking water treatment plant");
                }
                break;
            default: //popupIsOpen = false;
                break;
        }
        paint();
    }


    //Popup menu methods
    function drawLine(startx1, starty1, endx1, endy1){
        var c = document.getElementById("world");
        var cntxt = c.getContext("2d");
        cntxt.beginPath();
        cntxt.moveTo(startx1,starty1);
        cntxt.lineTo(endx1,endy1);
        cntxt.stroke();
        //cntxt.endPath();
    }

    var timer;
    $(document).mousemove(function (e) {
        // Get pixel location.
        // var parentOffset = $(this).offset();
        var parentOffset = $("#world").offset();
        /*console.log("e.pageX:"+e.pageX+"  e.pageY:"+e.pageY);
         console.log("parentOffset.left"+parentOffset.left+"parentOffset.top"+parentOffset.top);*/
        var relX = e.pageX - parentOffset.left;
        var relY = e.pageY - parentOffset.top;
        var px = relX;
        var py = relY;
        contMMXY[0] = px;
        contMMXY[1] = py;
        var pos = toCell(px, py);
        var cellX = pos[0];
        var cellY = pos[1];

        if (inWorld(cellX, cellY)) {
            var prx = worldWidth / 2 - cellImgWidth / 2 + cellXPreviousHovered * cellWidth * .5 - cellYPreviousHovered * cellWidth * .5;
            var pry = worldHeight - cellImgHeight - cellYPreviousHovered * cellHeight * .5 - cellXPreviousHovered * cellHeight * .5;
            var activeCircle = getActiveCircle(relX, relY);

            var $spanTooltip = $('#spnToolTip');
            var $spanDimensions = $('#spnDimensions');
            if (activeCircle != null) {

                $hlight.hide();
                $("#world").css("cursor","pointer");

                $spanTooltip.show();
                $spanTooltip.css({"top": (activeCircle.cy + 30) + "px", "left": (activeCircle.cx + 300) + "px"});
                $spanTooltip.text(activeCircle.tooltip);
                timer = setTimeout(function(){$spanTooltip.text(activeCircle.tooltipdesc);}, 1500);


                //uncomment to show distance from main reference point to the hovered menu item
                /*$spanDimensions.show();
                $spanDimensions.css({"top": (activeCircle.cy+30)+"px", "left":(activeCircle.cx+400)+"px"});
                var ttt = Math.sqrt((activeCircle.cx-tempclickedcx)*(activeCircle.cx-tempclickedcx) +(activeCircle.cy-tempclickedcy)*(activeCircle.cy-tempclickedcy));
                $spanDimensions.text("Distance from parent's center:" + ttt);*/

                //uncomment to draw line from main reference point to the hovered menu item
                /*drawLine(activeCircle.cx,activeCircle.cy,tempclickedcx,tempclickedcy);*/
            }
            else {
                $("#world").css("cursor","auto");
                //console.log("activeCircle = null");
                clearTimeout(timer);
                $spanTooltip.hide();
                $spanDimensions.hide();
                highlightreposition(e.pageX, e.pageY);
            }
        }

        cellXPreviousHovered = cellXHovered;
        cellYPreviousHovered = cellYHovered;

        if (cellX >= 0 && cellX < numCellsX && cellY >= 0 && cellY < numCellsY) {
            cellXHovered = cellX;
            cellYHovered = cellY;
            //paintcell();
        }
    });

    var isRightClicked = false;
    $(document).mousedown(function (e) {
        //set global variables
        if (e.target.id == "imghSquare" || e.target.id == "world") {
//ResetUI();
            isRightClicked = (e.which == 3);//right button clicked
            var parentOffset = $("#world").offset();
            var tempClick_X = e.pageX - parentOffset.left;
            var tempClick_Y = e.pageY - parentOffset.top;

            var cellXYClicked = toCell(tempClick_X, tempClick_Y);
            cellXClicked = cellXYClicked[0];
            cellYClicked = cellXYClicked[1];
            isOKToCreateMenu = inWorld(cellXClicked, cellYClicked);

            /* Tour handler */
            // second tour - infrastructure icon in main menu
            if(isTourShown("s01t02")==false){
                var s01t02 = getNewTour();
                addTourMarker(s01t02, "tourMainMenu", [e.pageX - 30, e.pageY - 70], "Main Menu", "This is the menu, eventually you will learn what each option is but for now click this pipe button to lay a pipe.");
                s01t02.restart();
                setTourShown("s01t02");
            }
            /* Tour handler */

            //no popups present
            if (isMainPopUpPresent == false && isSubPopUpPresent == false) {
                record_X = tempClick_X;
                record_Y = tempClick_Y;
                record_cell = toCell(record_X, record_Y);
                //isOKToCreateMenu = inWorld(record_cell[0], record_cell[1]);
            }
            //popups present
            else {
                clickedElement = getActiveCircle(tempClick_X, tempClick_Y);
                isMainMenuClicked = false;
                if(clickedElement != null){
                    //main popup present
                    if (isMainPopUpPresent == true) {
                        isMainMenuClicked = true;
                        isClickedElsewhere = false;
                        if (clickedElement.num == "0" || clickedElement.num == "1" || clickedElement.num == "2" || clickedElement.num == "4") {
                            isLeafClicked = true;
                        }
                    }
                    //sub popup present
                    else {
                        //check if the user has clicked the sub menu items
                        isMainPopUpPresent = false;
                        isSubMenuClicked = true;
                        if(clickedElement.num != 61 && clickedElement.num != 51 && clickedElement.num != 31){
                            isSubLeafClicked = true;
                            isBackButtonClicked = false;
                        }
                        else{
                            isSubLeafClicked = false;
                            isBackButtonClicked = true;
                        }
                    }
                }
            }
        }
    });

    $(document).mouseup(function (e) {
        if(isRightClicked){
            var tempPipeElement = {cx: 0, cy: 0, rad: 0, num: 4,tooltip: "Pipe"};
            createItem(tempPipeElement, record_cell);
        }
        else{
            if (e.target.id == "imghSquare" || e.target.id == "world") {

                //main popup present
                if (isOKToCreateMenu) {
                    if (isMainPopUpPresent == true) {//main menu present
                        if (isMainMenuClicked == true) {
                            if (isLeafClicked == true) {
                                createItem(clickedElement, record_cell);//create the corresponding item
                                resetPopUpFlags();
                            }
                            else {
                                //starting point of sub menu creation
                                switch (clickedElement.num) {
                                    case 5: createPopUpSystem(record_X, record_Y, 3, "is",clickedElement,e);
                                        popupCreatedCell = [record_X,record_Y];
                                        break;
                                    case 3: createPopUpSystem(record_X, record_Y, 4, "ww",clickedElement,e);
                                        popupCreatedCell = [record_X,record_Y];
                                        break;
                                    case 6: createPopUpSystem(record_X, record_Y, 4, "dw",clickedElement,e);
                                        popupCreatedCell = [record_X,record_Y];
                                        break;
                                }
                                isMainPopUpPresent = false; isSubPopUpPresent = true;
                            }
                        }
                        else{
                            ResetUI();
                        }
                        popupCell = record_cell;
                    }
                    else {
                        //sub menu present
                        if (isSubPopUpPresent) {
                            if (isBackButtonClicked) {
                                //based on position of mainbutton obtained from mousedown event
                                isMainPopUpPresent = true;
                                isSubPopUpPresent = false;
                                createPopUpSystem(record_X, record_Y, 7, "na", null,e);
                                popupCreatedCell = [record_X,record_Y];
                            }
                            else if (isSubLeafClicked) {
                                //create the item at the cell location obtained from mousedown event
                                createItem(clickedElement, record_cell);
                                resetPopUpFlags();
                            }
                            else {
                                ResetUI();
                            }
                        }//neither menus present and ok to create menu
                        else {
                            if(popupCell==null){
                                createPopUpSystem(record_X, record_Y, 7, "na", null,e); // for main menu
                                popupCreatedCell = [record_X,record_Y];
                                isMainPopUpPresent = true;
                            }
                            else{
                                if(popupCell[0]==record_cell[0]&&popupCell[1]==record_cell[1]){
                                    //refresh without creating popupmenu
                                    //paint();
                                    ResetUI();
                                }
                                else{
                                    createPopUpSystem(record_X, record_Y, 7, "na", null,e); // for main menu
                                    isMainPopUpPresent = true;
                                    popupCreatedCell = [record_X,record_Y];
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    startCookie();
    linkup();

    // Calls the tick function which performs end-step to begin step transition.
    // This occurs at interval
    window.setInterval(tick, turnDuration);
});