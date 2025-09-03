import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Transaction, Goal, Category } from '../types';
import { formatCurrency, formatDate } from './dateUtils';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const generateEnhancedReport = async (
  data: {
    transactions: Transaction[];
    goals: Goal[];
    categories: Category[];
    period: string;
  },
  chartIds: {
    balanceChartId: string;
    categoryChartId: string;
  }
) => {
  const { transactions, goals, period } = data;
  const doc = new jsPDF('p', 'pt', 'a4') as jsPDFWithAutoTable;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 0;

  const addHeader = () => {
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#2c3e50');
    doc.text('Relatório Financeiro', pageWidth / 2, 60, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#34495e');
    doc.text(`Período: ${period.charAt(0).toUpperCase() + period.slice(1)}`, pageWidth / 2, 80, { align: 'center' });
  };

  const addFooter = () => {
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor('#7f8c8d');
      const text = `Página ${i} de ${pageCount}`;
      const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
      doc.text(text, (pageWidth - textWidth) / 2, pageHeight - 30);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 40, pageHeight - 30, { align: 'right' });
    }
  };

  addHeader();
  yPos = 110;

  // --- SUMMARY CARDS ---
  const entradas = transactions.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
  const saidas = transactions.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0);
  const saldo = entradas - saidas;
  
  const cardWidth = 150;
  const cardMargin = (pageWidth - (cardWidth * 3)) / 4;

  doc.setFillColor(236, 240, 241);
  doc.roundedRect(cardMargin, yPos, cardWidth, 60, 5, 5, 'F');
  doc.roundedRect(cardMargin * 2 + cardWidth, yPos, cardWidth, 60, 5, 5, 'F');
  doc.roundedRect(cardMargin * 3 + cardWidth * 2, yPos, cardWidth, 60, 5, 5, 'F');

  doc.setFontSize(11);
  doc.setTextColor('#2c3e50');
  doc.text('Total Entradas', cardMargin + cardWidth / 2, yPos + 20, { align: 'center' });
  doc.text('Total Saídas', cardMargin * 2 + cardWidth * 1.5, yPos + 20, { align: 'center' });
  doc.text('Saldo Final', cardMargin * 3 + cardWidth * 2.5, yPos + 20, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#27ae60');
  doc.text(formatCurrency(entradas), cardMargin + cardWidth / 2, yPos + 45, { align: 'center' });
  doc.setTextColor('#c0392b');
  doc.text(formatCurrency(saidas), cardMargin * 2 + cardWidth * 1.5, yPos + 45, { align: 'center' });
  doc.setTextColor(saldo >= 0 ? '#27ae60' : '#c0392b');
  doc.text(formatCurrency(saldo), cardMargin * 3 + cardWidth * 2.5, yPos + 45, { align: 'center' });

  yPos += 90;
  doc.setFont('helvetica', 'normal');

  // --- CHARTS ---
  const balanceChartEl = document.getElementById(chartIds.balanceChartId);
  const categoryChartEl = document.getElementById(chartIds.categoryChartId);

  if (balanceChartEl && categoryChartEl) {
    try {
      doc.setFontSize(14);
      doc.setTextColor('#2c3e50');
      doc.text('Visão Geral Gráfica', 40, yPos);
      yPos += 20;

      const balanceCanvas = await html2canvas(balanceChartEl, { scale: 2, backgroundColor: null });
      const categoryCanvas = await html2canvas(categoryChartEl, { scale: 2, backgroundColor: null });
      const balanceImgData = balanceCanvas.toDataURL('image/png');
      const categoryImgData = categoryCanvas.toDataURL('image/png');

      const chartWidth = (pageWidth - 120) / 2;
      const chartHeight = (chartWidth * balanceCanvas.height) / balanceCanvas.width;

      doc.addImage(balanceImgData, 'PNG', 40, yPos, chartWidth, chartHeight);
      doc.addImage(categoryImgData, 'PNG', pageWidth / 2 + 20, yPos, chartWidth, chartHeight);
      
      yPos += chartHeight + 30;
    } catch (error) {
      console.error("Error generating charts for PDF:", error);
    }
  }

  // --- TRANSACTIONS TABLE ---
  if (yPos > pageHeight - 100) { doc.addPage(); yPos = 110; }
  doc.setFontSize(14);
  doc.setTextColor('#2c3e50');
  doc.text('Detalhes das Transações', 40, yPos);

  autoTable(doc, {
    startY: yPos + 10,
    head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
    body: transactions.map(t => [
      formatDate(t.date),
      t.description,
      t.category,
      t.type === 'entrada' ? 'Entrada' : 'Saída',
      formatCurrency(t.amount)
    ]),
    theme: 'striped',
    headStyles: { fillColor: '#34495e' },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const type = transactions[data.row.index].type;
        data.cell.styles.textColor = type === 'entrada' ? '#27ae60' : '#c0392b';
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 30;

  // --- GOALS TABLE ---
  if (goals.length > 0) {
    if (yPos > pageHeight - 150) { doc.addPage(); yPos = 110; }
    doc.setFontSize(14);
    doc.setTextColor('#2c3e50');
    doc.text('Resumo das Metas', 40, yPos);

    autoTable(doc, {
      startY: yPos + 10,
      head: [['Meta', 'Progresso', 'Valor Atual', 'Valor Alvo', 'Status']],
      body: goals.map(g => {
        const progress = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
        return [
          g.title,
          `${progress.toFixed(1)}%`,
          formatCurrency(g.currentAmount),
          formatCurrency(g.targetAmount),
          g.completed ? 'Concluída' : 'Em andamento'
        ];
      }),
      theme: 'grid',
      headStyles: { fillColor: '#34495e' },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const isCompleted = goals[data.row.index].completed;
          data.cell.styles.textColor = isCompleted ? '#27ae60' : '#f39c12';
        }
      }
    });
  }

  addFooter();
  doc.save(`relatorio-financeiro-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
};
