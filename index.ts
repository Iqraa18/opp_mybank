#! /urs/bin/env node
import { faker } from "@faker-js/faker";
import chalk from "chalk";
import inquirer from "inquirer";

class Customer {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  mobNumber: number;
  accNumber: number;

  constructor(fName: string, lName: string, age: number, gender: string, mob: number, acc: number) {
    this.firstName = fName;
    this.lastName = lName;
    this.age = age;
    this.gender = gender;
    this.mobNumber = mob;
    this.accNumber = acc;
  }
}

interface BankAccount {
  accNumber: number;
  balance: number;
}

class Bank {
  customers: Customer[] = [];
  accounts: BankAccount[] = [];

  addCustomer(customer: Customer) {
    this.customers.push(customer);
  }

  addAccount(account: BankAccount) {
    this.accounts.push(account);
  }

  updateAccount(account: BankAccount) {
    const index = this.accounts.findIndex(acc => acc.accNumber === account.accNumber);
    if (index !== -1) {
      this.accounts[index] = account;
    } else {
      this.accounts.push(account);
    }
  }

  findAccount(accNumber: number): BankAccount | undefined {
    return this.accounts.find(account => account.accNumber === accNumber);
  }

  findCustomer(accNumber: number): Customer | undefined {
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

async function bankService(bank: Bank) {
  const { select: service } = await inquirer.prompt<{ select: string }>({
    type: "list",
    name: "select",
    message: "Please Select the Service",
    choices: ["View Balance", "Cash Withdraw", "Cash Deposit"],
  });

  const { num: accountNumberStr } = await inquirer.prompt<{ num: string }>({
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
      console.log(
        `Dear ${chalk.green.italic(customer.firstName)} ${chalk.green.italic(
          customer.lastName
        )}, your Account Balance is ${chalk.bold.blueBright(`$${account.balance}`)}`
      );
      break;

    case "Cash Withdraw":
      const { rupee: withdrawAmount } = await inquirer.prompt<{ rupee: number }>({
        type: "number",
        message: "Please Enter your Amount:",
        name: "rupee",
      });

      if (withdrawAmount > account.balance) {
        console.log(chalk.red.bold("Insufficient Balance!!!"));
      } else {
        const newBalance = account.balance - withdrawAmount;
        bank.updateAccount({ accNumber: account.accNumber, balance: newBalance });
        console.log(
          chalk.green.bold(`Transaction Successful! Your new balance is: ${chalk.blueBright(`$${newBalance}`)}`)
        );
      }
      break;

    case "Cash Deposit":
      const { rupee: depositAmount } = await inquirer.prompt<{ rupee: number }>({
        type: "number",
        message: "Please Enter your Amount:",
        name: "rupee",
      });

      const newBalance = account.balance + depositAmount;
      bank.updateAccount({ accNumber: account.accNumber, balance: newBalance });
      console.log(
        chalk.green.bold(`Transaction Successful! Your new balance is: ${chalk.blueBright(`$${newBalance}`)}`)
      );
      break;

    default:
      console.log(chalk.red.bold("Invalid service selected"));
  }
}

bankService(myBank);
