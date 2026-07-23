function go(page){

  window.location.href = page + ".html";

}


function search(){

  let text = document.getElementById("search").value;

  alert(
    "You searched for: " + text
  );

}


// Back button support
function goBack(){

  if(history.length > 1){

    history.back();

  } else {

    window.location.href = "index.html";

  }

}


// Browser navigation support
window.addEventListener("popstate", function(){

  console.log("Going back");

});
