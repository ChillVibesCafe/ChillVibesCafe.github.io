const projects = [
    {
      title: "SuperPIP",
      description: "A powerful Python package installer interface.",
      icon: "fas fa-rocket",
      link: "https://github.com/ChillVibesCafe/SuperPIP"
    },
    {
      title: "Catbox Uploader",
      description: "Easily upload files to Catbox with a single click.",
      icon: "fas fa-upload",
      link: "https://github.com/ChillVibesCafe/Catbox-File-Uploader"
    },
    {
      title: "Games",
      description: "Browser games and game dev experiments.",
      icon: "fas fa-gamepad",
      link: "games.html"
    }
  ];
  
  const projectList = document.getElementById("project-list");
  
  projects.forEach(project => {
    const card = document.createElement("a");
    card.href = project.link;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.className = "block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition hover:-translate-y-1";
  
    card.innerHTML = `
      <div class="flex items-center space-x-4">
        <i class="${project.icon} text-2xl text-blue-500"></i>
        <div>
          <h3 class="text-xl font-bold">${project.title}</h3>
          <p class="text-sm text-gray-600">${project.description}</p>
        </div>
      </div>
    `;
  
    projectList.appendChild(card);
  });
  