document.addEventListener("DOMContentLoaded", function () {
    const projects = [
        { name: "Snake", url: "snake/index.html" },
        // Add more projects here
    ];

    const projectList = document.getElementById("project-list");

    projects.forEach(project => {
        const li = document.createElement("li");
        li.innerHTML = `
            <a href="${project.url}" class="block bg-blue-500 dark:bg-blue-700 text-white px-6 py-4 rounded-lg shadow-md hover:shadow-lg transition">
                <i class="fas fa-gamepad mr-2"></i> ${project.name}
            </a>
        `;
        projectList.appendChild(li);
    });

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById("darkModeToggle");

    function updateDarkMode() {
        if (localStorage.getItem("darkMode") === "enabled") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }

    darkModeToggle.addEventListener("click", () => {
        if (document.documentElement.classList.contains("dark")) {
            localStorage.setItem("darkMode", "disabled");
        } else {
            localStorage.setItem("darkMode", "enabled");
        }
        updateDarkMode();
    });

    updateDarkMode();
});
