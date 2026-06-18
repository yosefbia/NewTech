//1 Create the Data
const menu = [
    {
        id: 1,
        name: "Pizza",
        category: "Food",
        price: 30,  
        available: true
    },
    {
        id: 2,
        name: "Burger", 
        category: "Food",
        price: 25,
        available: true
    },
    {
        id: 3,
        name: "Pasta",  
        category: "Food",
        price: 28,
        available: false
    },
    {
        id: 4,
        name: "Coke",
        category: "Drink",
        price: 10,
        available: true
    },
    {
        id: 5,
        name: "Water",
        category: "Drink",
        price: 5,
        available: true
    },
    {
        id: 6,
        name: "Juice",
        category: "Drink",
        price: 15,
        available: false
    },
    {
        id: 7,
        name: "Ice Cream",
        category: "Dessert",
        price: 12,
        available: true
    },
    {
        id: 8,
        name: "Cake",
        category: "Dessert",
        price: 20,
        available: false
    }
];




const customer = {
    name: "Yosef",
    budget: 120,
    isStudent: true
};


const order = [1, 3, 5];

//2 Display the Menu


function displayMenu() {
    menu.forEach(item => {
        const availability = item.available ? "Available" : "Not Available";
        console.log(`${item.id} - ${item.name} - ${item.category} - ${item.price} NIS - ${availability}`);
    });
}

// displayMenu();

function getAvailableItems(){
    menu.forEach(item => {
        if(item.available){
            console.log(`${item.id} - ${item.name} - ${item.category} - ${item.price} NIS - Available`);
        }
    });
}
// getAvailableItems();

function findItemById(id){
    const item = menu.find(item => item.id === id);
    if(item){
        const availability = item.available ? "Available" : "Not Available";
        console.log(`${item.id} - ${item.name} - ${item.category} - ${item.price} NIS - ${availability}`);
    } else {
        console.log(`Item with ID ${id} not found (:.`);
    }
}
//  findItemById(20);


//3 Order Logic
function getOrderItems(){
    const orderedItems = order.map(id => menu.find(item => item.id === id));
    return orderedItems;

}
//  console.log(getOrderItems());

function validateOrder(){
    for (const id of order) {
        const item = menu.find(item => item.id === id);

        if (!item) {
            console.log("This item does not exist.");
            return false;
        }

        if (item.available !== true) {
            console.log("Sorry, this item is currently not available.");
            return false;
        }
    }

    return true;
}

// console.log(validateOrder());


//4 Payment and Discount

function calculateTotal(showDetails = true){
    const total = order.reduce((sum, id) => {
        const item = menu.find(item => item.id === id);

        if (item) {
            if (showDetails) {
                console.log(`${item.name}: ${item.price}`);
            }

            return sum + item.price;
        }

        return sum;
    }, 0);

    if (showDetails) {
        console.log(`Total: ${total}`);
    }

    return total;
}

// calculateTotal();

function applyDiscount(){
    const originalTotal = calculateTotal(false);
    let discountPercentage = 0;

    if (customer.isStudent) {
        discountPercentage = 10;
    }

    if (originalTotal > 100 && 15 > discountPercentage) {
        discountPercentage = 15;
    }

    if (originalTotal > 150 && 20 > discountPercentage) {
        discountPercentage = 20;
    }

    const discountAmount = originalTotal * discountPercentage / 100;
    const finalTotal = originalTotal - discountAmount;

    return {
        originalTotal: originalTotal,
        discountPercentage: discountPercentage,
        discountAmount: discountAmount,
        finalTotal: finalTotal
    };
}

// console.log(applyDiscount());

function canCustomerPay(){
    const discount = applyDiscount();
    return customer.budget >= discount.finalTotal;
}

// console.log(canCustomerPay());

//5 Print the Receipt

function printReceipt(){
    const restaurantName = "Ahmed Saeed Restaurant";
    const orderedItems = getOrderItems().filter(item => item);
    const discount = applyDiscount();
    const paymentStatus = canCustomerPay() ? "Paid Successfully" : "Not Enough Money";

    console.log("========== RECEIPT ==========");
    console.log(`Restaurant: ${restaurantName}`);
    console.log(`Customer: ${customer.name}`);
    console.log("Items:");

    orderedItems.forEach(item => {
        console.log(`- ${item.name}: ${item.price} NIS`);
    });

    console.log(`Original Total: ${discount.originalTotal} NIS`);
    console.log(`Discount: ${discount.discountPercentage}%`);
    console.log(`Discount Amount: ${discount.discountAmount} NIS`);
    console.log(`Final Total: ${discount.finalTotal} NIS`);
    console.log(`Customer Budget: ${customer.budget} NIS`);
    console.log(`Payment Status: ${paymentStatus}`);
    console.log("=============================");
}

//  printReceipt();


//6 Main Program Flow

// console.log("Full Menu:");
// displayMenu();

// console.log("Available Items:");
// getAvailableItems();

// console.log("Order Items:");
// console.log(getOrderItems());

// const isOrderValid = validateOrder();

// if (isOrderValid) {
//     calculateTotal();
//     console.log(applyDiscount());
//     console.log(canCustomerPay());
//     printReceipt();
// } else {
//     console.log("Order stopped. Please choose only items that exist and are available.");
// }







let a = 1;
{
    let b = 2;
    {
        let c = 3;
        console.log(a, b, c);

    }
        console.log(a, b);
}
console.log(a);
