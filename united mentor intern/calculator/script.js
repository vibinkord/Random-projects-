

    const display = document.getElementById("display");

    function appendValue(val) {
      display.value += val;
    }

    function clearDisplay() {
      display.value = "";
    }

    function deleteLast() {
      display.value = display.value.slice(0, -1);
    }

    function calculate() {
      try {
        display.value = eval(display.value.replace(/[^-()\d/*+.]/g, ''));
      } catch {
        display.value = "Error";
      }
    }

    document.addEventListener("keydown", function (e) {
      const key = e.key;

      if ((key >= "0" && key <= "9") || "+-*/.".includes(key)) {
        appendValue(key);
      } else if (key === "Enter") {
        e.preventDefault();
        calculate();
      } else if (key === "Backspace") {
        deleteLast();
      } else if (key.toLowerCase() === "c") {
        clearDisplay();
      }
    });