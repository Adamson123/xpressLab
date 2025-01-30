const dataSpace = document.querySelector(".dataSpace");

(async () => {
    const response = await fetch("data.json");
    const data = await response.json();
    dataSpace.textContent = JSON.stringify(data, null, 2);
    console.log({ data });
})();
