#! /usr/bin/env node
import inquirer from 'inquirer';
import { faker } from '@faker-js/faker';
import chalk from 'chalk';
class Customer {
    constructor(fName, lName, age, gender, mobileNum, accNum) {
        this.fName = fName;
        this.lName = lName;
        this.age = age;
        this.gender = gender;
        this.mobileNum = mobileNum;
        this._accountNum = accNum;
    }
    get accNumber() {
        return this._accountNum;
    }
}
class Bank {
    constructor() {
        this._customer = [];
        this._account = [];
    }
    addCustomer(obj) {
        this._customer.push(obj);
    }
    addAccountNumber(obj) {
        this._account.push(obj);
    }
    transaction(accObj) {
        const newAccounts = this._account.filter((acc) => acc.accountNumber !== accObj.accountNumber);
        this._account = [...newAccounts, accObj];
    }
    get account() {
        return this._account;
    }
    get customer() {
        return this._customer;
    }
}
const hbl = new Bank();
for (let i = 1; i <= 3; i++) {
    let fName = faker.person.firstName('male');
    let lName = faker.person.lastName();
    let phoneNum = parseInt(faker.phone.number('3#########'));
    const customer = new Customer(fName, lName, 24 * i, 'male', phoneNum, 1000 + i);
    hbl.addCustomer(customer);
    hbl.addAccountNumber({
        accountNumber: customer.accNumber,
        balance: 1000 * i,
    });
}
async function promptForQuestions(questions) {
    const { usrResponse } = await inquirer.prompt(questions);
    return usrResponse;
}
function findAccountByNumber(accountNumber, accounts) {
    return accounts.find((acc) => acc.accountNumber == accountNumber);
}
const questions = [
    {
        type: 'input',
        name: 'usrResponse',
        message: 'Enter your account number:',
    },
];
const amountQues = [
    {
        type: 'number',
        name: 'usrResponse',
        message: 'Enter your amount:',
    },
];
async function bankService(bank) {
    do {
        const { select } = await inquirer.prompt({
            type: 'list',
            name: 'select',
            message: 'Select the service',
            choices: ['View Balance', 'Cash Withdraw', 'Cash Deposit'],
        });
        function invalidAccount() {
            console.log(`${chalk.red.italic.bold('Invalid Account Number')}`);
        }
        if (select === 'View Balance') {
            const usrResponse = await promptForQuestions(questions);
            let account = findAccountByNumber(usrResponse, hbl.account);
            if (account) {
                const name = hbl.customer.find((item) => item.accNumber === account?.accountNumber);
                console.log(`Dear ${chalk.green.italic(name?.fName)} ${chalk.green.italic(name?.lName)} your Account balance is ${chalk.bold.blueBright(`$${account.balance}`)}`);
            }
            else
                invalidAccount();
        }
        if (select === 'Cash Withdraw') {
            const usrResponse = await promptForQuestions(questions);
            const account = findAccountByNumber(usrResponse, hbl.account);
            if (account) {
                const usrResponse = await promptForQuestions(amountQues);
                if (usrResponse > account.balance) {
                    console.log(`${chalk.red.bold('Insufficient amount!')}`);
                }
                const newBalance = account.balance - usrResponse;
                bank.transaction({
                    accountNumber: account.accountNumber,
                    balance: newBalance,
                });
                // console.log(newBalance);
            }
            else
                invalidAccount();
        }
        if (select === 'Cash Deposit') {
            const usrResponse = await promptForQuestions(questions);
            const account = findAccountByNumber(usrResponse, hbl.account);
            if (account) {
                const usrResponse = await promptForQuestions(amountQues);
                const newBalance = account.accountNumber + usrResponse;
                bank.transaction({
                    accountNumber: account.accountNumber,
                    balance: newBalance,
                });
                console.log(newBalance);
            }
            else
                invalidAccount();
        }
    } while (true);
}
bankService(hbl);
