import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
const Header = () => {
  const {
    currentUser,
    logout
  } = useAuth();
  return <motion.header initial={{
    y: -100
  }} animate={{
    y: 0
  }} className="bg-blue-700 border-b border-blue-800 text-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white text-blue-700 font-bold text-xl px-4 py-2 rounded-lg shadow-sm">
              NOVAROTAEXPRESS
            </div>
            <span className="text-blue-100 text-sm hidden sm:block">Pagamento de Motorista</span>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser && <div className="flex items-center space-x-2 text-blue-50">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:block">
                  {currentUser.username}
                </span>
              </div>}
            
            <Button onClick={logout} variant="ghost" size="sm" className="flex items-center space-x-2 text-white hover:bg-blue-600 hover:text-white transition-colors border border-blue-500/30">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>;
};
export default Header;