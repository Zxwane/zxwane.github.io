console.log("Version 1.1");
console.log("Patches: Fixed lag stutters in Home and Game. Fixed NaN in Calculator.");
console.log("|!| PLEASE REPORT TO DEVELOPER IF YOU ENCOUNTER ANY BUGS OR STRANGE THINGS |!|");

var isLoading = true;
let gameInitialized = false; // Flag to track if the game is initialized
let gameRunning = false; // Flag to track if the game should be running

// Declare game variables in a higher scope
let gridSize, currentGalaxy, resources, credits, playerPosition, blackHolePosition, galaxy, star, starEmojis, resourceValues, gridState, borderColors, selectedMerchant, merchants, storage, warpDrive;

if (isLoading == true) {
    // || GALAXY LOADER.js
    // Alias for requestAnimationFrame
    window.requestAnimFrame = window.requestAnimationFrame;

    // Get the canvas and its 2D context
    var canvas = document.getElementById("space");
    var c = canvas.getContext("2d");

    // Set up the starfield parameters
    var numGalaxies = 500;
    var focalLength = canvas.width * 2;
    var centerX, centerY;
    var galaxies = [];
    var animate = true;
    var zooming = false;
    var warping = false;

    var phrases = [
        "Andromeda Galaxy",
        "Triangulum Galaxy",
        "Whirlpool Galaxy",
        "Sombrero Galaxy",
        "Black Eye Galaxy",
        "Pinwheel Galaxy",
        "Messier 81",
        "Messier 82",
        "Sculptor Galaxy",
        "Cartwheel Galaxy",
        "Large Magellanic Cloud",
        "Small Magellanic Cloud",
        "Centaurus A",
        "NGC 1300",
        "NGC 253",
        "NGC 300",
        "NGC 4038",
        "NGC 4039",
        "NGC 4258",
        "NGC 4414",
        "NGC 4676",
        "NGC 6744",
        "NGC 6946",
        "NGC 7331",
        "NGC 7742",
        "Hoag's Object",
        "Circinus Galaxy",
        "Antennae Galaxies",
        "Sunflower Galaxy",
        "Fireworks Galaxy",
        "Starburst Galaxy",
        "Ring Nebula",
        "Hercules A",
        "IC 1101",
        "Tadpole Galaxy",
        "Cigar Galaxy",
        "Antennae Galaxy",
        "Draco Dwarf",
        "Ursa Minor Dwarf",
        "Sextans Dwarf",
        "Canes Venatici I",
        "Leo I",
        "Leo II",
        "Fornax Dwarf",
        "Carina Dwarf",
        "Phoenix Dwarf",
        "Sculptor Dwarf",
        "Sextans B",
        "Bootes I",
        "Pegasus Dwarf"
    ];

    // Probability (e.g., 0.1 means 10% chance)
    var displayTextProbability = 0.05;

    // Function to generate a random color
    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function getRandomText() {
        if (Math.random() < displayTextProbability) {
            return phrases[Math.floor(Math.random() * phrases.length)];
        }
        else {
            return "NIL";
        }
    }

    // Main animation loop
    function executeFrame() {
        if (animate) {
            window.requestAnimFrame(executeFrame);
        }
        if (zooming) {
            zoomIn();
        }
        moveGalaxies();
        drawGalaxies();
    }

    // Initialize star properties
    function initializeGalaxies() {
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;

        galaxies = [];
        for (var i = 0; i < numGalaxies; i++) {
            var galaxy = {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * canvas.width,
                o: '0.' + Math.floor(Math.random() * 99) + 1,
                color: getRandomColor(), // Assign a random color to each star
                text: getRandomText(),
                textX: 0,
                textY: 0
            };
            galaxies.push(galaxy);
        }
    }

    // Update star positions
    function moveGalaxies() {
        for (var i = 0; i < numGalaxies; i++) {
            var galaxy = galaxies[i];

            if (warping == 0) {
                galaxy.z--;
            }
            else {
                galaxy.z = (galaxy.z * 1.005) - 1;
            }

            // Reset galaxy position if it goes off-screen
            if (galaxy.z <= 0) {
                galaxy.z = canvas.width;
                galaxy.x = Math.random() * canvas.width;
                galaxy.y = Math.random() * canvas.height;
                galaxy.color = getRandomColor();
                galaxy.text = getRandomText();
            }
        }
    }

    // Draw the galaxies on the canvas
    function drawGalaxies() {
        var pixelX, pixelY, pixelRadius;

        // Resize the canvas to fit the screen
        if (canvas.width != window.innerWidth || canvas.height != window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initializeGalaxies();
        }

        if (warping == 0) {
            // Clear the canvas
            c.fillStyle = "rgba(0, 10, 20, 1)";
            c.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw each galaxy
        for (var i = 0; i < numGalaxies; i++) {
            var galaxy = galaxies[i];

            pixelX = (galaxy.x - centerX) * (focalLength / galaxy.z) + centerX;
            pixelY = (galaxy.y - centerY) * (focalLength / galaxy.z) + centerY;

            if (warping == 0) {
                pixelRadius = 1 * (focalLength / galaxy.z);
            }
            else {
                pixelRadius = 0.3 * (focalLength / galaxy.z);
            }

            // Create a radial gradient for the glow effect
            var gradient = c.createRadialGradient(pixelX, pixelY, 0, pixelX, pixelY, pixelRadius * 3);
            gradient.addColorStop(0, galaxy.color);
            gradient.addColorStop(0.2, galaxy.color); // Added an additional color stop
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

            c.fillStyle = gradient;
            c.beginPath();
            c.arc(pixelX, pixelY, pixelRadius * 3, 0, Math.PI * 2, false);
            c.fill();

            if (warping == 0) {
                // Randomly decide whether to display the text
                if (galaxy.text != "NIL") {
                    var textSize = 20 * (focalLength / galaxy.z);
                    c.font = textSize + "px Lexend Deca ";
                    c.fillStyle = "white";
                    c.fillText(galaxy.text, pixelX, pixelY);
                }
            }
        }
    }

    // Zoom in and make galaxies disappear
    function zoomIn() {
        focalLength -= 20;
        if (focalLength <= canvas.width / 2) {
            focalLength = canvas.width / 2;
            zooming = false;
            document.body.style.overflow = 'auto'; // Allow scrolling after zoom
            setTimeout(appearContent, 500);
        }
    }

    // Function to make content appear randomly and periodically
    function appearContent() {
        const contentItems = document.querySelectorAll('#content > *');
        let index = 0;

        function showNextItem() {
            if (index < contentItems.length) {
                contentItems[index].style.opacity = 1;
                index++;
                setTimeout(showNextItem, 300); // Adjust the delay as needed
            }
        }
        showNextItem();
    }

    // Initialize the galaxies
    initializeGalaxies();

    // Start the animation
    executeFrame();
    // .*. //

    window.addEventListener('load', function () {
        const loader = document.getElementById('loader');
        const content = document.getElementById('content');

        document.body.classList.add('loading'); // Add the 'loading' class when the script is first executed

        // Things to RESET when the page Refreshes
        window.scrollTo(0, 0);
        content.style.display = 'none'; // Hide the main content

        setTimeout(function () {
            document.body.classList.remove('loading'); // Remove the 'loading' class when the DOM is fully loaded

            window.warping = window.warping == 1 ? 0 : 1;
            window.c.clearRect(0, 0, window.canvas.width, window.canvas.height);
            executeFrame();
            loader.style.transition = 'transform 3s, opacity 3s';
            setTimeout(function () {
                loader.style.opacity = 0;

                setTimeout(function () {
                    loader.style.display = 'none'; // Remove the loading content
                    content.style.display = 'block'; // Show the main content
                    zooming = true;
                    isLoading = false;
                    console.log('Loading sequence ended. Proceeding to main webpage.');
                }, 3000); // Adjust timing as needed

            }, 3000); // Adjust timing as needed

        }, 1000); // 5000 milliseconds = 5 seconds
    });
    // .*. //
}

document.addEventListener('DOMContentLoaded', () => {
    // || HAMBURGER NAV MENU + PAGE MANAGER.js
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('nav ul');

    // Function to show the selected section and hide others
    function showSection(id) {
        sections.forEach(section => {
            if (section.id === id) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        if (id === 'game') {
            if (!gameInitialized) {
                gameInitialized = true; // Set the flag to true
                initializeGame(); // Initialize the game only once
            }
            gameRunning = true; // Set the flag to run the game
            runGame(); // Start the game loop
        } else {
            gameRunning = false; // Set the flag to stop the game
        }
    }

    // Event listeners for navigation links
    links.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showSection(targetId);

            // Close the menu on mobile after clicking a link
            if (window.innerWidth <= 800) {
                navMenu.classList.remove('active');
            }
        });
    });

    // Function to toggle the menu visibility
    function toggleMenu() {
        navMenu.classList.toggle('active');
    }

    // Attach the click event listener to the menu toggle button
    menuToggle.addEventListener('click', toggleMenu);

    // Add sticky header functionality
    window.addEventListener('scroll', function () {
        const header = document.querySelector('header');
        header.classList.toggle('sticky', window.scrollY > 0);
    });

    // Show the home section by default
    showSection('home');

    // || HOME SLIDESHOW.js
    const slides = document.querySelectorAll('#slideshow .slide');
    let currentIndex = 0;

    // Initialize the first slide
    slides[currentIndex].classList.add('active');

    function showNextSlide() {
        // Start fade out and fade in using CSS transitions
        slides[currentIndex].classList.remove('active'); // Start fade out
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active'); // Start fade in
    }

    // Set interval for slideshow
    setInterval(showNextSlide, 5000); // Change slide every 5 seconds

    // || DISTANCE CALCULATOR.js
    const calculateButton = document.getElementById('calculate');
    const resultElement = document.getElementById('result');

    const distances = {
        mars: 225000000, // 225 million km
        jupiter: 778500000, // 778.5 million km
        andromeda: 24000000000000000, // 24 million light years in km
        milkyway: 27000 * 9.461e+12 // 27,000 light years in km
    };

    const spacecraftSpeeds = {
        shuttle: 28000,
        falcon: 100000,
        warp: 1000000
    };

    calculateButton.addEventListener('click', () => {
        const destination = document.getElementById('destination').value;
        const spacecraft = document.getElementById('spacecraft').value;
        let speed = parseFloat(document.getElementById('speed').value);

        // Use the default spacecraft speed if no custom speed is provided
        if (isNaN(speed) || speed <= 0) {
            speed = spacecraftSpeeds[spacecraft];
        }
        else {
            speed += spacecraftSpeeds[spacecraft]; // Add the spacecraft speed to the inputted speed
        }

        const distance = distances[destination];
        const timeInHours = distance / speed;
        const timeInDays = timeInHours / 24;
        const timeInYears = Math.floor(timeInDays / 365);
        const timeInMonths = Math.floor((timeInDays % 365) / 30);
        const remainingDays = Math.floor((timeInDays % 365) % 30);
        const remainingHours = Math.floor(timeInHours % 24);

        let resultText = `${timeInYears} years, ${timeInMonths} months, ${remainingDays} days, and ${remainingHours} hours`;

        resultElement.textContent = resultText;
    });

    // || TIMELINE.js
    //const timelineItems = document.querySelectorAll('.timeline-item');

    //function highlightCurrentItem() {
    //    let current = null;

    //    timelineItems.forEach(item => {
    //        const rect = item.getBoundingClientRect();
    //        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
    //            current = item;
    //        }
    //    });

    //    timelineItems.forEach(item => {
    //        item.classList.remove('highlight');
    //    });

    //    if (current) {
    //        current.classList.add('highlight');
    //    }
    //}

    //window.addEventListener('scroll', highlightCurrentItem);
    //highlightCurrentItem(); // Initial call to highlight the first visible item
});
// .*. //

function initializeGame() {
    console.log('Game initializing...');
    // || SPACE EXPLORER.js
    // Initialize game variables
    gridSize = 5;
    currentGalaxy = 'Milky Way';
    resources = 0;
    credits = 100;
    playerPosition = { x: 2, y: 2 }; // Start position in the center of the grid
    blackHolePosition = null; // To store the black hole position
    galaxy = ['Andromeda', 'Triangulum', 'Whirlpool', 'Sombrero'];
    star = ['Main Sequence', 'Red Giant', 'White Dwarf', 'Neutron Star'];
    starEmojis = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪'];
    resourceValues = {
        'Main Sequence': 10,
        'Red Giant': 20,
        'White Dwarf': 15,
        'Neutron Star': 25,
    };
    gridState = [];
    borderColors = ['#0ff', '#f0f', '#ff0', '#f00', '#0f0'];
    selectedMerchant = null;
    merchants = [
        { name: 'Merchant A', requiredGalaxy: 'Andromeda', requiredStar: 'Red Giant', reward: 100 },
        { name: 'Merchant B', requiredGalaxy: 'Triangulum', requiredStar: 'White Dwarf', reward: 150 },
        { name: 'Merchant C', requiredGalaxy: 'Whirlpool', requiredStar: 'Neutron Star', reward: 200 },
        { name: 'Merchant D', requiredGalaxy: 'Sombrero', requiredStar: 'Main Sequence', reward: 250 }
    ];

    storage = 50;
    warpDrive = false;

    // Button Handlers
    document.getElementById('up').addEventListener('click', () => handleMovement('ArrowUp'));
    document.getElementById('down').addEventListener('click', () => handleMovement('ArrowDown'));
    document.getElementById('left').addEventListener('click', () => handleMovement('ArrowLeft'));
    document.getElementById('right').addEventListener('click', () => handleMovement('ArrowRight'));
    document.getElementById('click-left').addEventListener('click', handleMouseClickLeft);
    document.getElementById('click-right').addEventListener('click', handleMouseClickRight);

    document.getElementById('refresh-merchants').addEventListener('click', refreshMerchants);
    document.getElementById('add-merchant').addEventListener('click', addMerchant);

    // Event listeners for shop buttons
    document.getElementById('buy-storage').addEventListener('click', buyStorage);
    document.getElementById('buy-warp-drive').addEventListener('click', buyWarpDrive);

    generateGrid(true);
    displayMerchants();
}

function runGame() {
    if (!gameRunning) return; // Exit if the game should not be running
    requestAnimationFrame(runGame); // Continue the game loop

    // Game logic here (e.g., move player, check collisions)
    renderGrid(); // Render the game grid
}

function generateGrid(isNewGalaxy) {
    const gridContainer = document.getElementById('game-grid');
    if (isNewGalaxy) {
        gridState = [];
        for (let i = 0; i < gridSize; i++) {
            const row = [];
            for (let j = 0; j < gridSize; j++) {
                row.push({ type: 'empty', emoji: '' }); // Initialize with empty spaces
            }
            gridState.push(row);
        }

        let galaxiesPlaced = 0;
        while (galaxiesPlaced < 3) {
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            if (gridState[x][y].type === 'empty') {
                gridState[x][y] = { type: 'galaxy', name: galaxy[Math.floor(Math.random() * galaxy.length)], emoji: '🌌' };
                galaxiesPlaced++;
            }
        }

        // Randomly decide whether to place a black hole (1% chance)
        if (Math.random() < 0.01) {
            let placed = false;
            while (!placed) {
                const x = Math.floor(Math.random() * gridSize);
                const y = Math.floor(Math.random() * gridSize);
                if (gridState[x][y].type === 'empty' && isAreaEmpty(x, y)) {
                    gridState[x][y] = { type: 'blackhole', name: 'Black Hole', emoji: '🌀' };
                    blackHolePosition = { x, y };
                    placed = true;
                }
            }
        }

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (gridState[i][j].type === 'empty' && !(blackHolePosition && isAdjacentToBlackHole(i, j))) {
                    let tempStar = star[Math.floor(Math.random() * star.length)];
                    gridState[i][j] = {
                        type: 'star',
                        name: tempStar,
                        emoji: starEmojis[Math.floor(Math.random() * starEmojis.length)],
                        description: generateStarDescription(tempStar)
                    };
                }
            }
        }

        // Randomly replace some stars with empty spaces
        gridState.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell.type === 'star' && Math.random() < 0.7) {
                    gridState[i][j] = { type: 'empty', emoji: '' };
                }
            });
        });
    }
    renderGrid();
}

function isAreaEmpty(x, y) {
    const offsets = [-1, 0, 1];
    for (let dx of offsets) {
        for (let dy of offsets) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && gridState[nx][ny].type !== 'empty') {
                return false;
            }
        }
    }
    return true;
}

function isAdjacentToBlackHole(x, y) {
    const offsets = [-1, 0, 1];
    for (let dx of offsets) {
        for (let dy of offsets) {
            const nx = x + dx;
            const ny = y + dy;
            if (blackHolePosition && nx === blackHolePosition.x && ny === blackHolePosition.y) {
                return true;
            }
        }
    }
    return false;
}

function generateStarDescription(starType) {
    const names = ['Zeta', 'Alpha', 'Omega', 'Delta', 'Epsilon'];
    const spaceProperties = ['High Gravity', 'Low Gravity', 'Radiation Zone', 'Magnetic Fields'];
    const weatherPatterns = ['Solar Flares', 'Calm', 'Stormy', 'Windy'];
    const dangerLevels = ['Low', 'Medium', 'High', 'Extreme'];
    const resources = ['Helium', 'Iron', 'Gold', 'Uranium', 'Hydrogen'];

    return {
        name: `${names[Math.floor(Math.random() * names.length)]} ${starType}`,
        spaceProperties: spaceProperties[Math.floor(Math.random() * spaceProperties.length)],
        weatherPatterns: weatherPatterns[Math.floor(Math.random() * weatherPatterns.length)],
        dangerLevel: dangerLevels[Math.floor(Math.random() * dangerLevels.length)],
        resources: resources[Math.floor(Math.random() * resources.length)]
    };
}

function renderGrid() {
    const gridContainer = document.getElementById('game-grid');
    gridContainer.innerHTML = ''; // Clears the 'game-grid' container

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const gridItem = document.createElement('div');
            gridItem.classList.add('game-grid-item');
            const cell = gridState[i][j];
            if (i === playerPosition.x && j === playerPosition.y) {
                gridItem.classList.add('ship');
                gridItem.textContent = '🚀';
            } else if (cell.type !== 'empty') {
                gridItem.classList.add(cell.type);
                gridItem.textContent = cell.emoji;
                gridItem.dataset.type = cell.type;
                gridItem.dataset.name = cell.name;
                if (cell.description) {
                    gridItem.dataset.description = JSON.stringify(cell.description);
                }
            } else {
                gridItem.textContent = '';
            }
            fragment.appendChild(gridItem);
        }
    }
    gridContainer.appendChild(fragment);
    updateStatus();
}

function handleMovement(direction) {
    const { x, y } = playerPosition;
    let newX = x;
    let newY = y;
    if (direction === 'ArrowUp' && x > 0) newX -= 1;
    if (direction === 'ArrowDown' && x < gridSize - 1) newX += 1;
    if (direction === 'ArrowLeft' && y > 0) newY -= 1;
    if (direction === 'ArrowRight' && y < gridSize - 1) newY += 1;

    const targetCell = gridState[newX][newY];
    playerPosition = { x: newX, y: newY };
    if (targetCell.type) {
        if (targetCell.type === 'star') {
            // Player is on a random star
        } else if (targetCell.type === 'galaxy') {
            travelToNewGalaxy(targetCell.name);
            return; // Prevents generating the grid again on the same move
        } else if (targetCell.type === 'blackhole') {
            encounterBlackHole();
            return; // Prevents further actions after encountering a black hole
        }
    }
    if (blackHolePosition) {
        movePlayerCloserToBlackHole();
    }
    renderGrid(); // Only update the grid without regenerating
}

function handleMouseClickLeft() {
    const { x, y } = playerPosition;
    const targetCell = gridState[x][y];
    if (targetCell.type === 'star') {
        extractResources(targetCell.name, targetCell.description);
    }
}

function handleMouseClickRight() {
    if (warpDrive) {
        travelToNewGalaxy(galaxies[Math.floor(Math.random() * galaxies.length)]);
    } else {
        showMessage('You need a warp drive to warp out of a galaxy!');
    }
}

function extractResources(star, description) {
    const extracted = resourceValues[star];
    if (resources + extracted > storage) {
        showMessage(`Not enough storage! Extracted resources exceed storage capacity.`);
    } else {
        resources += extracted;
        showMessage(`You extracted ${extracted} resources from the ${description.name} star.`);

        // Update Star Descriptions
        document.getElementById('star-name').textContent = description.name;
        document.getElementById('star-properties').textContent = description.spaceProperties;
        document.getElementById('star-weather').textContent = description.weatherPatterns;
        document.getElementById('star-danger').textContent = description.dangerLevel;
        document.getElementById('star-resources').textContent = description.resources;

        checkMerchantRequirement(currentGalaxy, star, extracted);
    }
}

function travelToNewGalaxy(galaxy) {
    currentGalaxy = galaxy;
    playerPosition = { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) };
    showMessage(`You have traveled to the ${galaxy} galaxy.`);

    // Change Border Colour of containers
    const gridContainer = document.getElementById('game-grid');
    const starContainer = document.getElementById('star-description');
    const merchantContainer = document.getElementById('merchant-container');
    const controlContrainer = document.querySelectorAll('#movement-buttons button');
    const statusContainer = document.getElementById('status');
    const shopContainer = document.getElementById('shop');

    const randomColor = borderColors[Math.floor(Math.random() * borderColors.length)];

    gridContainer.style.borderColor = randomColor;
    starContainer.style.borderColor = randomColor;
    merchantContainer.style.borderColor = randomColor;

    controlContrainer.forEach(button => {
        button.style.borderColor = randomColor;
    });

    statusContainer.style.borderColor = randomColor;
    shopContainer.style.borderColor = randomColor;

    // Regenerate the grid with new stars and galaxies
    generateGrid(true);
}

function updateStatus() {
    document.getElementById('current-galaxy').textContent = currentGalaxy;
    document.getElementById('resources').textContent = resources;
    document.getElementById('credits').textContent = credits;
    document.getElementById('storage').textContent = storage;
    document.getElementById('warp-drive').textContent = warpDrive ? 'Yes' : 'No';
}

function showMessage(message) {
    document.getElementById('message').textContent = message;
}

function movePlayerCloserToBlackHole() {
    const { x: px, y: py } = playerPosition;
    const { x: bx, y: by } = blackHolePosition;

    if (px < bx) {
        playerPosition.x += 1;
    } else if (px > bx) {
        playerPosition.x -= 1;
    }

    if (py < by) {
        playerPosition.y += 1;
    } else if (py > by) {
        playerPosition.y -= 1;
    }

    // Check if the player has been pulled into the black hole
    if (playerPosition.x === bx && playerPosition.y === by) {
        const loss = Math.min(resources, 50); // Lose up to 50 resources
        resources -= loss;
        showMessage(`You encountered a Black Hole and lost ${loss} resources.`);
        blackHolePosition = null; // Reset the black hole position
        generateGrid(true); // Refresh the grid with a new random selection
    }
}

function displayMerchants() {
    const merchantContainer = document.getElementById('merchants');
    merchantContainer.innerHTML = '';
    merchants.forEach((merchant, index) => {
        const merchantItem = document.createElement('div');
        merchantItem.classList.add('merchant-item');
        if (selectedMerchant === merchant) {
            merchantItem.classList.add('selected');
        }
        merchantItem.textContent = `${merchant.name} - Requires: ${merchant.requiredGalaxy} - ${merchant.requiredStar} - Reward: ${merchant.reward} credits`;
        merchantItem.addEventListener('click', () => selectMerchant(index));
        merchantContainer.appendChild(merchantItem);
    });
}
function selectMerchant(index) {
    selectedMerchant = merchants[index];
    showMessage(`You have selected ${selectedMerchant.name}.`);
    displayMerchants(); // Refresh merchant display to highlight selected merchant
}

function checkMerchantRequirement(galaxy, star, extracted) {
    if (selectedMerchant &&
        selectedMerchant.requiredGalaxy === galaxy &&
        selectedMerchant.requiredStar === star &&
        extracted > 0) {
        credits += selectedMerchant.reward;
        showMessage(`You have completed the requirement for ${selectedMerchant.name} and earned ${selectedMerchant.reward} credits!`);
        merchants.splice(merchants.indexOf(selectedMerchant), 1);
        selectedMerchant = null;
        displayMerchants(); // Reset merchant selection and refresh the list
        updateStatus();
    }
}

function refreshMerchants() {
    merchants = [];
    for (let i = 0; i < 4; i++) {
        addMerchant();
    }
    displayMerchants();
}

function addMerchant() {
    if (merchants.length < 4) {
        const newMerchant = {
            name: `Merchant ${String.fromCharCode(65 + merchants.length)}`,
            requiredGalaxy: galaxy[Math.floor(Math.random() * galaxy.length)],
            requiredStar: star[Math.floor(Math.random() * star.length)],
            reward: Math.floor(Math.random() * 201) + 50 // Reward between 50 and 250 credits
        };
        merchants.push(newMerchant);
        displayMerchants();
    } else {
        showMessage('Maximum of 4 merchants at a time.');
    }
}

function buyStorage() {
    if (credits >= 100) {
        storage += 50;
        credits -= 100;
        showMessage('Storage increased by 50!');
        updateStatus();
    } else {
        showMessage('Not enough credits to buy storage!');
    }
}

function buyWarpDrive() {
    if (credits >= 500) {
        warpDrive = true;
        credits -= 500;
        showMessage('Warp drive purchased!');
        updateStatus();
    } else {
        showMessage('Not enough credits to buy a warp drive!');
    }
}
// .*. //

// || FULLSCREEN CODE
// Check if the browser supports the Fullscreen API
if (document.documentElement.requestFullscreen) {
    // Function to enter fullscreen mode
    function enterFullscreen() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, and Opera
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            document.documentElement.msRequestFullscreen();
        }
    }

    // Function to exit fullscreen mode
    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
    }

    // Add event listeners to enter/exit fullscreen on button click
    var fullscreenButton = document.getElementById('fullscreen-button');

    fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    });
}
// .*. //