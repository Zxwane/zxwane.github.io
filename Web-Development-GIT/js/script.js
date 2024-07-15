// Alias for requestAnimationFrame
window.requestAnimFrame = window.requestAnimationFrame;

// Get the canvas and its 2D context
var canvas = document.getElementById("space");
var c = canvas.getContext("2d");

// Set up the starfield parameters
var numStars = 500;
var focalLength = canvas.width * 2;
var centerX, centerY;
var stars = [];
var animate = true;
var zooming = false;

// Function to generate a random color
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Main animation loop
function executeFrame() {
    if (animate) {
        window.requestAnimFrame(executeFrame);
    }
    if (zooming) {
        zoomIn();
    }
    moveStars();
    drawStars();
}

// Initialize star properties
function initializeStars() {
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;

    stars = [];
    for (var i = 0; i < numStars; i++) {
        var star = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            z: Math.random() * canvas.width,
            o: '0.' + Math.floor(Math.random() * 99) + 1,
            color: getRandomColor() // Assign a random color to each star
        };
        stars.push(star);
    }
}

// Update star positions
function moveStars() {
    for (var i = 0; i < numStars; i++) {
        var star = stars[i];
        star.z--;

        // Reset star position if it goes off-screen
        if (star.z <= 0) {
            star.z = canvas.width;
        }
    }
}

// Draw the stars on the canvas
function drawStars() {
    var pixelX, pixelY, pixelRadius;

    // Resize the canvas to fit the screen
    if (canvas.width != window.innerWidth || canvas.height != window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initializeStars();
    }

    // Clear the canvas
    c.fillStyle = "rgba(0, 10, 20, 1)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each star
    for (var i = 0; i < numStars; i++) {
        var star = stars[i];

        pixelX = (star.x - centerX) * (focalLength / star.z) + centerX;
        pixelY = (star.y - centerY) * (focalLength / star.z) + centerY;
        pixelRadius = 1 * (focalLength / star.z);

        // Create a radial gradient for the glow effect
        var gradient = c.createRadialGradient(pixelX, pixelY, 0, pixelX, pixelY, pixelRadius * 3);
        gradient.addColorStop(0, star.color);
        gradient.addColorStop(0.2, star.color); // Added an additional color stop
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

        c.fillStyle = gradient;
        c.beginPath();
        c.arc(pixelX, pixelY, pixelRadius * 3, 0, Math.PI * 2, false);
        c.fill();
    }
}

// Zoom in and make stars disappear
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

// Initialize the stars
initializeStars();

// Start the animation
executeFrame();

window.addEventListener('load', function () {
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');

    document.body.classList.add('loading'); // Add the 'loading' class when the script is first executed

    // Things to RESET when the page Refreshes
    window.scrollTo(0, 0);
    content.style.display = 'none'; // Hide the main content

    setTimeout(function () {
        document.body.classList.remove('loading'); // Remove the 'loading' class when the DOM is fully loaded

        loader.style.transition = 'transform 3s, opacity 3s';
        loader.style.transform = 'scale(10)';
        loader.style.opacity = 0;

        setTimeout(function () {
            loader.style.display = 'none'; // Remove the loading content
            content.style.display = 'block'; // Show the main content
            zooming = true;
        }, 1000); // Adjust timing as needed

    }, 1000); // 5000 milliseconds = 5 seconds

    console.log('The webpage has fully loaded.');
});

function toggleMenu() {
    const menu = document.querySelector('nav ul');
    menu.classList.toggle('active');
}

// Get the menu-toggle element
var menuToggle = document.getElementById("menu-toggle");

// Attach the click event listener
menuToggle.addEventListener("click", toggleMenu);

// Add sticky header functionality
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 0);
});

// Function to update the scroll position
function updateScroller() {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const top = Math.round((scrollY / (documentHeight - viewportHeight)) * 100);
    const bottom = Math.round(
        ((scrollY + viewportHeight - documentHeight) / (documentHeight - viewportHeight)) *
        100
    );

    document.querySelector(".one").textContent = top + '%';
    document.querySelector(".two").textContent = bottom + '%';

    if (viewportHeight + window.pageYOffset > 1.2 * viewportHeight) {
        document.querySelector(".scroll").style.opacity = "1";
    } else {
        document.querySelector(".scroll").style.opacity = "0";
    }
}

window.addEventListener("scroll", updateScroller);
window.addEventListener("resize", updateScroller);
updateScroller();

/////////////////////

const stack = document.querySelector(".stack");
const cards = Array.from(stack.children)
    .reverse()
    .filter(function (child) {
        return child.classList.contains("card");
    });

cards.forEach(function (card) {
    stack.appendChild(card);
});

function moveCard() {
    const lastCard = stack.lastElementChild;
    if (lastCard.classList.contains("card")) {
        lastCard.classList.add("swap");

        setTimeout(function () {
            lastCard.classList.remove("swap");
            stack.insertBefore(lastCard, stack.firstElementChild);
        }, 1200);
    }
}

//autoplayinterval
setInterval(moveCard, 4000);

stack.addEventListener("click", function (e) {
    const card = e.target.closest(".card");
    if (card && card === stack.lastElementChild) {
        card.classList.add("swap");

        setTimeout(function () {
            card.classList.remove("swap");
            stack.insertBefore(card, stack.firstElementChild);
        }, 1200);
    }
});