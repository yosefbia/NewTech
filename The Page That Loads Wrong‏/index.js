const title = document.getElementById("mainTitle");
const features = document.querySelectorAll(".feature");
const description = document.querySelector(".description");

// Task 1
console.log(title.textContent);
console.log(description.innerHTML);

// Task 2
title.textContent = "Welcome to the Dashboard";
description.textContent = "Welcome! The dashboard is now ready to use.";
description.classList.remove("hidden");

// Task 3
title.classList.add("highlight");

// Task 4
features[2].remove();

// Task 5
const heading = document.createElement("h2");
heading.textContent = "Available Features";

const featureList = document.getElementById("features");
featureList.parentNode.insertBefore(heading, featureList);

// Task 6
const link = document.getElementById("mainLink");

console.log(link.getAttribute("href"));

link.setAttribute("href", "https://example.com");
link.textContent = "Go to Dashboard";