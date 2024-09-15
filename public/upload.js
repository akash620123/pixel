const form = document.querySelector('label[for="image"]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', document.querySelector('#image').files[0]);
    fetch('/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.text())
      .then((message) => console.log(message))
      .catch((error) => console.error(error));
  });