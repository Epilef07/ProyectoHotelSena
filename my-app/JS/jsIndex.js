document.addEventListener("DOMContentLoaded", function() {
    const selected = document.querySelector(".select-selected");
    const items = document.querySelector(".select-items");
    
    selected.addEventListener("click", function() {
        items.style.display = items.style.display === "block" ? "none" : "block";
    });

    items.querySelectorAll("div").forEach(item => {
        item.addEventListener("click", function() {
            selected.innerHTML = this.innerHTML;
            selected.setAttribute("data-value", this.getAttribute("data-value"));
            items.style.display = "none";
        });
    });

    document.addEventListener("click", function(event) {
        if (!event.target.matches('.select-selected')) {
            items.style.display = "none";
        }
    });
});