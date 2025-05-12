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
const loader = document.getElementById('loader');
const toast = document.getElementById('toast');

const todosCollection = collection(db, 'todos');

let isEditMode = false;
let editTodoId = null;

// Show toast
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Highlight invalid fields
function highlightInvalidFields(fields) {
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
      el.style.borderColor = 'red';
    } else {
      el.style.borderColor = '#ccc';
    }
  });
}

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('todo-name').value.trim();
  const description = document.getElementById('todo-description').value.trim();
  const link = document.getElementById('todo-link').value.trim();
  const dueDate = document.getElementById('todo-due-date').value;
  const status = document.getElementById('todo-status').value;

  if (!name || !description || !dueDate || !status) {
    highlightInvalidFields(['todo-name', 'todo-description', 'todo-due-date', 'todo-status']);
    showToast('Please fill in all required fields.', 'error');
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
      showToast('ToDo updated!', 'success');
    } else {
      await addDoc(todosCollection, {
        name,
        description,
        link: link || null,
        createdAt: serverTimestamp(),
        dueDate,
        status
      });
      showToast('ToDo added!', 'success');
    }

    form.reset();
    isEditMode = false;
    editTodoId = null;
    form.querySelector('button[type="submit"]').textContent = 'Add ToDo';

    loadTodos();
  } catch (error) {
    console.error("Error saving todo: ", error);
    showToast('Error saving ToDo.', 'error');
  }
});

// Load and display ToDos
async function loadTodos() {
  todoList.innerHTML = '';
  loader.classList.remove('hidden');

  try {
    const querySnapshot = await getDocs(todosCollection);

    if (querySnapshot.empty) {
      todoList.innerHTML = '<p style="text-align:center;color:#777;">No ToDos yet. Add one above!</p>';
    } else {
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

      // Delete listeners
      const deleteButtons = document.querySelectorAll('.delete-btn');
      deleteButtons.forEach(button => {
        button.addEventListener('click', async () => {
          const id = button.getAttribute('data-id');
          try {
            await deleteDoc(doc(db, 'todos', id));
            showToast('ToDo deleted!', 'success');
            loadTodos();
          } catch (error) {
            console.error('Error deleting todo:', error);
            showToast('Error deleting ToDo.', 'error');
          }
        });
      });

      // Edit listeners
      const editButtons = document.querySelectorAll('.edit-btn');
      editButtons.forEach(button => {
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
    }
  } catch (error) {
    console.error("Error loading todos: ", error);
    todoList.innerHTML = '<p style="color:red;">Failed to load todos.</p>';
    showToast('Error loading ToDos.', 'error');
  }

  loader.classList.add('hidden');
}

// Initial load
loadTodos();
