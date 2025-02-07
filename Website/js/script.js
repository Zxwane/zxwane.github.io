function openLink(url) {
    window.open(url, '_blank'); // Opens the URL in a new tab
}

// Start Menu
document.getElementById('start-button').addEventListener('click', () => {
    const startMenu = document.getElementById('start-menu');
    startMenu.style.display = startMenu.style.display === 'none' || startMenu.style.display === '' ? 'block' : 'none';
});

// Window Management
let maximizedWindow = null; // Track which window is maximized

function minimizeWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    windowElement.style.display = 'none'; // Hide the window
}

function maximizeWindow(windowId) {
    const windowElement = document.getElementById(windowId);

    // If already maximized, restore original size
    if (windowElement.classList.contains('maximized')) {
        windowElement.style.left = windowElement.dataset.originalLeft;
        windowElement.style.bottom = windowElement.dataset.originalBottom;
        windowElement.style.top = windowElement.dataset.originalTop;
        windowElement.style.width = windowElement.dataset.originalWidth;
        windowElement.style.height = windowElement.dataset.originalHeight;

        windowElement.classList.remove('maximized');
    } else {
        // Store current position and size
        windowElement.dataset.originalLeft = windowElement.style.left;
        windowElement.dataset.originalBottom = windowElement.style.bottom;
        windowElement.dataset.originalTop = windowElement.style.top;
        windowElement.dataset.originalWidth = windowElement.style.width;
        windowElement.dataset.originalHeight = windowElement.style.height;

        // Maximize the window
        windowElement.style.left = '0';
        windowElement.style.top = '0';
        windowElement.style.width = '100%';
        windowElement.style.height = '100%';

        windowElement.classList.add('maximized');
    }
}

let windowOffsetX = 20; // Horizontal offset for stacking
let windowOffsetY = 20; // Vertical offset for stacking
let currentOffsetX = 0; // Tracks cumulative X offset
let currentOffsetY = 0; // Tracks cumulative Y offset
let zIndexCounter = 100; // Global counter for zIndex

function openWindow(windowId, event) {
    const windowElement = document.getElementById(windowId);

    if (windowElement) {
        const screenWidth = window.innerWidth;

        // Dynamically set the window size
        if (screenWidth <= 768) {
            // Handle mobile-specific logic if needed
        } else {
            // Get desktop dimensions
            const desktopWidth = window.innerWidth;
            const desktopHeight = window.innerHeight;

            // Get window dimensions
            const windowWidth = windowElement.offsetWidth || 400; // Default width
            const windowHeight = windowElement.offsetHeight || 300; // Default height

            // Calculate the centered position
            let centeredLeft = (desktopWidth - windowWidth) / 2;
            let centeredTop = (desktopHeight - windowHeight) / 2;

            // Apply cascading offsets
            centeredLeft += currentOffsetX;
            centeredTop += currentOffsetY;

            // Ensure the window stays within screen bounds
            if (centeredLeft + windowWidth > desktopWidth || centeredTop + windowHeight > desktopHeight) {
                currentOffsetX = 0; // Reset offset if it goes out of bounds
                currentOffsetY = 0;
            } else {
                // Increment offsets for the next window
                currentOffsetX += windowOffsetX;
                currentOffsetY += windowOffsetY;
            }

            // Set the window's position
            windowElement.style.left = `${centeredLeft}px`;
            windowElement.style.top = `${centeredTop}px`;
        }

        // Update zIndex to bring the window to the front
        zIndexCounter += 1; // Increment the zIndex
        windowElement.style.zIndex = zIndexCounter;

        // Make the window visible
        windowElement.style.display = 'block';
        windowElement.style.position = 'absolute';

        // Get the icon that was clicked
        const clickedIcon = event?.target; // The element that triggered the event
        const iconSrc = clickedIcon?.src; // The source of the icon image
        const iconAlt = clickedIcon?.alt; // The alt text of the icon image

        // Add the icon to the taskbar
        if (iconSrc && iconAlt) {
            addTaskbarIcon(windowId, iconSrc, iconAlt);
            checkTaskbarOverflow();
        }
    }
}

function closeWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
        windowElement.style.display = 'none';
        removeTaskbarIcon(windowId);
    }
}

// Constrain resizing within screen boundaries
function enforceWindowBounds() {
    const windows = document.querySelectorAll('.window');

    windows.forEach(window => {
        window.addEventListener('resize', () => {
            const desktopWidth = window.parentElement.clientWidth;
            const desktopHeight = window.parentElement.clientHeight;

            // Ensure window doesn't exceed desktop width
            if (window.offsetLeft + window.offsetWidth > desktopWidth) {
                window.style.width = `${desktopWidth - window.offsetLeft}px`;
            }

            // Ensure window doesn't exceed desktop height
            if (window.offsetTop + window.offsetHeight > desktopHeight) {
                window.style.height = `${desktopHeight - window.offsetTop}px`;
            }
        });

        // Listen for movement to keep within boundaries
        window.addEventListener('mousemove', () => {
            const desktopWidth = window.parentElement.clientWidth;
            const desktopHeight = window.parentElement.clientHeight;

            // Constrain window position
            if (window.offsetLeft < 0) window.style.left = '0px';
            if (window.offsetTop < 0) window.style.top = '0px';
            if (window.offsetLeft + window.offsetWidth > desktopWidth)
                window.style.left = `${desktopWidth - window.offsetWidth}px`;
            if (window.offsetTop + window.offsetHeight > desktopHeight)
                window.style.top = `${desktopHeight - window.offsetHeight}px`;
        });
    });
}

// Ensure initialization does not show windows
window.onload = () => {
    enforceWindowBounds();
    if (typeof positionIconsInGrid === 'function') {
        positionIconsInGrid(); // Only align icons if necessary
    }
};

document.querySelectorAll('.window').forEach(window => {
    const header = window.querySelector('.window-header');

    header.addEventListener('mousedown', (e) => {
        // Increase z-index of the dragged window
        window.style.zIndex = getNextZIndex();

        let shiftX = e.clientX - window.getBoundingClientRect().left;
        let shiftY = e.clientY - window.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            const desktop = document.getElementById('desktop');
            const desktopRect = desktop.getBoundingClientRect();

            // Prevent window from going out of bounds
            const newX = Math.min(
                Math.max(0, pageX - shiftX),
                desktopRect.width - window.offsetWidth
            );
            const newY = Math.min(
                Math.max(0, pageY - shiftY),
                desktopRect.height - window.offsetHeight
            );

            window.style.left = `${newX}px`;
            window.style.top = `${newY}px`;
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onMouseMove);
        }, { once: true });
    });

    header.ondragstart = () => false; // Disable default drag behavior
});

// Helper function to get the next highest z-index
function getNextZIndex() {
    let maxZIndex = 0;
    document.querySelectorAll('.window').forEach(window => {
        const zIndex = parseInt(window.style.zIndex || 0, 10);
        if (zIndex > maxZIndex) {
            maxZIndex = zIndex;
        }
    });
    return maxZIndex + 1;
}

document.querySelectorAll('.icon').forEach(icon => {
    let lastTapTime = 0; // Track the time of the last tap

    icon.addEventListener('touchend', (event) => {
        const currentTime = new Date().getTime();
        const tapInterval = currentTime - lastTapTime;

        if (tapInterval < 300 && tapInterval > 0) {
            // Double-tap detected
            const windowId = icon.getAttribute('ondblclick').match(/'([^']+)'/)[1];
            openWindow(windowId); // Open the corresponding window
        }

        lastTapTime = currentTime; // Update the last tap time
        event.preventDefault(); // Prevent default behavior like zoom
    });
});

// Clock and Date
function updateClockAndDate() {
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const now = new Date();

    timeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    dateElement.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });
}

updateClockAndDate();
setInterval(updateClockAndDate, 1000);


// Taskbar Management
function addTaskbarIcon(windowId, iconSrc = "images/windows_folder.png", altText = "Window") {
    const taskbarIconsContainer = document.getElementById("taskbar-icons");

    // Check if the icon already exists
    if (document.querySelector(`.taskbar-icon[data-window="${windowId}"]`)) return;

    // Create the taskbar icon element
    const taskbarIcon = document.createElement("div");
    taskbarIcon.classList.add("taskbar-icon");
    taskbarIcon.setAttribute("data-window", windowId);

    // Set the icon's image
    taskbarIcon.innerHTML = `<img src="${iconSrc}" alt="${altText}">`;

    // Add click event to toggle window visibility
    taskbarIcon.addEventListener("click", () => {
        const windowElement = document.getElementById(windowId);
        if (windowElement.style.display === "block") {
            windowElement.style.display = "none"; // Minimize
        } else {
            windowElement.style.display = "block"; // Restore
            enforceWindowBounds(windowElement); // Ensure it stays within bounds
        }
    });

    // Append to the taskbar
    taskbarIconsContainer.appendChild(taskbarIcon);
    checkTaskbarOverflow(); // Check overflow after adding an icon
}

function removeTaskbarIcon(windowId) {
    const iconElement = document.querySelector(`.taskbar-icon[data-window="${windowId}"]`);
    if (iconElement) {
        iconElement.remove(); // Remove the taskbar icon
        checkTaskbarOverflow(); // Recheck for overflow
    }
}

// Check if the taskbar needs compression
function checkTaskbarOverflow() {
    const taskbar = document.getElementById("taskbar");
    const taskbarIconsContainer = document.getElementById("taskbar-icons");

    const taskbarWidth = taskbarIconsContainer.clientWidth;
    const icons = [...taskbarIconsContainer.children];
    let totalIconsWidth = 0;

    // Calculate the total width of all icons
    icons.forEach(icon => {
        totalIconsWidth += icon.offsetWidth + 10; // Add padding between icons
    });

    if (totalIconsWidth > taskbarWidth) {
        // If there's an overflow, adjust the taskbar height
        taskbar.style.height = "auto";
    } else {
        // Reset to the original height when there's no overflow
        taskbar.style.height = "3.5%";
    }
}

// Test
const icons = document.querySelectorAll('.icon');
const gridSize = 100; // Size of each grid cell
const containerPadding = 10; // Padding around the desktop
const taskbarHeight = document.getElementById('taskbar').offsetHeight; // Taskbar height

// Function to position icons evenly in a grid
function positionIconsInGrid() {
    const desktop = document.getElementById('desktop');
    const desktopWidth = desktop.clientWidth - containerPadding * 2;
    const desktopHeight = desktop.clientHeight - taskbarHeight - containerPadding;

    let currentX = containerPadding;
    let currentY = containerPadding;

    icons.forEach((icon) => {
        // Place icon at the calculated position
        icon.style.left = `${currentX}px`;
        icon.style.top = `${currentY}px`;

        // Move to the next row
        currentY += gridSize;

        // If we've hit the bottom, move to the next column
        if (currentY + gridSize > desktopHeight) {
            currentY = containerPadding; // Reset Y position
            currentX += gridSize; // Move to the next column
        }

        // Prevent exceeding the screen's width
        if (currentX + gridSize > desktopWidth) {
            console.error("Not enough space to position all icons!");
            return;
        }
    });
}

// Call the function to position icons on page load
window.onload = positionIconsInGrid;

//

function filterProjects(category) {
    const items = document.querySelectorAll('.project-item');
    const buttons = document.querySelectorAll('.filter-btn');

    // Update active button
    buttons.forEach((btn) => btn.classList.remove('active'));
    document.querySelector(`[onclick="filterProjects('${category}')"]`).classList.add('active');

    // Show or hide projects based on the selected category
    items.forEach((item) => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

let openWindows = {}; // Track open windows by their IDs

function openProjectDetails(projectElement) {
    const windowId = `project-details-window-${projectElement.getAttribute("data-title")}`; // Use a unique ID based on the project title

    // Check if the window is already open
    if (openWindows[windowId]) {
        // Bring the existing window to the front
        const existingWindow = document.getElementById(windowId);
        existingWindow.style.zIndex = getNextZIndex();
        return;
    }

    const desktop = document.getElementById("desktop");

    // Create a new project window dynamically
    const windowElement = document.createElement("div");
    windowElement.id = windowId;
    windowElement.className = "window";
    windowElement.style.position = "absolute";
    windowElement.style.left = "100px"; // Default position
    windowElement.style.top = "100px"; // Default position
    windowElement.style.zIndex = getNextZIndex(); // Bring to the front

    windowElement.innerHTML = `
        <div class="window-header">
            <span>${projectElement.getAttribute("data-title") || "Project Details"}</span>
            <div class="window-controls">
                <button class="min-btn" onclick="minimizeWindow('${windowId}')"></button>
                <button class="max-btn" onclick="maximizeWindow('${windowId}')">o</button>
                <button class="close-btn" onclick="closeWindow('${windowId}')">x</button>
            </div>
        </div>
        <div class="window-content">
            <img id="banner-${windowId}" class="project-banner" src="${projectElement.getAttribute("data-banner") || "images/default-banner.png"}" alt="Project Banner">
            <h2>${projectElement.getAttribute("data-title") || "Untitled Project"}</h2>
            <h3>${projectElement.getAttribute("data-role") || "Role not specified"}</h3>
            <p>${projectElement.getAttribute("data-date") || "Date not specified"}</p>
            <p>${projectElement.getAttribute("data-description") || "No description available"}</p>
            <h4>Game Screenshots:</h4>
            <div class="project-gallery">
                ${JSON.parse(projectElement.getAttribute("data-images") || "[]")
            .map(
                (url) =>
                    `<img src="${url}" alt="Screenshot" class="project-screenshot" onclick="expandImage('${url}')">`
            )
            .join("")}
            </div>
        </div>
    `;

    // Append the new window to the desktop
    desktop.appendChild(windowElement);

    // Make the window draggable
    attachDragListeners(windowElement);

    // Add the window to the tracking list
    openWindows[windowId] = true;

    // Clean up the reference when the window is closed
    windowElement.querySelector(".close-btn").addEventListener("click", () => {
        delete openWindows[windowId];
    });

    // Open the new project window
    openWindow(windowId);
}


// Attach drag-and-drop functionality to the window
function attachDragListeners(windowElement) {
    const header = windowElement.querySelector('.window-header');

    header.addEventListener('mousedown', (e) => {
        // Ensure the window is brought to the front
        windowElement.style.zIndex = getNextZIndex();

        let shiftX = e.clientX - windowElement.getBoundingClientRect().left;
        let shiftY = e.clientY - windowElement.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            const desktop = document.getElementById('desktop');
            const desktopRect = desktop.getBoundingClientRect();

            // Prevent the window from going out of bounds
            const newX = Math.min(
                Math.max(0, pageX - shiftX),
                desktopRect.width - windowElement.offsetWidth
            );
            const newY = Math.min(
                Math.max(0, pageY - shiftY),
                desktopRect.height - windowElement.offsetHeight
            );

            windowElement.style.left = `${newX}px`;
            windowElement.style.top = `${newY}px`;
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onMouseMove);
        }, { once: true });
    });

    header.ondragstart = () => false; // Disable default drag behavior
}

// Image expansion function
function expandImage(imageUrl) {
    // Check if an overlay already exists
    if (document.getElementById("image-overlay")) return;

    // Create a fullscreen overlay
    const overlay = document.createElement("div");
    overlay.id = "image-overlay";
    overlay.className = "image-overlay";
    overlay.innerHTML = `
        <div class="overlay-content">
            <img src="${imageUrl}" alt="Expanded Image" class="expanded-image">
            <button class="close-overlay-btn" onclick="closeOverlay()">✕</button>
        </div>
    `;

    // Append overlay to the body
    document.body.appendChild(overlay);

    // Add fade-in animation
    setTimeout(() => {
        overlay.classList.add("visible");
    }, 10);
}

// Close overlay
function closeOverlay() {
    const overlay = document.getElementById("image-overlay");
    if (overlay) {
        overlay.classList.remove("visible");
        setTimeout(() => overlay.remove(), 300); // Wait for fade-out animation
    }
}

// Attach event listeners to project items
document.querySelectorAll(".project-item").forEach((item) => {
    item.addEventListener("click", () => openProjectDetails(item));
});






document.querySelectorAll('.carousel-container').forEach(container => {
    const carousel = container.querySelector('.carousel');

    // Mouse-based horizontal scrolling
    let isDragging = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
        isDragging = true;
        carousel.classList.add('dragging');
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // Adjust the scroll speed
        carousel.scrollLeft = scrollLeft - walk;
    });

    carousel.addEventListener('mouseup', () => {
        isDragging = false;
        carousel.classList.remove('dragging');
    });

    carousel.addEventListener('mouseleave', () => {
        isDragging = false;
        carousel.classList.remove('dragging');
    });

    // Touch-based swiping
    let touchStartX = 0;
    let touchScrollLeft = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].pageX;
        touchScrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('touchmove', (e) => {
        const touchX = e.touches[0].pageX;
        const walk = (touchX - touchStartX) * 2; // Adjust the scroll speed
        carousel.scrollLeft = touchScrollLeft - walk;
    });

    // Wheel-based horizontal scrolling
    carousel.addEventListener('wheel', (e) => {
        e.preventDefault();
        carousel.scrollLeft += e.deltaY * 2; // Adjust the scroll speed
    });
});

document.querySelectorAll('.window').forEach(window => {
    const header = window.querySelector('.window-header');
    const snapPreview = document.getElementById('snap-preview');
    let isDragging = false;
    let isSnapped = false;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        let shiftX = e.clientX - window.getBoundingClientRect().left;
        let shiftY = e.clientY - window.getBoundingClientRect().top;

        // Remove snapping animation during drag
        window.classList.remove('snapping');

        function moveAt(pageX, pageY) {
            const desktop = document.getElementById('desktop');
            const desktopRect = desktop.getBoundingClientRect();

            let newX = pageX - shiftX;
            let newY = pageY - shiftY;

            snapPreview.style.display = 'none'; // Hide preview initially

            // Snapping zones
            const SNAP_MARGIN = 30; // Distance from edge or corner to snap

            // Reset snapping state when moving away from snap zones
            if (isSnapped) {
                window.style.width = '';
                window.style.height = '';
                isSnapped = false;
            }

            // Check for edge or corner snapping
            if (newX < SNAP_MARGIN && newY < SNAP_MARGIN) {
                // Top-left corner
                snapPreview.style.left = '0';
                snapPreview.style.top = '0';
                snapPreview.style.width = '50%';
                snapPreview.style.height = '50%';
                snapPreview.style.display = 'block';
            } else if (newX + window.offsetWidth > desktopRect.width - SNAP_MARGIN && newY < SNAP_MARGIN) {
                // Top-right corner
                snapPreview.style.left = '50%';
                snapPreview.style.top = '0';
                snapPreview.style.width = '50%';
                snapPreview.style.height = '50%';
                snapPreview.style.display = 'block';
            } else if (newX < SNAP_MARGIN && newY + window.offsetHeight > desktopRect.height - SNAP_MARGIN) {
                // Bottom-left corner
                snapPreview.style.left = '0';
                snapPreview.style.top = '50%';
                snapPreview.style.width = '50%';
                snapPreview.style.height = '50%';
                snapPreview.style.display = 'block';
            } else if (newX + window.offsetWidth > desktopRect.width - SNAP_MARGIN && newY + window.offsetHeight > desktopRect.height - SNAP_MARGIN) {
                // Bottom-right corner
                snapPreview.style.left = '50%';
                snapPreview.style.top = '50%';
                snapPreview.style.width = '50%';
                snapPreview.style.height = '50%';
                snapPreview.style.display = 'block';
            } else if (newX < SNAP_MARGIN) {
                // Left edge
                snapPreview.style.left = '0';
                snapPreview.style.top = '0';
                snapPreview.style.width = '50%';
                snapPreview.style.height = '100%';
                snapPreview.style.display = 'block';
            } else if (newX + window.offsetWidth > desktopRect.width - SNAP_MARGIN) {
                // Right edge
                snapPreview.style.left = '50%';
                snapPreview.style.top = '0';
                snapPreview.style.width = '50%';
                snapPreview.style.height = '100%';
                snapPreview.style.display = 'block';
            } else if (newY < SNAP_MARGIN) {
                // Top edge
                snapPreview.style.left = '0';
                snapPreview.style.top = '0';
                snapPreview.style.width = '100%';
                snapPreview.style.height = '50%';
                snapPreview.style.display = 'block';
            } else if (newY + window.offsetHeight > desktopRect.height - SNAP_MARGIN) {
                // Bottom edge
                snapPreview.style.left = '0';
                snapPreview.style.top = '50%';
                snapPreview.style.width = '100%';
                snapPreview.style.height = '50%';
                snapPreview.style.display = 'block';
            } else {
                // No snapping zone detected
                snapPreview.style.display = 'none';
                window.style.left = `${newX}px`;
                window.style.top = `${newY}px`;
            }
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onMouseMove);

            if (snapPreview.style.display === 'block') {
                // Confirm snapping with animation
                window.classList.add('snapping');
                window.style.left = snapPreview.style.left;
                window.style.top = snapPreview.style.top;
                window.style.width = snapPreview.style.width;
                window.style.height = snapPreview.style.height;
                isSnapped = true; // Set snapped state
            } else {
                window.classList.remove('snapping');
            }

            snapPreview.style.display = 'none'; // Hide preview
            isDragging = false;
        }, { once: true });
    });

    header.ondragstart = () => false; // Disable default drag behavior
});



function downloadFile(fileUrl, fileName) {
    // Create an invisible link element
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName; // Suggested filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a); // Clean up after the download
}
