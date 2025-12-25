"use strict";

// DOM Elements
const $expr = document.getElementById("expression");
const $res = document.getElementById("result");
const $keys = document.getElementById("keys");

// Calculator State
const state = {
  firstOperand: null,
  secondOperand: null,
  operator: null,
  displayInput: "0",
  isAfterEquals: false,
  hasError: false,
};

// Utility Functions
const isInErrorState = () => state.hasError || state.displayInput === "Error";

const formatNumber = (n) => {
  if (!Number.isFinite(n)) return "Error";
  const rounded = Math.round((n + Number.EPSILON) * 1e12) / 1e12;
  return String(rounded);
};

const getCurrentNumber = () => {
  if (state.displayInput === "." || state.displayInput === "-.") return 0;
  return Number(state.displayInput);
};

// Display Management
const updateDisplay = () => {
  const parts = [];
  if (state.firstOperand !== null) parts.push(formatNumber(state.firstOperand));
  if (state.operator) parts.push(state.operator);
  if (state.secondOperand !== null && !state.isAfterEquals) parts.push(formatNumber(state.secondOperand));

  $expr.textContent = parts.join(" ");
  $res.textContent = state.displayInput;
};

// Clear and Reset Functions
const clearCalculator = () => {
  state.firstOperand = null;
  state.secondOperand = null;
  state.operator = null;
  state.displayInput = "0";
  state.isAfterEquals = false;
  state.hasError = false;
  updateDisplay();
};

const resetForNewInput = () => {
  if (isInErrorState() || state.isAfterEquals) {
    state.firstOperand = null;
    state.secondOperand = null;
    state.operator = null;
    state.displayInput = "0";
    state.isAfterEquals = false;
    state.hasError = false;
  }
};

// Input Operations
const addDigit = (digit) => {
  resetForNewInput();
  
  if (state.displayInput === "0") {
    state.displayInput = digit;
  } else if (state.displayInput === "-0") {
    state.displayInput = "-" + digit;
  } else {
    state.displayInput += digit;
  }
  
  updateDisplay();
};

const addDecimal = () => {
  resetForNewInput();
  
  if (!state.displayInput.includes(".")) {
    state.displayInput += ".";
  }
  updateDisplay();
};

const toggleSign = () => {
  if (isInErrorState()) return;
  
  if (state.displayInput === "0" || state.displayInput === "0.") return;
  
  if (state.displayInput.startsWith("-")) {
    state.displayInput = state.displayInput.slice(1);
  } else {
    state.displayInput = "-" + state.displayInput;
  }
  
  updateDisplay();
};

const handleBackspace = () => {
  if (isInErrorState()) return;
  if (state.isAfterEquals) return;
  
  if (state.displayInput.length <= 1 || (state.displayInput.length === 2 && state.displayInput.startsWith("-"))) {
    state.displayInput = "0";
  } else {
    state.displayInput = state.displayInput.slice(0, -1);
    if (state.displayInput === "-") state.displayInput = "0";
  }
  
  updateDisplay();
};

// Calculation Functions
const performCalculation = (a, op, b) => {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
    default: return NaN;
  }
};

const selectOperator = (op) => {
  if (isInErrorState()) return;
  
  const num = getCurrentNumber();
  
  if (state.isAfterEquals) {
    state.isAfterEquals = false;
    state.secondOperand = null;
  }
  
  if (state.firstOperand === null) {
    state.firstOperand = num;
    state.operator = op;
    state.displayInput = "0";
    updateDisplay();
    return;
  }
  
  if (state.operator && state.displayInput !== "0") {
    state.secondOperand = num;
    const result = performCalculation(state.firstOperand, state.operator, state.secondOperand);
    
    if (!Number.isFinite(result)) {
      state.displayInput = "Error";
      state.hasError = true;
      state.firstOperand = null;
      state.secondOperand = null;
      state.operator = null;
      updateDisplay();
      return;
    }
    
    state.firstOperand = result;
    state.secondOperand = null;
    state.operator = op;
    state.displayInput = "0";
    updateDisplay();
    return;
  }
  
  state.operator = op;
  updateDisplay();
};

const calculateEquals = () => {
  if (isInErrorState()) return;
  if (state.operator === null || state.firstOperand === null) return;
  
  const num = getCurrentNumber();
  const b = state.isAfterEquals ? (state.secondOperand ?? num) : num;
  
  const result = performCalculation(state.firstOperand, state.operator, b);
  
  if (!Number.isFinite(result)) {
    state.displayInput = "Error";
    state.hasError = true;
    state.firstOperand = null;
    state.secondOperand = null;
    state.operator = null;
    updateDisplay();
    return;
  }
  
  state.secondOperand = b;
  state.firstOperand = result;
  state.displayInput = formatNumber(result);
  state.isAfterEquals = true;
  updateDisplay();
};

// Event Listeners
$keys.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.digit) addDigit(btn.dataset.digit);
  else if (btn.dataset.op) selectOperator(btn.dataset.op);
  else if (btn.dataset.action === "dot") addDecimal();
  else if (btn.dataset.action === "clear") clearCalculator();
  else if (btn.dataset.action === "backspace") handleBackspace();
  else if (btn.dataset.action === "sign") toggleSign();
  else if (btn.dataset.action === "equals") calculateEquals();
});

document.addEventListener("keydown", (e) => {
  const k = e.key;

  if (k >= "0" && k <= "9") return addDigit(k);
  if (k === ".") return addDecimal();
  if (k === "Enter" || k === "=") { e.preventDefault(); return calculateEquals(); }
  if (k === "Backspace" || k === "Delete") return handleBackspace();
  if (k === "Escape") return clearCalculator();

  if (k === "+" || k === "-" || k === "*" || k === "/") return selectOperator(k);
});

clearCalculator();
