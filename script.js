document.addEventListener('DOMContentLoaded', () => {
  const employeeForm = document.getElementById('employeeForm');
  const employeeTable = document.getElementById('employeeTable').querySelector('tbody');
  const importButton = document.getElementById('importButton');
  const exportButton = document.getElementById('exportButton');
  const clearButton = document.getElementById('clearButton');
  const importFile = document.getElementById('importFile');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const passwordModal = document.getElementById('passwordModal');
  const passwordInput = document.getElementById('passwordInput');
  const confirmPassword = document.getElementById('confirmPassword');
  const closeModal = document.querySelector('.close');
  const darkModeButton = document.getElementById('darkModeButton');

  const rolesColors = {
    "Moto": "#f4cccc",
    "Pedestre": "#d9ead3",
    "Veículo": "#c9daf8",
    "Moto-Veículo": "#fce5cd",
    "Interno": "#d0e0e3",
    "Supervisor": "#ead1dc",
    "Gerente": "#ead1dc",
    "Administrativo": "#cfe2f3"
  };

  const requiredPassword = "27731";

  // Função para formatar a data no padrão dd/mm/aaaa
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Função para carregar dados do localStorage
  const loadEmployees = () => {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    employees.forEach(addEmployeeToTable);
  };

  // Função para salvar dados no localStorage
  const saveEmployees = () => {
    const rows = Array.from(employeeTable.rows).map(row => ({
      name: row.cells[0].textContent,
      startDate: row.cells[1].dataset.rawDate,
      endDate: row.cells[2].dataset.rawDate,
      role: row.cells[3].textContent,
      notes: row.cells[5].textContent
    }));
    localStorage.setItem('employees', JSON.stringify(rows));
  };

  // Função para adicionar funcionário à tabela
  const addEmployeeToTable = (employee) => {
    const row = employeeTable.insertRow();

    row.innerHTML = `
      <td>${employee.name}</td>
      <td data-raw-date="${employee.startDate}">${formatDate(employee.startDate)}</td>
      <td data-raw-date="${employee.endDate}">${formatDate(employee.endDate)}</td>
      <td>${employee.role}</td>
      <td></td>
      <td>${employee.notes}</td>
    `;

    row.style.backgroundColor = rolesColors[employee.role] || "#fff";

    // Calcular dias restantes
    const start = new Date(employee.startDate);
    const end = new Date(employee.endDate);
    const now = new Date();
    const daysToStart = Math.max(0, Math.ceil((start - now) / (1000 * 60 * 60 * 24)));
    const daysToEnd = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    row.cells[4].textContent = now > start ? `${daysToEnd} dias restantes para término` : `${daysToStart} dias para início`;
  };

  // Submissão do formulário
  employeeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const employee = {
      name: document.getElementById('name').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      role: document.getElementById('role').value,
      notes: document.getElementById('notes').value
    };

    addEmployeeToTable(employee);
    saveEmployees();
    employeeForm.reset();
  });

  // Botão de limpar
  clearButton.addEventListener('click', () => {
    showPasswordModal("clear");
  });

  // Botão de exportar
  exportButton.addEventListener('click', () => {
    showPasswordModal("export");
  });

  // Botão de importação
  importButton.addEventListener('click', () => {
    showPasswordModal("import");
  });

  // Função para exibir o modal de senha
  const showPasswordModal = (action) => {
    passwordModal.style.display = 'block';
    confirmPassword.dataset.action = action;
  };

  // Fechar modal
  closeModal.addEventListener('click', () => {
    passwordModal.style.display = 'none';
  });

  // Confirmar senha
  confirmPassword.addEventListener('click', () => {
    const action = confirmPassword.dataset.action;

    if (passwordInput.value === requiredPassword) {
      passwordModal.style.display = 'none';

      if (action === "export") {
        const data = localStorage.getItem('employees');
        const blob = new Blob([data], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'employees.json';
        link.click();
      } else if (action === "import") {
        importFile.click();
      } else if (action === "clear") {
        localStorage.removeItem('employees');
        employeeTable.innerHTML = '';
      }
    } else {
      alert("Senha incorreta!");
    }
  });

  // Importar arquivo
  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const employees = JSON.parse(event.target.result);
      employees.forEach(addEmployeeToTable);
      saveEmployees();
    };
    reader.readAsText(file);
  });

  // Função de pesquisa
  searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const rows = Array.from(employeeTable.rows);

    rows.forEach(row => {
      const name = row.cells[0].textContent.toLowerCase();
      const role = row.cells[3].textContent.toLowerCase();
      const startDate = row.cells[1].textContent.toLowerCase();
      const endDate = row.cells[2].textContent.toLowerCase();

      if (name.includes(searchTerm) || role.includes(searchTerm) || startDate.includes(searchTerm) || endDate.includes(searchTerm)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });

  // Modo escuro
  darkModeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  // Inicializar dados
  loadEmployees();
});
