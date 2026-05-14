//Q1
let students = ["Dania", "Omar", "Lina","Rami"];

//Q2
students.push("Sara");

//Q3
students.unshift("Adam");

//Q4 
students[3] = "Lamar";

//Q5
let removedLast = students.pop();

//Q6
let removedFirst = students.shift();
console.log("removed first");

//Q7
let hasRami = students.includes("Rami");


//Q8
let omarIndex = students.indexOf("Omar");

//Q9 
let groupA = students.slice(0, 2);

//Q10
let groupB = ["Nour", "Tala"];
let allGroups = groupA.concat(groupB);

//Q11
let groupString = allGroups.join(" | ");

//Q12
students.sort();

//Q13
students.reverse();

//Q14
let seats = [1, 2, 3, 4, 5];
let reservedSeats = seats.splice(1, 3, "Reserved", "Reserved", "Reserved");


//Q15
let studentsString= students.toString();


console.log(students);
console.log(groupString);
console.log(seats);