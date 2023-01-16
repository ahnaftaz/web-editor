import transpile from '../transpiler';

const makeExecutionCode = async (input: string) => {
  let transpiledCode =`const print = (string) => {
    const output = JSON.stringify(string);
    if (output == undefined || !output) {
      throw new Error("Please use react rendering for JSX components");
    }
    const para = document.createElement("p");
    const node = document.createTextNode(output);
    para.appendChild(node);
    const element = document.getElementById("root");
    element.appendChild(para);
  }
  `;
  transpiledCode += await transpile(input);
  return transpiledCode
};

export default makeExecutionCode;
