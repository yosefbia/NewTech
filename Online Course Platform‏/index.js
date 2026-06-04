class Course {
  constructor(title, instructor, maxStudents) {
    this.title = title;
    this.instructor = instructor;
    this.maxStudents = maxStudents;
    this.enrolledStudents = 0;
  }

  enrollStudent() {
    if (this.enrolledStudents < this.maxStudents) {
      this.enrolledStudents++;
    }
  }
}

// Create course instances
const course1 = new Course("JavaScript Basics", "Dania", 30);
const course2 = new Course("Python Fundamentals", "Mohammad", 25);

// Enroll students in course1
course1.enrollStudent();
course1.enrollStudent();
course1.enrollStudent();

// Enroll students in course2
course2.enrollStudent();
course2.enrollStudent();

// Print course data
console.log("Course 1:");
console.log(course1);

console.log("Course 2:");
console.log(course2);