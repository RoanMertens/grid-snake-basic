//= require rails-ujs
//= require_tree .

// <<<<<<<<<<<................>>>>>>>>>>
//               controls
// <<<<<<<<<<<................>>>>>>>>>>

// user input
document.onkeydown = checkKey;
function checkKey(e) {
  e = e || window.event;
  if (e.keyCode == '37') {
    // left arrow
    snake_current_direction = 'left';
  } else if (e.keyCode == '39') {
    // right arrow
    snake_current_direction = 'right'
  } else if (e.keyCode == '38') {
    // up arrow
    snake_current_direction = 'up'
  } else if (e.keyCode == '40') {
    // down arrow
    snake_current_direction = 'down'
  }
}

// <<<<<<<<<<<................>>>>>>>>>>
//               functions
// <<<<<<<<<<<................>>>>>>>>>>

// ................
// candy functions
// ................

// expects integer
// returns random number as integer
function getRandomInt(max){
  return Math.floor(Math.random() * Math.floor(max));
}

// expects two array of strings
// returns game field without location where snake is as array of strings
function calcEmptySpaceGrid(game_field_array, snake_body){
  return game_field_array.filter(x => !snake_body.includes(x));
}

function displayCandy(candy_location){
  candy_location.setAttribute('class', 'candy');
}

function createCandy(game_field, snake_body){
  without_snake = calcEmptySpaceGrid(game_field, snake_body)
  random_number = getRandomInt(without_snake.length-1)
  displayCandy(without_snake[random_number]);
}

// ................
// game functions
// ................

// expects integers
// returns delay between each step as integer
function calcDelay(game_difficulty, candies_eaten){
  return 1000/(game_difficulty + (candies_eaten/10))
}

// ................
// grid functions
// ................

// expects hash of integers height and width and string with hash or css as type
// returns the playing field as array of strings
function calculateGrid(game_field_size, type){
  const height = Array.from({length: game_field_size.height}, (x,i) => i);
  const width = Array.from({length: game_field_size.width}, (x,i) => i);

  const game_field = height.map( function(h) {
    let game_row = width.map( function(w) {
      return createBlock(h, w);
    });
    return (type === "array" ? game_row : game_row.join(" "));
  });
  return (type === "array" ? game_field.flat() : game_field);
}

function displayGrid(game_field_array, game_field_css, game_field_size, elem){
  elem.style.gridTemplateRows = `${game_field_size.width}, ${game_field_size.width}fr`;
  elem.style.gridTemplateColumns = `${game_field_size.height}, ${game_field_size.height}fr`;
  elem.style.gridTemplateAreas = ``;

  game_field_css.map( function(row){
    elem.style.gridTemplateAreas += `"${row}"`;
  })

  const blocks = game_field_array.map( function(b){
    let block = document.createElement("div");
    elem.appendChild(block);
    block.setAttribute('id', b);
    block.style.gridArea = b;
    return block
  });
  return blocks
}

// expects integers
// returns one block from the grid as string
function createBlock(height, width){
  return `snake-${height}-${width}`
}

// ................
// snake start functions
// ................

// expects hash of integers height and width
// returns start location of snake as array
function calcSnakeStartLocation(game_field_size){
  const height = Math.round((game_field_size.height-1)/2);
  const width = Math.round((game_field_size.width-1)/2);
  const snake = [createBlock(height, width),
                 createBlock(height, width-1),
                 createBlock(height, width-2)]
  return snake
}

function createSnake(snake_location, game_field){
  const new_snake_body = []
  snake_location.map( function(part){
    game_field.map( function(block){
      if (block.id === part){
        block.setAttribute('class', 'snake');
        new_snake_body.push(block);
      }
    });
  });
  return new_snake_body;
}

// ................
// snake move functions
// ................

function removeSnakeTail(snake_body){
  snake_body[snake_body.length-1].className = '';
  snake_body.pop();
  return snake_body;
}

function growSnake(snake_body){
  snake_body.push(snake_body[snake_body.length-1]);
  return snake_body;
}

function addSnakeHead(snake_body, game_field, snake_head){
  let candies_eaten = 0
  let growing_up = false
  game_field.map( function(block){
    if (block.id === snake_head && block.classList.contains('candy')) {
      block.setAttribute('class', 'candy-snake');
      snake_body.unshift(block);
      createCandy(game_field, snake_body);
      candies_eaten += 1
      snake_body = growSnake(snake_body);
      growing_up = true
    } else if (block.id === snake_head){
      block.setAttribute('class', 'snake');
      snake_body.unshift(block);
    };
  });
  return {snake_body: snake_body, candies_eaten: candies_eaten, growing_up: growing_up};
}

// expects string
//returns opposite direction of snake_current_direction as string
function findOppositeDirectionSnakehead(snake_current_direction){
    let reverse_direction = {up: "down", down: "up", left: "right", right: "left"}
    return reverse_direction[snake_current_direction]
}

// expects array of strings, two strings and a hash of integers
function moveSnake(snake_body, snake_current_direction, game_field_size){ // returns new location snake as array of strings
  snake_body = removeSnakeTail(snake_body);
  const snake_head = calcNewLocationSnakehead(snake_body, snake_current_direction, game_field_size);
  params = addSnakeHead(snake_body, game_field, snake_head);
  return params;
}

// expects array of strings, two strings and a hash of integers
function calcNewLocationSnakehead(snake_body, snake_current_direction, game_field_size){ // returns new location head as string
  // sets the axis and direction of the step
  const axis = snake_current_direction === 'up' || snake_current_direction === 'down' ? 1 : 2;
  let direction = snake_current_direction === 'down' || snake_current_direction === 'right' ? 1 : -1;
  old_head = snake_body[0].id.split("-");

  if (snake_current_direction === 'up' && old_head[1] === "0"){
    old_head[axis] = (parseInt(old_head[axis], 10) + (game_field_size.height - 1)).toString();
  } else if (snake_current_direction === 'down' && old_head[1] === (game_field_size.height-1).toString()){
    old_head[axis] = (parseInt(old_head[axis], 10) - (game_field_size.height - 1)).toString();
  } else if (snake_current_direction === 'left' && old_head[2] === "0"){
    old_head[axis] = (parseInt(old_head[axis], 10) + (game_field_size.height - 1)).toString();
  } else if (snake_current_direction === 'right' && old_head[2] === (game_field_size.width-1).toString()) {
    old_head[axis] = (parseInt(old_head[axis], 10) - (game_field_size.height - 1)).toString();
  } else {
    old_head[axis] = (parseInt(old_head[axis], 10) + direction).toString();
  }
  let new_head = old_head
  new_head = new_head;
  if (snake_body[1].id === new_head.join("-")){
    snake_current_direction = findOppositeDirectionSnakehead(snake_current_direction)
    new_head = calcNewLocationSnakehead(snake_body, snake_current_direction, game_field_size)
    return new_head;
  } else {
    return new_head.join("-");
  }
}

function checkSnakeCollision(snake_body){
  return !(snake_body.length === new Set(snake_body).size);
}

// ................
// game end functions
// ................

function emptyGrid(snake_body){
  snake_body.forEach(function(i) {
    console.log(i);
    setTimeout(function(){
      removeSnakeTail(i);
      snakeStepDelay();
    }, 500);

    // wait three seconds function
    function snakeStepDelay(){
      var ms = 3000 + new Date().getTime();
      while (new Date() < ms){}
    }
  });
}

// <<<<<<<<<<<................>>>>>>>>>>
//           setting variable
// <<<<<<<<<<<................>>>>>>>>>>

// ................
// css info
// ................
const elem = document.getElementById("field");

// ................
// static'ish' game info
// ................
// let game_running = false;
let game_difficulty = 4; //easy1 || medium2 || hard3 || hell4
const game_field_size = { height:10 , width:10 };

// ................
//  dynamic info
// ................
const game_field_css = calculateGrid(game_field_size, "css");
const game_field_array = calculateGrid(game_field_size, "array");
// let snake_body_size = 3 // grows by eating candies
// let snake_distance_moved = 0 //begint op nul (telt een op met elke loop)
let snake_current_direction = 'right'
let candies_eaten = 0 //starts at 0 and adds one as the snake eats candies

// create array active elements
const game_field = displayGrid(game_field_array, game_field_css, game_field_size, elem);

// ................
//  snake info
// ................
const snake_start_location = calcSnakeStartLocation(game_field_size) // (middle field)
// get active elements from array and create snake body
let snake_body = createSnake(snake_start_location, game_field);

createCandy(game_field, snake_body);

const game = setInterval(function() {
  params = moveSnake(snake_body, snake_current_direction, game_field_size);
  snake_body = params.snake_body;
  candies_eaten = candies_eaten + params.candies_eaten;
  let snake_collision = checkSnakeCollision(snake_body);
  if (snake_collision === true && params.growing_up === false) {
    clearInterval(game);
    emptyGrid(snake_body);
  }
}, calcDelay(game_difficulty, candies_eaten));
