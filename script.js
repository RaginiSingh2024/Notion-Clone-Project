// script.js
// Dropdown toggle functionality for header navigation
// Enables click-to-open dropdowns with arrow rotation, and closes when clicking elsewhere.

document.addEventListener('DOMContentLoaded', () => {
  const dropdownLinks = document.querySelectorAll('.nav-item.dropdown > .nav-link');

  // Helper to close all open dropdowns
  const closeAllDropdowns = () => {
    document.querySelectorAll('.dropdown-megamenu.show').forEach(menu => menu.classList.remove('show'));
    document.querySelectorAll('.arrow.up').forEach(arrow => arrow.classList.remove('up'));
  };

  dropdownLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();

      const dropdownItem = link.parentElement; // .nav-item.dropdown
      const menu = dropdownItem.querySelector('.dropdown-megamenu');
      const arrow = link.querySelector('.arrow');
      const isOpen = menu.classList.contains('show');

      // Close any other open dropdowns first
      closeAllDropdowns();

      // Toggle the clicked dropdown
      if (!isOpen) {
        menu.classList.add('show');
        arrow.classList.add('up');
      }
    });
  });

  // Close dropdowns when clicking outside the nav
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav')) {
      closeAllDropdowns();
    }
  });
});