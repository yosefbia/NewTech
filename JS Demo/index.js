
//Q1
// Number
// String
// Boolean
// Undefined
// object
// object


//Q2
// 1firstName cannot start with a number
// my-age cannot use -
// score is const so you cannot change their value
// let cannot be used as a variable name because it is a reserved keyword

// Q3
// let name = "Yosef";
// let age = 30;
// let grade = "A+";
// let isPassed = true;
// console.log(`Student: ${name}, Age: ${age}, got grade: ${grade}, Passed: ${isPassed}`);


// Q4
// const msg = "I love javascript programming";
// console.log(msg.length);
// console.log(msg.toUpperCase());
// console.log(msg.slice(7, 17));
// if (msg.includes("love")) {
//     console.log(true);
// }

// // Q5
// true
// false
// true
// false
// true
// true
// false

// Q6
// let a = 5;
// let b = 10;
// a = a + b;//15
// b = a - b;//5
// a = a - b;//10
// console.log(`a: ${a}, b: ${b}`);

// Q7
//true
//false
//false
//true
//false
// false
//false
//false
//false

// // Q8
// console.log(2 + 3 * 4);//14
// console.log((2 + 3) * 4);//20
// console.log(2 ** 3 * 2);//16
// console.log(10 % 3 + 1);//2
// console.log(5 + 3 > 7 && 4 !== 5);//true

// Q9
// console.log(true && "hello");//hello
// console.log(false && "hello");//false
// console.log(0 || "default");//default
// console.log("value" || "default");//value
// console.log(null ?? "fallback");//fallback

// Q10

// let price = 120;
// let quantity = 3;
// let discountPercent = 10;
// let subtotal = price * quantity;
// let discountAmount = subtotal * discountPercent / 100;
// let finalTotal = subtotal - discountAmount;
// console.log(`Subtotal: ${subtotal}  Discount: ${discountAmount} Total: ${finalTotal}`);


// Q11
// let isOdd= true;
// let num = 17;
// let x = num
// x= num % 2 == 1;
// console.log(` ${num} Is odd? ${x}`);

// Q12
// x += 5;

// x*= 2;

// x-= 3;

// x**= 2;

// x%=7;

// Q13

// let weight = 70;
// let height = 1.75;
// let bmi = weight / (height ** 2);
// bmi = bmi.toFixed(1);
// console.log(`BMI: ${bmi}`);


//Q14
// let isLoggedIn = true;
// let isAdmin = false;
// let age = 20;
// if (isLoggedIn && age >= 18) {
//     console.log("true");
// }
// if(isLoggedIn && !isAdmin){
//     console.log("false");
// }
// if(isLoggedIn || age >= 21){
//     console.log("true");
// }

// Q15
// let light= "yellow";
// if(light === "green"){
// console.log("Go");
// }
// else if(light === "yellow"){
//     console.log("Slow down");
// }
// else if(light === "red"){
//     console.log("Stop");
// }
// else{
//     console.log("Unknown signal");
// }

// Q16
// let age = 25;
// let isMember = true;
// if ( age >= 18 && isMember) {
//     console.log("Full access — welcome member!");
// }
// if (age >= 18 && !isMember) {
//     console.log("Guest access — consider joining");
// }
// if (age < 18 && isMember) {
//     console.log("Junior member access");
// }
// else if (age < 18 && !isMember) {
//     console.log("No access");
// }

// Q17
// 1
// let msg;
// let msg = 10 > 5 ? "yes" : "no";
// // 2
// // let fee;
// let fee = isMember ? 5 : 20;
// // 3
// // let label;
// let label = score >= 50 ? "pass" : "fail";

// Q18
// let month = 7;
// switch (month) {
//     case 12:
//     case 1:
//     case 2:
//         console.log("Winter");
//         break;
//     case 3:
//     case 4:
//     case 5:
//         console.log("Spring");
//         break;
//     case 6:
//     case 7:
//     case 8:
//         console.log("Summer");
//         break;
//     case 9:
//     case 10:
//     case 11:
//         console.log("Autumn");
//         break;}
 
// 


// Q19
// let n = 15;
// if (n % 3 == 0 && n % 5 == 0) {
//     console.log("FizzBuzz");
// } else if (n % 3 == 0) {
//     console.log("Fizz");
// } else if (n % 5 == 0) {
//     console.log("Buzz");
// } else {
//     console.log(n);
// }

// Q20
// let password = "Hello1!";
// if (password.length < 6) {
//     console.log("Weak");
// } else if (password.length >= 6 && password.length < 10) {
//     console.log("Medium");
// } else if (password.length >= 10) {
//     console.log("Strong");
// }

// Q21
// const x = 5;
// console.log(x > 3 && x < 10 ? "in range" : "out");//in range
// console.log(!!(0));//false
// console.log(!!("hello"));//true
// console.log(x === 5 || x === 10 ? "match" : "no");//match

//Q22
// let sum = 0;    
// for (let i = 1; i <= 100; i++) {
//     sum += i;
// }
// console.log(sum);

// Q23
// let num = 7;
// for (let i = 1; i <= 10; i++) {
//     console.log(`${num} x ${i} = ${num * i}`);
// }

// Q24
// let n = true;
// let x = 1;
// while (n) {
// if (x %6 == 0 && x % 8 == 0) {
//     console.log(x);
//     n = false;  
// }
// x++;
// }

// Q25
// for (let i = 1; i <= 30; i++) {
//     if (i % 3 == 0 && i % 5 == 0) {
//         console.log("FizzBuzz");
//     } else if (i % 3 == 0) {
//         console.log("Fizz");
//     } else if (i % 5 == 0) {
//         console.log("Buzz");
//     } else {
//         console.log(i);
//     }
// }

// Q26
// let rockets=5;
// for(let i=1; i<=rockets; i++){
//     console.log(` ${i}...`);
// }
// console.log("Blast off!");

// Q27
// for (let num = 2; num <= 50; num++) {
//     let isPrime = true;
//     for (let i = 2; i < num; i++) {
//         if (num % i === 0) {
//             isPrime = false;
//             break;
//         }
//     }
//     if (isPrime) {
//         console.log(num);
//     }
// }


// Q28
// for (let i = 1; i <= 5; i++) {
//     let row = "";
//     for (let j = 1; j <= i; j++) {
//         row += "* ";
//     }
//     console.log(row);
// }