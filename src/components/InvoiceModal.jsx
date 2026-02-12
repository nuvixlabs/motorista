import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { X, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceModal = ({ isOpen, onClose, data, totalValue, driverName }) => {
  const [vencimento, setVencimento] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGeneratePDF = async () => {
    if (!vencimento) {
      toast({
        title: "Erro",
        description: "Por favor, informe a data de vencimento",
        variant: "destructive"
      });
      return;
    }

    // Validate date format DD/MM/YYYY
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(vencimento)) {
      toast({
        title: "Erro",
        description: "Data inválida. Use o formato DD/MM/YYYY",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const invoiceElement = document.getElementById('invoice-preview');
      
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const safeDriverName = driverName ? `_${driverName.replace(/\s+/g, '_')}` : '';
      pdf.save(`fatura_novarota${safeDriverName}_${timestamp}.pdf`);

      toast({
        title: "Sucesso",
        description: "Fatura gerada com sucesso!",
      });

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-700">Gerar Fatura</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="vencimento" className="text-blue-900 font-medium">Data de Vencimento</Label>
            <Input
              id="vencimento"
              type="text"
              placeholder="DD/MM/YYYY"
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              maxLength={10}
              className="max-w-xs border-blue-200 focus:ring-blue-500"
            />
          </div>

          <div id="invoice-preview" className="bg-white p-8 border rounded-lg shadow-sm">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-blue-600">
              <div>
                <h1 className="text-3xl font-bold text-blue-700">NOVAROTAEXPRESS</h1>
                <p className="text-gray-600 mt-1">Transporte e Logística</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-2 font-medium">FATURA</div>
                <div className="text-2xl font-bold text-blue-700">
                  {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <span className="font-semibold text-blue-800">Data de Emissão:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date().toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {vencimento && (
                  <div>
                    <span className="font-semibold text-blue-800">Data de Vencimento:</span>
                    <span className="ml-2 text-gray-900">{vencimento}</span>
                  </div>
                )}
                {driverName && (
                  <div className="col-span-2 border-t border-blue-200 pt-2 mt-2">
                    <span className="font-semibold text-blue-800">Motorista:</span>
                    <span className="ml-2 text-lg font-medium text-blue-900">{driverName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4 text-blue-800 border-b border-gray-200 pb-2">Cargas e Romaneios</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-50 text-blue-900">
                    <th className="text-left py-2 px-3 rounded-l-md font-semibold">Nº Romaneio</th>
                    <th className="text-left py-2 px-3 font-semibold">Data</th>
                    <th className="text-left py-2 px-3 font-semibold">Cidade</th>
                    <th className="text-left py-2 px-3 font-semibold">Status</th>
                    <th className="text-right py-2 px-3 rounded-r-md font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-3 text-gray-900">{item.nroRomaneio}</td>
                      <td className="py-3 px-3 text-gray-900">{item.dataRomaneio}</td>
                      <td className="py-3 px-3 text-gray-900">{item.cidade}</td>
                      <td className="py-3 px-3 text-gray-900">{item.status}</td>
                      <td className="text-right py-3 px-3 text-gray-900 font-medium">
                        {typeof item.valor === 'number'
                          ? item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : item.valor}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-blue-600 font-bold bg-blue-50">
                    <td colSpan="4" className="text-right py-3 px-3 text-blue-900">Total:</td>
                    <td className="text-right py-3 px-3 text-blue-700 text-lg">
                      {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
              <p className="font-medium text-blue-800">NOVAROTAEXPRESS - Transporte e Logística</p>
              <p>Documento gerado eletronicamente em {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="border-blue-200 hover:bg-blue-50 text-blue-700">
              Cancelar
            </Button>
            <Button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Gerar PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;