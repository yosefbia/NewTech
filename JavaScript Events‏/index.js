// Task 1 - Like Button

let likes = 0;

const likeBtn = document.getElementById("likeBtn");
const resetBtn = document.getElementById("resetBtn");
const likeCount = document.getElementById("likeCount");

likeBtn.addEventListener("click", () => {
    likes++;
    likeCount.textContent = `Likes: ${likes}`;
});

resetBtn.addEventListener("click", () => {
    likes = 0;
    likeCount.textContent = "Likes: 0";
});

// Task 2 - Greeter




const nameInput = document.getElementById("nameInput");
const greetBtn = document.getElementById("greetBtn");
const greetMsg = document.getElementById("greetMsg");

greetBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();

    if (name) {
        greetMsg.textContent = `Hello, ${name}!`;
    } else {
        greetMsg.textContent = "Please enter your name first.";
    }

    nameInput.value = "";
    nameInput.focus();
});

// Task 3 - Live Mirror



const liveInput = document.getElementById("liveInput");
const liveOutput = document.getElementById("liveOutput");

liveInput.addEventListener("input", () => {
    const text = liveInput.value;

    if (text === "") {
        liveOutput.textContent = "Waiting...";
    } else {
        liveOutput.textContent = text;
    }

    if (text.length > 20) {
        liveOutput.classList.add("long");
    } else {
        liveOutput.classList.remove("long");
    }
});

// Task 4 - Key Logger



const keyInput = document.getElementById("keyInput");
const keyLog = document.getElementById("keyLog");

keyInput.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {
        keyInput.value = "";
        keyLog.textContent = "";
        return;
    }

    const keys = [];

    if (e.ctrlKey) keys.push("Ctrl");
    if (e.shiftKey) keys.push("Shift");
    if (e.altKey) keys.push("Alt");

    keys.push(e.key);

    keyLog.textContent = keys.join(" + ");
});

// Task 5 - Event Delegation



const taskList = document.getElementById("taskList");

taskList.addEventListener("click", (e) => {

    if (e.target.tagName === "LI") {

        if (e.target.style.textDecoration === "line-through") {
            e.target.style.textDecoration = "none";
        } else {
            e.target.style.textDecoration = "line-through";
        }

    }

});

taskList.addEventListener("dblclick", (e) => {

    if (e.target.tagName === "LI") {
        e.target.remove();
    }

});


// Task 6 - Smart Form


const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

contactForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const form = e.target;

    const email = form.emailInput.value.trim();
    const subject = form.subjectInput.value.trim();

    if (!email || !subject) {

        formStatus.textContent = "Please fill in all fields.";
        formStatus.style.color = "red";

    } else {

        formStatus.textContent = `Message sent to ${email}!`;
        formStatus.style.color = "green";

        form.emailInput.value = "";
        form.subjectInput.value = "";
    }

});