const books = [
  {
    title: "The Hobbit",
    author: "Tolkien",
    year: 1937,
    rating: 4.7,
    genres: ["Fantasy"],
  },
  {
    title: "1984",
    author: "Orwell",
    year: 1949,
    rating: 4.8,
    genres: ["Dystopian", "Political Fiction"],
  },
  {
    title: "The Name of the Wind",
    author: "Rothfuss",
    year: 2007,
    rating: 4.5,
    genres: ["Fantasy", "Adventure"],
  },
  {
    title: "Brave New World",
    author: "Huxley",
    year: 1932,
    rating: 4.2,
    genres: ["Dystopian"],
  },
  {
    title: "Dune",
    author: "Herbert",
    year: 1965,
    rating: 4.6,
    genres: ["Science Fiction", "Adventure"],
  },
  {
    title: "Fahrenheit 451",
    author: "Bradbury",
    year: 1953,
    rating: 4.3,
    genres: ["Dystopian", "Science Fiction"],
  },
  {
    title: "The Road",
    author: "McCarthy",
    year: 2006,
    rating: 4.0,
    genres: ["Post-Apocalyptic"],
  },
  {
    title: "To Kill a Mockingbird",
    author: "Lee",
    year: 1960,
    rating: 4.9,
    genres: ["Classic", "Coming-of-Age"],
  },
];

//Q1
function getRecentBooks(books, afterYear) {
  const recentBooks = [];

  for (let i = 0; i < books.length; i++) {
    if (books[i].year >= afterYear) {
      recentBooks.push(books[i].title);
    }
  }

  return recentBooks;
}

//Q2
function getAverageRating(books) {
  let totalRating = 0;

  for (let i = 0; i < books.length; i++) {
    totalRating += books[i].rating;
  }

  return Number((totalRating / books.length).toFixed(2));
}

//Q3
function sortBooksBy(books, key, asc = true) {
  const sortedBooks = [];

  for (let i = 0; i < books.length; i++) {
    sortedBooks.push(books[i]);
  }

  for (let i = 0; i < sortedBooks.length; i++) {
    for (let j = 0; j < sortedBooks.length - 1; j++) {
      const shouldSwap = asc
        ? sortedBooks[j][key] > sortedBooks[j + 1][key]
        : sortedBooks[j][key] < sortedBooks[j + 1][key];

      if (shouldSwap) {
        const temp = sortedBooks[j];
        sortedBooks[j] = sortedBooks[j + 1];
        sortedBooks[j + 1] = temp;
      }
    }
  }

  return sortedBooks;
}

//Q4
function countGenres(books) {
  const genreCounts = {};

  for (let i = 0; i < books.length; i++) {
    for (let j = 0; j < books[i].genres.length; j++) {
      const genre = books[i].genres[j];

      if (genreCounts[genre] === undefined) {
        genreCounts[genre] = 1;
      } else {
        genreCounts[genre]++;
      }
    }
  }

  return genreCounts;
}

//Q5
function groupByAuthor(books) {
  const authors = {};

  for (let i = 0; i < books.length; i++) {
    const author = books[i].author;

    if (authors[author] === undefined) {
      authors[author] = [];
    }

    authors[author].push(books[i]);
  }

  return authors;
}

//Q6
function hasHighlyRated(books, threshold) {
  for (let i = 0; i < books.length; i++) {
    if (books[i].rating >= threshold) {
      return true;
    }
  }

  return false;
}

//Q7
function allBeforeYear(books, year) {
  for (let i = 0; i < books.length; i++) {
    if (books[i].year >= year) {
      return false;
    }
  }

  return true;
}

//Q8
function findByTitle(books, title) {
  for (let i = 0; i < books.length; i++) {
    if (books[i].title === title) {
      return books[i];
    }
  }

  return undefined;
}

console.log("Recent books:", getRecentBooks(books, 2000));
console.log("Average rating:", getAverageRating(books));
console.log("Books sorted by year:", sortBooksBy(books, "year"));
console.log("Genre counts:", countGenres(books));
console.log("Grouped by author:", groupByAuthor(books));
console.log("Has rating >= 4.8:", hasHighlyRated(books, 4.8));
console.log("All before 2010:", allBeforeYear(books, 2010));
console.log("Find 1984:", findByTitle(books, "1984"));
