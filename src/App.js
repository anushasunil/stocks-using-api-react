import { useRef, useState } from "react";
import "./styles.css";

export default function App() {
  var [statement, setStatement] = useState("");
  var [price, setPrice] = useState("");
  var bestMatches = {};
  var [currency, setCurrency] = useState("");
  var initialPrice = useRef("");
  var quantity = useRef("");
  var companySymbol = "";
  var globalQuoteJson = {};

  function getOptionList(name) {
    if (name === "") {
      setStatement("Enter a Name");
    } else {
      console.log(name);
      var url =
        "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" +
        name +
        "&apikey=MNHIILFQYDKQ97DT";
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          console.log("this is the bestmatches json", json);
          bestMatches = json["bestMatches"];
          console.log("this is bestmatches json", bestMatches);
          getDropDownList(bestMatches, name);
        });
    }
  }

  function getDropDownList(json, name) {
    if (json[0] !== json["Note"]) {
      Object.keys(json).map((x) => {
        var opt = document.createElement("option");
        opt.value = json[x]["2. name"];
        var element = document.getElementById("stockName");
        element.appendChild(opt);
      });
      console.log("get drop name ", name);
      getCurrentPrice(name);
    } else {
      console.log("limit exceeded");
    }
  }

  function getCurrentPrice(companyName) {
    if (companyName !== "") {
      console.log(bestMatches);

      Object.keys(bestMatches).map((x) => {
        if (companyName === bestMatches[x]["2. name"]) {
          setCurrency(bestMatches[x]["8. currency"]);
          companySymbol = bestMatches[x]["1. symbol"];
        }
      });
      console.log(
        "company ",
        companyName,
        "currency ",
        currency,
        "symbol ",
        companySymbol
      );

      var url =
        "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" +
        companySymbol +
        "&apikey=LTLP02A360UTW9WY";
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          globalQuoteJson = json;
          console.log("this is globaljson", globalQuoteJson);

          if (companySymbol !== "") {
            console.log("company symbol ", companySymbol);
            if (!globalQuoteJson["Note"]) {
              setPrice(globalQuoteJson["Global Quote"]["05. price"]);
            } else {
              setStatement("limit exceeded");
              setCurrency("");
              setPrice("");
            }
          }
        });
    }
  }

  function clickHandler() {
    var initial = Number(initialPrice.current.value);
    var stockQuantity = Number(quantity.current.value);
    if (initial && price && stockQuantity) {
      console.log(initial && price && stockQuantity);
      calculateProfitOrLoss(initial, price, stockQuantity);
    } else {
      setStatement("please fill all the fields");
    }
  }

  function calculateProfitOrLoss(initial, current, quantity) {
    console.log("initial", initial, current, quantity);
    if (initial > current) {
      var loss = (initial - current) * quantity;
      var lossPercentage = (loss / initial).toFixed(2);
      changeBackground("loss");

      setStatement(
        "The loss is  ₹ " + loss.toFixed(2) + " and " + lossPercentage + "% 😥"
      );
    } else if (current > initial) {
      var profit = (current - initial) * quantity;
      var profitPercentage = ((profit / (initial * quantity)) * 100).toFixed(2);
      changeBackground("profit");

      setStatement(
        "The profit is  ₹ " +
          profit.toFixed(2) +
          " and " +
          profitPercentage +
          "% 😃"
      );
    } else {
      changeBackground("");
      setStatement("No gain No pain 🙂");
    }
  }
  function changeBackground(status) {
    if (status === "loss") {
      document.getElementById("App").style.backgroundColor = "#990000";
      paintIt("white");
    } else if (status === "profit") {
      document.getElementById("App").style.backgroundColor = "#134d00";
      paintIt("white");
    } else {
      document.getElementById("App").style.backgroundColor = "cornsilk";
      paintIt("black");
    }
    document.getElementById("App").style.borderColor = "white";
  }

  function paintIt(colorName) {
    document.getElementById("App").style.borderColor = colorName;

    document.getElementById("heading").style.color = colorName;
    document.getElementById("subtitle").style.color = colorName;
    document.getElementById("output").style.color = colorName;

    document.getElementById("initial-currency").style.color = colorName;
    document.getElementById("current-currency").style.color = colorName;

    document.getElementById("labelStockName").style.color = colorName;
    document.getElementById("labelInitialPrice").style.color = colorName;
    document.getElementById("labelQuantity").style.color = colorName;
    document.getElementById("labelCurrentPrice").style.color = colorName;
  }

  return (
    <div id="App">
      <h1 id="heading">Stocks Prediction</h1>
      <p id="subtitle">Using API</p>

      <label id="labelStockName">Stock Name:</label>
      <input
        list="stockName"
        type="text"
        name="stock-name"
        className="stock-name"
        onChange={(e) => getOptionList(e.target.value)}
      />
      <datalist id="stockName"></datalist>
      <label id="labelInitialPrice">Initial Price</label>
      <span id="initial-currency"> in {currency}</span>
      <input
        type="number"
        name="initial-price"
        className="initial-price"
        ref={initialPrice}
      />
      <label id="labelQuantity">Quantity</label>
      <input
        type="number"
        name="quantity"
        className="quantity"
        ref={quantity}
      />
      <label id="labelCurrentPrice">Current Price</label>
      <span id="current-currency"> in {currency}</span>
      {/* <textarea
        type="number"
        name="current-price"
        className="current-price"
      ></textarea> */}
      <input value={price} readOnly />
      <button className="btn-check" onClick={() => clickHandler()}>
        Check
      </button>
      <h3 id="output">{statement}</h3>
    </div>
  );
}
