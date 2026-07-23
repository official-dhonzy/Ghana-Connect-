function go(page){

alert(
"Ghana Connect: " + page + " section coming soon"
);

}


function search(){

let text=document.getElementById("search").value;

alert(
"You searched for: " + text
);

}
// Android back button support
window.addEventListener("popstate", function () {
  if (window.history.length > 1) {
    history.back();
  }
});

// Create browser history when moving pages
function goBack() {
  if (history.length > 1) {
    history.back();
  } else {
    window.location.href = "index.html";
  }
}
