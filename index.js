#! /urs/bin/env node
import { faker } from "@faker-js/faker";
import chalk from "chalk";
import inquirer from "inquirer";
class Customer {
    firstName;
    lastName;
    age;
    gender;
    mobNumber;
    accNumber;
    constructor(fName, lName, age, gender, mob, acc) {
        this.firstName = fName;
        this.lastName = lName;
        this.age = age;
        this.gender = gender;
        this.mobNumber = mob;
        this.accNumber = acc;
    }
}
class Bank {
    customers = [];
    accounts = [];
    addCustomer(customer) {
        this.customers.push(customer);
    }
    addAccount(account) {
        this.accounts.push(account);
    }
    updateAccount(account) {
        const index = this.accounts.findIndex(acc => acc.accNumber === account.accNumber);
        if (index !== -1) {
            this.accounts[index] = account;
        }
        else {
            this.accounts.push(account);
        }
    }
    findAccount(accNumber) {
        return this.accounts.find(account => account.accNumber === accNumber);
    }
    findCustomer(accNumber) {
        return this.customers.find(customer => customer.accNumber === accNumber);
    }
}
const myBank = new Bank();
for (let i = 1; i <= 3; i++) {
    const fName = faker.person.firstName("male");
    const lName = faker.person.lastName();
    const num = parseInt(faker.phone.number("3#########"));
    const customer = new Customer(fName, lName, 25 + i, "male", num, 1000 + i);
    myBank.addCustomer(customer);
    myBank.addAccount({ accNumber: customer.accNumber, balance: 100 * i });
}
async function bankService(bank) {
    const { select: service } = await inquirer.prompt({
        type: "list",
        name: "select",
        message: "Please Select the Service",
        choices: ["View Balance", "Cash Withdraw", "Cash Deposit"],
    });
    const { num: accountNumberStr } = await inquirer.prompt({
        type: "input",
        name: "num",
        message: "Please Enter Your Account Number:",
        validate: (input) => /^\d+$/.test(input) || "Account number must be a valid number.",
    });
    const accountNumber = parseInt(accountNumberStr);
    const account = bank.findAccount(accountNumber);
    if (!account) {
        console.log(chalk.red.bold.italic("Invalid Account Number"));
        return;
    }
    const customer = bank.findCustomer(accountNumber);
    if (!customer) {
        console.log(chalk.red.bold.italic("Customer not found for this account number"));
        return;
    }
    switch (service) {
        case "View Balance":
            console.log(`Dear ${chalk.green.italic(customer.firstName)} ${chalk.green.italic(customer.lastName)}, your Account Balance is ${chalk.bold.blueBright(`$${account.balance}`)}`);
            break;
        case "Cash Withdraw":
            const { rupee: withdrawAmount } = await inquirer.prompt({
                type: "number",
                message: "Please Enter your Amount:",
                name: "rupee",
            });
            if (withdrawAmount > account.balance) {
                console.log(chalk.red.bold("Insufficient Balance!!!"));
            }
            else {
                const newBalance = account.balance - withdrawAmount;
                bank.updateAccount({ accNumber: account.accNumber, balance: newBalance });
                console.log(chalk.green.bold(`Transaction Successful! Your new balance is: ${chalk.blueBright(`$${newBalance}`)}`));
            }
            break;
        case "Cash Deposit":
            const { rupee: depositAmount } = await inquirer.prompt({
                type: "number",
                message: "Please Enter your Amount:",
                name: "rupee",
            });
            const newBalance = account.balance + depositAmount;
            bank.updateAccount({ accNumber: account.accNumber, balance: newBalance });
            console.log(chalk.green.bold(`Transaction Successful! Your new balance is: ${chalk.blueBright(`$${newBalance}`)}`));
            break;
        default:
            console.log(chalk.red.bold("Invalid service selected"));
    }
}
bankService(myBank);
