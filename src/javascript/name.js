function saveName(){
    let inputDoc = document.getElementById("name-input");
    localStorage.setItem("Name", inputDoc.value);
}
