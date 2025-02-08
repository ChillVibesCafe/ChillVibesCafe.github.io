document.addEventListener("DOMContentLoaded", function () {
    const projects = [
        { name: "Project 1", url: "project1/index.html" },
        { name: "Project 2", url: "project2/index.html" },
        // Add more projects here
    ];

    const projectList = document.getElementById("project-list");

    projects.forEach(project => {
        const li = document.createElement("li");
        li.innerHTML = `
            <a href="${project.url}" class="block bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-6 py-4 rounded-lg shadow-md hover:shadow-lg transition">
                <i class="fas fa-folder-open mr-2"></i> ${project.name}
            </a>
        `;
        projectList.appendChild(li);
    });

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById("darkModeToggle");
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("darkMode", document.body.classList.contains("dark") ? "enabled" : "disabled");
    });

    // Load Dark Mode preference
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark");
    }
});
