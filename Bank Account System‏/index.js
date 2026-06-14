class BankAccount {
    #balance;

    constructor(ownerName, initialBalance) {
        this.ownerName = ownerName;
        this.#balance = initialBalance;
    }

    deposit(amount) {
        if (amount <= 0) {
            console.log("Invalid deposit amount.");
            return;
        }

        this.#balance += amount;
        console.log(`Deposited ${amount}.`);
    }

    withdraw(amount) {
        if (amount <= 0) {
            console.log("Invalid withdrawal amount.");
            return;
        }

        if (amount > this.#balance) {
            console.log("Insufficient funds.");
            return;
        }

        this.#balance -= amount;
        console.log(`Withdrew ${amount}.`);
    }

    getBalance() {
        return this.#balance;
    }
}

const account = new BankAccount("Ali", 100);

console.log("Initial Balance:", account.getBalance());





account.withdraw(150);
console.log("Balance:", account.getBalance());


account.deposit(50);
console.log("Balance:", account.getBalance());

account.deposit(-20);
console.log("Balance:", account.getBalance());

account.withdraw(70);
console.log("Balance:", account.getBalance());

account.balance = -1000;

console.log("After direct manipulation attempt:");
console.log("Balance:", account.getBalance()); 
console.log(account.balance); 