import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faBookOpen, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const MenuCard: React.FC<{ icon: any; text: string; onClick: () => void }> = ({ icon, text, onClick }) => (
  <div 
    onClick={onClick}
    className="menu-card relative flex flex-col items-center justify-center p-10 min-h-[200px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-glass cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl group"
  >
    <FontAwesomeIcon icon={icon} className="text-5xl text-white mb-6 transition-transform duration-500 group-hover:rotate-[360deg]" />
    <p className="font-semibold text-lg text-white/90">{text}</p>
  </div>
);

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="main-title text-center mb-12 text-transparent font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-100 bg-clip-text text-[clamp(2.5rem,5vw,4rem)] relative after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-[3px] after:rounded-sm after:bg-gradient-accent">
        📖 Book Management System
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <MenuCard icon={faPlusCircle} text="Add New Book" onClick={() => navigate('/add')} />
        <MenuCard icon={faBookOpen} text="View All Books" onClick={() => navigate('/view')} />
        <MenuCard icon={faTrashAlt} text="Delete a Book" onClick={() => navigate('/delete')} />
      </div>
    </div>
  );
};

export default HomePage;