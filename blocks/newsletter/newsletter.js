import {
  getSignInToken,
  performMonolithGraphQLQuery,
} from "../../scripts/commerce.js";

const newsletterSubscrioptionMutation = `
mutation(
  $email: String!
) {
  subscribeEmailToNewsletter(email: $email) {
    status
  }
}
`;

export default function decorate(block) {
  // Create form elements
  const inputTextElement = createInputElement({
    name: "Enter your email address",
    id: "newsletter-email",
    type: "text",
    className: "newsletter-email",
    placeholder: "",
  });

  const labelElement = createLabelElement({
    for: "newsletter",
    id: "newsletter-email-label",
    text: "Enter your email address",
  });

  const buttonElement = createButtonElement({
    className: "button",
    type: "submit",
    text: "Subscribe",
  });

  // Create the wrapper divs
  inputTextElement.setAttribute("aria-labelledby", "newsletter-email-label");
  const textWrapper = createDivWrapper("text-wrapper", [
    inputTextElement,
    labelElement,
  ]);
  const submitWrapper = createDivWrapper("submit-wrapper", [buttonElement]);

  // Create form and append divs
  const formElement = document.createElement("form");
  formElement.id = "newsletter-form";
  formElement.append(textWrapper, submitWrapper);

  // Message container for error/success messages
  const messageContainer = document.createElement("div");
  messageContainer.id = "form-message";

  // Form submit event
  formElement.onsubmit = (e) => {
    e.preventDefault();
    const email = inputTextElement.value;

    if (validateEmail(email)) {
      proceedEmailSubscription(email);
    } else {
      showMessage("Please enter a valid email address!", "error");
    }
  };

  async function proceedEmailSubscription(email) {
    buttonElement.disabled = true;
    buttonElement.innerHTML = "In Progress ...";
    const token = getSignInToken();

    try {
      ({ data, errors } = await performMonolithGraphQLQuery(
        newsletterSubscrioptionMutation,
        { email: email },
        false,
        token
      ));
      if (data && data?.subscribeEmailToNewsletter?.status) {
        formElement.reset();
        showMessage("Thank you for your subscription.!", "success");
      } else if (errors && errors.message) {
        showMessage(errors.message, "error");
      }
    } catch (err) {
      console.error(err);
      showMessage(
        "Oops! Something went wrong. Please try again later.",
        "error"
      );
    } finally {
      resetNewsletterForm();
    }
  }

  function resetNewsletterForm() {
    buttonElement.disabled = false;
    buttonElement.innerHTML = "Subscribe";
  }

  /** Helper function to create input element */
  function createInputElement({ name, id, type, className, placeholder }) {
    const input = document.createElement("input");
    input.name = name;
    input.id = id;
    input.type = type;
    input.className = className;
    input.placeholder = placeholder;
    return input;
  }

  /** Helper function to create label element */
  function createLabelElement({ for: htmlFor, id, text }) {
    const label = document.createElement("label");
    label.htmlFor = htmlFor;
    label.id = id;
    label.innerHTML = text;
    return label;
  }

  /** Helper function to create button element */
  function createButtonElement({ className, type, text }) {
    const button = document.createElement("button");
    button.className = className;
    button.type = type;
    button.innerHTML = text;
    return button;
  }

  /** Helper function to create div wrapper */
  function createDivWrapper(className, children) {
    const wrapper = document.createElement("div");
    wrapper.className = `field-wrapper ${className}`;
    children.forEach((child) => wrapper.appendChild(child));
    return wrapper;
  }

  /** Function to validate email */
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /** Function to show message (error or success) */
  function showMessage(message, type) {
    messageContainer.className =
      type === "error" ? "form-error" : "form-success";
    messageContainer.innerHTML = message;
  }

  // Empty the block and append the form
  block.textContent = "";
  block.append(formElement);
  block.append(messageContainer);
}
