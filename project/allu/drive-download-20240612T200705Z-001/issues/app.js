// app.js

// Function to determine the type based on the file name
function getTypeFromFileName() {
  const path = window.location.pathname;
  const fileName = path.split("/").pop().split(".")[0];
  const types = {
    Electrical: "Electrical",
    Faculty: "Faculty",
    Fan: "Fan",
    Light: "Light",
    Projector: "Projector",
    Sanitary: "Sanitary",
    Washroom: "Washroom",
    Water: "Water",
  };
  return types[fileName] || "Unknown";
}

// Function to fetch data from the API
async function fetchData(type) {
  const apiUrl = "http://54.172.1.133:5000/data/getdata";
  const body = JSON.stringify({ type: type });

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    displayData(data);
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

// Function to update the resolved status
async function updateResolvedStatus(id) {
  const apiUrl = "http://54.172.1.133:5000/data/resolved";
  const body = JSON.stringify({ id: id });

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    // Update the UI after successful API call
    fetchData(getTypeFromFileName());
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

// Function to create a button for the resolved status
function createResolvedButton(item) {
  const button = document.createElement("button");
  button.textContent = item.resolved ? "True" : "False";
  button.classList.add(item.resolved ? "true" : "false");
  button.addEventListener("click", () => {
    updateResolvedStatus(item.id);
  });
  return button;
}

// Function to display fetched data in a table
function displayData(data) {
  const dataContainer = document.getElementById("api-data");
  dataContainer.innerHTML = ""; // Clear previous content
  const table = document.createElement("table");
  const headerRow = document.createElement("tr");

  const headers = ["ID", "Query", "Resolved", "Type"];
  headers.forEach((headerText) => {
    const header = document.createElement("th");
    header.textContent = headerText;
    headerRow.appendChild(header);
  });
  table.appendChild(headerRow);

  data.forEach((item) => {
    const row = document.createElement("tr");
    const idCell = document.createElement("td");
    idCell.textContent = item.id;
    row.appendChild(idCell);

    const queryCell = document.createElement("td");
    queryCell.textContent = item.query;
    row.appendChild(queryCell);

    const resolvedCell = document.createElement("td");
    resolvedCell.appendChild(createResolvedButton(item));
    row.appendChild(resolvedCell);

    const typeCell = document.createElement("td");
    typeCell.textContent = item.type;
    row.appendChild(typeCell);

    table.appendChild(row);
  });

  dataContainer.appendChild(table);
}

// Call fetchData when the window loads with the correct type
window.addEventListener("load", () => {
  const type = getTypeFromFileName();
  fetchData(type);
});
