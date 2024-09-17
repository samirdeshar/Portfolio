document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    const terminals = document.querySelectorAll('.terminal');
    const minimizedTabsContainer = document.querySelector('.minimized-tabs');
    const navIcons = document.querySelectorAll('.nav-icon');
    const sun = document.querySelector('.sun');
    const moon = document.querySelector('.moon');

    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        moon.style.display = document.body.classList.contains('dark-mode') ? 'block' : 'none';
        sun.style.display = document.body.classList.contains('light-mode') ? 'block' : 'none';
    });

    function getRandomPosition() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const terminalWidth = 400; // Width of the terminal
        const terminalHeight = 300; // Height of the terminal

        const maxLeft = screenWidth / 2 - terminalWidth / 2;
        const maxTop = screenHeight / 2 - terminalHeight / 2;

        // Generate random position within the range
        const left = Math.random() * (screenWidth - terminalWidth);
        const top = Math.random() * (screenHeight - terminalHeight);

        return {
            left: Math.min(left, maxLeft),
            top: Math.min(top, maxTop),
        };
    }

    document.querySelectorAll('.nav-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const targetId = icon.dataset.target;
            const targetTerminal = document.getElementById(targetId);
            if (targetTerminal.classList.contains('minimized')) {
                targetTerminal.classList.remove('minimized');
                targetTerminal.classList.add('expand');
                const { left, top } = getRandomPosition();
                targetTerminal.style.top = `${top}px`;
                targetTerminal.style.left = `${left}px`;
                const tab = minimizedTabsContainer.querySelector(`[data-target="${targetId}"]`);
                if (tab) tab.remove();
                // Remove expand class after animation
                setTimeout(() => targetTerminal.classList.remove('expand'), 400);
            } else {
                const { left, top } = getRandomPosition();
                targetTerminal.classList.add('show');
                targetTerminal.style.top = `${top}px`;
                targetTerminal.style.left = `${left}px`;
            }
        });
    });

    document.querySelectorAll('.terminal-control.close').forEach(button => {
        button.addEventListener('click', (e) => {
            const terminal = e.target.closest('.terminal');
            const navIcon = document.querySelector(`.nav-icon[data-target="${terminal.id}"]`);
            if (navIcon) {
                const rect = navIcon.getBoundingClientRect();
                terminal.style.setProperty('--nav-top', rect.top + window.scrollY + 'px');
                terminal.style.setProperty('--nav-left', rect.left + window.scrollX + 'px');
                terminal.classList.add('sweep');

                // Hide terminal after animation
                setTimeout(() => {
                    terminal.classList.remove('show', 'sweep');
                    const tab = minimizedTabsContainer.querySelector(`[data-target="${terminal.id}"]`);
                    if (tab) tab.remove();
                }, 400); // Match animation duration
            } else {
                // For terminals that are not minimized
                terminal.classList.remove('show');
                terminal.classList.remove('minimized');
                const tab = minimizedTabsContainer.querySelector(`[data-target="${terminal.id}"]`);
                if (tab) tab.remove();
            }
        });
    });

    document.querySelectorAll('.terminal-control.minimize').forEach(button => {
        button.addEventListener('click', (e) => {
            const terminal = e.target.closest('.terminal');
            terminal.classList.remove('show');
            terminal.classList.add('minimized');
            
            // Find the corresponding nav-icon
            const targetIcon = document.querySelector(`.nav-icon[data-target="${terminal.id}"]`);
            const rect = targetIcon.getBoundingClientRect();

            // Create a tab for the minimized terminal and place it next to the corresponding nav-icon
            const tab = document.createElement('div');
            tab.classList.add('minimized-tab');
            tab.textContent = targetIcon.textContent;
            tab.dataset.target = terminal.id;
            tab.style.position = 'absolute';
            tab.style.top = `${rect.top + window.scrollY}px`;
            tab.style.left = `${rect.left + window.scrollX}px`;

            tab.addEventListener('click', () => {
                terminal.classList.remove('minimized');
                terminal.classList.add('expand');
                const { left, top } = getRandomPosition();
                terminal.style.top = `${top}px`;
                terminal.style.left = `${left}px`;
                tab.remove();
                // Remove expand class after animation
                setTimeout(() => terminal.classList.remove('expand'), 400);
            });
            minimizedTabsContainer.appendChild(tab);
        });
    });

    // Make terminals draggable
    terminals.forEach(terminal => {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const onMouseMove = (e) => {
            if (isDragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                terminal.style.left = `${initialLeft + dx}px`;
                terminal.style.top = `${initialTop + dy}px`;
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        terminal.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('terminal-header')) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = terminal.getBoundingClientRect().left;
            initialTop = terminal.getBoundingClientRect().top;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });
});
