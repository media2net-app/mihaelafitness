'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, Eye, Calendar, Euro, User, Calculator, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import jsPDF from 'jspdf';

interface PricingCalculation {
  id: string;
  service: string;
  duration: number;
  frequency: number;
  discount: number;
  vat: number;
  finalPrice: number;
  includeNutritionPlan: boolean;
  nutritionPlanCount: number;
  customerId: string;
  customerName: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

export default function InvoicesPage() {
  const { t } = useLanguage();
  const [calculations, setCalculations] = useState<PricingCalculation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PricingCalculation | null>(null);
  const [pdfLanguage, setPdfLanguage] = useState<'nl' | 'ro'>('ro');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load pricing calculations
      const calculationsResponse = await fetch('/api/pricing-calculations');
      const calculationsData = await calculationsResponse.json();
      setCalculations(calculationsData);

      // Load customers
      const customersResponse = await fetch('/api/clients/overview');
      const customersData = await customersResponse.json();
      setCustomers(customersData.clients || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCalculations = calculations.filter(calc => {
    const matchesSearch = calc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        calc.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomer = !selectedCustomer || calc.customerId === selectedCustomer;
    const matchesDate = !dateFilter || new Date(calc.createdAt).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesCustomer && matchesDate;
  });

  const totalRevenue = filteredCalculations.reduce((sum, calc) => sum + calc.finalPrice, 0);
  const totalCalculations = filteredCalculations.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(price);
  };

  const addLogoToPDF = async (pdf: jsPDF) => {
    try {
      // For now, we'll use a simple text logo since jsPDF doesn't easily support SVG
      // In a production environment, you would convert the SVG to PNG/JPEG first
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MF', 20, 25);
      
      // Add company name below logo
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('MIHAELA FITNESS', 20, 32);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
      // Fallback to text logo
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MF', 20, 25);
    }
  };

  const generatePDFInvoice = async (calculation: PricingCalculation, language: 'nl' | 'ro' = 'ro') => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Colors
    const primaryColor = [236, 72, 153]; // Pink #EC4899 (like homepage)
    const darkColor = [31, 31, 31]; // Dark gray #1F1F1F
    const lightGray = [245, 245, 245];
    
    // Header with pink background
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    // Add logo
    await addLogoToPDF(pdf);
    
    // Invoice title and details (right side, properly aligned)
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(language === 'ro' ? 'FACTURĂ' : 'FACTUUR', pageWidth - 80, 25);
    
    // Invoice details
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${language === 'ro' ? 'Număr Factură' : 'Factuurnummer'}: INV-${calculation.id.slice(-8).toUpperCase()}`, pageWidth - 80, 32);
    pdf.text(`${language === 'ro' ? 'Data' : 'Datum'}: ${formatDate(calculation.createdAt)}`, pageWidth - 80, 38);
    
    let yPosition = 70;
    
    // Customer info
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(language === 'ro' ? 'Informații Client:' : 'Klant Informatie:', 20, yPosition);
    yPosition += 10;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text(`${language === 'ro' ? 'Nume' : 'Naam'}: ${calculation.customerName}`, 20, yPosition);
    yPosition += 8;
    
    // Service details
    yPosition += 10;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(language === 'ro' ? 'Detalii Serviciu:' : 'Service Details:', 20, yPosition);
    yPosition += 10;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text(`${language === 'ro' ? 'Serviciu' : 'Service'}: ${calculation.service}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`${language === 'ro' ? 'Durată' : 'Duur'}: ${calculation.duration} ${language === 'ro' ? 'săptămâni' : 'weken'}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`${language === 'ro' ? 'Frecvență' : 'Frequentie'}: ${calculation.frequency}x ${language === 'ro' ? 'pe săptămână' : 'per week'}`, 20, yPosition);
    yPosition += 8;
    
    if (calculation.includeNutritionPlan) {
      pdf.text(`${language === 'ro' ? 'Plan nutrițional' : 'Voedingsplan'}: ${calculation.nutritionPlanCount} ${language === 'ro' ? 'planuri' : 'plannen'}`, 20, yPosition);
      yPosition += 8;
    }
    
    // Pricing table
    yPosition += 20;
    const tableStartY = yPosition;
    
    // Table header
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(20, tableStartY, pageWidth - 40, 12, 'F');
    
    pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(language === 'ro' ? 'Descriere' : 'Beschrijving', 25, tableStartY + 8);
    pdf.text(language === 'ro' ? 'Sumă' : 'Bedrag', pageWidth - 60, tableStartY + 8);
    
    yPosition = tableStartY + 12;
    
    // Calculate service details
    const servicePrice = calculation.finalPrice;
    const totalSessions = calculation.duration * calculation.frequency;
    const pricePerSession = servicePrice / totalSessions;
    const nutritionPrice = calculation.includeNutritionPlan ? calculation.nutritionPlanCount * 200 : 0;
    const totalPrice = servicePrice + nutritionPrice;
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    
    // Service breakdown
    pdf.text(`${calculation.service} (${calculation.duration} ${language === 'ro' ? 'săptămâni' : 'weken'})`, 25, yPosition + 8);
    pdf.text(`${totalSessions} ${language === 'ro' ? 'sesiuni' : 'sessies'} × ${formatPrice(pricePerSession)}`, pageWidth - 60, yPosition + 8);
    yPosition += 12;
    
    if (calculation.includeNutritionPlan && calculation.nutritionPlanCount > 0) {
      const nutritionPrice = 200; // 200 RON per nutrition plan
      const totalNutritionPrice = calculation.nutritionPlanCount * nutritionPrice;
      pdf.text(`${language === 'ro' ? 'Plan nutrițional' : 'Voedingsplan'} (${calculation.nutritionPlanCount} ${language === 'ro' ? 'planuri' : 'plannen'})`, 25, yPosition + 8);
      pdf.text(`${calculation.nutritionPlanCount} × ${formatPrice(nutritionPrice)}`, pageWidth - 60, yPosition + 8);
      yPosition += 12;
    }
    
    if (calculation.discount > 0) {
      const discountAmount = servicePrice * (calculation.discount / 100);
      pdf.text(`${language === 'ro' ? 'Reducere' : 'Korting'} (${calculation.discount}%)`, 25, yPosition + 8);
      pdf.text(`-${formatPrice(discountAmount)}`, pageWidth - 60, yPosition + 8);
      yPosition += 12;
    }
    
    // Total line
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(20, yPosition, pageWidth - 40, 12, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(language === 'ro' ? 'TOTAL' : 'TOTAAL', 25, yPosition + 8);
    pdf.text(formatPrice(totalPrice), pageWidth - 60, yPosition + 8);
    
    // Footer
    yPosition = pageHeight - 40;
    pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Mihaela Fitness', 20, yPosition);
    pdf.text('Email: mihaela@mihaelafitness.com', 20, yPosition + 8);
    pdf.text(language === 'ro' ? 'Mulțumim pentru încredere!' : 'Bedankt voor het vertrouwen!', pageWidth - 60, yPosition);
    
    return pdf;
  };

  const generateInvoice = async (calculation: PricingCalculation) => {
    const pdf = await generatePDFInvoice(calculation, pdfLanguage);
    const filename = pdfLanguage === 'ro' ? 'factura' : 'factuur';
    pdf.save(`${filename}-${calculation.customerName.replace(/\s+/g, '-')}-${calculation.id.slice(-8)}.pdf`);
  };

  const handlePreviewInvoice = (calculation: PricingCalculation) => {
    setSelectedInvoice(calculation);
    setShowPreviewModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă facturile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-500 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Facturi</h1>
              <p className="text-gray-600">Gestionează și generează facturi pentru clienți</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Facturi</p>
                  <p className="text-2xl font-bold text-gray-800">{totalCalculations}</p>
                </div>
                <div className="p-3 bg-pink-100 rounded-lg">
                  <FileText className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Venit Total</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Euro className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Factură Medie</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalCalculations > 0 ? formatPrice(totalRevenue / totalCalculations) : '€0'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calculator className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filtre</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">PDF Taal:</span>
              <button
                onClick={() => setPdfLanguage('ro')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  pdfLanguage === 'ro' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                RO
              </button>
              <button
                onClick={() => setPdfLanguage('nl')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  pdfLanguage === 'nl' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                NL
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Caută după client sau serviciu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="">Toți clienții</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Prezentare Generală Facturi</h2>
            <p className="text-gray-600">Apasă pe o factură pentru a o descărca</p>
          </div>

          {filteredCalculations.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nu s-au găsit facturi</h3>
              <p className="text-gray-500">Nu există facturi care să corespundă filtrelor curente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serviciu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durată
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frecvență
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reducere
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCalculations.map((calculation) => (
                    <tr key={calculation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-rose-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {calculation.customerName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{calculation.service}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{calculation.duration} săptămâni</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{calculation.frequency}x/săptămână</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{calculation.discount}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatPrice(calculation.finalPrice)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(calculation.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreviewInvoice(calculation)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                            title="Preview Factuur"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => generateInvoice(calculation)}
                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreviewModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Previzualizare Factură</h2>
                    <p className="text-sm text-gray-600">
                      {selectedInvoice.customerName} - {formatDate(selectedInvoice.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateInvoice(selectedInvoice)}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descarcă PDF
                  </button>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PDF Preview */}
              <div className="p-6 bg-gray-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-h-[60vh] overflow-y-auto">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">MF</span>
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">MIHAELA FITNESS</h1>
                        <p className="text-gray-600">Fitness & Nutrition Coaching</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">FACTURĂ</h2>
                      <p className="text-sm text-gray-600">
                        Număr Factură: INV-{selectedInvoice.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Data: {formatDate(selectedInvoice.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Informații Client</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 font-medium">{selectedInvoice.customerName}</p>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalii Serviciu</h3>
                    <div className="space-y-2">
                      <p className="text-gray-700"><strong>Serviciu:</strong> {selectedInvoice.service}</p>
                      <p className="text-gray-700"><strong>Durată:</strong> {selectedInvoice.duration} săptămâni</p>
                      <p className="text-gray-700"><strong>Frecvență:</strong> {selectedInvoice.frequency}x pe săptămână</p>
                      {selectedInvoice.includeNutritionPlan && (
                        <p className="text-gray-700">
                          <strong>Plan nutrițional:</strong> {selectedInvoice.nutritionPlanCount} planuri
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pricing Table */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Prețuri</h3>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descriere</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Sumă</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {selectedInvoice.service} ({selectedInvoice.duration} săptămâni)<br/>
                              <span className="text-sm text-gray-500">
                                {selectedInvoice.duration * selectedInvoice.frequency} sesiuni × {formatPrice(selectedInvoice.finalPrice / (selectedInvoice.duration * selectedInvoice.frequency))}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-right">
                              {formatPrice(selectedInvoice.finalPrice)}
                            </td>
                          </tr>
                          {selectedInvoice.includeNutritionPlan && selectedInvoice.nutritionPlanCount > 0 && (
                            <tr>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                Plan nutrițional ({selectedInvoice.nutritionPlanCount} planuri)<br/>
                                <span className="text-sm text-gray-500">
                                  {selectedInvoice.nutritionPlanCount} × {formatPrice(200)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                {formatPrice(selectedInvoice.nutritionPlanCount * 200)}
                              </td>
                            </tr>
                          )}
                          {selectedInvoice.discount > 0 && (
                            <tr>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                Reducere ({selectedInvoice.discount}%)
                              </td>
                              <td className="px-4 py-3 text-sm text-red-600 text-right">
                                -{formatPrice(selectedInvoice.finalPrice * (selectedInvoice.discount / 100))}
                              </td>
                            </tr>
                          )}
                          <tr className="bg-pink-500 text-white">
                            <td className="px-4 py-3 font-semibold">TOTAL</td>
                            <td className="px-4 py-3 font-semibold text-right">
                              {formatPrice(selectedInvoice.finalPrice + (selectedInvoice.includeNutritionPlan ? selectedInvoice.nutritionPlanCount * 200 : 0))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Mihaela Fitness</p>
                        <p className="text-sm text-gray-600">Email: mihaela@mihaelafitness.com</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Mulțumim pentru încredere!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
