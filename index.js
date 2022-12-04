
const display = document.querySelector('#display');
const keys = document.querySelector('.keys');
const operators = document.querySelectorAll('.operator');
const cleared = document.querySelector('#clear');


let firstOperand,
    operatorValue,
    secondOperand = null,
    tempOperand = null,
    tempOperator,
    result = 0,
    holder,
    isNegative = false,
    wasEqualed = false;



keys.addEventListener('click', e => {
    let value = e.target.value;
    let buttonId = e.target.id;
    let buttonClass = e.target.className;

    if (buttonClass === 'number') currentNumber(+value)
    else if (buttonClass === 'operator') currentOperator(value)
    else if (buttonId === 'equals') equals();
    else if (buttonId === 'decimal') decimal();
    else if (buttonId === 'percent') percent();
    else if (buttonId === 'negative') negative();
    else if (buttonId === 'clear') cleared.innerText === 'C' ? clear() : clearAll();
    e.target.blur()
})


document.addEventListener('keyup', e => {
    let value = e.key;
    if (/[0-9]/.test(value)) currentNumber(+value);
    else if (/[-+/*]/.test(value)) currentOperator(value);
    else if (value === 'Equal' || value === 'Enter') equals();
    else if (value === '.') decimal();
    else if (value === '%') percent();
    else if (value === 'Backspace') clear();
    else if (value === 'Delete') clearAll();
})


function calculate(operand1, operator, operand2) {

    switch (operator) {
        case '-':
            result = operand1 - operand2;
            break;
        case '+':
            result = +operand1 + +operand2;
            break;
        case '/':
            result = operand1 / operand2;
            break;
        case '*':
            result = operand1 * operand2;
    }

    result = Math.round(parseFloat(result) * Math.pow(10, 10)) / Math.pow(10, 10);
    display.innerHTML = format(result);
    return result;
}


function format(num) {
    num = +num;

    if ((num <= 999999999 && num >= -999999999) || num.toString().replace(/[-\.]/g, '').length < 10) {

        num = num.toLocaleString('en-US', { maximumSignificantDigits: 10, maximumFractionDigits: 8, minimumFractionDigits: 8 });
    } else if (num.toExponential().toString().length > 7) num = num.toExponential(5)

    else num = num.toExponential();

    if (num.toString().replace(/[-\.]/g, '').length >= 8) display.style.fontSize = '3.5rem';
    return num;
}


function currentNumber(num) {
    display.style.fontSize = '4rem'
    cleared.innerText = 'C';

    if (wasEqualed === true && !operatorValue) firstOperand = null;

    if (!operatorValue || (operatorValue && !firstOperand)) {
        firstOperand = operands(firstOperand, num);
        operatorValue = '';
    } 

    else if (tempOperator) tempOperand = operands(tempOperand, num);

    else secondOperand = operands(secondOperand, num);
    wasEqualed = false;
}


function operands(operand, value) {
    if (operand && operand.toString().replace(/[-\.]/g, '').length >= 7) display.style.fontSize = '3.5rem';
    if (operand && operand.toString().replace(/[-\.]/g, '').length >= 9) {
        console.log('should just return')
        return operand;
    }
    let result = operand ? operand + '' + value : value;
    result = (isNegative && result > 0) ? -result : result;
    if (format(result) === '0' || format(result) === '-0') display.innerHTML = result;
    else display.innerHTML = format(result);
    return result;
}


function finalResult(operator) {
    firstOperand ??= 0;
    holder = calculate(firstOperand, operatorValue, secondOperand);
    clearAll();
    firstOperand = holder;
    operatorValue = operator;
    display.innerHTML = format(firstOperand);
}


function currentOperator(operator) {
    isNegative = false;
    if (!secondOperand) operatorValue = operator;
    else if (secondOperand && (/[-+]/.test(operator) || /[\*\/]/.test(operatorValue))) {
        if (tempOperand) {
            secondOperand = calculate(secondOperand, tempOperator, tempOperand)
        }
        finalResult(operator);
    } else if (secondOperand && tempOperand) {
        secondOperand = calculate(secondOperand, tempOperator, tempOperand);
        tempOperand = '';
        tempOperator = operator;
    } else if (!tempOperand) {
        tempOperator = operator;
    };
}


function equals() {
    cleared.innerText = 'AC'
    if (!secondOperand && secondOperand != '0' && operatorValue) calculate(firstOperand, operatorValue, firstOperand);
    if (tempOperand) secondOperand = calculate(secondOperand, tempOperator, tempOperand);
    operatorValue && finalResult(operatorValue);
    operatorValue = '';
    wasEqualed = true;
}


function addDecimal(num) {
    if (num) { if ((num.toString().includes('.') && !wasEqualed) || num.toString().replace(/[-\.]/g, '').length >= 9) return num; }
    if (wasEqualed) num = null
    num ??= 0;
    num += '.';
    num = isNegative ? `-${num}` : `${num}`
    display.innerHTML = `${Object.is(num, -0) ? '-0.' : format(num) == 0 ? num : format(num)} `;
    wasEqualed = false;
    return num
}


function decimal() {
    if (!operatorValue) firstOperand = addDecimal(firstOperand);
    else if (!tempOperator) secondOperand = addDecimal(secondOperand);
    else tempOperand = addDecimal(tempOperand);   
}


function percent() {
  wasEqualed = false;
    if (!tempOperand && (operatorValue === '+' || operatorValue === '-')) {
        secondOperand = calculate(firstOperand, '*', (calculate(secondOperand, '/', 100)));
        display.innerText = secondOperand;
    } else if (tempOperand) {
        tempOperand = calculate(tempOperand, '/', 100);
        display.innerText = tempOperand;
    } else if (secondOperand) {
        secondOperand = calculate(secondOperand, '/', 100);
        display.innerText = secondOperand;
    } else {
        firstOperand = calculate(firstOperand, '/', 100);
        display.innerText = firstOperand;
    }
}


function negative() {
  wasEqualed = false;
    if (!operatorValue) firstOperand = negOrPos(firstOperand);
    else if (!tempOperator) secondOperand = negOrPos(secondOperand);
    else tempOperand = negOrPos(tempOperand);
}


function negOrPos(num) {
    num ??= 0;
    isNegative = isNegative ? false : true;
    num = -(num);
    display.innerHTML = `${Object.is(num, -0) ? '-0' : format(num)} `;
    wasEqualed = false;
    return num;
}

function clear() {
    display.style.fontSize = '4rem'
    if (tempOperand) {
        tempOperand = null;
    } else if (secondOperand) {
        secondOperand = null;

        cleared.innerText = 'AC';
    } else {
        firstOperand = null;
        cleared.innerText = 'AC';
    }
    display.innerText = '0';
}


function clearAll() {
    display.style.fontSize = '4rem'
    cleared.innerHTML = 'AC';
    firstOperand = null;
    secondOperand = null;
    tempOperand = null;
    operatorValue = '';
    tempOperator = '';
    display.innerHTML = 0;
    isNegative = false;
    hasDecimal = false;
    wasEqualed = false;
}
