import React, { useReducer } from "react";
import "./styles.css";
import DigitButton from "./DigitButton";
import OperationButton from "./OperationButton";

// Define action types for better readability and maintainability
export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR: "clear",
  DEL_DIGIT: "del-digit",
  EVALUATE: "evaluate",
};

// Reducer function to handle state transitions based on the dispatched actions
function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      // If the result is being overwritten, reset and start fresh
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit, // Set the first digit of the new operand
          overwrite: false, // Disable overwrite after the first digit
        };
      }
      // Prevent entering multiple leading zeros
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state;
      }
      // Prevent entering multiple decimals in the same number
      if (payload.digit === "." && state.currentOperand.includes(".")) {
        return state;
      }
      return {
        ...state,
        // Append the new digit to the current operand
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      };

    case ACTIONS.CHOOSE_OPERATION:
      // Ignore if no operands are available for an operation
      if (state.currentOperand == null && state.previousOperand == null) {
        return state;
      }

      // Allow switching the operation if an operation is already chosen
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        };
      }
      // If there’s only a current operand, move it to `previousOperand`
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        };
      }

      // If both operands exist, evaluate the result and chain the operation
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      };

    case ACTIONS.CLEAR:
      // Reset all state when AC (All Clear) is pressed
      return {};

    case ACTIONS.DEL_DIGIT:
      // If overwrite is active, clear the current operand
      if (state.overwrite)
        return {
          ...state,
          currentOperand: null,
          overwrite: false,
        };

      // If no current operand, do nothing
      if (state.currentOperand == null) return state;

      // If the current operand has only one digit, clear it
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null };
      }

      // Remove the last digit of the current operand
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1), // Slice off the last digit
      };

    case ACTIONS.EVALUATE:
      // Ensure all required fields (operands and operation) are available
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state;
      }
      return {
        ...state,
        overwrite: true, // Mark result to overwrite on next input
        previousOperand: null, // Clear the previous operand
        operation: null, // Clear the operation
        currentOperand: evaluate(state), // Set the evaluated result as the current operand
      };
    default:
      return state; // Default case to avoid errors
  }
}

// function to evaluate the current expression
function evaluate({ currentOperand, previousOperand, operation }) {
  // Convert string operands into a numbers
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);

  //validate the operands (numbers only)
  if (isNaN(prev) || isNaN(current)) {
    return "";
  }
  // Perform the calculation based on the chosen operation
  let compute = "";
  switch (operation) {
    case "+":
      compute = prev + current;
      break;
    case "-":
      compute = prev - current;
      break;
    case "*":
      compute = prev * current;
      break;
    case "/":
      compute = prev / current;
      break;
  }
  return compute.toString(); // Return the result as a string
}

//Built-in JavaScript Intl.NumberFormat function to format numbers with commas. it is a formatter for displaying large integers in a readable format
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
});

// function to format operands for display
function formatOperand(operand) {
  if (operand == null) return; // Return nothing if operand is null
  const [integer, decimal] = operand.split("."); // Split into integer and decimal parts using '.'
  // Format integers
  if (decimal == null) {
    return INTEGER_FORMATTER.format(integer);
  }
  // Format both integer and decimal
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`;
}

// Main App Component
function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    {}
  );// Initialize state with the reducer and dispatch function

  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="prevoius-operand">
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.CLEAR })}
      >
        AC
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.DEL_DIGIT })}>DEL</button>
      <OperationButton operation="/" dispatch={dispatch} />

      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />

      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />

      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />

      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
      >
        =
      </button>
    </div>
  );
}

export default App;
