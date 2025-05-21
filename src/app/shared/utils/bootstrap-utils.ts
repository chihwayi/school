export function initBootstrapDropdowns() {
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function (this: HTMLElement, e) {
      e.preventDefault();
      e.stopPropagation();

      const parent = this.closest('.dropdown');
      const dropdownMenu = parent?.querySelector('.dropdown-menu');

      if (!dropdownMenu) return;

      if (dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
      } else {
        // Close all other open dropdowns
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          menu.classList.remove('show');
        });

        dropdownMenu.classList.add('show');
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function () {
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
      menu.classList.remove('show');
    });
  });
}
