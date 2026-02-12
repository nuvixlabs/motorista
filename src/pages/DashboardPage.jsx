import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { RefreshCw, FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { fetchGoogleSheetsData } from '@/services/GoogleSheetsService';
import { exportToExcel } from '@/services/ExcelExportService';
import InvoiceModal from '@/components/InvoiceModal';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Label } from '@/components/ui/label.jsx';

const DashboardPage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMotorista, setSelectedMotorista] = useState('all');
  const [selectedPeriodo, setSelectedPeriodo] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const { toast } = useToast();

  const handleFetchData = async () => {
    setIsLoading(true);
    toast({
      title: "Carregando dados...",
      description: "Buscando informações do Google Sheets",
    });

    const result = await fetchGoogleSheetsData();

    if (result.success) {
      setData(result.data);
      toast({
        title: "Sucesso!",
        description: `${result.data.length} romaneios carregados com sucesso`,
      });
    } else {
      toast({
        title: "Erro ao carregar dados",
        description: result.error || "Verifique a conexão com o Google Sheets",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  // Extract unique values for filters
  const motoristas = useMemo(() => {
    const unique = [...new Set(data.map(item => item.motorista).filter(Boolean))];
    return unique.sort();
  }, [data]);

  const periodos = useMemo(() => {
    const unique = [...new Set(data.map(item => item.dataRomaneio).filter(Boolean))];
    return unique.sort();
  }, [data]);

  const statusOptions = useMemo(() => {
    const unique = [...new Set(data.map(item => item.status).filter(Boolean))];
    return unique.sort();
  }, [data]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const motoristaMatch = selectedMotorista === 'all' || item.motorista === selectedMotorista;
      const periodoMatch = selectedPeriodo === 'all' || item.dataRomaneio === selectedPeriodo;
      const statusMatch = selectedStatus.length === 0 || selectedStatus.includes(item.status);
      
      return motoristaMatch && periodoMatch && statusMatch;
    });
  }, [data, selectedMotorista, selectedPeriodo, selectedStatus]);

  // Calculate totals
  const totals = useMemo(() => {
    // Count unique romaneios using Set on nroRomaneio property
    const uniqueRomaneios = new Set(filteredData.map(item => item.nroRomaneio).filter(Boolean));
    const quantity = uniqueRomaneios.size;
    
    // Calculate total value (sum of all rows)
    const value = filteredData.reduce((sum, item) => sum + (item.valor || 0), 0);
    
    return { quantity, value };
  }, [filteredData]);

  // Determine Driver Name for Invoice
  const invoiceDriverName = useMemo(() => {
    if (selectedMotorista !== 'all') return selectedMotorista;
    
    // Check if filtered data has only one unique driver
    const driversInFiltered = [...new Set(filteredData.map(d => d.motorista).filter(Boolean))];
    if (driversInFiltered.length === 1) return driversInFiltered[0];
    
    return 'Diversos';
  }, [selectedMotorista, filteredData]);

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há dados para exportar",
        variant: "destructive"
      });
      return;
    }

    const result = exportToExcel(filteredData);
    
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Relatório Excel gerado com sucesso",
      });
    } else {
      toast({
        title: "Erro ao exportar",
        description: result.error || "Erro ao gerar arquivo Excel",
        variant: "destructive"
      });
    }
  };

  const handleGenerateInvoice = () => {
    if (filteredData.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há dados para gerar fatura",
        variant: "destructive"
      });
      return;
    }
    setIsInvoiceModalOpen(true);
  };

  const handleStatusToggle = (status) => {
    setSelectedStatus(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - NOVAROTAEXPRESS Admin</title>
        <meta name="description" content="Dashboard administrativo para gestão de romaneios, cargas e relatórios do NOVAROTAEXPRESS." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-blue-900">Dashboard</h1>
                <p className="text-blue-600 mt-1 font-medium">Gestão de Romaneios e Cargas</p>
              </div>
              
              {/* Fetch Data Button */}
               <Button
                  onClick={handleFetchData}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sincronizar Planilha
                    </>
                  )}
                </Button>
            </div>

            {/* Filters Section */}
            {data.length > 0 && (
              <Card className="mb-6 border-t-4 border-t-blue-500 shadow-md">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-xl text-blue-900">Filtros Avançados</CardTitle>
                  </div>
                  <CardDescription>Refine a visualização por motorista, período e status</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Motorista Filter */}
                    <div className="space-y-2">
                      <Label className="text-blue-900 font-semibold">Motorista</Label>
                      <Select value={selectedMotorista} onValueChange={setSelectedMotorista}>
                        <SelectTrigger className="border-blue-200 focus:ring-blue-500">
                          <SelectValue placeholder="Selecione o motorista" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Motoristas</SelectItem>
                          {motoristas.map(motorista => (
                            <SelectItem key={motorista} value={motorista}>
                              {motorista}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Período Filter */}
                    <div className="space-y-2">
                      <Label className="text-blue-900 font-semibold">Período</Label>
                      <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                        <SelectTrigger className="border-blue-200 focus:ring-blue-500">
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Períodos</SelectItem>
                          {periodos.map(periodo => (
                            <SelectItem key={periodo} value={periodo}>
                              {periodo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Multi-Select */}
                    <div className="space-y-2">
                      <Label className="text-blue-900 font-semibold">Status (Múltipla Seleção)</Label>
                      <div className="border border-blue-200 rounded-md p-3 bg-white max-h-40 overflow-y-auto custom-scrollbar">
                        {statusOptions.length > 0 ? (
                          <div className="space-y-2">
                            {statusOptions.map(status => (
                              <div key={status} className="flex items-center space-x-3 p-1 hover:bg-blue-50 rounded transition-colors">
                                <Checkbox
                                  id={`status-${status}`}
                                  checked={selectedStatus.includes(status)}
                                  onCheckedChange={() => handleStatusToggle(status)}
                                  className="border-blue-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label
                                  htmlFor={`status-${status}`}
                                  className="text-sm text-gray-700 cursor-pointer flex-1"
                                >
                                  {status}
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Nenhum status disponível</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Totalizadores */}
            {filteredData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-600 uppercase tracking-wide">Total de Romaneios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-blue-900">{totals.quantity}</p>
                    <p className="text-sm text-blue-400 mt-1">Romaneios únicos filtrados</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-600 uppercase tracking-wide">Valor Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-green-700">
                      {totals.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                     <p className="text-sm text-green-500 mt-1">Soma dos valores</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action Buttons */}
            {filteredData.length > 0 && (
              <Card className="mb-6 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleGenerateInvoice}
                      className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Gerar Fatura PDF
                    </Button>
                    <Button
                      onClick={handleExportExcel}
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Exportar para Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Table */}
            {filteredData.length > 0 ? (
              <Card className="shadow-md overflow-hidden border-t-4 border-t-blue-600">
                <CardHeader>
                  <CardTitle className="text-xl text-blue-900">Listagem de Romaneios</CardTitle>
                  <CardDescription>
                    Exibindo {filteredData.length} registros
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-blue-50">
                      <TableRow>
                        <TableHead className="font-bold text-blue-800">Nº ROMANEIO</TableHead>
                        <TableHead className="font-bold text-blue-800">DATA</TableHead>
                        <TableHead className="font-bold text-blue-800">SITUAÇÃO</TableHead>
                        <TableHead className="font-bold text-blue-800">CIDADE</TableHead>
                        <TableHead className="font-bold text-blue-800">MOTORISTA</TableHead>
                        <TableHead className="font-bold text-blue-800">STATUS</TableHead>
                        <TableHead className="text-right font-bold text-blue-800">VALOR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item, index) => (
                        <TableRow key={index} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                          <TableCell className="font-medium text-gray-900">{item.nroRomaneio}</TableCell>
                          <TableCell className="text-gray-600">{item.dataRomaneio}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.situacao === 'ENTREGUE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {item.situacao}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-600">{item.cidade}</TableCell>
                          <TableCell className="text-gray-600">{item.motorista}</TableCell>
                          <TableCell className="text-gray-600">{item.status}</TableCell>
                          <TableCell className="text-right font-medium text-gray-900">
                            {typeof item.valor === 'number'
                              ? item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              : item.valor}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : data.length > 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">Nenhum romaneio encontrado com os filtros selecionados</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="py-20 text-center">
                  <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="h-8 w-8 text-blue-500 opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Nenhum dado carregado</h3>
                  <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">
                    Clique no botão "Sincronizar Planilha" para importar os dados mais recentes do Google Sheets.
                  </p>
                  <Button
                    onClick={handleFetchData}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                     <RefreshCw className="mr-2 h-4 w-4" />
                     Sincronizar Agora
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </main>

        <InvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          data={filteredData}
          totalValue={totals.value}
          driverName={invoiceDriverName}
        />
      </div>
    </>
  );
};

export default DashboardPage;