window.addEventListener("scroll", function () {
    const nav = document.querySelector("nav");

    if (window.scrollY > 50) {
        nav.classList.add("scrolled");
    } else {
        nav.classList.remove("scrolled");
    }
});

// Typing Effect
const text = "Endless possibilities";
let index = 0;

function typeEffect() {
    const heading = document.querySelector(".left h1");

    if (heading && index < text.length) {
        heading.innerHTML += text.charAt(index);
        index++;
        setTimeout(typeEffect, 70);
    }
}

typeEffect();

// Mouse Glow
const glow = document.querySelector(".mouse-glow");

document.addEventListener("mousemove", (e) => {
    if (glow) {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
    }
});

// Reveal Animation
function reveal() {
    let reveals = document.querySelectorAll(".reveal");

    reveals.forEach((el) => {
        let windowHeight = window.innerHeight;
        let top = el.getBoundingClientRect().top;

        if (top < windowHeight - 100) {
            el.classList.add("active");
        }
    });
}

window.addEventListener("scroll", reveal);
reveal();

// Show Register Form
function showRegister() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
}

// Show Login Form
function showLogin() {
    document.getElementById("register-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
}

// Register Function
const API = "https://student-management-system-ht84.onrender.com";
async function register() {
    try {
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch(`${API}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.text();

        alert(data);

        if (data.includes("Successfully")) {
            showLogin();
        }

    } catch (error) {
        console.log(error);
        alert("Register Failed");
    }
}

// Login Function
async function login() {
    try {
        console.log("Login started");

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const response = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.text();

        console.log(data);

        if (data.includes("eyJ")) {
            localStorage.setItem("token", data);
            alert("Login Success");
            window.location.href = "dashboard.html";
        } else {
            alert(data);
        }

    } catch (error) {
        console.log(error);
        alert("Login Failed");
    }
}
function scrollToLogin() {
    const login = document.getElementById("login-section");

    login.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    login.style.transition = "0.5s";

    login.style.boxShadow = "0 0 40px #00c6ff";

    setTimeout(() => {
        login.style.boxShadow = "";
    }, 1500);
}
