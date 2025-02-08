document.addEventListener("DOMContentLoaded", function () {
    const projects = [
        { name: "Snake", url: "snake/index.html" },
        // Add more projects here
    ];

    const projectList = document.getElementById("project-list");

    projects.forEach(project => {
        const li = document.createElement("li");
        li.innerHTML = `
            <a href="${project.url}" class="block bg-blue-500 text-white px-6 py-4 rounded-lg shadow-md hover:shadow-lg transition">
                <i class="fas fa-gamepad mr-2"></i> ${project.name}
            </a>
        `;
        projectList.appendChild(li);
    });
});
