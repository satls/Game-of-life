

function Cell(_x, _y, _board){
	var x = _x;
	var y = _y;
	var board = _board;

	var alive = false;
	var dying = false;
	var beingBorn = false;
	var aliveNeighbours = 0;
	
	this.safeToDelete=function(){
		if(aliveNeighbours == 0 && !alive)
			return true;
		else
			return false;
	}

	this.neighbourBorn = function(){
		aliveNeighbours++;
	}

	this.neighbourDie = function(){
		aliveNeighbours--;
	}

	this.evolve = function(){
		if(aliveNeighbours==3 && !alive){
			beingBorn = true;
		}else if (aliveNeighbours !=2 && aliveNeighbours!=3 && alive){
			dying = true;
		}
	}

	this.update = function(_drawToBoard){
		if(beingBorn){
			//birth
			alive = true;
			beingBorn=false;
			dying = false;
			//draw cell birth
			if(_drawToBoard != false)
				board.drawCell(x,y,alive);
			//broadcast to neighbours
			board.broadcastBirth(x,y);
		}
		if(dying){
			//death
			alive = false;
			dying=false;
			beingBorn=false
			//draw cell death
			if(_drawToBoard != false)
				board.drawCell(x,y,alive);
			//broadcast to neighbours
			board.broadcastDeath(x,y);
		}
	}

	this.setAlive = function(){
		alive=false;
		dying=false;
		beingBorn=true;

	}
	
	this.draw = function(){
		board.drawCell(x,y,alive);
	}
}
function GameOfLife(_canvas){
	var canvas = _canvas;
	var ctx = canvas.getContext('2d');
	var cells = {};
	var me = this;
	var scrolledLeft = 0;
	var scrolledDown = 0;
	var _SCROLL_VAL = 60;
	var cellsRedraw = true;

	var gameTimer;
	var started = false;

	this.startTimer =function(){
		if(!started)
			gameTimer = window.setInterval(this.evolve,200);
		started=true;
	}
	this.pauseTimer = function(){
		window.clearInterval(gameTimer);
		started=false;
	}

	this.evolve = function(){
		//evolve cells
		for(var i in cells){
			cells[i].evolve();
		}
		//update cells
		for(var i in cells){
			cells[i].update(cellsRedraw);
			//clean up unused cells
			if(cells[i].safeToDelete())
				delete cells[i];
			if(!cellsRedraw)
				me.drawAllCells();
		}
	}

	function getCell(x, y){
		if(cells[x+','+y]==null)
			addNewCell(x,y);

		return cells[x+','+y];
	}

	function addNewCell(x, y){
		cells[x+','+y]=new Cell(x, y, me);
		
	}

	this.setCellAlive = function(x, y){
		if(getCell(x, y)!=null)
			getCell(x, y).setAlive();
		else{
			addNewCell(x, y);
			getCell(x, y).setAlive();
		}
	}

	this.broadcastBirth = function(x, y){
		for(var i = -1; i <2; i++){
			for(var j = -1; j < 2; j++){
				if(!(i==0 && j==0))
					getCell(x+i, y+j).neighbourBorn();
			}
		}
	}

	this.broadcastDeath = function(x, y){
		for(var i = -1; i <2; i++){
			for(var j = -1; j < 2; j++){
				if(!(i==0 && j==0))
					getCell(x+i, y+j).neighbourDie();
			}
		}
	}

	this.drawCell = function(x,y,alive){
		if(alive){
			ctx.fillStyle = "#000000";
		}
		else{
			ctx.fillStyle = "#FFFFFF";
		}
		//to be replaced with somehting better
		ctx.fillRect(x*10,y*10,10,10);
	}

	this.drawAllCells = function(){
		//this function is used when scrolling or zooming only
		//for normal cell drawing, cells should call the board
		this.clearCanvas();
		for(var i in cells){
			cells[i].draw();
		}
	}

	this.clearCanvas = function(){
		ctx.fillStyle = "#FFFFFF";
		// Store the current transformation matrix
		ctx.save();
		// Use the identity matrix while clearing the canvas
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// Restore the transform
		ctx.restore();
	}

	this.scrollDown = function(){
		this.clearCanvas();
		ctx.translate(0,-1*_SCROLL_VAL);
		this.drawAllCells();
		scrolledDown+=_SCROLL_VAL;
	}

	this.scrollUp = function(){
		this.clearCanvas();
		ctx.translate(0,_SCROLL_VAL);
		this.drawAllCells();
		scrolledDown-=_SCROLL_VAL;
	}

	this.scrollLeft = function(){
		this.clearCanvas();
		ctx.translate(_SCROLL_VAL,0);
		this.drawAllCells();
		scrolledLeft-=_SCROLL_VAL;
	}
	this.scrollRight = function(){
		this.clearCanvas();
		ctx.translate(-1*_SCROLL_VAL,0);
		this.drawAllCells();
		scrolledLeft+=_SCROLL_VAL;
	}

	this.zoomIn = function(){
		this.clearCanvas();
		ctx.translate((canvas.width/2) + scrolledLeft, (canvas.width/2) + scrolledDown);
		ctx.scale(1.1,1.1);
		ctx.translate(-1*(canvas.width/2) - scrolledLeft, -1*(canvas.height/2) - scrolledDown);
		this.drawAllCells();
	}

	this.zoomOut = function(){
		this.clearCanvas();
		ctx.translate((canvas.width/2) + scrolledLeft, (canvas.width/2) + scrolledDown);
		ctx.scale(0.9,0.9);
		ctx.translate(-1*(canvas.width/2) - scrolledLeft, -1*(canvas.height/2) - scrolledDown);
		this.drawAllCells();
	}

	this.resetCamera = function(){
		this.clearCanvas();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.drawAllCells();
	}

	this.toggleFullRedraw = function(){
		cellsRedraw = !cellsRedraw;
	}
}
