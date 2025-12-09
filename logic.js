const btn = document.getElementById("generateBtn");

function generateOdd() {
    let min = 5;
    let max = 20;
    return (Math.random() * (max - min) + min).toFixed(2) + "x";
}

function currentTime() {
    return new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
}

function analyze() {
    btn.disabled = true;
    btn.innerText = "ANALYZING...";

    let oddIds = ["o1","o2","o3","o4"];
    let timeIds = ["t1","t2","t3","t4"];

    oddIds.forEach(id => document.getElementById(id).innerText = "--");
    timeIds.forEach(id => document.getElementById(id).innerText = "--");

    setTimeout(() => {
        for (let i = 0; i < 4; i++) {
            document.getElementById(oddIds[i]).innerText = generateOdd();
            document.getElementById(timeIds[i]).innerText = currentTime();
        }

        btn.disabled = false;
        btn.innerText = "GENERATE";

    }, 3000);
}

btn.addEventListener("click", analyze);
