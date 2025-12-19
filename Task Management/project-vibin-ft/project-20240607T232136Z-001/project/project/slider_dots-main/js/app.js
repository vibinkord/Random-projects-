// Function to get the filename from the URL
function getFilename() {
  const path = window.location.pathname;
  const page = path.split("/").pop();
  return page.split(".")[0];
}

// Function to handle form submission
async function submitForm(event) {
  event.preventDefault();
  const query = document.getElementById("query").value;
  const type = getFilename();

  const data = {
    type: type,
    query: query,
  };

  try {
    const response = await fetch("http://127.0.0.1:5000/data/adddata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Your response has been submitted");
      // Redirect to login page
      window.location.href = "../homepage.html";
    } else {
      alert("Error submitting your response");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error submitting your response");
  }
}
