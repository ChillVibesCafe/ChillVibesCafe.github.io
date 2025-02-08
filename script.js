document.addEventListener("DOMContentLoaded", function () {
    const projects = [
        { name: "Snake", url: "Snake/index.html" },
        { name: "Project 2", url: "project2/index.html" },
        // Add more projects here
    ];

    const projectList = document.getElementById("project-list");

    projects.forEach(project => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = project.url;
        a.textContent = project.name;
        li.appendChild(a);
        projectList.appendChild(li);
    });
});
