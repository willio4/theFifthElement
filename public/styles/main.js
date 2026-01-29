const button = document.getElementById('dig-deeper-btn');
const text = document.getElementById('modal-text');
let statement = null;

if(button) {
  console.log("button visible");
  button.addEventListener("click", async () => {
    console.log("button pressed...");
    if(statement===null) {
      console.log("statement null...");
      try {
        console.log("contacting api...");
        const response = await fetch("/api/dig-deeper");
        if (!response.ok) throw new Error("Network response was not ok");
        console.log("api responded...");
        statement = await response.json();
      } catch (err) {
        console.error("Error calling server:", err);
      }
    }
    console.log("statement shown...");
    text.textContent = statement.text;
  })
}



    // try {
    //   const response = await fetch("/api/dig-deeper");
    //   if (!response.ok) throw new Error("Network response was not ok");
    //   const data = await response.json();
    //   console.log(data);
    //   alert(data.text); 
    // } catch (err) {
    //   console.error("Error calling server:", err);
    // }