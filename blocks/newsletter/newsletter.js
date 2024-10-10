import { createOptimizedPicture } from "../../scripts/aem.js";

export default function decorate(block) {
  /* change to ul, li */

  const formElement = document.createElement("form");
  const inputTextELment = document.createElement("input");
  const buttonElement = document.createElement("button");

  // form.method = "POST";
  // form.action = "login.php";

  inputTextELment.value = "";
  inputTextELment.name = "email";

  buttonElement.innerHTML = "Submit";

  formElement.appendChild(inputTextELment);
  formElement.appendChild(buttonElement);

  block.innerHTML(formElement);
}
