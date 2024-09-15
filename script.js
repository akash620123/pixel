const mobileMenuButton = document.querySelector(".mobile-menu-button");
const mobileMenu = document.querySelector(".mobile-menu");

mobileMenuButton.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

const accessKey = "z7J_LEA4q9fRKfWjH-HaTtVVLE0CLSPt-3o_cP-GctA";
const apiUrl = "https://api.unsplash.com/photos"; // updated apiUrl
const gridGallery = document.getElementsByClassName("grid-gallery")[0]; // assuming you have only one grid gallery
let currentPage = 1; // keep track of the current page
let searchQuery = ""; // keep track of the search query
let imageCount = 0; // keep track of the image count

document.getElementById("search").addEventListener("click", () => {
  searchQuery = document.getElementById("search-input").value.trim();

  if (searchQuery === "") {
    alert("Please enter a search query");
    return;
  }

  currentPage = 1; // reset current page
  gridGallery.innerHTML = ""; // reset inner HTML of gridGallery
  imageCount = 0; // reset image count

  fetchImages();
});

window.addEventListener("scroll", () => {
  if (isBottomOfPage()) {
    currentPage++; // increment current page
    fetchImages();
  }
});

function isBottomOfPage() {
  return window.innerHeight + window.scrollY >= document.body.offsetHeight;
}

let retryCount = 0;
const maxRetries = 5;
const retryDelay = 1000; // 1 second

function fetchImages() {
  const url = searchQuery
    ? `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=20&page=${currentPage}&client_id=${accessKey}`
    : `https://api.unsplash.com/photos?per_page=20&page=${currentPage}&client_id=${accessKey}`;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else if (response.status === 429) {
        // Rate Limit Exceeded
        retryCount++;
        if (retryCount <= maxRetries) {
          console.log(`Rate limit exceeded. Retrying in ${retryDelay}ms...`);
          setTimeout(() => {
            fetchImages(); // retry after delay
          }, retryDelay);
          retryDelay *= 2; // exponential backoff
          return Promise.reject("Rate limit exceeded");
        } else {
          console.error("Maximum retries exceeded. Giving up.");
          return Promise.reject("Error fetching images");
        }
      } else {
        return Promise.reject("Error fetching images");
      }
    })
    .then((data) => {
      if (searchQuery) {
        data = data.results;
      }

      if (imageCount < 40) {
        data.forEach((photoData) => {
          const photoUrl = photoData.urls.regular;
          const downloadUrl = photoData.links.download;

          const imageElement = document.createElement("img");
          imageElement.src = photoUrl;
          imageElement.alt = photoData.alt_description;
          imageElement.classList.add("w-full", "h-full", "object-cover", "rounded-md", "md:w-1/2", "lg:w-1/3", "xl:w-1/4");
          imageElement.classList.add("grid-item", "relative"); // add relative class to image element
          imageElement.style.width = "500px";
          imageElement.style.height = "100%";
          imageElement.style.objectFit = "cover";

          const downloadLink = document.createElement("a");
          downloadLink.href = downloadUrl;
          downloadLink.download = `${photoData.id}.jpg`;
          downloadLink.innerHTML = "Download";
          downloadLink.addEventListener("click", (event) => {
            const downloadAnchor = document.createElement("a");
            downloadAnchor.href = downloadUrl;
            downloadAnchor.download = `${photoData.id}.jpg`;
            downloadAnchor.click(); // Trigger the download
            event.preventDefault(); // Prevent the default link behavior
          });

          const downloadButtonContainer = document.createElement("div");
          downloadButtonContainer.classList.add("absolute", "bottom-4", "right-4", "flex", "justify-center"); // add styles to download button container
          downloadButtonContainer.appendChild(downloadLink);

          const imageContainer = document.createElement("div");
          imageContainer.style.position = "relative"; // add relative positioning
          imageContainer.appendChild(imageElement);
          imageContainer.appendChild(downloadButtonContainer);

          gridGallery.appendChild(imageContainer);
          imageCount++; // increment the image count
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

document.addEventListener("DOMContentLoaded", fetchImages);