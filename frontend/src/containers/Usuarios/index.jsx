import { useState } from "react";
import { Search, Plus, MoreVertical, Edit2, Trash2, Shield, User, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";
import UserModal from "./components/UserModal";

// MOCK DATA
const usuariosMock = [
  { id: 1, nome: "Diego Flausino", email: "diego@email.com", funcao: "Administrador", acesso: "Total", status: "Ativo" },
  { id: 2, nome: "Maria Souza", email: "maria@email.com", funcao: "Técnico de Segurança", acesso: "Parcial", status: "Ativo" },
  { id: 3, nome: "João Pereira", email: "joao@email.com", funcao: "Almoxarife", acesso: "Restrito", status: "Ativo" },
  { id: 4, nome: "Roberto Costa", email: "roberto@email.com", funcao: "Gerente", acesso: "Total", status: "Inativo" },
];

export default function Usuarios() {
  const [busca, setBusca] = useState("");
  const [users, setUsers] = useState(usuariosMock);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const filteredUsers = users.filter(
    (u) =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())
  );

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getBadgeClass = (funcao) => {
    if (funcao === "Administrador") return styles.badgeAdmin;
    if (funcao.includes("Técnico")) return styles.badgeTech;
    return styles.badgeUser;
  };

  const handleDelete = (id) => {
    if(window.confirm("Remover este usuário do sistema?")) {
        setUsers(prev => prev.filter(u => u.id !== id));
        toast.success("Usuário removido com sucesso.");
    }
  }

  const handleEdit = (user) => {
      setEditingUser(user);
      setIsModalOpen(true);
  }

  const handleNew = () => {
      setEditingUser(null);
      setIsModalOpen(true);
  }

  const handleSaveUser = (userData) => {
      if (editingUser) {
          // Atualiza
          setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userData, funcao: userData.role === 'admin' ? 'Administrador' : 'Usuário' } : u));
      } else {
          // Cria novo
          const newUser = {
              id: Date.now(),
              ...userData,
              funcao: userData.role === 'admin' ? 'Administrador' : 'Usuário',
              status: userData.ativo ? 'Ativo' : 'Inativo'
          };
          setUsers(prev => [...prev, newUser]);
      }
  };

  return (
    <div className={styles.container}>
      
      {/* Controls */}
      <div className={styles.headerControls}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <button className={styles.addButton} onClick={handleNew}>
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      {/* Rich Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Função / Cargo</th>
              <th>Status</th>
              <th>Último Acesso</th>
              <th style={{textAlign: 'right'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userProfile}>
                      <div className={styles.avatar}>{getInitials(user.nome)}</div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.nome}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <span className={`${styles.badge} ${getBadgeClass(user.funcao)}`}>
                        {user.funcao}
                    </span>
                  </td>

                  <td>
                    {user.status === 'Ativo' ? (
                        <div className={styles.statusActive}>
                            <div className={styles.dot}></div> Ativo
                        </div>
                    ) : (
                        <span style={{color: '#94a3b8', fontSize: '0.85rem'}}>Inativo</span>
                    )}
                  </td>

                  <td style={{color: '#64748b', fontSize: '0.85rem'}}>
                    Hoje, 14:30
                  </td>

                  <td>
                    <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => handleEdit(user)} title="Editar">
                            <Edit2 size={16} />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(user.id)} title="Remover">
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                    <div className={styles.emptyState}>
                        <User size={48} strokeWidth={1} />
                        <p>Nenhum usuário encontrado para "{busca}"</p>
                    </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        userToEdit={editingUser}
        onSave={handleSaveUser}
      />

    </div>
  );
}