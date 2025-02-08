document.addEventListener("DOMContentLoaded", function () {
    const projects = [
        { name: "Snake", url: "Snake/index.html" },
        // Add more projects here
    ];

    const projectList = document.getElementById("project-list");

    projects.forEach(project => {
        const li = document.createElement("li");
        const a = document.createElement("a");

        a.href = project.url;
        a.textContent = project.name;
        a.classList.add(
            "block", "bg-blue-500", "text-white", "px-6", "py-4", 
            "rounded-lg", "shadow-md", "hover:shadow-lg", "transition",
            "text-lg", "font-semibold", "text-center"
        );

        li.appendChild(a);
        projectList.appendChild(li);
    });
});
