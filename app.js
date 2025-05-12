import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// References to HTML elements
const form = document.getElementById('todo-form');
const todoList = document.getElementById('todo-list');

// Firestore collection reference
const todosCollection = collection(db, 'todos');

let isEditMode = false;
let editTodoId = null;

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('todo-name').value.trim();
  const description = document.getElementById('todo-description').value.trim();
  const link = document.getElementById('todo-link').value.trim();
  const dueDate = document.getElementById('todo-due-date').value;
  const status = document.getElementById('todo-status').value;

  if (!name || !description || !dueDate || !status) {
    alert('Please fill in all required fields.');
    return;
  }

  try {
    if (isEditMode && editTodoId) {
      const todoRef = doc(db, 'todos', editTodoId);
      await updateDoc(todoRef, {
        name,
        description,
        link: link || null,
        dueDate,
        status
      });
    } else {
      await addDoc(todosCollection, {
        name,
        description,
        link: link || null,
        createdAt: serverTimestamp(),
        dueDate,
        status
      });
    }

    // Reset form and state after submission
    form.reset();
    isEditMode = false;
    editTodoId = null;
    form.querySelector('button[type="submit"]').textContent = 'Add ToDo';

    loadTodos();
  } catch (error) {
    console.error("Error saving todo: ", error);
  }
});

// Load and display ToDos
async function loadTodos() {
  todoList.innerHTML = '';
  try {
    const querySnapshot = await getDocs(todosCollection);
    querySnapshot.forEach((docSnap) => {
      const todo = docSnap.data();
      const id = docSnap.id;

      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${todo.name}</strong> - ${todo.status}<br/>
        ${todo.description}<br/>
        ${todo.link ? `<a href="${todo.link}" target="_blank">More Info</a><br/>` : ''}
        <small>Due: ${todo.dueDate}</small><br/>
        <button class="edit-btn" data-id="${id}">Edit</button>
        <button class="delete-btn" data-id="${id}">Delete</button>
        <hr/>
      `;
      todoList.appendChild(li);
    });

    // Attach delete event listeners
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.getAttribute('data-id');
        try {
          await deleteDoc(doc(db, 'todos', id));
          loadTodos(); // Refresh list
        } catch (error) {
          console.error('Error deleting todo:', error);
        }
      });
    });

    // Attach edit event listeners
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        const todoDoc = querySnapshot.docs.find(d => d.id === id).data();

        document.getElementById('todo-name').value = todoDoc.name;
        document.getElementById('todo-description').value = todoDoc.description;
        document.getElementById('todo-link').value = todoDoc.link || '';
        document.getElementById('todo-due-date').value = todoDoc.dueDate;
        document.getElementById('todo-status').value = todoDoc.status;

        isEditMode = true;
        editTodoId = id;
        form.querySelector('button[type="submit"]').textContent = 'Update ToDo';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

  } catch (error) {
    console.error("Error loading todos: ", error);
  }
}

// Initial load
loadTodos();
