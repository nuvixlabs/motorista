import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { motion } from 'framer-motion';
import { LogIn, Truck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { Helmet } from 'react-helmet';

const LoginPage = () => {
  // Initialize with hardcoded credentials as requested
  const [username, setUsername] = useState('NOVAROTA');
  const [password, setPassword] = useState('NOVAROTA25');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = login(username, password);

    if (result.success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      navigate('/dashboard', { replace: true });
    } else {
      toast({
        title: "Erro ao fazer login",
        description: result.error || "Credenciais inválidas",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Login - NOVAROTAEXPRESS Admin</title>
        <meta name="description" content="Área administrativa do NOVAROTAEXPRESS. Faça login para acessar o dashboard de gestão de romaneios e cargas." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-2xl shadow-lg mb-4 transform rotate-3"
            >
              <Truck className="w-10 h-10" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">NOVAROTAEXPRESS</h1>
            <p className="text-blue-600 mt-2 font-medium">Painel Administrativo Profissional</p>
          </div>

          <Card className="shadow-2xl border-t-4 border-t-blue-600 border-x-0 border-b-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">Acesso Restrito</CardTitle>
              <CardDescription className="text-center text-gray-500">
                Identifique-se para gerenciar cargas e faturas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-blue-900 font-medium">Usuário</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="transition-all border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" classname="text-blue-900 font-medium">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="transition-all border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 transition-all shadow-md hover:shadow-lg mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Autenticando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Acessar Sistema
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
                <p>Ambiente seguro e monitorado</p>
              </div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-sm text-blue-400"
          >
            <p>© 2026 NOVAROTAEXPRESS. Excelência em Logística.</p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;