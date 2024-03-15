class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.walls = { top: true, right: true, bottom: true, left: true };
        this.visited = false;
    }
}

function addFrontier(cell, grid, frontier) {
    let directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; 
    directions.forEach(([dx, dy]) => {
        let nx = cell.x + dx, ny = cell.y + dy;
        if (nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length && !grid[ny][nx].visited && !frontier.includes(grid[ny][nx])) {
            frontier.push(grid[ny][nx]);
        }
    });
}

function getVisitedNeighbors(cell, grid) {
    let neighbors = [];
    let directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; 
    directions.forEach(([dx, dy]) => {
        let nx = cell.x + dx, ny = cell.y + dy;
        if (nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length && grid[ny][nx].visited) {
            neighbors.push(grid[ny][nx]);
        }
    });
    return neighbors.filter(neighbor => !areCellsConnected(cell, neighbor));
}

function areCellsConnected(cell1, cell2) {
    let dx = cell1.x - cell2.x;
    let dy = cell1.y - cell2.y;
    if (dx === 1) {
        return !cell1.walls.left && !cell2.walls.right;
    } else if (dx === -1) {
        return !cell1.walls.right && !cell2.walls.left;
    } else if (dy === 1) {
        return !cell1.walls.top && !cell2.walls.bottom;
    } else if (dy === -1) {
        return !cell1.walls.bottom && !cell2.walls.top;
    }
    return false;
}

function removeWall(cell1, cell2) {
    let dx = cell1.x - cell2.x;
    let dy = cell1.y - cell2.y;
    if (dx === 1) {
        cell1.walls.left = false;
        cell2.walls.right = false;
    } else if (dx === -1) {
        cell1.walls.right = false;
        cell2.walls.left = false;
    } else if (dy === 1) {
        cell1.walls.top = false;
        cell2.walls.bottom = false;
    } else if (dy === -1) {
        cell1.walls.bottom = false;
        cell2.walls.top = false;
    }
}

function generateMaze(rows, cols) {
    let grid = [];
    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {
            row.push(new Cell(x, y));
        }
        grid.push(row);
    }

    let startCell = grid[Math.floor(Math.random() * rows)][Math.floor(Math.random() * cols)];
    startCell.visited = true;
    let frontier = [];
    addFrontier(startCell, grid, frontier);

    while (frontier.length > 0) {
        let frontierIndex = Math.floor(Math.random() * frontier.length);
        let frontierCell = frontier[frontierIndex];
        let neighbors = getVisitedNeighbors(frontierCell, grid);

        if (neighbors.length > 0) {
            let neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWall(frontierCell, neighbor);
            frontierCell.visited = true;
            addFrontier(frontierCell, grid, frontier);
        }

        frontier.splice(frontierIndex, 1);
    }

    return generateMazeJSON(grid, rows, cols);
}

function generateMazeJSON(grid, rows, cols) {
    let mazeJSON = {
        "rows": rows,
        "cols": cols,
        "start": {"row": 0, "col": 0}, // Fixed start position
        "goal": {"row": rows - 1, "col": cols - 1}, // Fixed goal position
        "maze": []
    };

    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {
            let cell = grid[y][x];
            row.push({
                "row": y,
                "col": x,
                "north": cell.walls.top,
                "east": cell.walls.right,
                "south": cell.walls.bottom,
                "west": cell.walls.left
            });
        }
        mazeJSON.maze.push(row);
    }

    return mazeJSON;
}


document.getElementById('generate').addEventListener('click', function() {
    const rows = parseInt(document.getElementById('rows').value, 10);
    const cols = parseInt(document.getElementById('cols').value, 10);

    const mazeJSON = generateMaze(rows, cols);
    document.getElementById('mazeJSON').value = JSON.stringify(mazeJSON, null, 2);
});


document.getElementById('showMaze').addEventListener('click', function() {
    const mazeJSON = JSON.parse(document.getElementById('mazeJSON').value);
    visualizeMaze(mazeJSON);
});


function visualizeMaze(mazeJSON) {

    const mazeBoard = document.getElementById('maze-board');
    mazeBoard.innerHTML = ''; 
    mazeBoard.style.display = 'grid';
    mazeBoard.style.gridTemplateRows = `repeat(${mazeJSON.rows}, 40px)`; 
    mazeBoard.style.gridTemplateColumns = `repeat(${mazeJSON.cols}, 40px)`; 

    
    const startCellCoords = mazeJSON.start;
    const goalCellCoords = mazeJSON.goal;

    for (let y = 0; y < mazeJSON.rows; y++) {
        for (let x = 0; x < mazeJSON.cols; x++) {
            const cellData = mazeJSON.maze[y][x];
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            
            cellElement.style.borderTop = cellData.north ? '1px solid black' : 'none';
            cellElement.style.borderRight = cellData.east ? '1px solid black' : 'none';
            cellElement.style.borderBottom = cellData.south ? '1px solid black' : 'none';
            cellElement.style.borderLeft = cellData.west ? '1px solid black' : 'none';
            cellElement.style.boxSizing = 'border-box'; 

            // Color the start cell
            if (cellData.row === startCellCoords.row && cellData.col === startCellCoords.col) {
                cellElement.style.backgroundColor = 'cyan'; // Start cell color
            }
            // Color the goal cell
            if (cellData.row === goalCellCoords.row && cellData.col === goalCellCoords.col) {
                cellElement.style.backgroundColor = 'magenta'; // Goal cell color
            }

            mazeBoard.appendChild(cellElement);
        }
    }
}


