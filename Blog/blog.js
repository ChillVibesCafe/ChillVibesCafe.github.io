function openPost(path) {
    fetch(path)
      .then(res => res.text())
      .then(html => {
        document.getElementById('modalContent').innerHTML = html;
        document.getElementById('modalOverlay').style.display = 'flex';
      });
  }
  
  function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('modalContent').innerHTML = '';
  }
  