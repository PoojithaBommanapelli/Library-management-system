document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/books"); // Fetch books from API
        const books = await response.json();
        const bookList = document.getElementById("bookList");

        books.forEach(book => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.genre}</td>
                <td>${book.publication_year}</td>
                <td>
                    <button onclick="openEditModal(${book.id}, '${book.title}', '${book.author}', '${book.genre}', ${book.publication_year})">Edit</button>
                    <button onclick="deleteBook(${book.id})">Delete</button>
                </td>
            `;
            bookList.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading books:", error);
    }
});

// ✅ Open Modal & Fill Form with Book Data
function openEditModal(id, title, author, genre, year) {
    document.getElementById("editBookId").value = id;
    document.getElementById("editTitle").value = title;
    document.getElementById("editAuthor").value = author;
    document.getElementById("editGenre").value = genre;
    document.getElementById("editYear").value = year;
    document.getElementById("updateModal").style.display = "block";
}

// ✅ Close Modal
function closeModal() {
    document.getElementById("updateModal").style.display = "none";
}

// ✅ Handle Book Update
document.getElementById("updateBookForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const bookId = document.getElementById("editBookId").value;
    const updatedData = {
        title: document.getElementById("editTitle").value,
        author: document.getElementById("editAuthor").value,
        genre: document.getElementById("editGenre").value,
        publication_year: document.getElementById("editYear").value
    };

    try {
        const response = await fetch(`/update-book/${bookId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();
        alert(data.message || "Book updated!");
        location.reload();
    } catch (error) {
        console.error("Error updating book:", error);
        alert("Failed to update book.");
    }
});

// ✅ Handle Book Deletion
async function deleteBook(bookId) {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
        const response = await fetch(`/delete-book/${bookId}`, {
            method: "DELETE"
        });

        const data = await response.json();
        alert(data.message || "Book deleted!");
        location.reload();
    } catch (error) {
        console.error("Error deleting book:", error);
        alert("Failed to delete book.");
    }
}
