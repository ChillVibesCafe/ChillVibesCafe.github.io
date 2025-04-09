document.addEventListener("DOMContentLoaded", function () {
    const projects = [
      {
        name: "Snake",
        url: "Snake/index.html",
        description: "Classic snake game.",
        icon: "fas fa-ghost"
      },
      {
        name: "Breakout",
        url: "Breakout/index.html",
        description: "Brick-breaking fun.",
        icon: "fas fa-layer-group"
      },
      {
        name: "Push The Button",
        url: "Button/ptb.html",
        description: "You literally just push a button... or do you?",
        icon: "fas fa-hand-pointer"
      },
      {
        name: "Plinko",
        url: "PlinkoIdle/index.html",
        description: "This one kinda sucks.",
        icon: "fas fa-coins"
      }
      // Add more games with the same structure if needed
    ];
  
    const projectList = document.getElementById("project-list");
  
    projects.forEach(project => {
      const card = document.createElement("a");
      card.href = project.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.className = "block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition hover:-translate-y-1";
  
      card.innerHTML = `
        <div class="flex items-center space-x-4">
          <i class="${project.icon} text-2xl text-green-500"></i>
          <div>
            <h3 class="text-xl font-bold">${project.name}</h3>
            <p class="text-sm text-gray-600">${project.description}</p>
          </div>
        </div>
      `;
  
      projectList.appendChild(card);
    });
  });
  